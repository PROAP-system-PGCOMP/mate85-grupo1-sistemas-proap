import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Chip,
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CeapgResponse } from '../../../types';
import { formatNumberToBRL } from '../../../helpers/formatter';
import GradingIcon from '@mui/icons-material/Grading';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Visibility, ExpandMore } from '@mui/icons-material';
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
      sx={{ fontWeight: 'bold', backgroundColor: 'grey.50', whiteSpace: 'nowrap' }}
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
  onStartDateChange,
  onEndDateChange,
  onFilter,
  selectedPropToSortTable,
  handleClickSortTable,
}) => {
  const navigate = useNavigate();
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const checkIsCompleted = (req: any) => {
    const sit = req.situacao || 0;
    let completed = !!req.dataAvaliacaoCeapg;
    
    if (sit === 2 || sit === 4) {
      completed = true;
    }
    
    return completed;
  };

  const filteredRequests = requests.filter((req) => !checkIsCompleted(req));

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
        aVal = checkIsCompleted(a) ? 1 : 0;
        bVal = checkIsCompleted(b) ? 1 : 0;
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

  const handleReviewSolicitation = (id: number, tipo: string) => {
    navigate(`/admin/ceapg/review/${id}`, { state: { tipoDemanda: tipo } });
  };

  const handleViewSolicitation = (id: number, tipo: string) => {
    navigate(`/admin/ceapg/view/${id}`, { state: { tipoDemanda: tipo } });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getChipColor = (tipo: string) => {
    switch (tipo.toUpperCase()) {
      case 'EXTRA': return 'secondary';
      case 'PUBLICAÇÃO': 
      case 'PUBLICACAO': return 'info';
      default: return 'primary';
    }
  };

  const getEvaluatorDisplay = (evaluator: any) => {
    if (!evaluator) return '-';
    if (typeof evaluator === 'string') return evaluator;
    if (typeof evaluator === 'object' && evaluator.name) return evaluator.name;
    return '-';
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
      ) : filteredRequests.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>Nenhuma solicitação pendente encontrada.</Alert>
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
                  <TableCellHeader text="Solicitação" sortBy="id" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="Tipo" sortBy="tipoSolicitacao" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="Valor aprovado na reunião" sortBy="custoFinalCeapg" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="Valor aprovado pelo CEAPG" sortBy="valorAprovado" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="Avaliador" sortBy="avaliadorProap" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="Data" sortBy="dataAvaliacaoProap" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="ATA" sortBy="numeroAta" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCellHeader text="Status" sortBy="isCompleted" align="center" selectedPropToSortTable={activeSortRecord} handleClickSortTable={handleSortClick} />
                  <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortData(filteredRequests).map((request) => {
                  const tipo = (request as any).tipoDemanda || (request as any).tipoSolicitacao || 'NORMAL'; 
                  const tipoFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
                  
                  const isCompleted = checkIsCompleted(request);
                  const sit = (request as any).situacao || 0;

                  let statusLabel = 'Pendente';
                  let statusColor: any = 'warning';
                  
                  if (isCompleted) {
                     if (sit === 4) {
                         statusLabel = 'Cancelada';
                         statusColor = 'error';
                     } else if (sit === 2) {
                         statusLabel = 'Reprovada';
                         statusColor = 'error';
                     } else {
                         statusLabel = 'Finalizada';
                         statusColor = 'success';
                     }
                  }

                  const displayValorAprovado = (sit === 2 || sit === 4) 
                    ? formatNumberToBRL(0) 
                    : formatNumberToBRL(request.valorAprovado);

                  return (
                    <TableRow key={`${tipo}-${request.id}`} hover>
                      <TableCell>#{request.id}</TableCell>
                      <TableCell align="center">
                        <Chip label={tipoFormatado} color={getChipColor(tipo)} size="small" variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'normal' }}>
                        {displayValorAprovado}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'normal' }}>
                        {isCompleted
                          ? (sit === 2 || sit === 4) ? formatNumberToBRL(0) : formatNumberToBRL(request.custoFinalCeapg || request.valorAprovado)
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {getEvaluatorDisplay(request.avaliadorCeapg || request.avaliadorProap || 'Sistema')}
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(isCompleted ? request.dataAvaliacaoCeapg : request.dataAvaliacaoProap)}
                      </TableCell>
                      <TableCell align="center">{request.numeroAta || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={statusLabel}
                          color={statusColor}
                          size="small"
                          variant={isCompleted ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 'medium', color: isCompleted ? 'white' : 'warning.main' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {isCompleted ? (
                          <Tooltip title="Visualizar Detalhes">
                            <IconButton onClick={() => handleViewSolicitation(request.id, tipo)} size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Avaliar Prestação de Contas">
                            <IconButton color="default" onClick={() => handleReviewSolicitation(request.id, tipo)} size="small">
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