import { Field, useFormikContext } from 'formik';
import { InitialSolicitationFormValues } from '../SolicitationFormSchema';
import {
  Box,
  Checkbox,
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
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  StyledFormLabel,
  StyledTextField,
} from '../SolicitationFormContainer.style';
import useHasPermission from '../../../hooks/auth/useHasPermission';
import { useEffect } from 'react';
import useCurrentUser from '../../../hooks/auth/useCurrentUser';
import { Person, Help, School, AccessTime } from '@mui/icons-material';

export default function SolicitantDetailFormContainer() {
  const { errors, touched, values, setFieldValue } =
    useFormikContext<InitialSolicitationFormValues>();

  const { name } = useCurrentUser();
  const userIsDocente = useHasPermission('DOCENTE_ROLE');
  const userIsAdmin = useHasPermission('ADMIN_ROLE');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!userIsAdmin) {
      setFieldValue('solicitanteDocente', userIsDocente);
      setFieldValue(userIsDocente ? 'nomeDocente' : 'nomeDiscente', name);
    }
  }, []);

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

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <FormControl
          error={Boolean(
            touched.solicitanteDocente && errors.solicitanteDocente,
          )}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <StyledFormLabel
            required
            sx={{
              fontWeight: 'medium',
              fontSize: '0.95rem',
              color: 'text.primary',
              mb: 1,
            }}
          >
            Solicitação em nome do:
          </StyledFormLabel>
          <Field name="solicitanteDocente">
            {({ field }: { field: any }) => (
              <RadioGroup
                {...field}
                row
                onChange={(event) => {
                  setFieldValue(field.name, event.target.value === 'true');
                }}
                aria-labelledby="demo-row-radio-buttons-group-label"
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
          <Field name="nomeDiscente">
            {({ field }: any) => (
              <StyledTextField
                {...field}
                required={!values.solicitanteDocente}
                label={
                  values.solicitanteDocente
                    ? 'Nome do Discente PGCOMP (se houver)'
                    : 'Nome do Discente PGCOMP'
                }
                disabled={!userIsAdmin && !values.solicitanteDocente}
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

          <Field name="nomeDocente">
            {({ field }: any) => (
              <StyledTextField
                {...field}
                label="Nome do Docente Orientador do PGCOMP"
                required
                disabled={!userIsAdmin && values.solicitanteDocente}
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
            )}
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
                        aria-labelledby="demo-row-radio-buttons-group-label"
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
