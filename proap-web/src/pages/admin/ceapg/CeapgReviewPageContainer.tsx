import { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Tabs, 
  Tab,
  Paper 
} from '@mui/material';

import { RateReview, AccountBalanceWallet, Savings, Receipt, PriceCheck, FactCheck, Leaderboard  } from '@mui/icons-material';
import { useSnackbar } from 'notistack'; 

import useCeapgRequests from '../../../hooks/admin/useLoadCeapgRequests';
import CeapgReviewRequests from '../../../containers/admin-panel/ceapg/CeapgReviewRequests';
import CeapgEvaluationModal from './CeapgEvaluationModal'; 
import CeapgRankingView from '../../../containers/admin-panel/ceapg/CeapgRankingView'; 

import { CeapgResponse } from '../../../types';
import { getBudgetSummary } from '../../../services/budgetService';
import { formatNumberToBRL } from '../../../helpers/formatter';

const CeapgReviewPageContainer = () => {
  const { ceapgRequests, loading, getCeapg, updateCeapgEvaluation }: any = useCeapgRequests();
  const { enqueueSnackbar } = useSnackbar();
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CeapgResponse | null>(null);

  const [totalBudget, setTotalBudget] = useState<number>(0);
  
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    getCeapg();

    const fetchBudget = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await getBudgetSummary(currentYear);        
        setTotalBudget(response.totalBudget || 0); 
      } catch (error) {
        console.error("Erro ao buscar o orçamento anual:", error);
        enqueueSnackbar('Não foi possível carregar os dados de orçamento.', { variant: 'warning' });
      }
    };

    fetchBudget();
  }, [getCeapg, enqueueSnackbar]);

  const handleFilterApply = useCallback((start?: string, end?: string) => {
    getCeapg(start, end);
  }, [getCeapg]);

  const handleOpenEvaluation = (request: CeapgResponse) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleSaveEvaluation = async (id: number, data: any) => {
    try {
      await updateCeapgEvaluation(id, data);
      enqueueSnackbar('Avaliação gravada!', { variant: 'success' });
      setIsModalOpen(false);
      getCeapg(startDate, endDate);
    } catch (error) {
      enqueueSnackbar('Erro ao salvar.', { variant: 'error' });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const requestsArray = ceapgRequests || [];
  const totalSolicitado = requestsArray.reduce((acc: number, req: CeapgResponse) => acc + Number(req.valorAprovado || 0), 0);
  const totalGasto = requestsArray
    .filter((req: CeapgResponse) => !!req.avaliadorCeapg)
    .reduce((acc: number, req: CeapgResponse) => acc + Number(req.custoFinalCeapg || req.valorAprovado || 0), 0);

  const saldoPrevisto = totalBudget - totalSolicitado;
  const saldoReal = totalBudget - totalGasto;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', xl: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', xl: 'center' },
        gap: 3
      }}>
        
        {/* TÍTULO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RateReview color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ whiteSpace: 'nowrap' }}>
            Avaliações CEAPG
          </Typography>
        </Box>

        {/* CARDS DE RESUMO (Mantidos inalterados) */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', xl: 'flex-end' } }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'info.50', minWidth: '200px', flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Receipt sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">CONSUMO PREVISTO</Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {formatNumberToBRL(totalSolicitado)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'primary.50', minWidth: '200px', flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <AccountBalanceWallet sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">SALDO PREVISTO</Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {formatNumberToBRL(saldoPrevisto)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', minWidth: '200px', flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <PriceCheck sx={{ fontSize: 32, color: 'success.main', mr: 1.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">CONSUMO REAL</Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {formatNumberToBRL(totalGasto)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'success.50', minWidth: '200px', flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Savings sx={{ fontSize: 32, color: 'success.main', mr: 1.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">SALDO REAL</Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {formatNumberToBRL(saldoReal)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
        }}
      >
        {/* CONTROLE DE ABAS */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, alignItems: 'center', display: 'flex', minHeight: 70 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="Abas de avaliação CEAPG"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              minHeight: 70,
              '& .MuiTab-root': {
                textTransform: 'none', 
                fontWeight: 600,       
                fontSize: '0.9rem',
                minHeight: 70,
                color: 'text.secondary', 
                '&.Mui-selected': {
                  color: 'primary.main', 
                },
              },
            }}
          >
            <Tab 
              icon={<FactCheck sx={{ fontSize: '1.2rem' }} />}
              label="Solicitações Pendentes" 
              iconPosition="start" 
              id="tab-0" 
            />
            <Tab 
              icon={<Leaderboard sx={{ fontSize: '1.2rem' }} />}
              label="Recursos por Solicitante" 
              iconPosition="start" 
              id="tab-1" 
            />
          </Tabs>
        </Box>

        {/* CONTEÚDO DAS ABAS */}
        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <CeapgReviewRequests
              loading={loading}
              requests={ceapgRequests}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onFilter={handleFilterApply}
              montanteTotal={totalBudget} 
            />
          )}

          {currentTab === 1 && (
            <CeapgRankingView />
          )}
        </Box>
      </Paper>

      <CeapgEvaluationModal
        open={isModalOpen}
        request={selectedRequest}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvaluation}
      />
    </Container>
  );
};

export default CeapgReviewPageContainer;