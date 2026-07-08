import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import useSolicitation from '../../../hooks/solicitation/useSolicitation';
import { formatNumberToBRL } from '../../../helpers/formatter';
import { dateToLocalDate } from '../../../helpers/conversion';
import { useAuth } from '../../../hooks';
import useEvaluateCeapg from '../../../hooks/admin/useEvaluateCeapg'; // Novo hook importado

const steps = ['Resumo da Solicitação', 'Avaliação'];

// Helper local para formatar o número de telefone do solicitante
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return 'Não informado';
  const cleaned = phone.replace(/\D/g, '');
  const digits = cleaned.startsWith('55') && cleaned.length > 10 ? cleaned.slice(2) : cleaned;

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const CeapgReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { solicitation, isLoading } = useSolicitation(id);
  
  // ALTERADO AQUI: Consumindo a lógica do novo hook assíncrono
  const { evaluateCeapg, loading: isEvaluating } = useEvaluateCeapg();

  const [activeStep, setActiveStep] = useState(0);

  // Campos de entrada para o Passo 2
  const [valorFinal, setValorFinal] = useState<number>(0);
  const [observacao, setObservacao] = useState('');

  const sData = solicitation as any;

  useEffect(() => {
    if (sData && sData.valorAprovado) {
      setValorFinal(sData.valorAprovado);
    }
  }, [solicitation]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // ALTERADO AQUI: Lógica simplificada delegando o tratamento ao hook
  const handleFinalize = async () => {
    if (!id) return;
    try {
      await evaluateCeapg(Number(id), {
        custoFinalCeapg: valorFinal,
        observacoesCeapg: observacao,
      });
      // O hook já dispara o Toast interno de sucesso, então apenas redirecionamos
      navigate('/admin-panel');
    } catch (error) {
      // O erro também já é alertado pelo hook interno
    }
  };

  const currentUser = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ mb: 1 }}>
        Avaliar Solicitação de Auxílio
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
        Gestão de solicitações do CEAPG
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          bgcolor: '#ffffff',
          p: { xs: 4, md: 6 },
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)',
          mb: 4,
        }}
      >
        {/* PASSO 1: Dashboard de Informações Expandido */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" fontWeight="600">
                Resumo da Solicitação
              </Typography>
              <Chip label={sData?.modalidade || 'Nacional'} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
            </Box>

            <Grid container spacing={4}>
              {/* 1. SEÇÃO DO SOLICITANTE */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Detalhes do Solicitante
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Solicitante</Typography>
                    <Typography variant="body1" fontWeight="500">{currentUser.name || 'Não informado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">E-mail</Typography>
                    <Typography variant="body1">{solicitation.user.email || 'Não informado'}</Typography>
                  </Grid>
                  
                  {/* ALTERADO AQUI: Número de telefone agora passa pela formatação */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Telefone</Typography>
                    <Typography variant="body1">{formatPhoneNumber(solicitation.user.phone)}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Tipo de Solicitante</Typography>
                    <Typography variant="body1">{solicitation.solicitanteDocente ? 'Docente' : 'Discente'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Nome do Discente PGCOMP</Typography>
                    <Typography variant="body1">{solicitation.nomeDiscente || 'Não informado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Nome do Docente PGCOMP</Typography>
                    <Typography variant="body1">{solicitation.nomeDocente || 'Não informado'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">No prazo regular do curso?</Typography>
                    <Typography variant="body1">{solicitation.discenteNoPrazoDoCurso ? 'Sim' : 'Não'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* 2. SEÇÃO DO TRABALHO / PUBLICAÇÃO */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Dados da Solicitação
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">Título da Publicação</Typography>
                    <Typography variant="body1" fontWeight="500">{solicitation.tituloPublicacao || 'Não informado'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">Co-autores</Typography>
                    <Typography variant="body1">
                      {solicitation.coautores && solicitation.coautores.length > 0 ? solicitation.coautores.join(', ') : 'Nenhum co-autor informado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">Coautores PGCOMP?</Typography>
                    <Typography variant="body1">{solicitation.algumCoautorPGCOMP ? 'Sim' : 'Não'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider />

            {/* 3. SEÇÃO DOS DETALHES DO EVENTO */}
            <Box>
              <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Detalhamento do Evento
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Nome do Evento</Typography>
                  <Typography variant="body1" fontWeight="500">{solicitation.nomeEvento || 'Não informado'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="caption" color="text.secondary" display="block">Data de Início</Typography>
                  <Typography variant="body1">{dateToLocalDate(solicitation.dataInicio)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="caption" color="text.secondary" display="block">Data de Término</Typography>
                  <Typography variant="body1">{dateToLocalDate(solicitation.dataFim)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="caption" color="text.secondary" display="block">Dias de Evento</Typography>
                  <Typography variant="body1">{solicitation.qtdDiasEvento || solicitation.quantidadeDiariasSolicitadas || 0} dia(s)</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="caption" color="text.secondary" display="block">Qualis</Typography>
                  <Typography variant="body1" fontWeight="600">{solicitation.qualis || 'Não informado'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Localização (País / Cidade)</Typography>
                  <Typography variant="body1">{solicitation.cidade || 'Não informada'} — {solicitation.pais || 'Não informado'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Homepage do Evento</Typography>
                  <Typography variant="body1" color="primary" sx={{ wordBreak: 'break-all' }}>
                    {solicitation.linkHomePageEvento || 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Link da Inscrição</Typography>
                  <Typography variant="body1" color="primary" sx={{ wordBreak: 'break-all' }}>
                    {solicitation.linkPaginaInscricao || 'Não informado'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* 4. PLANEJAMENTO FINANCEIRO SOLICITADO */}
            <Box>
              <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Detalhamento Financeiro
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">Valor da Inscrição</Typography>
                  <Typography variant="body1" fontWeight="500">{formatNumberToBRL(solicitation.valorInscricao || 0)}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">Diárias Solicitadas</Typography>
                  <Typography variant="body1" fontWeight="500">{solicitation.quantidadeDiariasSolicitadas}x</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">Valor da Diária</Typography>
                  <Typography variant="body1" fontWeight="500">{formatNumberToBRL(solicitation.valorDiaria || 0)}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">Total da Solicitação</Typography>
                  <Typography variant="h5" fontWeight="700" color="text.primary">
                    {formatNumberToBRL(solicitation.valorTotal || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* PASSO 2: Formulário de Avaliação Executada pelo CEAPG */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h5" fontWeight="600">
              Prestação definitiva de orçamento
            </Typography>

            <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
              <Box sx={{ flex: 1, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #edf2f7', p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">Número da ATA</Typography>
                <Typography variant="body1" fontWeight="600">{solicitation.numeroAta || 'Não informada'}</Typography>
              </Box>

              <Box sx={{ flex: 1, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #edf2f7', p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">Valor Aprovado</Typography>
                <Typography variant="body1" fontWeight="600" color="primary.main">
                  {formatNumberToBRL(sData?.valorAprovado || 0)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Valor Final"
                type="number"
                fullWidth
                required
                variant="outlined"
                value={valorFinal}
                onChange={(e) => setValorFinal(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                helperText="Valor final informado pelo CEAPG"
              />

              <TextField
                label="Observações"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Descreva retificações de valores, se houver, ou observações gerais sobre a finalização..."
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Ações de Navegação */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
        <Button
          disabled={activeStep === 0 || isEvaluating}
          onClick={handleBack}
          variant="text"
          color="inherit"
          size="large"
          sx={{ fontWeight: 600 }}
        >
          Voltar
        </Button>
        {activeStep === 0 ? (
          <Button variant="contained" onClick={handleNext} size="large" disableElevation sx={{ fontWeight: 600, px: 4 }}>
            Avançar
          </Button>
        ) : (
            <Button  
            variant="contained"
            color="success"
            onClick={handleFinalize}
            disabled={isEvaluating} 
            size="large"  
            disableElevation  
            sx={{ fontWeight: 600, px: 4, color: '#fff' }}  >  {isEvaluating ? 'Salvando...' : 'Finalizar Análise'}  
            </Button>  
        )}
      </Box>
    </Container>
  );
};

export default CeapgReviewPage;