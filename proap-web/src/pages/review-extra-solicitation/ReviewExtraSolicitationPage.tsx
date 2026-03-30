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
} from '@mui/material';
import { Formik, Form } from 'formik';
import {
  getExtraAssistanceRequestById,
  reviewExtraAssistanceRequest
} from '../../services/extraAssistanceRequestService';

export default function ReviewExtraSolicitationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [extraRequest, setExtraRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

const handleReviewSubmit = (values: any) => {
  const dateParaJava = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  // 1. Criamos um objeto de usuário seguro para o Java não quebrar
  const safeUser = {
    ...extraRequest.user,
    perfil: extraRequest.user?.perfil || { name: 'Solicitante' } // Se for null, a gente cria um objeto com name
  };

  const { createdAt, updatedAt, ...restOfRequest } = extraRequest;

  const payload = {
    ...restOfRequest,
    user: safeUser, // Enviamos o usuário com o perfil garantido
    situacao: Number(values.situacao),
    observacao: values.parecer,
    numeroAta: values.numeroAta || "001",
    valorAprovado: values.situacao === 1 ? (extraRequest.valorSolicitado || 0) : 0,
    dataAvaliacaoProap: dateParaJava()
  };

  console.log("Enviando com Perfil Seguro:", payload);

  reviewExtraAssistanceRequest(payload)
    .then(() => {
      alert("Sucesso! O formulário foi salvo.");
      navigate('/home');
    })
    .catch((error) => {
      console.error("Erro final:", error.response?.data);
      alert("Erro ao salvar. Verifique se o usuário da solicitação tem um perfil atribuído.");
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
          status: 'PENDENTE',
          solicitante: extraRequest?.nomeSolicitante || extraRequest?.user?.name || 'Não informado',
          valorSolicitado: extraRequest?.valorSolicitado || 0,
          justificativa: extraRequest?.justificativa || 'Sem justificativa detalhada.',
        }}
        enableReinitialize // IMPORTANTE para o Formik pegar os dados após o loading
        onSubmit={handleReviewSubmit}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Informações da Solicitação
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Solicitante"
                    value={values.solicitante}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Solicitado"
                    value={`R$ ${values.valorSolicitado}`}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Justificativa do Solicitante"
                    value={values.justificativa}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
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
                    rows={6}
                    name="parecer"
                    label="Descreva aqui os motivos da aprovação ou reprovação"
                    value={values.parecer}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                 <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                   <Button variant="outlined" onClick={() => navigate(-1)}>
                     Voltar
                   </Button>

                   <Button
                     variant="contained"
                     color="error"
                     onClick={() => {
                       // Reprovar = situacao 2
                       const updatedValues = { ...values, situacao: 2 };
                       handleReviewSubmit(updatedValues);
                     }}
                   >
                     Reprovar
                   </Button>

                   <Button
                     variant="contained"
                     color="success"
                     onClick={() => {
                       // Aprovar = situacao 1
                       const updatedValues = { ...values, situacao: 1 };
                       handleReviewSubmit(updatedValues);
                     }}
                   >
                     Aprovar Solicitação
                   </Button>
                 </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Form>
        )}
      </Formik>
    </Box>
  );
}