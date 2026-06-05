import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AssistanceIdValueDTO } from '../../services/budgetService';
import { formatNumberToBRL } from '../../helpers/formatter';
import DateRangeFilter from '../../components/custom/DateRangeFilter';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    navigate(`/admin-panel/solicitation/view/${id}`);
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

          <TableContainer 
            component={Paper} 
            sx={{ 
              maxHeight: '600px', 
              boxShadow: 'none', 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <Table stickyHeader aria-label="tabela de solicitações aprovadas">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Data de Criação</strong></TableCell>
                  <TableCell><strong>Data de Aprovação</strong></TableCell>
                  <TableCell><strong>Avaliador</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {totalRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    hover
                    onClick={() => handleViewSolicitation(request.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>{formatDate(request.dataAvaliacaoProap)}</TableCell>
                    <TableCell>{request.avaliadorProap || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label="Aprovada"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'medium', color: 'white' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatNumberToBRL(request.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default ApprovedRequests;