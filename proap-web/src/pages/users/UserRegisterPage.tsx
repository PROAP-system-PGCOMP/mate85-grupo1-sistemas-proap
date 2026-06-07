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
  Tabs,
  Tab,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Email, Phone, Badge, Send, PersonAdd, MarkEmailRead } from '@mui/icons-material';
import { sendInviteByEmail } from '../../services/authService';
import PersonalDataFormContainer from '../../containers/register/PersonalDataFormContainer';
import useAllProfiles from '../../hooks/profile/useAllProfiles';
import { registerUserByAdmin } from '../../services/authService'; 
import Toast from '../../helpers/notification';
import { generateSecurePassword } from '../../helpers/authUtils';
import { PhoneInputMask } from '../../containers/input-masks/PhoneInputMask';

// Schema de Validação do Cadastro Manual
const CreateUserSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .matches(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/, 'Números ou caracteres especiais não são permitidos')
    .test('nome-completo', 'Informe o nome completo (nome e sobrenome)', (value) => {
      if (!value) return false;
      const parts = value.trim().split(/\s+/);
      return parts.length >= 2 && parts.every((p) => p.length >= 2);
    })
    .required('O nome é obrigatório'),
  cpf: Yup.string().length(11, 'CPF deve ter 11 dígitos').required('CPF é obrigatório'),
  registration: Yup.string().min(5, 'Matrícula inválida').required('Matrícula/SIAPE é obrigatória'),
  email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  phone: Yup.string().required('Telefone celular é obrigatório'),
  profileId: Yup.string().required('A seleção do perfil é obrigatória'),
});

export default function UserRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Controle das Abas (0 = Manual, 1 = Convite)
  const [tabIndex, setTabIndex] = useState(0);

  // Estados para o painel de convite
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Handler do Cadastro Manual
  const handleSubmit = (values: any) => {
    setIsLoading(true);
    const payload = {
      ...values,
      perfilId: Number(values.profileId),
      password: generateSecurePassword(),
    };

    delete (payload as any).profileId;

    registerUserByAdmin(payload)
      .then(() => {
        Toast.success('Usuário cadastrado com sucesso!');
        setIsLoading(false);
        navigate('/users');
      })
      .catch((err) => {
        Toast.error(`Falha no cadastro: ${err.message}`);
        setIsLoading(false);
      });
  };

  // Handler do Convite por E-mail
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsInviting(true);
    
    try {
      // Aqui está a mágica real acontecendo:
      await sendInviteByEmail(inviteEmail); 
      
      Toast.success(`Convite enviado com sucesso para ${inviteEmail}!`);
      setInviteEmail('');
    } catch (err: any) {
      const status = err.response?.status;
      // Pegamos a mensagem original do Java (em minúsculo para facilitar a busca)
      const originalMessage = err.response?.data?.message?.toLowerCase() || '';

      // Se for Erro 400 (Regra de Negócio barrada)
      if (status === 400) {
        // Verifica se a mensagem do Java fala sobre o e-mail já existir
        if (originalMessage.includes('cadastrado') || originalMessage.includes('existe') || originalMessage.includes('encontrado')) {
          Toast.error('Atenção: Este e-mail já possui um cadastro no sistema!');
        } else {
          // Se for um Erro 400 diferente, mostra a mensagem real do Java, mas mais limpa
          Toast.error(err.response?.data?.message || 'Verifique os dados informados.');
        }
      } else {
        // Se for 500 ou outro erro grave (queda de servidor, etc)
        Toast.error('Falha na comunicação com o servidor. Tente novamente mais tarde.');
      }
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
          Cadastrar Novo Usuário
        </Typography>

        <Paper elevation={1} sx={{ borderRadius: 2, mt: 2 }}>
          {/* BARRA DE ABAS */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              aria-label="opções de cadastro de usuário"
              sx={{ px: 2 }}
            >
              <Tab 
                icon={<PersonAdd />} 
                iconPosition="start" 
                label="Cadastro Manual" 
                sx={{ textTransform: 'none', fontWeight: 'medium', fontSize: '1rem' }}
              />
              <Tab 
                icon={<MarkEmailRead />} 
                iconPosition="start" 
                label="Convidar por E-mail" 
                sx={{ textTransform: 'none', fontWeight: 'medium', fontSize: '1rem' }}
              />
            </Tabs>
          </Box>

          {/* ABA 0: CADASTRO MANUAL */}
          {tabIndex === 0 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Preencha os dados abaixo. O sistema gerará uma senha segura e enviará por e-mail para o usuário.
              </Typography>

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
            </Box>
          )}

          {/* ABA 1: CONVIDAR POR E-MAIL */}
          {tabIndex === 1 && (
            <Box sx={{ p: 4, minHeight: '300px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Envie um link de convite exclusivo para que o próprio usuário preencha seus dados de cadastro. 
              </Typography>
              
              <Box 
                component="form" 
                onSubmit={handleSendInvite} 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'flex-start', 
                  flexWrap: 'wrap',
                  maxWidth: '700px'
                }}
              >
                <TextField
                  required
                  type="email"
                  label="E-mail do usuário"
                  variant="outlined"
                  size="medium"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  sx={{ flexGrow: 1, minWidth: '250px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isInviting || !inviteEmail}
                  startIcon={isInviting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  sx={{ height: '56px', minWidth: '180px' }} 
                >
                  {isInviting ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}