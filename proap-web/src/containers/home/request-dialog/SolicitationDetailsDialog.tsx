import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CommentIcon from '@mui/icons-material/Comment';

export interface SolicitationDetailsDialogProps {
  nomeSolicitante: string;
  solicitanteDocente: boolean;
  valorTotal: number;
  variacaoCambial: number;
  valorDiarias: number;
  nomeEvento: string;
  tituloPublicacao: string;
  isDolar: boolean;
  qualisEvento: string;
  cidade: string;
  pais: string;
  dataInicio: string;
  dataFim: string;
  situacao: number;
  observacoes: string;
}

export default function SolicitationDetailsDialog({
  open,
  onClose,
  solicitationData,
}: {
  open: boolean;
  onClose: () => void;
  solicitationData: SolicitationDetailsDialogProps;
}) {
  const getStatusColor = () => {
    if (solicitationData.situacao === 1) return 'success';
    if (solicitationData.situacao === 2) return 'error';
    if (solicitationData.situacao === 3) return 'secondary';
    if (solicitationData.situacao === 4) return 'error';
    return 'warning';
  };

  const getStatusText = () => {
    if (solicitationData.situacao === 1) return 'Aprovada';
    if (solicitationData.situacao === 2) return 'Não aprovada';
    if (solicitationData.situacao === 3) return 'Em espera';
    if (solicitationData.situacao === 4) return 'Cancelada';
    return 'Pendente de avaliação';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Resumo da Solicitação</Typography>
          <Chip
            label={getStatusText()}
            color={getStatusColor()}
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Solicitante Information */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Solicitante
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {solicitationData.nomeSolicitante}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo
                  </Typography>
                  <Typography variant="body1">
                    {solicitationData.solicitanteDocente
                      ? 'Docente'
                      : 'Discente'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Financial Information */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Informações Financeiras
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatNumberToBRL(solicitationData.valorTotal)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Diárias
                  </Typography>
                  <Typography variant="body1">
                    {solicitationData.isDolar
                      ? `$ ${solicitationData.valorDiarias?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : formatNumberToBRL(solicitationData.valorDiarias)}
                  </Typography>
                </Grid>
                {solicitationData.isDolar && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Variação Cambial
                    </Typography>
                    <Typography variant="body1">
                      {formatNumberToBRL(solicitationData.variacaoCambial)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Publication Information */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Informações da Publicação
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Título da Publicação
              </Typography>
              <Typography variant="body1" paragraph>
                {solicitationData.tituloPublicacao}
              </Typography>
            </Paper>
          </Grid>

          {/* Event Information */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Informações do Evento
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nome do Evento
                  </Typography>
                  <Typography variant="body1">
                    {solicitationData.nomeEvento}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Classificação Qualis
                  </Typography>
                  <Typography variant="body1">
                    {solicitationData.qualisEvento}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Período
                  </Typography>
                  <Typography variant="body1">
                    {solicitationData.dataInicio} a {solicitationData.dataFim}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Localização
                </Typography>
              </Box>
              <Typography variant="body1">
                {solicitationData.cidade}, {solicitationData.pais}
              </Typography>
            </Paper>
          </Grid>

          {/* Evaluation */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Avaliação
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {solicitationData.situacao !== 0 ? (
                  <>
                    Após verificação da documentação enviada, a comissão PROAP
                    entende que a solicitação{' '}
                    {solicitationData.situacao !== 1 && 'não'} está de acordo
                    com a resolução vigente e recomenda sua{' '}
                    {solicitationData.situacao === 1
                      ? 'aprovação'
                      : 'reprovação'}
                    .
                  </>
                ) : (
                  <>A solicitação ainda não foi avaliada.</>
                )}
              </Typography>
            </Paper>
          </Grid>

          {/* Observations */}
          {solicitationData.observacoes?.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Observações do Avaliador
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {solicitationData.observacoes}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
