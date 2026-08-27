import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  FilterAlt,
  Clear,
  FlightTakeoff,
  Groups,
  AccountBalanceWallet,
  InsertChartOutlined,
} from '@mui/icons-material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import useDashboardMetrics from '../../../hooks/admin/useDashboardMetrics';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface MetricsData {
  totalGeralSolicitacoes: number; 
  inscricoes: { docenteNacional: number; docenteInternacional: number; discenteNacional: number; discenteInternacional: number; };
  diarias: { docenteNacional: number; docenteInternacional: number; discenteNacional: number; discenteInternacional: number; };
  totalPassagensDocentes: number;
  comparativoFinanceiro: { nome: string; solicitado: number; aprovado: number }[]; 
}

const SolicitationsMetricsContainer: React.FC = () => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  
  const { data, loading, fetchMetrics } = useDashboardMetrics();
  
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleApplyFilter = () => fetchMetrics(startDate, endDate);
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchMetrics();
  };

  const totalInscricoes = Object.values(data.inscricoes).reduce((a, b) => a + b, 0);
  const totalDocentes = data.inscricoes.docenteNacional + data.inscricoes.docenteInternacional;
  const totalDiscentes = data.inscricoes.discenteNacional + data.inscricoes.discenteInternacional;
  const totalNacional = data.inscricoes.docenteNacional + data.inscricoes.discenteNacional;
  const totalInternacional = data.inscricoes.docenteInternacional + data.inscricoes.discenteInternacional;

  const totalDiariasDocentes = data.diarias.docenteNacional + data.diarias.docenteInternacional;
  const totalDiariasDiscentes = data.diarias.discenteNacional + data.diarias.discenteInternacional;
  const totalGeralDiarias = totalDiariasDocentes + totalDiariasDiscentes;

  const dataPerfil = [
    { name: 'Docentes', value: totalDocentes, color: theme.palette.info.main },
    { name: 'Discentes', value: totalDiscentes, color: theme.palette.success.main },
  ];

  const dataOrigem = [
    { name: 'Nacional', value: totalNacional, color: theme.palette.warning.main },
    { name: 'Internacional', value: totalInternacional, color: theme.palette.secondary.main },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      
      {/* 1. FILTROS DE PERÍODO */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4} md={3}>
            <TextField fullWidth label="Data Início" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField fullWidth label="Data Fim" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4} md={6} sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<FilterAlt />} onClick={handleApplyFilter} disableElevation disabled={loading}>
              {loading ? 'Carregando...' : 'Filtrar'}
            </Button>
            {(startDate || endDate) && (
              <Button variant="outlined" color="inherit" startIcon={<Clear />} onClick={handleClearFilter} disabled={loading}>Limpar</Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* 2. DESTAQUES SUPERIORES (Cards Lado a Lado) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', display: 'flex' }}>
                <InsertChartOutlined fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">Total de Solicitações</Typography>
                <Typography variant="body2" color="text.secondary">Volume geral de pedidos registrados</Typography>
              </Box>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="primary.main">{data.totalGeralSolicitacoes}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.primary.main, color: 'primary.contrastText', borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FlightTakeoff fontSize="large" sx={{ opacity: 0.8 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">Passagens Aéreas</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Aprovadas através das solicitações</Typography>
              </Box>
            </Box>
            <Typography variant="h3" fontWeight="bold">{data.totalPassagensDocentes}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* 3. VISÃO DE INSCRIÇÕES (Gráficos de Pizza) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups color="primary" /> Inscrições em Eventos
            </Typography>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 0.5 }}>{totalInscricoes}</Typography>
              <Typography variant="body2" color="text.secondary">Total de inscrições</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              {/* Pizza: Perfil */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">POR PERFIL</Typography>
                <PieChart width={140} height={140}>
                  <Pie data={dataPerfil} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2}>
                    {dataPerfil.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} vagas`, 'Total']} />
                </PieChart>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, fontWeight: 'bold' }}>• Docentes ({totalDocentes})</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>• Discentes ({totalDiscentes})</Typography>
                </Box>
              </Box>

              {/* Pizza: Origem */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">POR ORIGEM</Typography>
                <PieChart width={140} height={140}>
                  <Pie data={dataOrigem} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2}>
                    {dataOrigem.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} vagas`, 'Total']} />
                </PieChart>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>• Nacional ({totalNacional})</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>• Int. ({totalInternacional})</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 4. VISÃO FINANCEIRA (Tabela Estruturada) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWallet color="secondary" /> Consolidação de Diárias (R$)
            </Typography>
            
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Perfil</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Nacional</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Internacional</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>Docentes</TableCell>
                    <TableCell align="right">{formatNumberToBRL(data.diarias.docenteNacional)}</TableCell>
                    <TableCell align="right">{formatNumberToBRL(data.diarias.docenteInternacional)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: '500' }}>{formatNumberToBRL(totalDiariasDocentes)}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Discentes</TableCell>
                    <TableCell align="right">{formatNumberToBRL(data.diarias.discenteNacional)}</TableCell>
                    <TableCell align="right">{formatNumberToBRL(data.diarias.discenteInternacional)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: '500' }}>{formatNumberToBRL(totalDiariasDiscentes)}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: theme.palette.primary.main + '0A' }}>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>TOTAL GERAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>{formatNumberToBRL(data.diarias.docenteNacional + data.diarias.discenteNacional)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>{formatNumberToBRL(data.diarias.docenteInternacional + data.diarias.discenteInternacional)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem', borderBottom: 'none' }}>
                      {formatNumberToBRL(totalGeralDiarias)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 5. VISÃO FINANCEIRA COMPARATIVA (Gráfico de Barras Horizontal) */}
      <Box sx={{ mt: 2 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: 320 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsertChartOutlined color="primary" /> Comparativo: Solicitado vs. Aprovado (R$)
          </Typography>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={data.comparativoFinanceiro} 
              layout="vertical" 
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
              
              {/* O eixo X vira numérico (valores em reais) */}
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.palette.text.secondary }}
                tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
              />
              
              {/* O eixo Y recebe a categoria ("Balanço Geral") */}
              <YAxis 
                dataKey="nome" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.palette.text.secondary, fontWeight: 500 }} 
              />
              
              <RechartsTooltip 
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [formatNumberToBRL(value), undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar dataKey="solicitado" name="Valor Solicitado" fill={theme.palette.warning.main} radius={[0, 4, 4, 0]} barSize={25} />
              <Bar dataKey="aprovado" name="Valor Aprovado" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default SolicitationsMetricsContainer;