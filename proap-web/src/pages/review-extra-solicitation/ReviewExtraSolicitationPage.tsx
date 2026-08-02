import React, { useEffect, useState } from 'react';
import api from '../../services';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Grid,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import Toast from '../../helpers/notification';
import { Edit, Delete, Restore, CheckCircle, Cancel, Undo, ArrowBack, LowPriority, DoDisturb } from '@mui/icons-material';
import {
  getExtraAssistanceRequestById,
  reviewExtraAssistanceRequest
} from '../../services/extraAssistanceRequestService';

export default function ReviewExtraSolicitationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [extraRequest, setExtraRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<number | null>(null);
  const [selectedAvaliadorId, setSelectedAvaliadorId] = useState<number | ''>('');
  const [formValuesSnapshot, setFormValuesSnapshot] = useState<any>(null); 
  
  const [avaliadoresCeapg, setAvaliadoresCeapg] = useState<any[]>([]);

  useEffect(() => {
    api.get('/user/list')
      .then(({ data }) => {
        const apenasCeapg = data.filter((user: any) => 
          user.profileName === 'CEAPG' || 
          user.profileName === 'Membro CEAPG' ||
          user.perfil?.name === 'CEAPG'
        );
        setAvaliadoresCeapg(apenasCeapg);
      })
      .catch((error) => {
        console.error("Erro ao buscar avaliadores CEAPG:", error);
      });
  }, []);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getExtraAssistanceRequestById(Number(id))
        .then(({ data }) => {
          setExtraRequest(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar demanda:", error);
          alert("Erro ao carregar dados da solicitação.");
          setIsLoading(false);
        });
    }
  }, [id]);

  const formatToBackend = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatToInput = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const handleOpenReviewModal = (values: any, decisionValue: number) => {
    setFormValuesSnapshot(values);
    setPendingAction(decisionValue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingAction(null);
    setSelectedAvaliadorId('');
    setFormValuesSnapshot(null);
  };

  const handleConfirmReview = async () => {
    if (!selectedAvaliadorId || pendingAction === null || !formValuesSnapshot) return;
    
    try {
      await api.patch('/admin/ceapg/define/extra', {
        avaliadorId: Number(selectedAvaliadorId),
        solicitacaoId: Number(id)
      });

      handleReviewSubmit(formValuesSnapshot, pendingAction, Number(selectedAvaliadorId));
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao atribuir o avaliador:", error);
      Toast.error("Não foi possível atribuir o avaliador CEAPG.");
    }
  };
  // ----------------------------------------------------------------------------------

  const handleReviewSubmit = (values: any, status: number, avaliadorId?: number) => {
    
    let dataAvaliacao = values.dataAvaliacaoProap;
    if (dataAvaliacao && dataAvaliacao.includes('-')) {
       const [year, month, day] = dataAvaliacao.split('-');
       dataAvaliacao = `${day}/${month}/${year}`;
    }

    const payloadExato = {
      id: extraRequest.id,
      titulo: extraRequest.titulo,
      itemSolicitado: extraRequest.itemSolicitado,
      justificativa: extraRequest.justificativa,
      valorSolicitado: extraRequest.valorSolicitado,
      solicitacaoApoio: extraRequest.solicitacaoApoio,
      solicitacaoAuxilioOutrasFontes: extraRequest.solicitacaoAuxilioOutrasFontes,
      nomeSolicitacao: extraRequest.nomeSolicitacao,
      nomeAgenciaFomento: extraRequest.nomeAgenciaFomento,
      valorSolicitadoAgenciaFormento: extraRequest.valorSolicitadoAgenciaFormento,
      situacao: status,
      
      numeroAta: values.numeroAta || null,
      dataAvaliacaoProap: dataAvaliacao || null,
      valorAprovado: status === 1 ? (Number(extraRequest.valorSolicitado) || 0) : 0,
      observacao: values.parecer,
      
      user: extraRequest.user?.id ? { id: extraRequest.user.id } : null,
      avaliadorCeapg: avaliadorId ? { id: avaliadorId } : (extraRequest.avaliadorCeapg?.id ? { id: extraRequest.avaliadorCeapg.id } : null),

      custoFinalCeapg: extraRequest.custoFinalCeapg,
      observacoesCeapg: extraRequest.observacoesCeapg,
      automaticDecText: extraRequest.automaticDecText,

      createdAt: extraRequest.createdAt,
      updatedAt: extraRequest.updatedAt
    };

    reviewExtraAssistanceRequest(payloadExato as any)
      .then(() => {
        Toast.success('Solicitação avaliada com sucesso!');
        navigate('/home');
      })
      .catch((error) => {      
          console.error("Erro detalhado:", error.response?.data);
          Toast.error(error.response?.data?.message || 'Erro ao avaliar solicitação.');
      });
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Avaliar Demanda Extra
      </Typography>

      <Formik
        initialValues={{
          parecer: '',
          solicitante: extraRequest?.nomeSolicitante || extraRequest?.user?.name || 'Não informado',
          valorSolicitado: extraRequest?.valorSolicitado || 0,
          justificativa: extraRequest?.justificativa || 'Sem justificativa detalhada.',
          dataAvaliacaoProap: formatToInput(extraRequest?.dataAvaliacaoProap),
          numeroAta: extraRequest?.numeroAta || '',
        }}
        enableReinitialize
        onSubmit={() => {}}
      >
        {({ values, handleChange, setFieldValue, touched, errors }) => {
          
          const handleSetCurrentDate = () => {
            const today = new Date().toISOString().split('T')[0];
            setFieldValue('dataAvaliacaoProap', today);
            setIsEditingDate(false);
          };

          return (
            <Form>
              <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Informações da Solicitação
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ flex: 1, mb: isMobile ? 2 : 0 }}>
                      {isEditingDate ? (
                        <Box sx={{ position: 'relative' }}>
                          <Field
                            as={TextField}
                            fullWidth
                            required
                            label="Data da avaliação da solicitação"
                            name="dataAvaliacaoProap"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(touched.dataAvaliacaoProap && errors.dataAvaliacaoProap)}
                            helperText={touched.dataAvaliacaoProap && (errors.dataAvaliacaoProap as string)}
                          />
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setIsEditingDate(false)}
                              startIcon={<Restore />}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={handleSetCurrentDate}
                              startIcon={<Delete />}
                            >
                              Resetar
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 'bold' }}>
                            Data da avaliação da solicitação *
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body1">
                              {values.dataAvaliacaoProap.split('-').reverse().join('/')}
                            </Typography>
                            <Button
                              variant="text"
                              color="primary"
                              size="small"
                              onClick={() => setIsEditingDate(true)}
                              startIcon={<Edit />}
                              sx={{ ml: 2 }}
                            >
                              Alterar
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="numeroAta"
                      label="ATA"
                      value={values.numeroAta}
                      onChange={handleChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Solicitante" value={values.solicitante} InputProps={{ readOnly: true }} variant="filled" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Valor Solicitado" value={`R$ ${values.valorSolicitado}`} InputProps={{ readOnly: true }} variant="filled" />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="primary" gutterBottom>
                      Parecer do Avaliador
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="parecer"
                      label="Parecer da avaliação"
                      value={values.parecer}
                      onChange={handleChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', mt: 2 }}>
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        type="button"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBack />}
                        sx={{ 
                          borderRadius: '12px', 
                          py: 1.5, 
                          fontWeight: 'bold',
                          borderWidth: 1,
                        }}
                      >
                        Anterior
                      </Button>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                        <Tooltip title="Remove a decisão atual e permite salvar como pendente">
                          <Button
                            variant='contained'
                            color="primary"
                            size="small"
                            type="button"
                            disabled={extraRequest?.situacao === 0}
                            onClick={() => handleReviewSubmit(values, 0)}
                            startIcon={<Undo />}
                            sx={{
                              borderRadius: '12px',
                              py: 1.5,
                              borderColor: 'warning.main',
                              '&:hover': {
                                backgroundColor: 'warning.main', 
                              },
                            }}
                          >
                            Remover
                          </Button>
                        </Tooltip>

                        <Button
                          variant='contained'
                          color="primary"
                          size="small"
                          type="button"
                          onClick={() => handleReviewSubmit(values, 4)}
                          startIcon={<DoDisturb />}
                          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', '&:hover': { backgroundColor: 'error.main'}, }}
                        >
                          Cancelar
                        </Button>

                        <Button
                          variant='contained'
                          color="primary"
                          size="small"
                          type="button"
                          onClick={() => handleReviewSubmit(values, 3)}
                          startIcon={<LowPriority />}
                          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', color: 'white', '&:hover': { backgroundColor: 'secondary.main'},}}
                        >
                          Em espera
                        </Button>

                        {/* Botões que abrem o modal */}
                        <Button
                          variant='contained'
                          color="primary"
                          size="small"
                          type="button"
                          onClick={() => handleOpenReviewModal(values, 2)}
                          startIcon={<Cancel />}
                          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', '&:hover': { backgroundColor: 'error.main'}, }}
                        >
                          Reprovar
                        </Button>

                        <Button
                          variant='contained'
                          color="primary"
                          size="small"
                          type="button"
                          onClick={() => handleOpenReviewModal(values, 1)}
                          startIcon={<CheckCircle />}
                          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', color: 'white', '&:hover': { backgroundColor: 'success.main'}, }}
                        >
                          Aprovar
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Form>
          );
        }}
      </Formik>

      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Indicar Revisor CEAPG
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Para concluir a ação de <strong>{pendingAction === 1 ? 'aprovar' : 'reprovar'}</strong>, selecione o revisor do CEAPG responsável por esta avaliação.
          </Typography>

          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="select-revisor-label">Revisor Responsável *</InputLabel>
            <Select
              labelId="select-revisor-label"
              value={selectedAvaliadorId}
              label="Revisor Responsável *"
              onChange={(e) => setSelectedAvaliadorId(Number(e.target.value))}
            >
              {avaliadoresCeapg.map((avaliador) => (
                <MenuItem key={avaliador.id} value={avaliador.id}>
                  {avaliador.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmReview} 
            variant="contained" 
            color={pendingAction === 1 ? 'success' : 'error'}
            disabled={!selectedAvaliadorId}
            sx={{ color: 'white' }}
          >
            Finalizar Avaliação
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}