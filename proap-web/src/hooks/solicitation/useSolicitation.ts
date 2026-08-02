import { useState, useEffect } from 'react';
import { INITIAL_REVIEW_FORM_VALUES } from '../../containers/solicitation/SolicitationFormSchema';
import { localDateToDate } from '../../helpers/conversion';
import { getAssistanceRequestById } from '../../services/assistanceRequestService';
import api from '../../services'; 

export default function useSolicitation(id: string | undefined, tipoDemanda?: string) {
  const [solicitation, setSolicitation] = useState(INITIAL_REVIEW_FORM_VALUES);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setHasError(false);
      setSolicitation(INITIAL_REVIEW_FORM_VALUES);

      const fetchDados = async () => {
        try {
          let response;
          
          if (tipoDemanda?.toUpperCase() === 'EXTRA') {
            response = await api.get(`/extrarequest/find/${id}`);
          } else {
            response = await getAssistanceRequestById(id);
          }

          const data = response.data;
          const { dataInicio, dataFim, dataAvaliacaoProap, coautores } = data;

          let processedCoautores = Array.isArray(coautores) ? [...coautores] : [];
          if (processedCoautores.length === 1 && processedCoautores[0] === '') {
            processedCoautores.pop();
          }

          setSolicitation({
            ...data,
            dataInicio: dataInicio ? localDateToDate(dataInicio) : null,
            dataFim: dataFim ? localDateToDate(dataFim) : null,
            dataAvaliacaoProap: dataAvaliacaoProap ? localDateToDate(dataAvaliacaoProap) : null,
            coautores: processedCoautores,
          });
          
        } catch (error) {
          console.error("Erro ao carregar os detalhes da solicitação:", error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDados();
    }
  }, [id, tipoDemanda]);

  return { solicitation, isLoading, hasError };
}