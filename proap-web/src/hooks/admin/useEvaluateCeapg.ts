import { useState, useCallback } from 'react';
import api from '../../services';
import Toast from '../../helpers/notification';

interface CeapgEvaluationPayload {
  custoFinalCeapg: number;
  observacoesCeapg: string;
  numeroAta?: string | number; 
  tipoDemanda?: string;
}

export default function useEvaluateCeapg() {
  const [loading, setLoading] = useState(false);

  const evaluateCeapg = useCallback(async (id: number, payload: CeapgEvaluationPayload) => {
    try {
      setLoading(true);
      
      const payloadParaOJava = {
        valorFinal: payload.custoFinalCeapg,
        observacoes: payload.observacoesCeapg,
        numeroAta: payload.numeroAta || null, 
      };
      
      const response = await api.patch(`/admin/ceapg/review/${id}`, payloadParaOJava);
      
      Toast.success('Avaliação do CEAPG salva com sucesso!');
      return response.data;
    } catch (error: any) {
      console.error('Erro na avaliação do CEAPG:', error);
      Toast.error(error.response?.data?.message || 'Erro ao salvar avaliação.');
      throw error; 
    } finally {
      setLoading(false);
    }
  }, []);

  return { evaluateCeapg, loading };
}