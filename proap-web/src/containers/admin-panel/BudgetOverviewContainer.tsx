import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TableSortLabel,
} from '@mui/material';
import { InfoOutlined, Square, ExpandMore } from '@mui/icons-material';
import {
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatNumberToBRL } from '../../helpers/formatter';
import StatCard from '../../components/custom/StatCard';
import { BudgetSummaryDTO } from '../../services/budgetService';

interface TableCellHeaderProps {
  text: string;
  sortBy: string;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: string) => void;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
  align = 'left',
  width,
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
        width: width,
      }}
    >
      <TableSortLabel
        active={isSorted}
        direction={isSorted ? orderDirection : 'asc'}
        onClick={() => handleClickSortTable(sortBy)}
        IconComponent={ExpandMore}
        sx={{
          flexDirection: 'row',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-subtabpanel-${index}`}
      aria-labelledby={`budget-subtab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export interface SolicitacaoDTO {
  id?: string;
  nomeDocente: string;
  valorSolicitado: number;
  status?: string;
}

interface BudgetOverviewProps {
  budgetLoading: boolean;
  totalBudget: number;
  remainingBudget: number;
  usedPercentage: number;
  selectedYear: number;
  usedBudget: number;
  historicalData: BudgetSummaryDTO[];
  availableYears: number[];
  yearsLoading: boolean;
  onYearChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  solicitacoes?: SolicitacaoDTO[];
  
  // Novas propriedades adicionadas para os valores do CEAPG
  totalCeapgBudget?: number;
  usedCeapgBudget?: number;
  remainingCeapgBudget?: number;
  usedCeapgPercentage?: number;
}

interface DocenteAcumulado {
  nomeDocente: string;
  valorTotal: number;
}

const StyledFormLabel = ({ children, ...props }: any) => (
  <Typography variant="subtitle1" fontWeight="medium" color="text.primary" sx={{ mb: 1 }} {...props}>
    {children}
    {props.required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
  </Typography>
);

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgetLoading,
  totalBudget,
  selectedYear,
  usedPercentage,
  remainingBudget,
  usedBudget,
  historicalData,
  availableYears,
  yearsLoading,
  onYearChange,
  solicitacoes = [],
  
  // Valores padrão para o CEAPG caso ainda não sejam passados pelo componente pai
  totalCeapgBudget = 0,
  usedCeapgBudget = 0,
  remainingCeapgBudget = 0,
  usedCeapgPercentage = 0,
}) => {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);

  const [localSortConfig, setLocalSortConfig] = useState<{ key: string; asc: boolean }>({
    key: 'valorTotal',
    asc: false,
  });

  const activeSortRecord = { [localSortConfig.key]: localSortConfig.asc };

  const handleSortClick = (prop: string) => {
    setLocalSortConfig((prev) => ({
      key: prop,
      asc: prev.key === prop ? !prev.asc : true,
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const dadosAcumuladosDocentes = useMemo(() => {
    if (!solicitacoes || solicitacoes.length === 0) return [];

    const agrupamento = solicitacoes.reduce((acumulador: Record<string, number>, sol) => {
      const nome = sol.nomeDocente;
      const valor = Number(sol.valorSolicitado) || 0;

      if (!nome) return acumulador;

      if (!acumulador[nome]) {
        acumulador[nome] = 0;
      }

      acumulador[nome] += valor;
      return acumulador;
    }, {});

    const dadosMapeados = Object.entries(agrupamento).map(([nome, total]) => ({
      nomeDocente: nome,
      valorTotal: total,
    }));

    const currentKey = localSortConfig.key as keyof DocenteAcumulado;
    const isAsc = localSortConfig.asc;

    return dadosMapeados.sort((a, b) => {
      let aVal = a[currentKey];
      let bVal = b[currentKey];

      if (currentKey === 'nomeDocente') {
        return isAsc
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      } else {
        return isAsc
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });
  }, [solicitacoes, localSortConfig.key, localSortConfig.asc]);

  const chartData = historicalData.map((item) => ({
    year: item.year.toString(),
    'Orçamento Total': item.totalBudget,
    Utilizado: item.usedBudget,
    Restante: item.remainingBudget,
  }));

  const pieChartData = totalBudget > 0 ? [
    { name: 'Utilizado', value: Number(usedBudget), color: theme.palette.warning.main },
    { name: 'Restante', value: Number(remainingBudget), color: theme.palette.success.main },
  ] : [];

  
  return (
    <>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <StyledFormLabel htmlFor="year-select" required>Selecione o ano</StyledFormLabel>
        {yearsLoading ? (
          <Box sx={{ display: 'flex', py: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Carregando anos...</Typography>
          </Box>
        ) : (
          <Select id="year-select" value={selectedYear} onChange={onYearChange as any} size="small" displayEmpty sx={{ borderRadius: 1 }}>
            {availableYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </Select>
        )}
      </FormControl>

      {budgetLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : Number(totalBudget) === 0 && Number(totalCeapgBudget) === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>Nenhum orçamento definido para o ano {selectedYear}.</Alert>
      ) : (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Painel de Gráficos" id="budget-subtab-0" aria-controls="budget-subtabpanel-0" />
              <Tab label="Valores Acumulados por Docente" id="budget-subtab-1" aria-controls="budget-subtabpanel-1" />
            </Tabs>
          </Box>

          <CustomTabPanel value={activeTab} index={0}>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
              
              {/* Coluna 1: PROAP/Total */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ mb: 1, pl: 1 }}>
                  Orçamento PROAP
                </Typography>
                <Stack spacing={2}>
                  <StatCard title="Orçamento Total" value={formatNumberToBRL(Number(totalBudget))} icon={<Square />} color="primary.main" />
                  <StatCard title="Utilizado" value={formatNumberToBRL(Number(usedBudget))} secondaryText={`${usedPercentage}% do orçamento total`} icon={<Square />} color="warning.main" />
                  <StatCard title="Restante" value={formatNumberToBRL(Number(remainingBudget))} secondaryText={`${100 - usedPercentage}% do orçamento total restante`} icon={<Square />} color="success.main" />
                </Stack>
              </Box>

              {/* Coluna 2: Valores CEAPG*/}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ mb: 1, pl: 1 }}>
                  Orçamento CEAPG
                </Typography>
                <Stack spacing={2}>
                  <StatCard title="Orçamento Total CEAPG" value={formatNumberToBRL(Number(totalCeapgBudget))} icon={<Square />} color="primary.main" />
                  <StatCard title="Utilizado CEAPG" value={formatNumberToBRL(Number(usedCeapgBudget))} secondaryText={`${usedCeapgPercentage}% do orçamento CEAPG`} icon={<Square />} color="warning.main" />
                  <StatCard title="Restante CEAPG" value={formatNumberToBRL(Number(remainingCeapgBudget))} secondaryText={`${100 - usedCeapgPercentage}% do orçamento CEAPG restante`} icon={<Square />} color="success.main" />
                </Stack>
              </Box>
            </Box>

            {/*GRÁFICO DE PIZZA*/}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
              <Paper elevation={0} sx={{ width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" startAngle={90} endAngle={-270} nameKey="name">
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartTooltip formatter={(value: number) => [formatNumberToBRL(value), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total PROAP</Typography>
                    <Typography variant="h6" color="text.primary" fontWeight="bold" sx={{ wordBreak: 'break-word', textAlign: 'center' }}>{formatNumberToBRL(Number(totalBudget))}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* --- GRÁFICO DE BARRAS DE HISTÓRICO --- */}
            {chartData.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">Histórico de Orçamento</Typography>
                  <Tooltip title="Histórico de orçamentos por ano"><InfoOutlined fontSize="small" color="action" /></Tooltip>
                </Box>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                      <RechartTooltip formatter={(value: number) => formatNumberToBRL(value)} />
                      <Legend />
                      <Bar dataKey="Orçamento Total" fill={theme.palette.primary.main} />
                      <Bar dataKey="Utilizado" fill={theme.palette.warning.main} />
                      <Bar dataKey="Restante" fill={theme.palette.success.main} />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </CustomTabPanel>

          <CustomTabPanel value={activeTab} index={1}>
            {dadosAcumuladosDocentes.length > 0 ? (
              <TableContainer 
                component={Paper}
                sx={{ 
                  maxWidth: '65em', 
                  mx: 'auto',        
                  maxHeight: '500px',
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCellHeader
                        text="Solicitante"
                        sortBy="nomeDocente"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                        width="85%"
                      />
                      <TableCellHeader
                        text="Valor acumulado"
                        sortBy="valorTotal"
                        align="center"
                        selectedPropToSortTable={activeSortRecord}
                        handleClickSortTable={handleSortClick}
                        width="30%"
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dadosAcumuladosDocentes.map((linha, index) => (
                      <TableRow 
                        key={index} 
                        hover 
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell sx={{ color: 'text.primary' }}>
                          {linha.nomeDocente}
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="medium" color="text.primary">
                            {formatNumberToBRL(linha.valorTotal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma solicitação aprovada encontrada para o ano de {selectedYear}.
                </Typography>
              </Box>
            )}
          </CustomTabPanel>

        </Box>
      )}
    </>
  );
};

export default BudgetOverview;