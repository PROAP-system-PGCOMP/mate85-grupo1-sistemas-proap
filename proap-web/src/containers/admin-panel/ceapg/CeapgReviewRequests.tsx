import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Tab,
  Tabs,
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CeapgResponse } from '../../../types';
import { formatNumberToBRL } from '../../../helpers/formatter';
import GradingIcon from '@mui/icons-material/Grading';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  AccessTime,
  Visibility,
  RateReview,
  ExpandMore,
} from '@mui/icons-material';
import DateRangeFilter from '../../../components/custom/DateRangeFilter';

interface TableCellHeaderProps {
  text: string;
  sortBy: string;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: string) => void;
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
            transition: 'transform 0.2s ease-in-out', // Suaviza a rotação da seta
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
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: (startDate?: string, endDate?: string) => void;
  selectedPropToSortTable?: Record<string, boolean>;
  handleClickSortTable?: (prop: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ceapg-tabpanel-${index}`}
      aria-labelledby={`ceapg-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `ceapg-tab-${index}`,
    'aria-controls': `ceapg-tabpanel-${index}`,
  };
};

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
  const [tabValue, setTabValue] = useState(0);

  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --- IMPLEMENTAÇÃO DA LÓGICA DE ORDENAÇÃO LOCAL ---
  const [localSortConfig, setLocalSortConfig] = useState<{ key: string; asc: boolean }>({
    key: 'id',
    asc: true,
  });

  // Se o componente pai não passar as props de ordenação, usamos o estado local automaticamente
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

  // Função auxiliar para ordenar os arrays dinamicamente antes de renderizar na tabela
  const sortData = (arrayToSort: CeapgResponse[]) => {
    const currentKey = Object.keys(activeSortRecord)[0] || 'id';
    const isAsc = activeSortRecord[currentKey];

    return [...arrayToSort].sort((a: any, b: any) => {
      let aVal = a[currentKey];
      let bVal = b[currentKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });
  };
  // --------------------------------------------------

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

  const pendingReviews = requests.filter(
    (request) => !request.avaliadorCeapg
  );

// Se TEM avaliador preenchido, a revisão foi concluída
const completedReviews = requests.filter(
  (request) => !!request.avaliadorCeapg
);

  // Aplicando a ordenação ativa nas listas filtradas
  const orderedPending = sortData(pendingReviews);
  const orderedCompleted = sortData(completedReviews);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        <Alert severity="info">Nenhuma solicitação encontrada no período selecionado.</Alert>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="ceapg review tabs"
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab
                label={`Pendentes (${pendingReviews.length})`}
                icon={<AccessTime />}
                iconPosition="start"
                {...a11yProps(0)}
              />
              <Tab
                label={`Avaliadas (${completedReviews.length})`}
                icon={<CheckCircle />}
                iconPosition="start"
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          {/* TABELA 1: SOLICITAÇÕES PENDENTES */}
          <TabPanel value={tabValue} index={0}>
            {orderedPending.length === 0 ? (
              <Alert severity="info">Nenhuma avaliação pendente.</Alert>
            ) : (
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
                <Table stickyHeader aria-label="pending ceapg table">
                  <TableHead>
                    <TableRow>
                      <TableCellHeader
                        text="Solicitação"
                        sortBy="id"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Aprovado por"
                        sortBy="avaliadorProap"
                        align="center"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Data da Aprovação"
                        sortBy="dataAvaliacaoProap"
                        align="center"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Valor Aprovado"
                        sortBy="valorAprovado"
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
                    {orderedPending.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>#{request.id}</TableCell>
                        <TableCell align="center">{request.avaliadorProap || 'Sistema'}</TableCell>
                        <TableCell align="center">{formatDate(request.dataAvaliacaoProap)}</TableCell>
                        <TableCell align="center">
                          {formatNumberToBRL(request.valorAprovado)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Avaliar Prestação de Contas">
                            <IconButton
                              color="default"
                              onClick={() => handleReviewSolicitation(request.id)}
                              size="small"
                            >
                              <GradingIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* TABELA 2: SOLICITAÇÕES JÁ AVALIADAS */}
          <TabPanel value={tabValue} index={1}>
            {orderedCompleted.length === 0 ? (
              <Alert severity="info">Nenhuma solicitação avaliada ainda.</Alert>
            ) : (
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
                <Table stickyHeader aria-label="completed ceapg table">
                  <TableHead>
                    <TableRow>
                      <TableCellHeader
                        text="Solicitação"
                        sortBy="id"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Valor Final Real"
                        sortBy="custoFinalCeapg"
                        align="center"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Avaliador CEAPG"
                        sortBy="avaliadorCeapg"
                        align="center"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Data de Avaliação"
                        sortBy="dataAvaliacaoCeapg"
                        align="center"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCellHeader
                        text="Observações"
                        sortBy="observacoesCeapg"
                        align="left"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                      />
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderedCompleted.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>#{request.id}</TableCell>
                        
                        {/* CORRIGIDO: De custoFinalCeapg para valorAprovado */}
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          {formatNumberToBRL(request.valorAprovado)}
                        </TableCell>
                        
                        {/* CORRIGIDO: De avaliadorCeapg para avaliadorProap */}
                        <TableCell align="center">{request.avaliadorProap}</TableCell>
                        
                        {/* CORRIGIDO: De dataAvaliacaoCeapg para dataAvaliacaoProap */}
                        <TableCell align="center">{formatDate(request.dataAvaliacaoProap)}</TableCell>
                        
                        <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {request.observacoesCeapg || '-'}
                        </TableCell>
                        
                        <TableCell align="center">
                          <Tooltip title="Visualizar Detalhes">
                            <IconButton onClick={() => handleViewSolicitation(request.id)} size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Box>
      )}
    </>
  );
};

export default CeapgReviewRequests;