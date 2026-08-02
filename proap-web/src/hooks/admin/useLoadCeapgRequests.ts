import { useState, useCallback } from 'react';
import Toast from '../../helpers/notification';
import { formatDateToAPI } from '../../helpers/conversion';
import { getAllCeapgReviews } from '../../services/ceapgService';
import { CeapgResponse } from '../../types';
import api from '../../services';

export default function useCeapgRequests() {
  const [loading, setLoading] = useState(false);
  const [ceapgRequests, setCeapgRequests] = useState<CeapgResponse[]>([]);

  const getCeapg = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);

      const start = startDate ? formatDateToAPI(startDate) : undefined;
      const end = endDate ? formatDateToAPI(endDate) : undefined;
      
      const normalRequests = await getAllCeapgReviews(start, end);

      let extraRequests: any[] = [];
      try {
        const extraResponse = await api.get('/extrarequest/list', {
          params: { sortBy: 'createdAt', ascending: false, page: 0, size: 1000 }
        });
        
        const responseData = extraResponse.data;
        let extrasList: any[] = [];

        if (Array.isArray(responseData)) extrasList = responseData;
        else if (responseData && Array.isArray(responseData.list)) extrasList = responseData.list;
        else if (responseData && Array.isArray(responseData.content)) extrasList = responseData.content;
        else if (responseData && Array.isArray(responseData.data)) extrasList = responseData.data;
        
        extraRequests = extrasList
          .filter((req: any) => {
            if (req.avaliadorCeapg) return true;
            const situacaoAtual = req.situacao !== undefined ? Number(req.situacao) : Number(req.status);
            return situacaoAtual === 1; 
          }) 
          .map((req: any) => {
            let dataProap = req.dataAvaliacaoProap || req.createdAt;
            if (dataProap && typeof dataProap === 'string' && dataProap.includes('/')) {
              const [day, month, year] = dataProap.split('/');
              dataProap = `${year}-${month}-${day}`;
            }

            return {
              ...req,
              tipoDemanda: 'EXTRA',
              valorAprovado: req.valorAprovado !== null && req.valorAprovado !== undefined 
                ? req.valorAprovado 
                : req.valorSolicitado,
              valorTotal: req.valorSolicitado || req.valorTotal,
              dataAvaliacaoProap: dataProap,
            };
          });
      } catch (extraErr) {
        console.warn("Não foi possível buscar as solicitações extras na listagem.", extraErr);
      }

      const combinedRequests = [
        ...normalRequests.map((req: any) => ({
          ...req,
          tipoDemanda: req.tipoSolicitacao || 'PUBLICAÇÃO' 
        })),
        ...extraRequests
      ];

      combinedRequests.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.dataAvaliacaoProap || 0).getTime();
        const dateB = new Date(b.createdAt || b.dataAvaliacaoProap || 0).getTime();
        return dateB - dateA;
      });

      setCeapgRequests(combinedRequests as CeapgResponse[]);
      
    } catch (err) {
      console.error('Erro ao carregar solicitações CEAPG:', err);
      Toast.error('Erro ao carregar solicitações CEAPG');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateCeapgEvaluation = async (id: number, data: any) => {
    const tipoFormatado = (data.tipoDemanda || '').toUpperCase();
    
    if (tipoFormatado === 'EXTRA' || data.itemSolicitado !== undefined) {
      return await api.patch(`/admin/ceapg/review/extra/${id}`, data);
    }
    
    return await api.patch(`/admin/ceapg/review/${id}`, data);
  };

  return { ceapgRequests, loading, getCeapg, updateCeapgEvaluation };
}