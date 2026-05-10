import { useSelector } from 'react-redux';
import { IRootState, useAppDispatch } from '../../store';
import { useEffect } from 'react';
import {
  setLoading,
  updateUser,
} from '../../store/slices/user-profile-slice/userProfileSlice';
import {
  changeUserPassword,
  getCurrentUserInfo,
  updateUserProfile,
} from '../../services/authService';
import { User } from '../../types';
import {
  Box,
  Container,
  Fade,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  Skeleton,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  alpha,
} from '@mui/material';
import { Person, Home, Lock } from '@mui/icons-material';
import UserProfileFormContainer from '../../containers/user-profile/UserProfileFormContainer';
import Toast from '../../helpers/notification';
import ChangePasswordContainer from '../../containers/change-password/ChangePasswordContainer';

export default function UserProfilePage() {
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, error } = useSelector(
    (state: IRootState) => state.userProfileSlice,
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentUser.email === '') {
      dispatch(setLoading(true));
      getCurrentUserInfo()
        .then((user) => {
          dispatch(updateUser(user));
          dispatch(setLoading(false));
        })
        .catch((error) => {
          dispatch(setLoading(false));
          Toast.error(
            'Erro ao carregar informações do usuário: ' + error.message,
          );
        });
    }
  }, [currentUser, dispatch]);

  const handleSubmit = async (values: User) => {
    dispatch(setLoading(true));

    return updateUserProfile(values)
      .then((updatedUsers) => {
        dispatch(updateUser(updatedUsers));
        dispatch(setLoading(false));
      })
      .catch((error) => {
        dispatch(setLoading(false));
        throw error; 
      });
  };

  const handleChangePasswordSubmit = async (values: unknown) => {
    const { currentPassword, newPassword } = values as {
      currentPassword: string;
      newPassword: string;
    };
    
    dispatch(setLoading(true));
    
    // Adicione o 'return' aqui também!
    return changeUserPassword(currentPassword, newPassword)
      .then((response) => {
        Toast.success(response.message);
        dispatch(setLoading(false));
      })
      .catch((error) => {
        // Se o seu ChangePasswordContainer também usa Formik, relance o erro:
        Toast.error(error.response?.data?.message || "Erro ao trocar senha");
        dispatch(setLoading(false));
        throw error; 
      });
  };

  if (error) {
    return (
      <Container maxWidth="md">
        <Card sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h5" gutterBottom>
            Ocorreu um erro
          </Typography>
          <Typography color="error">{error}</Typography>
        </Card>
      </Container>
    );
  }

  const renderLoadingState = () => (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ mr: 2 }}
            />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rounded" width={120} height={36} />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Skeleton variant="text" width="40%" height={40} />
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} key={item}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rounded" width={120} height={36} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );

  if (isLoading && currentUser.email === '') {
    return renderLoadingState();
  }

  const getProfileInitials = () => {
    if (!currentUser.name) return '?';
    return currentUser.name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Início
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Person sx={{ mr: 0.5 }} fontSize="inherit" />
            Perfil do Usuário
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '1.5rem',
                      mb: isMobile ? 2 : 0,
                      mr: isMobile ? 0 : 3,
                    }}
                  >
                    {getProfileInitials()}
                  </Avatar>
                  <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {currentUser.name || 'Carregando...'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {currentUser.profileName
                        ? currentUser.profileName.charAt(0).toUpperCase() +
                          currentUser.profileName.slice(1)
                        : 'Carregando perfil...'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentUser.email || 'Carregando email...'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    p: 2,
                    borderRadius: 1,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      mb: 1,
                    }}
                  >
                    <Person sx={{ mr: 1 }} />
                    Informações Pessoais
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atualize suas informações pessoais abaixo. Seus dados são
                    mantidos em segurança.
                  </Typography>
                </Box>

                <UserProfileFormContainer
                  initialValues={currentUser}
                  onSubmit={handleSubmit}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    p: 2,
                    borderRadius: 1,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      mb: 1,
                    }}
                  >
                    <Lock sx={{ mr: 1 }} />
                    Segurança da Conta
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Altere sua senha periodicamente para manter sua conta
                    segura.
                  </Typography>
                </Box>

                <ChangePasswordContainer
                  onSubmit={handleChangePasswordSubmit}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
