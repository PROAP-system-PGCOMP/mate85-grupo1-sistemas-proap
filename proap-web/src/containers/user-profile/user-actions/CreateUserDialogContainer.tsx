import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Email, Phone, Badge } from '@mui/icons-material';
import PersonalDataFormContainer from '../../register/PersonalDataFormContainer'; 
import useAllProfiles from '../../../hooks/profile/useAllProfiles';
import { registerUserByAdmin } from '../../../services/authService'; 
import Toast from '../../../helpers/notification';
import { generateSecurePassword } from '../../../helpers/authUtils';
import { PhoneInputMask } from '../../input-masks/PhoneInputMask';

// Schema atualizado: Agora o perfil é obrigatório
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

export default function CreateUserDialogContainer({ open, onClose, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const { profiles } = useAllProfiles(); // Hook que busca os perfis do banco

  const initialValues = {
    name: '',
    cpf: '',
    registration: '',
    email: '',
    phone: '',
    profileId: '', // Valor inicial vazio
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
        onSuccess();
        onClose();
      })
      .catch((err) => {
        Toast.error(`Falha no cadastro: ${err.message}`);
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Cadastrar Novo Usuário
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={CreateUserSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isValid, dirty, errors, touched, setFieldValue, values }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                 
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
                        placeholder="Digite seu endereço de e-mail"
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
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
                    helperText={touched.phone && errors.phone || 'Digite seu número com DDD'}
                    onChange={(e) => {
                      // Remove a máscara antes de salvar no estado do Formik
                      const rawValue = e.target.value.replace(/[^0-9]/g, '');
                      setFieldValue('phone', rawValue);
                    }}
                    InputProps={{
                      // O componente de máscara lida apenas com a exibição visual
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
                        select // Isso resolve o desalinhamento
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
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={onClose} color="inherit" disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !isValid || !dirty}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                Concluir Cadastro
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
