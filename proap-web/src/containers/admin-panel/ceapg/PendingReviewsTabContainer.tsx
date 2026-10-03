import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { CeapgResponse } from '../../../types';
import {
  PendingOutlined,
  Person,
  CheckCircle,
  AttachMoney,
} from '@mui/icons-material';

interface PendingReviewsTabProps {
  pendingReviews: CeapgResponse[];
  handleReviewSolicitation: (id: number) => void;
  formatDate: (dateString: string | null) => string;
  formatNumberToBRL: (value: number) => string;
}

const PendingReviewsTab: React.FC<PendingReviewsTabProps> = ({
  pendingReviews,
  handleReviewSolicitation,
  formatDate,
  formatNumberToBRL,
}) => {
  return pendingReviews.length === 0 ? (
    <Alert severity="info">
      Não há solicitações pendentes de avaliação pelo CEAPG.
    </Alert>
  ) : (
    <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1 }}>
      {pendingReviews.map((request) => (
        <Card
          key={request.id}
          sx={{
            mb: 1.5,
            transition: 'all 0.2s ease',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            },
          }}
          onClick={() => handleReviewSolicitation(request.id!)}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Solicitação #{request.id} {request.nomeSolicitante ? `- ${request.nomeSolicitante}` : ''}
                </Typography>
                <Chip
                  icon={<PendingOutlined fontSize="small" />}
                  label="Pendente CEAPG"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexBasis: { sm: '50%' },
                  }}
                >
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Aprovada por: {request.avaliadorProap}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexBasis: { sm: '50%' },
                  }}
                >
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Aprovada em: {formatDate(request.dataAvaliacaoProap)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 0.5,
                }}
              >
                <AttachMoney fontSize="small" color="primary" />
                <Typography variant="body1" fontWeight="bold" color="primary">
                  Valor Aprovado: {formatNumberToBRL(request.valorAprovado)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PendingReviewsTab;