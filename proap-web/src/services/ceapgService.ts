import api from '.';
import { CeapgResponse } from '../types';

export const getPendingCeapgReviews = async (
  startDate?: string,
  endDate?: string,
) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get('/admin/ceapg/pending', {
    params,
  });
  return response.data as CeapgResponse[];
};

export const getCompletedCeapgReviews = async (
  startDate?: string,
  endDate?: string,
) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get('/admin/ceapg/completed', {
    params,
  });
  return response.data as CeapgResponse[];
};

export const getAllCeapgReviews = async (
  startDate?: string,
  endDate?: string,
) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api
    .get('/admin/ceapg', {
      params,
    })
    .catch((error) => {
      console.error(
        'Error fetching CEAPG reviews:',
        error.response.data.message,
      );
      return { status: 404, data: [] };
    });
  return response.data as CeapgResponse[];
};

export interface RankingUserDTO {
  id: number;
  name: string;
  email: string;
  cpf: string;
  registrationNumber: string; 
  phone: string;
  alternativePhone: string;
  profileName: string;        
  requestedNormalAmount: number; 
  aproveNormalAmount: number;    
  requestedExtraAmount: number; 
  aprovedExtraAmount: number;   
}

export const getApprovedRanking = async () => {
  const response = await api
    .get('/user/ranking')
    .catch((error) => {
      console.error(
        'Erro ao buscar o ranking de usuários:',
        error.response?.data?.message || error.message,
      );
      return { data: [] };
    });
    
  return response.data as RankingUserDTO[];
};
