import {
  CircularProgress,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Box,
  Button,
  Divider,
  Typography,
  Stack,
  Collapse,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import React from 'react';
import { signIn } from '../../services/authService';
import { useAppDispatch } from '../../store';
import {
  LoginButton,
  LoginCircularProgress,
  RegisterLinkTypography,
} from './LoginFormContainer.style';
import {
  INITIAL_FORM_VALUES,
  loginFormSchema,
  LoginFormValues,
} from './LoginFormSchema';

import Toast from '../../helpers/notification';
import { StyledTextField } from './LoginFormContainer.style';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Email,
  Lock,
  Person,
  HelpOutline,
  ArrowForward,
} from '@mui/icons-material';

export default function LoginFormContainer() {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const navigate = useNavigate(); 

  const handleSubmit = useCallback(
    async (
      values: LoginFormValues,
      actions: FormikHelpers<LoginFormValues>,
    ) => {
      setLoginError(null);
      const transformedValues = {
        ...values,
        username: values.username.toLowerCase(),
      };
      
      return dispatch(signIn(transformedValues))
        .then(() => {
          navigate('/home');
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            actions.setFieldError('password', 'Senha incorreta');
            setLoginError('Credenciais inválidas. Verifique seu e-mail e senha.');
          } else {
            setLoginError(
              error.response?.data?.message ||
                'Erro ao fazer login. Tente novamente.',
            );
          }
          Toast.error(
            'Erro ao fazer login: ' +
              (error.response?.data?.message || 'Ocorreu um erro inesperado'),
          );
        });
    },
    [dispatch, navigate],
  );

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Formik
      initialValues={INITIAL_FORM_VALUES}
      validationSchema={loginFormSchema}
      validateOnChange={true}
      validateOnBlur={true}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, values }) => (
        <Form noValidate style={{ width: '100%' }}>
          <Collapse in={!!loginError}>
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setLoginError(null)}
            >
              {loginError}
            </Alert>
          </Collapse>

          <Stack spacing={3} sx={{ width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Field name="username">
                {({ field, meta }: any) => (
                  <TextField
                    {...field}
                    label="E-mail"
                    placeholder="Digite seu e-mail institucional"
                    variant="outlined"
                    fullWidth
                    autoComplete="email"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email
                            color="action"
                            fontSize={isSmall ? 'small' : 'medium'}
                          />
                        </InputAdornment>
                      ),
                    }}
                    size={isSmall ? 'small' : 'medium'}
                  />
                )}
              </Field>
            </Box>

            <Box sx={{ width: '100%' }}>
              <Field name="password">
                {({ field, meta }: any) => (
                  <TextField
                    {...field}
                    label="Senha"
                    placeholder="Digite sua senha"
                    variant="outlined"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                    size={isSmall ? 'small' : 'medium'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock
                            color="action"
                            fontSize={isSmall ? 'small' : 'medium'}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            size={isSmall ? 'small' : 'medium'}
                          >
                            {showPassword ? (
                              <VisibilityOff
                                fontSize={isSmall ? 'small' : 'medium'}
                              />
                            ) : (
                              <Visibility
                                fontSize={isSmall ? 'small' : 'medium'}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Field>
            </Box>

            <Button
              variant="contained"
              type="submit"
              size={isSmall ? 'medium' : 'large'}
              disabled={isSubmitting}
              endIcon={isSubmitting ? undefined : <ArrowForward />}
              sx={{
                py: isSmall ? 1 : 1.5,
                position: 'relative',
                fontWeight: 'bold',
                width: '100%',
              }}
            >
              {isSubmitting ? (
                <CircularProgress
                  size={isSmall ? 20 : 24}
                  sx={{
                    color: 'white',
                    position: 'absolute',
                  }}
                />
              ) : (
                'Entrar'
              )}
            </Button>
          </Stack>

          <Box
            sx={{
              mt: 4,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              width: '100%',
            }}
          >
            <Typography
              align="center"
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              Não tem uma conta ainda?
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              startIcon={<Person fontSize={isSmall ? 'small' : 'medium'} />}
              sx={{ mb: 2 }}
              size={isSmall ? 'small' : 'medium'}
            >
              Criar nova conta
            </Button>

            <Typography
              align="center"
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              Problemas para acessar?
            </Typography>
            <Button
              component={Link}
              to="/recover-password"
              variant="text"
              fullWidth
              color="primary"
              startIcon={
                <HelpOutline fontSize={isSmall ? 'small' : 'medium'} />
              }
              size={isSmall ? 'small' : 'medium'}
            >
              Recuperar senha
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}