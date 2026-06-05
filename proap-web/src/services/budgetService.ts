import api from './index';

export interface SolicitationAdmin {
  id: number;
  year: number;
  orcamentoAnual: number;
}

export interface AssistanceIdValueDTO {
  id: number;
  value: number;
  createdAt: string;
  dataAvaliacaoProap: string;
  avaliadorProap: string;
}

export interface BudgetSummaryDTO {
  year: number;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  totalCeapgBudget?: number;
  usedCeapgBudget?: number;
  remainingCeapgBudget?: number;
  usedCeapgPercentage?: number;
}

export const setBudget = async (
  budget: number,
  year: number,
): Promise<SolicitationAdmin> => {
  const response = await api
    .put('/admin/budget/set', null, {
      params: { budget, year },
    })
    .catch((error) => {
      throw error.response.data.message;
    });
  return response.data;
};

export const getBudgetByYear = async (
  year: number,
): Promise<BudgetSummaryDTO> => {
  const response = await api.get(`/admin/budget/view/${year}`);
  return response.data;
};

export const getTotalAssistanceRequestsValue = async (
  startDate?: string,
  endDate?: string,
): Promise<AssistanceIdValueDTO[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get('/admin/budget/total-assistance-requests', {
    params,
  });
  return response.data;
};

export const getRemainingBudget = async (year: number): Promise<number> => {
  const response = await api.get(`/admin/budget/remaining-budget/${year}`);
  return response.data;
};

export const getBudgetSummary = async (
  year: number,
): Promise<BudgetSummaryDTO> => {
  const response = await api.get(`/admin/budget/summary/${year}`);
  return response.data;
};

export const getAvailableYears = async (): Promise<number[]> => {
  const response = await api.get('/admin/budget/available-years');
  return response.data;
};
