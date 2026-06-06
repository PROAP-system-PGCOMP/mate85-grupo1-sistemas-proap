import React, { useState, useEffect, useMemo } from 'react';
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
  TableSortLabel,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
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

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] === null || b[orderBy] === undefined) return -1;
  if (a[orderBy] === null || a[orderBy] === undefined) return 1;
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface TableCellHeaderProps {
  text: string;
  sortBy: keyof AssistanceIdValueDTO;
  orderBy: keyof AssistanceIdValueDTO;
  order: Order;
  onRequestSort: (property: keyof AssistanceIdValueDTO) => void;
  align?: 'left' | 'center' | 'right';
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  orderBy,
  order,
  onRequestSort,
  align = 'left',
}) => {
  const isSorted = orderBy === sortBy;

  return (
    <TableCell
      align={align}
      sortDirection={isSorted ? order : false}
      sx={{
        fontWeight: 'bold',
        backgroundColor: 'grey.50',
        whiteSpace: 'nowrap',
      }}
    >
      <TableSortLabel
        active={isSorted}
        direction={isSorted ? order : 'asc'}
        onClick={() => onRequestSort(sortBy)}
        IconComponent={ExpandMore} // <--- A setinha que você queria!
        sx={{
          flexDirection: align === 'center' ? 'row' : 'inherit',
          '& .MuiTableSortLabel-icon': {
            marginLeft: align === 'center' ? '4px' : 'inherit',
          },
        }}
      >
        {text}
      </TableSortLabel>
    </TableCell>
  );
};

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

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof AssistanceIdValueDTO>('createdAt');

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
      return 'Data inválida';
    }
  };

  const handleRequestSort = (property: keyof AssistanceIdValueDTO) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRequests = useMemo(() => {
    return [...totalRequests].sort(getComparator(order, orderBy));
  }, [totalRequests, order, orderBy]);

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
                  <TableCellHeader
                    text="ID"
                    sortBy="id"
                    orderBy={orderBy}
                    order={order}
                    onRequestSort={handleRequestSort}
                  />
                  <TableCellHeader
                    text="Data de Criação"
                    sortBy="createdAt"
                    orderBy={orderBy}
                    order={order}
                    onRequestSort={handleRequestSort}
                  />
                  <TableCellHeader
                    text="Data de Aprovação"
                    sortBy="dataAvaliacaoProap"
                    orderBy={orderBy}
                    order={order}
                    onRequestSort={handleRequestSort}
                  />
                  <TableCellHeader
                    text="Avaliador"
                    sortBy="avaliadorProap"
                    orderBy={orderBy}
                    order={order}
                    onRequestSort={handleRequestSort}
                  />
                  
                  {/* Status não é ordenável, então mantemos a TableCell nativa */}
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                    Status
                  </TableCell>

                  <TableCellHeader
                    text="Valor"
                    sortBy="value"
                    orderBy={orderBy}
                    order={order}
                    onRequestSort={handleRequestSort}
                    align="right"
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRequests.map((request) => (
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
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'black' }}>
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