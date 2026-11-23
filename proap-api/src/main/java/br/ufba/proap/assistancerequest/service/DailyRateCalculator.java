package br.ufba.proap.assistancerequest.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.exception.InvalidDailyRateException;
import br.ufba.proap.sysadminpanel.domain.CountryGroup;
import br.ufba.proap.sysadminpanel.domain.SystemConfiguration;
import br.ufba.proap.util.TextNormalizer;

/**
 * Regras de valor da diária.
 * <p>
 * Nacional (BRL):
 * <ul>
 * <li>Aluno: valor padrão do aluno (R$ 320,00);</li>
 * <li>Docente nas capitais de São Paulo e Rio de Janeiro: R$ 425,00;</li>
 * <li>Docente em qualquer outro lugar do país (outras capitais e interior,
 * inclusive interior de SP/RJ): R$ 380,00.</li>
 * </ul>
 * Internacional (USD): valor do grupo CNPq (A a D) do país de destino.
 */
@Component
public class DailyRateCalculator {

    public static final BigDecimal DEFAULT_ALUNO = new BigDecimal("320.00");
    public static final BigDecimal DEFAULT_DOCENTE = new BigDecimal("380.00");
    public static final BigDecimal DEFAULT_DOCENTE_SP_RJ = new BigDecimal("425.00");

    private static final BigDecimal DAILY_TOLERANCE = new BigDecimal("0.01");
    private static final BigDecimal TOTAL_TOLERANCE = new BigDecimal("0.05");
    private static final BigDecimal HALF = new BigDecimal("0.5");
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    // Cidade já normalizada (sem acento/caixa/pontuação), com UF e país opcionais.
    // Ex.: "sao paulo", "sao paulo sp", "rio de janeiro rj brasil".
    private static final Pattern CAPITAL_SP_RJ = Pattern
            .compile("^(sao paulo|rio de janeiro)( (sp|rj))?( (brasil|brazil))?$");

    /**
     * Verdadeiro quando o local é a capital São Paulo ou a capital Rio de Janeiro.
     * País em branco é considerado Brasil.
     */
    public static boolean isCapitalSpRj(String cidade, String pais) {
        String paisNormalizado = TextNormalizer.normalize(pais);
        if (!paisNormalizado.isEmpty() && !paisNormalizado.equals("brasil") && !paisNormalizado.equals("brazil")) {
            return false;
        }
        return CAPITAL_SP_RJ.matcher(TextNormalizer.normalize(cidade)).matches();
    }

    /** Valor da diária nacional (BRL) conforme perfil e localidade. */
    public BigDecimal resolveNacional(SystemConfiguration config, boolean docente, String cidade, String pais) {
        if (!docente) {
            return firstNonNull(
                    config == null ? null : config.getValorDiariaAlunoBRL(),
                    config == null ? null : config.getValorDiariaBRL(),
                    DEFAULT_ALUNO);
        }
        if (isCapitalSpRj(cidade, pais)) {
            return firstNonNull(
                    config == null ? null : config.getValorDiariaDocenteSpRjBRL(),
                    DEFAULT_DOCENTE_SP_RJ);
        }
        return firstNonNull(
                config == null ? null : config.getValorDiariaDocenteBRL(),
                DEFAULT_DOCENTE);
    }

    /** Total da solicitação em BRL, com a mesma fórmula usada pelo formulário. */
    public BigDecimal calculateTotal(AssistanceRequest request) {
        boolean usd = Boolean.TRUE.equals(request.getIsDolar());
        BigDecimal cotacao = usd && request.getCotacaoMoeda() != null ? request.getCotacaoMoeda() : BigDecimal.ONE;

        int quantidade = request.getQuantidadeDiariasSolicitadas() == null ? 0
                : request.getQuantidadeDiariasSolicitadas();
        BigDecimal fator = BigDecimal.valueOf(quantidade);
        if (quantidade > 1 && !Boolean.TRUE.equals(request.getUltimaDiariaIntegral())) {
            fator = fator.subtract(HALF);
        }

        BigDecimal inscricao = nz(request.getValorInscricao()).multiply(cotacao);
        BigDecimal diarias = nz(request.getValorDiaria()).multiply(cotacao).multiply(fator);
        BigDecimal passagem = nz(request.getValorPassagem());

        return inscricao.add(diarias).add(passagem).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Confere se o valor da diária e o total informados batem com as regras.
     *
     * @throws InvalidDailyRateException se houver divergência
     */
    public void validate(AssistanceRequest request, SystemConfiguration config) {
        Integer quantidade = request.getQuantidadeDiariasSolicitadas();
        boolean usd = Boolean.TRUE.equals(request.getIsDolar());

        if (quantidade != null && quantidade > 0) {
            if (!usd && Boolean.TRUE.equals(request.getEventoInternacional())) {
                throw new InvalidDailyRateException(
                        "Eventos internacionais devem ter a diária em USD, conforme o grupo do país de destino.");
            }

            BigDecimal informado = request.getValorDiaria();
            if (usd) {
                validateInternational(request, config, informado);
            } else {
                boolean docente = Boolean.TRUE.equals(request.getSolicitanteDocente());
                BigDecimal esperado = resolveNacional(config, docente, request.getCidade(), request.getPais());
                if (!sameValue(informado, esperado, DAILY_TOLERANCE)) {
                    throw new InvalidDailyRateException(String.format(PT_BR,
                            "O valor da diária informado (%s) não corresponde ao valor esperado (%s) para %s.",
                            money("R$", informado), money("R$", esperado), describeNacional(docente, request)));
                }
            }
        }

        if (usd && (request.getCotacaoMoeda() == null || request.getCotacaoMoeda().signum() <= 0)) {
            throw new InvalidDailyRateException("A cotação do dólar é obrigatória para solicitações em USD.");
        }

        if (request.getValorTotal() != null) {
            BigDecimal esperadoTotal = calculateTotal(request);
            if (!sameValue(request.getValorTotal(), esperadoTotal, TOTAL_TOLERANCE)) {
                throw new InvalidDailyRateException(String.format(PT_BR,
                        "O valor total informado (%s) não confere com o valor calculado (%s).",
                        money("R$", request.getValorTotal()), money("R$", esperadoTotal)));
            }
        }
    }

    private void validateInternational(AssistanceRequest request, SystemConfiguration config, BigDecimal informado) {
        List<CountryGroup> groups = config == null || config.getCountryGroups() == null
                ? List.of()
                : config.getCountryGroups();
        String requested = request.getCountryGroup();

        if (requested != null && !requested.isBlank()) {
            CountryGroup group = groups.stream()
                    .filter(g -> g.getGroupName() != null
                            && g.getGroupName().trim().equalsIgnoreCase(requested.trim()))
                    .findFirst()
                    .orElseThrow(() -> new InvalidDailyRateException(
                            "Grupo de país inválido: " + requested.trim() + "."));
            if (!sameValue(informado, group.getValueUSD(), DAILY_TOLERANCE)) {
                throw new InvalidDailyRateException(String.format(PT_BR,
                        "O valor da diária informado (%s) não corresponde ao valor esperado (%s) para o Grupo %s.",
                        money("US$", informado), money("US$", group.getValueUSD()), group.getGroupName()));
            }
            return;
        }

        // Solicitações antigas não têm o grupo gravado: aceita se o valor bater com algum grupo.
        boolean matchesSomeGroup = groups.stream().anyMatch(g -> sameValue(informado, g.getValueUSD(), DAILY_TOLERANCE));
        if (!matchesSomeGroup) {
            throw new InvalidDailyRateException(
                    "Selecione o grupo do país de destino para solicitações em USD.");
        }
    }

    private String describeNacional(boolean docente, AssistanceRequest request) {
        if (!docente) {
            return "discente";
        }
        return isCapitalSpRj(request.getCidade(), request.getPais())
                ? "docente nas capitais de São Paulo e Rio de Janeiro"
                : "docente";
    }

    private static boolean sameValue(BigDecimal informado, BigDecimal esperado, BigDecimal tolerance) {
        if (informado == null || esperado == null) {
            return false;
        }
        return informado.subtract(esperado).abs().compareTo(tolerance) <= 0;
    }

    private static String money(String symbol, BigDecimal value) {
        BigDecimal v = value == null ? BigDecimal.ZERO : value.setScale(2, RoundingMode.HALF_UP);
        return String.format(PT_BR, "%s %,.2f", symbol, v);
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    @SafeVarargs
    private static <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}
