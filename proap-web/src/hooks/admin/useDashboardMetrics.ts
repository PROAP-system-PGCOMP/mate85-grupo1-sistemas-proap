import { useState, useCallback } from 'react';
import { getDashboardMetrics, getTotalAssistanceRequests } from '../../services/dashboardService';
import Toast from '../../helpers/notification'; // Ajuste o caminho do seu Toast se necessário

export interface MetricsData {
  totalGeralSolicitacoes: number;
  inscricoes: { docenteNacional: number; docenteInternacional: number; discenteNacional: number; discenteInternacional: number; };
  diarias: { docenteNacional: number; docenteInternacional: number; discenteNacional: number; discenteInternacional: number; };
  totalPassagensDocentes: number;
  comparativoFinanceiro: { nome: string; solicitado: number; aprovado: number }[];
  ticketMedio: { nome: string; valor: number }[];
}

const initialMetrics: MetricsData = {
  totalGeralSolicitacoes: 0,
  inscricoes: { docenteNacional: 0, docenteInternacional: 0, discenteNacional: 0, discenteInternacional: 0 },
  diarias: { docenteNacional: 0, docenteInternacional: 0, discenteNacional: 0, discenteInternacional: 0 },
  totalPassagensDocentes: 0,
  comparativoFinanceiro: [
    { nome: 'Balanço Geral', solicitado: 0, aprovado: 0 }, // Simplificado
  ],
  ticketMedio: [
    { nome: 'Doc. Nac', valor: 0 },
    { nome: 'Doc. Int', valor: 0 },
    { nome: 'Disc. Nac', valor: 0 },
    { nome: 'Disc. Int', valor: 0 },
  ],
};

const useDashboardMetrics = () => {
  const [data, setData] = useState<MetricsData>(initialMetrics);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      const [responseMetrics, responseTotal] = await Promise.all([
        getDashboardMetrics(startDate, endDate),
        getTotalAssistanceRequests(startDate, endDate)
      ]);
      
      const consolidated: MetricsData = {
        ...initialMetrics,
        diarias: { docenteNacional: 0, docenteInternacional: 0, discenteNacional: 0, discenteInternacional: 0 },
        inscricoes: { docenteNacional: 0, docenteInternacional: 0, discenteNacional: 0, discenteInternacional: 0 },
        comparativoFinanceiro: [
          { nome: 'Balanço Geral', solicitado: 0, aprovado: 0 },
        ],
        ticketMedio: [
          { nome: 'Doc. Nac', valor: 0 },
          { nome: 'Doc. Int', valor: 0 },
          { nome: 'Disc. Nac', valor: 0 },
          { nome: 'Disc. Int', valor: 0 },
        ]
      };

      consolidated.totalGeralSolicitacoes = responseTotal.count;

      responseMetrics.forEach((item) => {
        const isDocente = item.perfil?.name.toUpperCase() === 'DOCENTE';
        const isIntl = item.eventoInternacional === true;
        
        const valorAprovado = item.totalAprovado || 0;
        const valorSolicitado = item.totalSolicitado || 0; 
        const quantidade = item.count || 0; 

        // Cálculo do Ticket Médio
        const valorMedio = quantidade > 0 ? valorAprovado / quantidade : 0;

        if (isDocente && !isIntl) consolidated.ticketMedio[0].valor += valorMedio;
        else if (isDocente && isIntl) consolidated.ticketMedio[1].valor += valorMedio;
        else if (!isDocente && !isIntl) consolidated.ticketMedio[2].valor += valorMedio;
        else if (!isDocente && isIntl) consolidated.ticketMedio[3].valor += valorMedio;

        // Distribuição Financeira (Tabela de Diárias)
        if (isDocente && !isIntl) consolidated.diarias.docenteNacional += valorAprovado;
        if (isDocente && isIntl) consolidated.diarias.docenteInternacional += valorAprovado;
        if (!isDocente && !isIntl) consolidated.diarias.discenteNacional += valorAprovado;
        if (!isDocente && isIntl) consolidated.diarias.discenteInternacional += valorAprovado;

        // Distribuição de Inscrições (Pizzas)
        if (isDocente && !isIntl) consolidated.inscricoes.docenteNacional += quantidade;
        if (isDocente && isIntl) consolidated.inscricoes.docenteInternacional += quantidade;
        if (!isDocente && !isIntl) consolidated.inscricoes.discenteNacional += quantidade;
        if (!isDocente && isIntl) consolidated.inscricoes.discenteInternacional += quantidade;

        consolidated.comparativoFinanceiro[0].solicitado += valorSolicitado;
        consolidated.comparativoFinanceiro[0].aprovado += valorAprovado;
      });

      consolidated.totalPassagensDocentes = consolidated.inscricoes.docenteNacional + consolidated.inscricoes.docenteInternacional;

      setData(consolidated);
    } catch (error) {
      console.error(error);
      Toast.error('Erro ao carregar as métricas do painel');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetchMetrics };
};

export default useDashboardMetrics;