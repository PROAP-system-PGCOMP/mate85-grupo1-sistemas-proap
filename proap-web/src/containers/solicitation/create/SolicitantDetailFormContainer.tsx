import { Field, useFormikContext } from 'formik';
import { InitialSolicitationFormValues } from '../SolicitationFormSchema';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Paper,
  Typography,
  Divider,
  InputAdornment,
  MenuItem,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  StyledFormLabel,
  StyledTextField,
} from '../SolicitationFormContainer.style';
import useHasPermission from '../../../hooks/auth/useHasPermission';
import { useEffect, useMemo } from 'react';
import useCurrentUser from '../../../hooks/auth/useCurrentUser';
import useUsers from '../../../hooks/auth/useUsers';
import { Person, School } from '@mui/icons-material';

export default function SolicitantDetailFormContainer() {
  const { errors, touched, values, setFieldValue } =
    useFormikContext<InitialSolicitationFormValues>();

  const { name } = useCurrentUser();
  const userIsDocente = useHasPermission('DOCENTE_ROLE');
  const userIsAdmin = useHasPermission('ADMIN_ROLE');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { allUsers, isLoading: isLoadingUsers } = useUsers();

  const listaTodosDocentes = useMemo(() => {
    const nomes = allUsers
      .filter((user) => ['Docente', 'Docente e Admin'].includes(user.profileName)) 
      .map((user) => user.name);
      
    if (name && userIsDocente && !nomes.includes(name)) {
      nomes.push(name);
    }
    
    return nomes;
  }, [allUsers, name, userIsDocente]);

  const showDocenteSelect = values.solicitanteDocente;

  useEffect(() => {
    if (!userIsAdmin) {
      setFieldValue('solicitanteDocente', userIsDocente);
      setFieldValue(userIsDocente ? 'nomeDocente' : 'nomeDiscente', name);
    }
  }, [userIsAdmin, userIsDocente, name, setFieldValue]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mt: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.8),
      }}
    >
      <Typography
        variant="h6"
        color="primary"
        fontWeight="medium"
        gutterBottom
        sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
      >
        <Person sx={{ mr: 1 }} /> Informações do Solicitante
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl
          error={Boolean(touched.solicitanteDocente && errors.solicitanteDocente)}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <StyledFormLabel required sx={{ fontWeight: 'medium', fontSize: '0.95rem', color: 'text.primary', mb: 1 }}>
            Solicitação em nome do:
          </StyledFormLabel>
          <Field name="solicitanteDocente">
            {({ field }: { field: any }) => (
              <RadioGroup
                {...field}
                row
                onChange={(event) => {
                  const isDocente = event.target.value === 'true';
                  setFieldValue(field.name, isDocente);

                  if (isDocente) {
                    setFieldValue('nomeDiscente', '');
                    
                    if (userIsDocente) {
                      setFieldValue('nomeDocente', name);
                    }
                  } else {
                    setFieldValue('nomeDocente', '');
                  }
                }}
              >
                <FormControlLabel
                  disabled={!userIsAdmin}
                  value={true}
                  control={<Radio color="primary" />}
                  label={<Typography variant="body1">Docente</Typography>}
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  disabled={!userIsAdmin}
                  value={false}
                  control={<Radio color="primary" />}
                  label={<Typography variant="body1">Discente</Typography>}
                />
              </RadioGroup>
            )}
          </Field>
          {touched.solicitanteDocente && errors.solicitanteDocente && (
            <FormHelperText>{errors.solicitanteDocente}</FormHelperText>
          )}
        </FormControl>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {!values.solicitanteDocente && (
            <Field name="nomeDiscente">
              {({ field }: any) => (
                <StyledTextField
                  {...field}
                  required
                  label="Nome do Discente PGCOMP"
                  disabled={!userIsAdmin}
                  error={touched.nomeDiscente && !!errors.nomeDiscente}
                  helperText={touched.nomeDiscente && errors.nomeDiscente}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ background: 'white' }}
                />
              )}
            </Field>
          )}

          <Field name="nomeDocente">
            {({ field }: any) => {
              
              if (showDocenteSelect) {
                return (
                  <StyledTextField
                    key="select-docente" 
                    {...field}
                    select
                    label="Nome do Docente"
                    required
                    disabled={isLoadingUsers}
                    error={touched.nomeDocente && !!errors.nomeDocente}
                    helperText={(touched.nomeDocente && errors.nomeDocente) || (isLoadingUsers ? 'Carregando docentes...' : '')}
                    fullWidth
                    sx={{
                      background: 'white',
                      maxWidth: { xs: '100%', md: '40%' },
                    }}
                  >
                    {listaTodosDocentes.map((docenteName) => (
                      <MenuItem key={docenteName} value={docenteName}>
                        {docenteName}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                );
              }

              return (
                <StyledTextField
                  key="input-docente" 
                  {...field}
                  label="Nome do Docente Orientador do PGCOMP"
                  required
                  error={touched.nomeDocente && !!errors.nomeDocente}
                  helperText={touched.nomeDocente && errors.nomeDocente}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ background: 'white' }}
                />
              );
            }}
          </Field>
        </Stack>
      </Box>
    </Paper>
  );
}