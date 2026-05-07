import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AssistanceIdValueDTO } from '../../services/budgetService';
import { formatNumberToBRL } from '../../helpers/formatter';
import DateRangeFilter from '../../components/custom/DateRangeFilter';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarToday, CheckCircle, Person } from '@mui/icons-material';

interface ApprovedRequestsProps {
  loading: boolean;
  totalRequests: AssistanceIdValueDTO[];
  totalRequestsValue: number;
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: (startDate?: string, endDate?: string) => void;
}

const ApprovedRequests: React.FC<ApprovedRequestsProps> = ({
  loading,
  totalRequests,
  totalRequestsValue,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilter,
}) => {
  const navigate = useNavigate();

  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  const handleLocalStartDateChange = (date: string) => {
    setLocalStartDate(date);
  };

  const handleLocalEndDateChange = (date: string) => {
    setLocalEndDate(date);
  };

  const handleFilterClick = () => {
    onFilter(localStartDate, localEndDate);
  };

  const handleViewSolicitation = (id: number) => {
    navigate(`/solicitation/view/${id}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não disponível';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Data inválida';
    }
  };

  return (
    <>
      <DateRangeFilter
        filterByLabel="data de criação"
        startDate={localStartDate || ''}
        endDate={localEndDate || ''}
        onStartDateChange={handleLocalStartDateChange}
        onEndDateChange={handleLocalEndDateChange}
        onFilter={handleFilterClick}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : totalRequests.length === 0 ? (
        <Alert severity="info">
          Nenhuma solicitação encontrada no período selecionado.
        </Alert>
      ) : (
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 3,
              gap: 2,
              p: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Total de solicitações:{' '}
              <Box component="span" fontWeight="bold">
                {totalRequests.length}
              </Box>
            </Typography>
            <Typography variant="subtitle1" fontWeight="medium">
              Valor total:{' '}
              <Box component="span" fontWeight="bold">
                {formatNumberToBRL(totalRequestsValue)}
              </Box>
            </Typography>
          </Box>

          <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1 }}>
            {totalRequests.map((request) => (
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
                onClick={() => handleViewSolicitation(request.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
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
                        Solicitação #{request.id}
                      </Typography>
                      <Chip
                        icon={<CheckCircle fontSize="small" />}
                        label="Aprovada"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'medium', color: 'white' }}
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
                        <CalendarToday fontSize="small" color="action" />
                        <Tooltip title="Data de criação" arrow>
                          <Typography variant="body2" color="text.secondary">
                            Criada em: {formatDate(request.createdAt)}
                          </Typography>
                        </Tooltip>
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
                        <Tooltip title="Data de aprovação" arrow>
                          <Typography variant="body2" color="text.secondary">
                            Aprovada em:{' '}
                            {formatDate(request.dataAvaliacaoProap)}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Box>

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
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary"
                      >
                        {formatNumberToBRL(request.value)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ApprovedRequests;
