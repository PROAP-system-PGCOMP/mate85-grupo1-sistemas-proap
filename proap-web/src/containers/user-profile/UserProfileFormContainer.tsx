import { Field, Form, Formik } from 'formik';
import { User } from '../../types';
import { userProfileSchema } from './UserProfileSchema';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Divider,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Phone,
  Email,
  Badge,
  DriveFileRenameOutline,
  Save,
  Info,
} from '@mui/icons-material';
import { maskCpf, maskPhone } from '../../helpers/masks';
// Certifique-se de que o react-toastify está instalado. 
// Se o projeto usa um helper próprio, mude para: import Toast from '../../helpers/notification';
import { toast } from 'react-toastify'; 

interface UserProfileFormProps {
  initialValues: User;
  onSubmit: (values: User) => Promise<void>;
}

export default function UserProfileFormContainer(props: UserProfileFormProps) {
  // Mantém a máscara apenas para exibição inicial no formulário
  const formatInitialValues = (user: User): User => ({
    ...user,
    phone: maskPhone(user.phone),
    alternativePhone: maskPhone(user.alternativePhone ?? ''),
    cpf: maskCpf(user.cpf),
  });

  // FUNÇÃO DE SUBMISSÃO UNIFICADA
  const handleSubmit = async (values: User, { setSubmitting, setErrors }: any) => {
    try {
      // 1. Sanitização: Transformamos "(75) 98353-0062" em "75983530062"
      const sanitizedValues: User = {
        ...values,
        phone: values.phone.replace(/\D/g, ''), 
        alternativePhone: values.alternativePhone 
          ? values.alternativePhone.replace(/\D/g, '') 
          : undefined,
        cpf: values.cpf.replace(/\D/g, ''),
      };

      // 2. Chama o serviço (enviado via props) e aguarda
      await props.onSubmit(sanitizedValues);
      
      // 3. Notificação de Sucesso
      toast.success("Perfil atualizado com sucesso!");
      
    } catch (error: any) {
      // 4. Tratamento do Erro 400 (Adeus mensagens em inglês)
      console.error("Erro ao atualizar:", error);
      
      const errorMsg = error.response?.data?.message || "Erro ao atualizar perfil.";
      toast.error(errorMsg);

      // Se o back-end devolveu erros específicos por campo
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      // 5. DESTRAVA O BOTÃO: O isSubmitting volta a ser false aqui
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={formatInitialValues(props.initialValues)}
      validationSchema={userProfileSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, setFieldValue, isSubmitting, dirty }) => (
        <Box component={Form} sx={{ width: '100%' }}>
          <Grid container spacing={3}>
            {/* --- SEÇÃO: INFORMAÇÕES DA CONTA --- */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                Informações da Conta
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="cpf"
                    label="CPF"
                    error={touched.cpf && !!errors.cpf}
                    helperText={touched.cpf && errors.cpf}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="disabled" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="O CPF não pode ser alterado">
                            <Info fontSize="small" color="disabled" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="email"
                    label="Email"
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="disabled" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="O email não pode ser alterado">
                            <Info fontSize="small" color="disabled" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* --- SEÇÃO: INFORMAÇÕES PESSOAIS --- */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                Informações Pessoais
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="name"
                    label="Nome Completo"
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DriveFileRenameOutline />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="profileName"
                    label="Papel do Usuário"
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="registrationNumber"
                    label="Número de Matrícula"
                    error={touched.registrationNumber && !!errors.registrationNumber}
                    helperText={touched.registrationNumber && errors.registrationNumber}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* --- SEÇÃO: INFORMAÇÕES DE CONTATO --- */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                Informações de Contato
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field name="phone">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Telefone Principal"
                        error={touched.phone && !!errors.phone}
                        helperText={(touched.phone && errors.phone) || 'Ex: (71) 99999-9999'}
                        onChange={(e) => setFieldValue('phone', maskPhone(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field name="alternativePhone">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Telefone Alternativo"
                        error={touched.alternativePhone && !!errors.alternativePhone}
                        helperText={
                          (touched.alternativePhone && errors.alternativePhone) || 
                          'Opcional - Ex: (71) 99999-9999'
                        }
                        onChange={(e) => setFieldValue('alternativePhone', maskPhone(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
            </Grid>

            {/* --- BOTÃO DE AÇÃO --- */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  // isSubmitting gerencia o travamento do botão
                  disabled={isSubmitting || !dirty}
                  startIcon={<Save />}
                  size="large"
                >
                  Salvar Alterações
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Formik>
  );
}