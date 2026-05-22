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
  IconButton,
  Tooltip,
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
import { Person, Help, School, AccessTime } from '@mui/icons-material';

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

const showDocenteSelect = values.solicitanteDocente && !userIsDocente;

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
                    setFieldValue('discenteNoPrazoDoCurso', undefined);
                    setFieldValue('mesesAtrasoCurso', undefined);
                    
                    if (userIsDocente) {
                      setFieldValue('nomeDocente', name);
                    }
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

          {/* Campo Dinâmico: Docente */}
          <Field name="nomeDocente">
            {({ field }: any) => {
              
              if (showDocenteSelect) {
                return (
                  <StyledTextField
                    key="select-docente"
                    {...field}
                    select
                    label={values.solicitanteDocente ? 'Nome do Docente' : 'Nome do Docente Orientador do PGCOMP'}
                    required
                    disabled={isLoadingUsers}
                    error={touched.nomeDocente && !!errors.nomeDocente}
                    helperText={(touched.nomeDocente && errors.nomeDocente) || (isLoadingUsers ? 'Carregando docentes...' : '')}
                    fullWidth
                    sx={{
                      background: 'white',
                      maxWidth: values.solicitanteDocente ? { xs: '100%', md: '40%' } : '100%',
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
                  label={values.solicitanteDocente ? 'Nome do Docente' : 'Nome do Docente Orientador do PGCOMP'}
                  required
                  disabled={!userIsAdmin && userIsDocente}
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
                  sx={{
                    background: 'white',
                    maxWidth: values.solicitanteDocente ? { xs: '100%', md: '49%' } : '100%',
                  }}
                />
              );
            }}
          </Field>
        </Stack>

        {!values.solicitanteDocente && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            }}
          >
            <FormControl
              error={Boolean(
                touched.discenteNoPrazoDoCurso && errors.discenteNoPrazoDoCurso,
              )}
              sx={{ width: '100%' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <AccessTime color="action" fontSize="small" sx={{ mr: 1 }} />
                <StyledFormLabel
                  required
                  sx={{
                    fontWeight: 'medium',
                    fontSize: '0.95rem',
                    color: 'text.primary',
                    m: 0,
                  }}
                >
                  Está no prazo regular para finalização do seu curso (mestrado
                  ou doutorado)?
                </StyledFormLabel>
                <Tooltip title="Esta informação é importante para a análise da solicitação">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <Help fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{
                  alignItems: { xs: 'start', sm: 'center' },
                  justifyContent: 'space-between',
                  width: '100%',
                }}
                spacing={2}
              >
                <Stack>
                  <Field name="discenteNoPrazoDoCurso">
                    {({ field }: { field: any }) => (
                      <RadioGroup
                        {...field}
                        row
                        value={String(field.value)}
                        onChange={(event) => {
                          setFieldValue(
                            field.name,
                            event.target.value === 'true',
                          );
                          setFieldValue('mesesAtrasoCurso', undefined);
                        }}
                      >
                        <FormControlLabel
                          value={true}
                          control={<Radio color="success" />}
                          label={<Typography variant="body1">Sim</Typography>}
                          sx={{ mr: 3 }}
                        />
                        <FormControlLabel
                          value={false}
                          control={<Radio color="error" />}
                          label={<Typography variant="body1">Não</Typography>}
                        />
                      </RadioGroup>
                    )}
                  </Field>
                  {touched.discenteNoPrazoDoCurso &&
                    errors.discenteNoPrazoDoCurso && (
                      <FormHelperText>
                        {errors.discenteNoPrazoDoCurso}
                      </FormHelperText>
                    )}
                </Stack>
                {!values.discenteNoPrazoDoCurso && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'start', sm: 'center' },
                      gap: 2,
                      bgcolor: alpha(theme.palette.warning.light, 0.1),
                      p: 1.5,
                      borderRadius: 1,
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    <StyledFormLabel
                      required
                      htmlFor="text-field"
                      sx={{ m: 0, minWidth: 'max-content' }}
                    >
                      Quantos meses já se passaram do prazo regular?
                    </StyledFormLabel>
                    <Field name="mesesAtrasoCurso">
                      {({ field }: any) => (
                        <StyledTextField
                          {...field}
                          id="text-field"
                          sx={{ maxWidth: '180px', m: 0 }}
                          type="number"
                          InputProps={{
                            inputProps: { min: 1, step: 1 },
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTime color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          error={
                            touched.mesesAtrasoCurso &&
                            !!errors.mesesAtrasoCurso
                          }
                          helperText={
                            touched.mesesAtrasoCurso && errors.mesesAtrasoCurso
                          }
                          size="small"
                          placeholder="Nº de meses"
                        />
                      )}
                    </Field>
                  </Box>
                )}
              </Stack>
            </FormControl>
          </Paper>
        )}
      </Box>
    </Paper>
  );
}