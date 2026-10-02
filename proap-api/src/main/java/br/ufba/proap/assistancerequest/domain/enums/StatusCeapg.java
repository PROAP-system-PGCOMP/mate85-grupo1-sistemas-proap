package br.ufba.proap.assistancerequest.domain.enums;

public enum StatusCeapg {
    ACIMA_DO_LIMITE("Acima do limite"),
    IGUAL_AO_LIMITE("Igual ao limite"),
    ABAIXO_DO_LIMITE("Abaixo do limite"),
    PENDENTE("Pendente"),
    NAO_APROVADO("Não aprovado");

    private final String status;

    StatusCeapg(String status) {
        this.status = status;
    }
}
