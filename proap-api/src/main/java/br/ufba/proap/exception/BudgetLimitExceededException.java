package br.ufba.proap.exception;

/**
 * Lançada quando uma solicitação viola os limites de orçamento anual
 * (10% por solicitação ou 20% acumulado por usuário).
 */
public class BudgetLimitExceededException extends RuntimeException {
    public BudgetLimitExceededException(String message) {
        super(message);
    }
}
