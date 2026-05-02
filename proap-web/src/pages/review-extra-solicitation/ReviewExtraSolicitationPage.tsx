import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  Grid,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { Edit, Delete, Restore } from '@mui/icons-material';
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

  const handleReviewSubmit = (values: any, status: number) => {
    // Simplifica o usuário para evitar erros de desserialização no Java
    const safeUser = {
      id: extraRequest.user?.id,
      perfil: extraRequest.user?.perfil || { name: 'Solicitante' }
    };

    const { createdAt, updatedAt, ...restOfRequest } = extraRequest;

    const payload = {
      ...restOfRequest,
      user: safeUser,
      situacao: status,
      observacao: values.parecer,
      numeroAta: values.numeroAta,
      // Conversão crucial para evitar o Erro 400
      dataAvaliacaoProap: formatToBackend(values.dataAvaliacaoProap),
      valorAprovado: status === 1 ? (extraRequest.valorSolicitado || 0) : 0,
    };

    reviewExtraAssistanceRequest(payload)
      .then(() => {
        alert("Sucesso! O formulário foi salvo.");
        navigate('/home');
      })
      .catch((error) => {
        console.error("Erro detalhado:", error.response?.data);
        alert("Erro ao salvar. Verifique se os dados da ATA e Data são válidos.");
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
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Button variant="outlined" onClick={() => navigate(-1)}>Voltar</Button>
                      
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleReviewSubmit(values, 2)}
                      >
                        Reprovar
                      </Button>
                      
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleReviewSubmit(values, 1)}
                      >
                        Aprovar Solicitação
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
}