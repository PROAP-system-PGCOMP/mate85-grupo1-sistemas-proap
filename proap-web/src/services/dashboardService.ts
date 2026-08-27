import api from '.';

export interface DashboardResponseDTO {
  perfil: {
    id: number;
    name: string;
  };
  eventoInternacional: boolean;
  totalSolicitado: number;
  totalAprovado: number;
  count: number; 
}

export interface TotalElementosResponseDTO {
  count: number;
}

export const getDashboardMetrics = async (startDate?: string, endDate?: string): Promise<DashboardResponseDTO[]> => {
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', `${startDate}T00:00:00`);
  if (endDate) params.append('endDate', `${endDate}T23:59:59`);

  const response = await api.get(`/assistancerequest/dashboard?${params.toString()}`);
  return response.data;
};

export const getTotalAssistanceRequests = async (startDate?: string, endDate?: string): Promise<TotalElementosResponseDTO> => {
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', `${startDate}T00:00:00`);
  if (endDate) params.append('endDate', `${endDate}T23:59:59`);

  const response = await api.get(`/assistancerequest/get_elements_total?${params.toString()}`);
  return response.data;
};