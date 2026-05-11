import { useState } from 'react';
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  MenuItem,
  Box,
  Paper,
  Container,
  Link as MuiLink,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Email, Phone, Badge, Home, Group, PersonAdd } from '@mui/icons-material';

import PersonalDataFormContainer from '../../containers/register/PersonalDataFormContainer';
import useAllProfiles from '../../hooks/profile/useAllProfiles';
import { registerUserByAdmin } from '../../services/authService'; 
import Toast from '../../helpers/notification';
import { generateSecurePassword } from '../../helpers/authUtils';
import { PhoneInputMask } from '../../containers/input-masks/PhoneInputMask';

// Schema de Validação
const CreateUserSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, 'Nome muito curto')
    .matches(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/, 'Números ou caracteres especiais não são permitidos')
    .required('O nome é obrigatório'),
  cpf: Yup.string().length(11, 'CPF deve ter 11 dígitos').required('CPF é obrigatório'),
  registration: Yup.string().min(5, 'Matrícula inválida').required('Matrícula/SIAPE é obrigatória'),
  email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  phone: Yup.string().required('Telefone celular é obrigatório'),
  profileId: Yup.string().required('A seleção do perfil é obrigatória'),
});

export default function UserRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { profiles } = useAllProfiles();
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    cpf: '',
    registration: '',
    email: '',
    phone: '',
    profileId: '',
  };

  const handleSubmit = (values: any) => {
    setIsLoading(true);
    const payload = {
      ...values,
      profileId: Number(values.profileId),
      password: generateSecurePassword(),
    };

    registerUserByAdmin(payload)
      .then(() => {
        Toast.success('Usuário cadastrado com sucesso!');
        setIsLoading(false);
        navigate('/users'); // Redireciona para a listagem após o sucesso
      })
      .catch((err) => {
        Toast.error(`Falha no cadastro: ${err.message}`);
        setIsLoading(false);
      });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>        
        <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
            Cadastrar Novo Usuário
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Preencha os dados abaixo. O sistema gerará uma senha segura e enviará por e-mail para o usuário.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Formik
            initialValues={initialValues}
            validationSchema={CreateUserSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isValid, dirty, errors, touched, setFieldValue, values }) => (
              <Form>
                <Grid container spacing={3}>
                  {/* Reaproveita Nome, CPF e Matrícula */}
                  <Grid item xs={12}>
                    <PersonalDataFormContainer />
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="email">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          required
                          label="E-mail"
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      name="phone"
                      label="Telefone"
                      value={values.phone}
                      error={Boolean(touched.phone && errors.phone)}
                      helperText={(touched.phone && errors.phone) || 'Digite seu número com DDD'}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setFieldValue('phone', rawValue);
                      }}
                      InputProps={{
                        inputComponent: PhoneInputMask as any,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Seleção de Perfil */}
                  <Grid item xs={12} sm={6}>
                    <Field name="profileId">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          required
                          label="Perfil do Usuário"
                          error={Boolean(touched.profileId && errors.profileId)}
                          helperText={(touched.profileId && errors.profileId) as string}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Badge color="action" />
                              </InputAdornment>
                            ),
                          }}
                        >
                          {profiles?.map((profile: any) => (
                            <MenuItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="info.main" fontStyle="italic">
                    * O usuário receberá um e-mail com as instruções para definir sua senha de acesso.
                  </Typography>
                </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button 
                        onClick={() => navigate('/users')} 
                        color="inherit" 
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading || !isValid || !dirty}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        {isLoading ? 'Cadastrando...' : 'Concluir Cadastro'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
}