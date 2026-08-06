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
  isExtra?: boolean;
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

  const extraParams: Record<string, string> = {};
  if (startDate) extraParams.start = startDate;
  if (endDate) extraParams.end = endDate;

  try {
    const [normalResponse, extraResponse] = await Promise.all([
      api.get('/admin/budget/total-assistance-requests', { params }),
      api.get('/admin/budget/total-approved-extra-requests', { params: extraParams }),
    ]);

    const normais: AssistanceIdValueDTO[] = normalResponse.data.map((req: any) => ({
      ...req,
      isExtra: false
    }));
    const extras = extraResponse.data;

    const extrasMapeadas: AssistanceIdValueDTO[] = extras.map((req: any) => ({
      id: req.id,
      value: req.custoFinalCeapg ?? req.valorAprovado ?? 0,
      
      createdAt: Array.isArray(req.createdAt) 
        ? new Date(req.createdAt[0], req.createdAt[1] - 1, req.createdAt[2]).toISOString()
        : req.createdAt || req.dataCriacao,
        
      dataAvaliacaoProap: req.dataAvaliacaoProap || req.dataAvaliacaoCeapg || '-',
      avaliadorProap: req.avaliadorProap?.name || req.avaliadorProap || req.avaliadorCeapg?.name || '-',
      isExtra: true 
    }));

    return [...normais, ...extrasMapeadas];
  } catch (error) {
    console.error("Erro ao buscar as solicitações:", error);
    throw error;
  }
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