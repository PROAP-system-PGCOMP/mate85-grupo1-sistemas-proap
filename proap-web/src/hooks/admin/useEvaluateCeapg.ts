import { useState, useCallback } from 'react';
import api from '../../services';
import Toast from '../../helpers/notification'; // Padrão de notificações do seu projeto

interface CeapgEvaluationPayload {
  custoFinalCeapg: number;
  observacoesCeapg: string;
}

export default function useEvaluateCeapg() {
  const [loading, setLoading] = useState(false);

  const evaluateCeapg = useCallback(async (id: number, payload: CeapgEvaluationPayload) => {
    try {
      setLoading(true);
      
      // LEMBRETE: Ajuste o método (api.put ou api.patch) e a URL de acordo com o CeapgController do Igor
      const response = await api.patch(`/admin/ceapg/review/${id}`, payload);
      
      Toast.success('Avaliação do CEAPG salva com sucesso!');
      return response.data;
    } catch (error: any) {
      console.error('Erro na avaliação do CEAPG:', error);
      Toast.error(error.response?.data?.message || 'Erro ao salvar avaliação.');
      throw error; // Lança o erro para o componente saber que não deve redirecionar a página
    } finally {
      setLoading(false);
    }
  }, []);

  return { evaluateCeapg, loading };
}