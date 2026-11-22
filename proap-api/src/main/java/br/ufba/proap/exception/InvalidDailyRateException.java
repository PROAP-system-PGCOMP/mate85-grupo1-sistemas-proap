package br.ufba.proap.exception;

/**
 * Lançada quando o valor da diária (ou o total) informado em uma solicitação
 * não corresponde ao valor calculado pelas regras do sistema.
 */
public class InvalidDailyRateException extends RuntimeException {

    public InvalidDailyRateException(String message) {
        super(message);
    }
}
