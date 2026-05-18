import { useState, useCallback, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { RateReview } from '@mui/icons-material';
// Se não quiser instalar o notistack agora, comente a linha abaixo e use alert()
import { useSnackbar } from 'notistack'; 

import useCeapgRequests from '../../../hooks/admin/useLoadCeapgRequests';
import CeapgReviewRequests from '../../../containers/admin-panel/ceapg/CeapgReviewRequests';
import CeapgEvaluationModal from './CeapgEvaluationModal'; // Verifique se o nome do arquivo está idêntico
import { CeapgResponse } from '../../../types';

const CeapgReviewPageContainer = () => {
  // Certifique-se de que o hook useCeapgRequests retorna updateCeapgEvaluation
  const { ceapgRequests, loading, getCeapg, updateCeapgEvaluation }: any = useCeapgRequests();
  const { enqueueSnackbar } = useSnackbar();
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CeapgResponse | null>(null);

  useEffect(() => {
    getCeapg();
  }, [getCeapg]);

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

  

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <RateReview color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight="bold" color="primary">
          Avaliações CEAPG
        </Typography>
      </Box>

      <CeapgReviewRequests
        loading={loading}
        requests={ceapgRequests}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={handleFilterApply}
      />

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