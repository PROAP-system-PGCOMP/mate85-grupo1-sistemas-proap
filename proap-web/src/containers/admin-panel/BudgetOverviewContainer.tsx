import React, { useEffect } from 'react';
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
} from '@mui/material';
import { AttachMoney, InfoOutlined } from '@mui/icons-material';
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
}

const StyledFormLabel = ({ children, ...props }: any) => (
  <Typography
    variant="subtitle1"
    fontWeight="medium"
    color="text.primary"
    sx={{ mb: 1 }}
    {...props}
  >
    {children}
    {props.required && (
      <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
        *
      </Box>
    )}
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
}) => {
  const theme = useTheme();

  useEffect(() => {}, [
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
  ]);

  const chartData = historicalData.map((item) => ({
    year: item.year.toString(),
    'Orçamento Total': item.totalBudget,
    Utilizado: item.usedBudget,
    Restante: item.remainingBudget,
  }));

  const pieChartData =
    totalBudget > 0
      ? [
          {
            name: 'Utilizado',
            value: Number(usedBudget),
            color: theme.palette.warning.main,
          },
          {
            name: 'Restante',
            value: Number(remainingBudget),
            color: theme.palette.success.main,
          },
        ]
      : [];

  const pieTooltipFormatter = (value: number) => {
    return formatNumberToBRL(value);
  };

  return (
    <>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <StyledFormLabel htmlFor="year-select" required>
          Selecione o ano
        </StyledFormLabel>
        {yearsLoading ? (
          <Box sx={{ display: 'flex', py: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Carregando anos...
            </Typography>
          </Box>
        ) : (
          <Select
            id="year-select"
            value={selectedYear}
            onChange={onYearChange as any}
            size="small"
            displayEmpty
            sx={{ borderRadius: 1 }}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>

      {budgetLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : Number(totalBudget) === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhum orçamento definido para o ano {selectedYear}.
        </Alert>
      ) : (
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: 4,
              alignItems: 'stretch',
            }}
          >
            {/* Cards de estatísticas à esquerda */}
            <Box
              sx={{ flex: '7 1 0%', display: 'flex', flexDirection: 'column' }}
            >
              <Stack spacing={2}>
                <StatCard
                  title="Orçamento Total"
                  value={formatNumberToBRL(Number(totalBudget))}
                  icon={<AttachMoney />}
                  color="primary.main"
                />

                <StatCard
                  title="Utilizado"
                  value={formatNumberToBRL(Number(usedBudget))}
                  secondaryText={`${usedPercentage}% do orçamento total`}
                  icon={<AttachMoney />}
                  color="warning.main"
                />

                <StatCard
                  title="Restante"
                  value={formatNumberToBRL(Number(remainingBudget))}
                  secondaryText={`${
                    100 - usedPercentage
                  }% do orçamento total restante`}
                  icon={<AttachMoney />}
                  color="success.main"
                />
              </Stack>
            </Box>

            {/* Gráfico circular à direita */}
            <Box sx={{ flex: '5 1 0%', display: 'flex' }}>
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    maxHeight: '210px',
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        nameKey="name"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartTooltip
                        formatter={(value: number) => [
                          pieTooltipFormatter(value),
                          'Valor',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Valor no centro do gráfico */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.primary"
                      fontWeight="bold"
                      sx={{ wordBreak: 'break-word', textAlign: 'center' }}
                    >
                      {formatNumberToBRL(Number(totalBudget))}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Gráfico de barras mostrando dados históricos */}
          {chartData.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Histórico de Orçamento
                </Typography>
                <Tooltip title="Histórico de orçamentos por ano">
                  <InfoOutlined fontSize="small" color="action" />
                </Tooltip>
              </Box>

              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <RechartTooltip
                      formatter={(value: number) => formatNumberToBRL(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="Orçamento Total"
                      fill={theme.palette.primary.main}
                    />
                    <Bar
                      dataKey="Utilizado"
                      fill={theme.palette.warning.main}
                    />
                    <Bar dataKey="Restante" fill={theme.palette.success.main} />
                  </RechartBarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default BudgetOverview;
