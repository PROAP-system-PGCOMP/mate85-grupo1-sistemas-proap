import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  RecoverPasswordBox,
  RecoverPasswordPaperContainer,
} from './../RecoverPassword.style';
import useQuery from '../../../hooks/useQuery';
import { useEffect, useState } from 'react';
import { validateToken } from '../../../services/recoverPasswordService';
import { ErrorOutline } from '@mui/icons-material';
import { StatusResponse } from '../../../types';
import ConfirmRecoverPasswordFormContainer from '../../../containers/recover-password/confirm/ConfirmRecoverPasswordContainer';

type PageState = {
  loading: boolean;
  isValid: boolean;
  error: StatusResponse | null;
};

export default function ConfirmRecoverPassword() {
  const query = useQuery();
  const token = query.get('token');
  const [pageState, setPageState] = useState<PageState>({
    loading: true,
    isValid: false,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setPageState({
        loading: false,
        isValid: false,
        error: { status: 'Erro', message: 'Token não informado' },
      });
      return;
    }
    validateToken(token as string)
      .then((res) => {
        setPageState({
          loading: false,
          isValid: true,
          error: null,
        });
      })
      .catch((error) => {
        setPageState({
          loading: false,
          isValid: false,
          error: error,
        });
      });
  }, []);

  function ErrorMessage() {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <Box
        sx={{
          maxWidth: 480,
          p: isSmallScreen ? 2 : 4,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {pageState.error?.status ?? 'Erro'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {pageState.error?.message ?? 'Erro ao validar token'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href="/"
          sx={{ textTransform: 'none' }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <RecoverPasswordBox
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <RecoverPasswordPaperContainer elevation={2} sx={{ minWidth: 320 }}>
          <Typography
            color="primary"
            component="h1"
            variant="h4"
            fontWeight="bold"
            align="center"
            sx={{ mb: 1 }}
          >
            {pageState.isValid ? 'Criar nova senha' : ''}
          </Typography>
          {pageState.loading ? (
            <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : pageState.isValid ? (
            <ConfirmRecoverPasswordFormContainer token={token} />
          ) : (
            <ErrorMessage />
          )}
        </RecoverPasswordPaperContainer>
      </Box>
    </RecoverPasswordBox>
  );
}
