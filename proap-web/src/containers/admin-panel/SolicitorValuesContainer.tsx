import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { SolicitorAccumulatedValueDTO } from '../../services/budgetService';

interface SolicitorValuesContainerProps {
  loading: boolean;
  data: SolicitorAccumulatedValueDTO[];
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SolicitorValuesContainer({ loading, data }: SolicitorValuesContainerProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="text.secondary">Nenhum dado encontrado.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Docente Solicitante</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }} align="right">Valor Acumulado Aprovado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
            >
              <TableCell>{row.nomeDocente || '—'}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                {formatCurrency(row.totalAprovado)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
