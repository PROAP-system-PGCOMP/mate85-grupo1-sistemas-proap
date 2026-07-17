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
  id?: string | number;
  nomeDocente: string;
  valorSolicitado?: number;
  valorAprovado?: number;
  custoFinalCeapg?: number;
  avaliadorCeapg?: string;
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

  
  const calculadoSolicitado = solicitacoes
    .filter((req: SolicitacaoDTO) => req.status !== 'rejeitado' && req.status !== 'reprovado') 
    .reduce((acc: number, req: SolicitacaoDTO) => acc + Number(req.valorAprovado || req.valorSolicitado || 0), 0);
  
  const calculadoGasto = solicitacoes
    .filter((req: SolicitacaoDTO) => !!req.avaliadorCeapg)
    .reduce((acc: number, req: SolicitacaoDTO) => acc + Number(req.custoFinalCeapg || req.valorAprovado || 0), 0);

  const consumoPrevisto = calculadoSolicitado > 0 ? calculadoSolicitado : usedBudget;
  const consumoReal = calculadoGasto > 0 ? calculadoGasto : usedCeapgBudget;

  const saldoPrevisto = totalBudget - consumoPrevisto;
  const saldoReal = totalBudget - consumoReal;

  // 3. Percentagens para os cartões
  const percentualPrevisto = totalBudget > 0 ? Math.round((consumoPrevisto / totalBudget) * 100) : 0;
  const percentualReal = totalBudget > 0 ? Math.round((consumoReal / totalBudget) * 100) : 0;


  const dadosAcumuladosDocentes = useMemo(() => {
    if (!solicitacoes || solicitacoes.length === 0) return [];

    const agrupamento = solicitacoes.reduce((acumulador: Record<string, number>, sol) => {
      const nome = sol.nomeDocente;
      const valor = !!sol.avaliadorCeapg 
        ? Number(sol.custoFinalCeapg || sol.valorAprovado || 0)
        : Number(sol.valorAprovado || 0);

      if (!nome) return acumulador;
      if (!acumulador[nome]) acumulador[nome] = 0;
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

  // DADOS DOS GRÁFICOS
  const chartData = historicalData.map((item) => ({
    year: item.year.toString(),
    'Orçamento Total': item.totalBudget,
    Utilizado: item.usedBudget,
    Restante: item.remainingBudget,
  }));

  // 1. Gráfico PROAP Original
  const pieChartDataProap = totalBudget > 0 ? [
    { name: 'Utilizado', value: Number(usedBudget), color: theme.palette.warning.main },
    { name: 'Restante', value: Number(remainingBudget), color: theme.palette.success.main },
  ] : [];

  // 2. Gráfico Previsto 
  const pieChartDataPrevisto = totalBudget > 0 ? [
    { name: 'Consumo Previsto', value: Number(consumoPrevisto), color: theme.palette.primary.main },
    { name: 'Saldo Previsto', value: Number(saldoPrevisto > 0 ? saldoPrevisto : 0), color: '#e0e0e0' },
  ] : [];

  // 3. Gráfico Real
  const pieChartDataReal = totalBudget > 0 ? [
    { name: 'Consumo Real', value: Number(consumoReal), color: theme.palette.success.main },
    { name: 'Saldo Real', value: Number(saldoReal > 0 ? saldoReal : 0), color: '#e0e0e0' },
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
                  <StatCard title="Utilizado" value={formatNumberToBRL(Number(consumoPrevisto))} secondaryText={`${percentualPrevisto}% do orçamento total`} icon={<Square />} color="warning.main" />
                  <StatCard title="Restante" value={formatNumberToBRL(Number(saldoPrevisto))} secondaryText={`${100 - percentualPrevisto}% do orçamento total restante`} icon={<Square />} color="success.main" />
                </Stack>
              </Box>

              {/* Coluna 2: Valores CEAPG*/}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ mb: 1, pl: 1 }}>
                  Orçamento CEAPG
                </Typography>
                <Stack spacing={2}>
                  <StatCard title="Orçamento Total CEAPG" value={formatNumberToBRL(Number(totalBudget))} icon={<Square />} color="primary.main" />
                  <StatCard title="Utilizado CEAPG" value={formatNumberToBRL(Number(consumoReal))} secondaryText={`${percentualReal}% do orçamento CEAPG`} icon={<Square />} color="warning.main" />
                  <StatCard title="Restante CEAPG" value={formatNumberToBRL(Number(saldoReal))} secondaryText={`${100 - percentualReal}% do orçamento CEAPG restante`} icon={<Square />} color="success.main" />
                </Stack>
              </Box>
            </Box>

            {/* GRÁFICOS DE PIZZA LADO A LADO */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 5 }}>
              
              {/* Gráfico 1: TOTAL Proap */}
              <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>Distribuição Total PROAP</Typography>
                <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieChartDataProap} 
                        cx="50%" cy="50%" 
                        innerRadius={70} outerRadius={95} 
                        paddingAngle={3} stroke="#fff" strokeWidth={2}
                        dataKey="value" startAngle={90} endAngle={-270} nameKey="name"
                      >
                        {pieChartDataProap.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartTooltip formatter={(value: number) => [formatNumberToBRL(value), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <Typography variant="caption" color="text.secondary">Total PROAP</Typography>
                    <Typography variant="subtitle1" color="text.primary" fontWeight="bold" sx={{ wordBreak: 'break-word', textAlign: 'center' }}>{formatNumberToBRL(Number(totalBudget))}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Gráfico 2: TOTAL Previsto */}
              <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>Orçamento Previsto</Typography>
                <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieChartDataPrevisto} 
                        cx="50%" cy="50%" 
                        innerRadius={70} outerRadius={95} 
                        paddingAngle={3} stroke="#fff" strokeWidth={2} 
                        dataKey="value" startAngle={90} endAngle={-270} nameKey="name"
                      >
                        {pieChartDataPrevisto.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartTooltip formatter={(value: number) => [formatNumberToBRL(value), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 1, pointerEvents: 'none' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Consumo Previsto</Typography>
                    <Typography variant="subtitle1" color="primary.main" fontWeight="bold" sx={{ textAlign: 'center', mt: 0.25, mb: 0.25, fontSize: '1.05rem' }}>
                      {formatNumberToBRL(Number(consumoPrevisto))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', opacity: 0.85 }}>
                      de {formatNumberToBRL(Number(totalBudget))}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Gráfico 3: TOTAL Real */}
              <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>Orçamento Real</Typography>
                <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieChartDataReal} 
                        cx="50%" cy="50%" 
                        innerRadius={70} outerRadius={95} 
                        paddingAngle={3} stroke="#fff" strokeWidth={2} 
                        dataKey="value" startAngle={90} endAngle={-270} nameKey="name"
                      >
                        {pieChartDataReal.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartTooltip formatter={(value: number) => [formatNumberToBRL(value), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 1, pointerEvents: 'none' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Consumo Real</Typography>
                    <Typography variant="subtitle1" color="success.main" fontWeight="bold" sx={{ textAlign: 'center', mt: 0.25, mb: 0.25, fontSize: '1.05rem' }}>
                      {formatNumberToBRL(Number(consumoReal))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', opacity: 0.85 }}>
                      de {formatNumberToBRL(Number(totalBudget))}
                    </Typography>
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