import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  Container,
  alpha,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { Link } from 'react-router-dom';
import { ArrowBack, Email } from '@mui/icons-material';

interface SentEmailRecoverPasswordContainerProps {
  email: string;
}

export default function SentEmailRecoverPasswordContainer({
  email,
}: SentEmailRecoverPasswordContainerProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderRadius: theme.shape.borderRadius,
          backgroundColor: '#f8f9fa',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
          p: { xs: 3, md: 4 },
          textAlign: 'center',
          maxWidth: '600px',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          color="primary.main"
        >
          E-mail de recuperação enviado!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Enviamos as instruções para:
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            p: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1,
          }}
        >
          <Email color="primary" sx={{ mr: 1 }} />
          <Typography variant="body1" fontWeight="medium">
            {email}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          Verifique sua caixa de entrada e siga as instruções para redefinir sua
          senha. Se não receber o e-mail em alguns minutos, verifique sua pasta
          de spam.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login"
          startIcon={<ArrowBack />}
          sx={{
            py: isSmallScreen ? 1 : 1.5,
            px: 3,
            fontWeight: 'medium',
            width: isSmallScreen ? '100%' : 'auto',
          }}
        >
          Voltar para Login
        </Button>
      </Box>
    </Box>
  );
}
