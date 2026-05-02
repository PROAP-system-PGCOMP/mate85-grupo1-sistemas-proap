import { InitialSolicitationFormValues } from '../SolicitationFormSchema';
import { Field, FieldArray, useFormikContext } from 'formik';
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormHelperText,
  Box,
  IconButton,
  Button,
  Stack,
  Typography,
  Tooltip,
  Alert,
  Link,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  StyledFormLabel,
  StyledIconButton,
  StyledTextField,
} from '../SolicitationFormContainer.style';
import {
  Add,
  CloudUpload,
  Info,
  Remove,
  Title,
  People,
  Help,
  InsertDriveFile,
  Upload,
  Group,
} from '@mui/icons-material';
import { BASE_PDF_URL } from '../../../helpers/api';
import { useSysConfig } from '../../../hooks/admin/useSysConfig';
import TextPreviewAlert from '../../../components/FormFields/TextPreviewAlert';

export default function SolicitationDataFormContainer() {
  const { config } = useSysConfig();
  const { errors, touched, values, setFieldValue } =
    useFormikContext<InitialSolicitationFormValues>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFieldValue('file', event.target.files[0]);
    }
  };

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
        <Title sx={{ mr: 1 }} /> Dados da Publicação
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
        <Field name="tituloPublicacao">
          {({ field }: any) => (
            <StyledTextField
              {...field}
              label="Título completo da publicação (solicitação) a ser apoiada"
              error={Boolean(
                touched.tituloPublicacao && errors.tituloPublicacao,
              )}
              helperText={touched.tituloPublicacao && errors.tituloPublicacao}
              required
              multiline
              rows={2}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: 'flex-start', mt: 1.5 }}
                  >
                  </InputAdornment>
                ),
              }}
              sx={{ background: 'white' }}
            />
          )}
        </Field>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <People color="action" fontSize="small" sx={{ mr: 1 }} />
            <StyledFormLabel
              sx={{
                fontSize: '0.95rem',
                fontWeight: 'medium',
                color: 'text.primary',
                m: 0,
              }}
            >
              Lista completa de coautor(es) da publicação ou solicitação a ser
              apoiada
            </StyledFormLabel>
          </Box>

          <FieldArray name="coautores">
            {({ push, remove }) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {values.coautores.length > 0 ? (
                  values.coautores.map((_, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                      }}
                    >
                      <Field name={`coautores[${index}]`}>
                        {({ field }: any) => (
                          <StyledTextField
                            {...field}
                            label={`Nome do Coautor ${index + 1}`}
                            fullWidth
                            error={
                              touched.coautores &&
                              errors.coautores &&
                              errors.coautores[index]
                            }
                            helperText={
                              touched.coautores &&
                              errors.coautores &&
                              errors.coautores[index]
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Group color="action" />
                                </InputAdornment>
                              ),
                            }}
                            size="small"
                            sx={{ background: 'white' }}
                          />
                        )}
                      </Field>
                      <IconButton
                        sx={{
                          color: theme.palette.error.main,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.2),
                          },
                          width: 40,
                          height: 40,
                        }}
                        onClick={() => remove(index)}
                      >
                        <Remove />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontStyle: 'italic' }}
                  >
                    Nenhum coautor adicionado.
                  </Typography>
                )}
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => push('')}
                  startIcon={<Add />}
                  size="medium"
                  sx={{
                    width: 'fit-content',
                    mt: 1,
                    borderRadius: 1,
                    fontWeight: 'medium',
                  }}
                >
                  Adicionar Coautor
                </Button>
              </Box>
            )}
          </FieldArray>
        </Paper>

        {values.coautores.some((coautor) => coautor !== '') && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <FormControl
              error={Boolean(
                touched.algumCoautorPGCOMP && errors.algumCoautorPGCOMP,
              )}
              fullWidth
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Group color="action" fontSize="small" sx={{ mr: 1 }} />
                <StyledFormLabel
                  required
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    color: 'text.primary',
                    m: 0,
                  }}
                >
                  Há alunos ativos do PGCOMP coautores/coparticipantes direto na
                  solicitação?
                </StyledFormLabel>
                <Tooltip title="Informe se algum dos coautores é aluno ativo do PGCOMP">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <Help fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Field name="algumCoautorPGCOMP">
                {({ field }: { field: any }) => (
                  <RadioGroup
                    {...field}
                    row
                    value={field.value}
                    onChange={(event) => {
                      setFieldValue(field.name, event.target.value === 'true');
                    }}
                    aria-labelledby="demo-row-radio-buttons-group-label"
                  >
                    <FormControlLabel
                      value={true}
                      control={<Radio color="primary" />}
                      label={<Typography variant="body1">Sim</Typography>}
                      sx={{ mr: 4 }}
                    />
                    <FormControlLabel
                      value={false}
                      control={<Radio color="primary" />}
                      label={<Typography variant="body1">Não</Typography>}
                    />
                  </RadioGroup>
                )}
              </Field>
              {touched.algumCoautorPGCOMP && errors.algumCoautorPGCOMP && (
                <FormHelperText>{errors.algumCoautorPGCOMP}</FormHelperText>
              )}
            </FormControl>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
          }}
        >
          <FormControl error={Boolean(touched.file && errors.file)} fullWidth>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InsertDriveFile color="action" fontSize="small" sx={{ mr: 1 }} />
              <StyledFormLabel
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 'medium',
                  color: 'text.primary',
                  m: 0,
                }}
              >
                Envio de carta de aceite do artigo
              </StyledFormLabel>
              <Tooltip title="Formato PDF. Tamanho máximo 10MB">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Help fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                p: 2,
                borderRadius: 1,
              }}
            >
              <Button
                component="label"
                role="button"
                variant="contained"
                tabIndex={-1}
                startIcon={<Upload />}
                sx={{
                  minWidth: '200px',
                  padding: '0.5rem 1rem',
                  borderRadius: 1,
                  fontWeight: 'medium',
                  boxShadow: 1,
                }}
              >
                <Typography
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  fontWeight="bold"
                  fontSize="0.875rem"
                >
                  {values.cartaAceite
                    ? (values.file?.name ?? 'Alterar arquivo')
                    : (values.file?.name ?? 'Escolher arquivo')}
                </Typography>
                <input
                  type="file"
                  onChange={handleFileChange}
                  hidden
                  accept=".pdf"
                />
              </Button>

              {values.cartaAceite && (
                <Link
                  href={BASE_PDF_URL + values.cartaAceite}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <InsertDriveFile sx={{ mr: 0.5 }} />
                  <Typography sx={{ fontWeight: 'medium' }}>
                    Visualizar Arquivo
                  </Typography>
                </Link>
              )}
            </Box>

            {touched.file && errors.file && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.file}
              </FormHelperText>
            )}
          </FormControl>
          {config.textoAvisoEnvioArquivoCarta && (
            <TextPreviewAlert
              value={config.textoAvisoEnvioArquivoCarta}
              links={config.resourceLinks?.filter(
                (link) => link.fieldName == 'textoAvisoEnvioArquivoCarta',
              )}
            />
          )}
        </Paper>
      </Box>
    </Paper>
  );
}
