package br.ufba.proap.assistancerequest.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.exception.InvalidDailyRateException;
import br.ufba.proap.sysadminpanel.domain.CountryGroup;
import br.ufba.proap.sysadminpanel.domain.SystemConfiguration;

class DailyRateCalculatorTest {

    private final DailyRateCalculator calculator = new DailyRateCalculator();
    private SystemConfiguration config;

    @BeforeEach
    void setup() {
        config = new SystemConfiguration();
        config.setValorDiariaAlunoBRL(new BigDecimal("320"));
        config.setValorDiariaDocenteBRL(new BigDecimal("380"));
        config.setValorDiariaDocenteSpRjBRL(new BigDecimal("425"));

        List<CountryGroup> groups = new ArrayList<>();
        groups.add(group("A", "180"));
        groups.add(group("B", "260"));
        groups.add(group("C", "310"));
        groups.add(group("D", "370"));
        config.setCountryGroups(groups);
    }

    private CountryGroup group(String name, String usd) {
        CountryGroup g = new CountryGroup();
        g.setGroupName(name);
        g.setValueUSD(new BigDecimal(usd));
        return g;
    }

    private AssistanceRequest nacional(boolean docente, String cidade, String valorDiaria) {
        AssistanceRequest r = new AssistanceRequest();
        r.setSolicitanteDocente(docente);
        r.setEventoInternacional(false);
        r.setCidade(cidade);
        r.setPais("Brasil");
        r.setQuantidadeDiariasSolicitadas(2);
        r.setUltimaDiariaIntegral(true);
        r.setIsDolar(false);
        r.setValorDiaria(new BigDecimal(valorDiaria));
        r.setValorInscricao(new BigDecimal("100"));
        r.setValorPassagem(BigDecimal.ZERO);
        return r;
    }

    // ---------- localidade ----------

    @ParameterizedTest
    @ValueSource(strings = { "São Paulo", "sao paulo", "  SÃO   PAULO ", "São Paulo - SP", "Sao Paulo/SP",
            "Rio de Janeiro", "rio de janeiro - RJ", "RIO DE JANEIRO, RJ" })
    void reconheceCapitaisSpRj(String cidade) {
        assertTrue(DailyRateCalculator.isCapitalSpRj(cidade, "Brasil"), cidade);
    }

    @ParameterizedTest
    @ValueSource(strings = { "Campinas", "Niterói", "Salvador", "São Paulo do Potengi", "Santos", "Guarulhos",
            "Rio das Ostras", "SP", "" })
    void naoReconheceOutrasCidades(String cidade) {
        assertFalse(DailyRateCalculator.isCapitalSpRj(cidade, "Brasil"), cidade);
    }

    @Test
    void capitalForaDoBrasilNaoContaComoSpRj() {
        assertFalse(DailyRateCalculator.isCapitalSpRj("São Paulo", "Portugal"));
    }

    // ---------- tarifa nacional ----------

    @Test
    void alunoSempre320EmQualquerCidade() {
        assertEquals(0, new BigDecimal("320").compareTo(calculator.resolveNacional(config, false, "São Paulo", "Brasil")));
        assertEquals(0, new BigDecimal("320").compareTo(calculator.resolveNacional(config, false, "Salvador", "Brasil")));
    }

    @Test
    void docenteEmCapitalSpRj425() {
        assertEquals(0, new BigDecimal("425").compareTo(calculator.resolveNacional(config, true, "São Paulo", "Brasil")));
        assertEquals(0, new BigDecimal("425").compareTo(calculator.resolveNacional(config, true, "Rio de Janeiro", "Brasil")));
    }

    @Test
    void docenteEmOutrasCapitaisEInterior380() {
        assertEquals(0, new BigDecimal("380").compareTo(calculator.resolveNacional(config, true, "Salvador", "Brasil")));
        assertEquals(0, new BigDecimal("380").compareTo(calculator.resolveNacional(config, true, "Campinas", "Brasil")));
        assertEquals(0, new BigDecimal("380").compareTo(calculator.resolveNacional(config, true, "Niterói", "Brasil")));
    }

    @Test
    void semConfiguracaoUsaValoresPadrao() {
        assertEquals(0, DailyRateCalculator.DEFAULT_ALUNO.compareTo(calculator.resolveNacional(null, false, "X", "Brasil")));
        assertEquals(0, DailyRateCalculator.DEFAULT_DOCENTE.compareTo(calculator.resolveNacional(null, true, "X", "Brasil")));
        assertEquals(0, DailyRateCalculator.DEFAULT_DOCENTE_SP_RJ
                .compareTo(calculator.resolveNacional(null, true, "São Paulo", "Brasil")));
    }

    @Test
    void alunoUsaValorGlobalAntigoQuandoNovoCampoAusente() {
        config.setValorDiariaAlunoBRL(null);
        config.setValorDiariaBRL(new BigDecimal("300"));
        assertEquals(0, new BigDecimal("300").compareTo(calculator.resolveNacional(config, false, "Salvador", "Brasil")));
    }

    // ---------- validação ----------

    @Test
    void aceitaValorCorretoParaCadaPerfil() {
        AssistanceRequest aluno = nacional(false, "São Paulo", "320");
        aluno.setValorTotal(calculator.calculateTotal(aluno));
        assertDoesNotThrow(() -> calculator.validate(aluno, config));

        AssistanceRequest docSp = nacional(true, "São Paulo", "425");
        docSp.setValorTotal(calculator.calculateTotal(docSp));
        assertDoesNotThrow(() -> calculator.validate(docSp, config));

        AssistanceRequest docInterior = nacional(true, "Campinas", "380");
        docInterior.setValorTotal(calculator.calculateTotal(docInterior));
        assertDoesNotThrow(() -> calculator.validate(docInterior, config));
    }

    @Test
    void rejeitaDocenteEmCampinasCom425() {
        AssistanceRequest r = nacional(true, "Campinas", "425");
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void rejeitaAlunoCom425() {
        AssistanceRequest r = nacional(false, "São Paulo", "425");
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void semDiariasNaoValidaValorDaDiaria() {
        AssistanceRequest r = nacional(false, "Salvador", "999");
        r.setQuantidadeDiariasSolicitadas(0);
        assertDoesNotThrow(() -> calculator.validate(r, config));
    }

    @Test
    void rejeitaTotalDivergente() {
        AssistanceRequest r = nacional(true, "Salvador", "380");
        r.setValorTotal(new BigDecimal("1.00"));
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void ultimaDiariaMeiaReduzTotal() {
        AssistanceRequest r = nacional(true, "Salvador", "380");
        r.setQuantidadeDiariasSolicitadas(3);
        r.setUltimaDiariaIntegral(false);
        // 100 inscrição + 380 * 2,5
        assertEquals(0, new BigDecimal("1050.00").compareTo(calculator.calculateTotal(r)));
    }

    // ---------- internacional ----------

    private AssistanceRequest internacional(String grupo, String valorDiaria) {
        AssistanceRequest r = nacional(true, "Berlim", valorDiaria);
        r.setPais("Alemanha");
        r.setEventoInternacional(true);
        r.setIsDolar(true);
        r.setCotacaoMoeda(new BigDecimal("5.00"));
        r.setCountryGroup(grupo);
        return r;
    }

    @Test
    void aceitaValorDoGrupoCnpq() {
        AssistanceRequest r = internacional("D", "370");
        r.setValorTotal(calculator.calculateTotal(r));
        assertDoesNotThrow(() -> calculator.validate(r, config));
    }

    @Test
    void rejeitaValorQueNaoBateComOGrupo() {
        AssistanceRequest r = internacional("D", "260");
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void rejeitaGrupoInexistente() {
        AssistanceRequest r = internacional("Z", "370");
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void solicitacaoAntigaSemGrupoAceitaValorDeAlgumGrupo() {
        AssistanceRequest ok = internacional(null, "310");
        ok.setValorTotal(calculator.calculateTotal(ok));
        assertDoesNotThrow(() -> calculator.validate(ok, config));

        AssistanceRequest bad = internacional(null, "123");
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(bad, config));
    }

    @Test
    void eventoInternacionalExigeUsd() {
        AssistanceRequest r = nacional(true, "Berlim", "380");
        r.setEventoInternacional(true);
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void usdExigeCotacao() {
        AssistanceRequest r = internacional("A", "180");
        r.setCotacaoMoeda(null);
        assertThrows(InvalidDailyRateException.class, () -> calculator.validate(r, config));
    }

    @Test
    void totalEmUsdConverteInscricaoEDiariasParaBrl() {
        AssistanceRequest r = internacional("A", "180");
        r.setQuantidadeDiariasSolicitadas(2);
        r.setUltimaDiariaIntegral(true);
        r.setValorInscricao(new BigDecimal("100"));
        r.setValorPassagem(new BigDecimal("1000"));
        // (100 + 180 * 2) * 5 + 1000
        assertEquals(0, new BigDecimal("3300.00").compareTo(calculator.calculateTotal(r)));
    }
}
