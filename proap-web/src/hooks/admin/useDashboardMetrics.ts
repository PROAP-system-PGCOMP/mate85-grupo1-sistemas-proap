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
        // Docente/Discente vem de solicitanteDocente (campo da solicitação), não do perfil do usuário.
        const isDocente = item.solicitanteDocente === true;
        const isIntl = item.eventoInternacional === true;

        const valorAprovado = Number(item.totalAprovado) || 0;
        const valorSolicitado = Number(item.totalSolicitado) || 0;
        const quantidade = Number(item.count) || 0;
        const qtdInscricoes = Number(item.qtdInscricoes) || 0;
        const qtdPassagens = Number(item.qtdPassagensAprovadas) || 0;
        const valorDiarias = Number(item.totalDiariasAprovadas) || 0;

        const key = `${isDocente ? 'docente' : 'discente'}${isIntl ? 'Internacional' : 'Nacional'}` as
          'docenteNacional' | 'docenteInternacional' | 'discenteNacional' | 'discenteInternacional';
        const ticketIndex = (isDocente ? 0 : 2) + (isIntl ? 1 : 0);

        // Ticket médio (valor aprovado / nº de solicitações)
        consolidated.ticketMedio[ticketIndex].valor += quantidade > 0 ? valorAprovado / quantidade : 0;

        // Tabela "Consolidação de Diárias": somente o valor das diárias aprovadas
        consolidated.diarias[key] += valorDiarias;

        // Pizzas "Inscrições em Eventos": somente solicitações com valor de inscrição
        consolidated.inscricoes[key] += qtdInscricoes;

        // Card "Passagens Aéreas": solicitações aprovadas com valor de passagem
        consolidated.totalPassagensDocentes += qtdPassagens;

        consolidated.comparativoFinanceiro[0].solicitado += valorSolicitado;
        consolidated.comparativoFinanceiro[0].aprovado += valorAprovado;
      });

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