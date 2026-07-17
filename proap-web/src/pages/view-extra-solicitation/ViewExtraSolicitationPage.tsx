import React, { useEffect, useState } from 'react';
import { Button, SvgIcon, SvgIconProps} from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { toast } from 'react-toastify';
import { getExtraAssistanceRequestById } from '../../services/extraAssistanceRequestService';
import ViewExtraSolicitationContainer from '../../containers/solicitation/view/ViewExtraSolicitationContainer';
import PageHeader from '../../components/PageHeader';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import useHasPermission from '../../hooks/auth/useHasPermission';

const EditSquareIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413Q19.825 21 19 21Zm4-6v-2.125l5.975-5.975 2.125 2.125L11.125 15Zm8.8-6.025-2.125-2.125.85-.85q.275-.275.688-.275.412 0 .687.275l.75.75q.275.275.275.688 0 .412-.275.687Z"/>
  </SvgIcon>
);


export default function ViewExtraSolicitationPage() {
  const { id } = useParams<{ id: string }>();
  const [extraRequest, setExtraRequest] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const userCanReviewRequests = useHasPermission('ADMIN_ROLE');

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/extra-solicitation/edit/${id}`); 
  };
  
  const handleReview = () => {
    navigate(`/extra-solicitation/review/${id}`); 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error('ID da solicitação não fornecido');
        }

        const response = await getExtraAssistanceRequestById(Number(id));
        setExtraRequest(response);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os dados da solicitação';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  
  let content;
  if (loading) {
    content = <LoadingIndicator />;
  } else if (error) {
    content = <ErrorMessage message={error} />;
  } else if (!extraRequest) {
    content = <ErrorMessage message="Solicitação não encontrada" />;
  } else {
    content = <ViewExtraSolicitationContainer extraRequest={extraRequest} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>{content}</Paper>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
                sx={{ mt: 4 }}
                variant="contained"
                color="primary"
                onClick={handleBackClick}
              >
                Voltar
        </Button>
        {userCanReviewRequests && (
          <Box display="flex" justifyContent="space-between" gap={2}>
            <Button
                    sx={{ mt: 4, display:"flex", gap: 1 }}
                    variant="contained"
                    color="primary"
                    onClick={handleEdit}
                  >
                    <EditSquareIcon />
                    Editar
            </Button>
            <Button
                    sx={{ mt: 4, display:"flex", gap: 1 }}
                    variant="contained"
                    color="primary"
                    onClick={handleReview}
                  >
                    <FactCheckIcon fontSize="small" />
                    Revisar
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
