import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Chip,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CeapgResponse } from '../../../types';
import { formatNumberToBRL } from '../../../helpers/formatter';
import GradingIcon from '@mui/icons-material/Grading';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Visibility, ExpandMore, AccountBalanceWallet, Savings } from '@mui/icons-material';
import DateRangeFilter from '../../../components/custom/DateRangeFilter';

interface TableCellHeaderProps {
  text: string;
  sortBy: string;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: any) => void;
  align?: 'left' | 'center' | 'right';
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
  align = 'left',
}) => {
  const isSorted = selectedPropToSortTable[sortBy] !== undefined;
  const orderDirection = selectedPropToSortTable[sortBy] ? 'asc' : 'desc';

  return (
    <TableCell
      align={align}
      sortDirection={isSorted ? orderDirection : false}
      sx={{
        fontWeight: 'bold',
        backgroundColor: 'grey.50',
        whiteSpace: 'nowrap',
      }}
    >
      <TableSortLabel
        active={isSorted}
        direction={isSorted ? orderDirection : 'asc'}
        onClick={() => handleClickSortTable(sortBy)}
        IconComponent={ExpandMore}
        sx={{
          flexDirection: align === 'center' ? 'row' : 'inherit',
          '& .MuiTableSortLabel-icon': {
            marginLeft: align === 'center' ? '4px' : 'inherit',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        {text}
      </TableSortLabel>
    </TableCell>
  );
};

interface CeapgReviewRequestsProps {
  loading: boolean;
  requests: CeapgResponse[];
  startDate?: string;
  endDate?: string;
  montanteTotal?: number;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: (startDate?: string, endDate?: string) => void;
  selectedPropToSortTable?: Record<string, boolean>;
  handleClickSortTable?: (prop: string) => void;
}

const CeapgReviewRequests: React.FC<CeapgReviewRequestsProps> = ({
  loading,
  requests,
  startDate,
  endDate,
  montanteTotal = 0, 
  onStartDateChange,
  onEndDateChange,
  onFilter,
  selectedPropToSortTable,
  handleClickSortTable,
}) => {
  const navigate = useNavigate();
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const theme = useTheme();

  const [localSortConfig, setLocalSortConfig] = useState<{ key: string; asc: boolean }>({
    key: 'id',
    asc: true,
  });

  const activeSortRecord = selectedPropToSortTable && Object.keys(selectedPropToSortTable).length > 0
    ? selectedPropToSortTable
    : { [localSortConfig.key]: localSortConfig.asc };

  const handleSortClick = (prop: string) => {
    if (handleClickSortTable && selectedPropToSortTable && Object.keys(selectedPropToSortTable).length > 0) {
      handleClickSortTable(prop);
    } else {
      setLocalSortConfig((prev) => ({
        key: prop,
        asc: prev.key === prop ? !prev.asc : true,
      }));
    }
  };

  const sortData = (arrayToSort: CeapgResponse[]) => {
    const currentKey = Object.keys(activeSortRecord)[0] || 'id';
    const isAsc = activeSortRecord[currentKey];

    return [...arrayToSort].sort((a: any, b: any) => {
      let aVal = a[currentKey];
      let bVal = b[currentKey];

      if (currentKey === 'isCompleted') {
        aVal = !!a.avaliadorCeapg ? 1 : 0;
        bVal = !!b.avaliadorCeapg ? 1 : 0;
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  const handleLocalStartDateChange = (date: string) => {
    setLocalStartDate(date);
    onStartDateChange(date);
  };

  const handleLocalEndDateChange = (date: string) => {
    setLocalEndDate(date);
    onEndDateChange(date);
  };

  const handleFilterClick = () => {
    onFilter(localStartDate, localEndDate);
  };

  const handleReviewSolicitation = (id: number) => {
    navigate(`/admin/ceapg/review/${id}`);
  };

  const handleViewSolicitation = (id: number) => {
    navigate(`/admin/ceapg/view/${id}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
        filterByLabel="data de aprovação"
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
      ) : requests.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>Nenhuma solicitação encontrada no período selecionado.</Alert>
      ) : (
        <Box sx={{ width: '100%', mt: 2 }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: '500px',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Table stickyHeader aria-label="ceapg unified table">
              <TableHead>
                <TableRow>
                  <TableCellHeader
                    text="Solicitação"
                    sortBy="id"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCellHeader
                    text="Valor aprovado pelo revisor"
                    sortBy="valorAprovado"
                    align="center"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCellHeader
                    text="Valor aprovado em reunião"
                    sortBy="custoFinalCeapg"
                    align="center"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCellHeader
                    text="Avaliador"
                    sortBy="avaliadorProap"
                    align="center"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCellHeader
                    text="Data"
                    sortBy="dataAvaliacaoProap"
                    align="center"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCellHeader
                    text="ATA"
                    sortBy="numeroAta"
                    align="center"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCellHeader
                    text="Status"
                    sortBy="isCompleted"
                    align="center"
                    selectedPropToSortTable={activeSortRecord}
                    handleClickSortTable={handleSortClick}
                  />
                  <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortData(requests).map((request) => {
                  const isCompleted = !!request.avaliadorCeapg;

                  return (
                    <TableRow key={request.id} hover>
                      <TableCell>#{request.id}</TableCell>

                      <TableCell align="center" sx={{ fontWeight: 'normal' }}>
                        {formatNumberToBRL(request.valorAprovado)}
                      </TableCell>

                      <TableCell align="center" sx={{ fontWeight: 'normal' }}>
                        {isCompleted
                          ? formatNumberToBRL(request.custoFinalCeapg || request.valorAprovado)
                          : '-'}
                      </TableCell>

                      <TableCell align="center">
                        {isCompleted
                          ? (request.avaliadorCeapg || '-')
                          : (request.avaliadorProap || 'Sistema')}
                      </TableCell>

                      <TableCell align="center">
                        {formatDate(isCompleted ? request.dataAvaliacaoCeapg : request.dataAvaliacaoProap)}
                      </TableCell>

                      <TableCell align="center">{request.numeroAta || '-'}</TableCell>

                      <TableCell align="center">
                        <Chip
                          label={isCompleted ? 'Finalizado' : 'Pendente'}
                          color={isCompleted ? 'success' : 'warning'}
                          size="small"
                          variant={isCompleted ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 'medium', color: isCompleted ? 'white' : 'warning.main' }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        {isCompleted ? (
                          <Tooltip title="Visualizar Detalhes">
                            <IconButton onClick={() => handleViewSolicitation(request.id)} size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Avaliar Prestação de Contas">
                            <IconButton
                              color="default"
                              onClick={() => handleReviewSolicitation(request.id)}
                              size="small"
                            >
                              <GradingIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default CeapgReviewRequests;