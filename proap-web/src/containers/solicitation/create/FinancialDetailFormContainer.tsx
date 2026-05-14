import { useEffect, useState } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { InitialSolicitationFormValues } from '../SolicitationFormSchema';
import { Field, useFormikContext } from 'formik';
import {
  FormControl,
  FormHelperText,
  MenuItem,
  Tooltip,
  Box,
  Stack,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Button,
  TableBody,
  TableCell,
  Table,
  TableContainer,
  DialogContent,
  DialogTitle,
  Dialog,
  TableHead,
  TableRow,
  DialogActions,
  InputAdornment,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  alpha,
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
} from '@mui/material';
import Select from '@mui/material/Select';
import {
  StyledFormLabel,
  StyledIconButton,
  StyledTextField,
} from '../SolicitationFormContainer.style';
import {
  Info,
  Refresh,
  AttachMoney,
  Language,
  HotelOutlined,
  CurrencyExchange,
  Help,
  Flight,
  Receipt,
  Calculate,
  Public,
} from '@mui/icons-material';
import useCalculeTotal from '../../../hooks/solicitation/useCalculeTotal';
import { useSysConfig } from '../../../hooks/admin/useSysConfig';
import TextPreviewAlert from '../../../components/FormFields/TextPreviewAlert';
import useDollarRate from '../../../hooks/useDollarRate';
import Toast from '../../../helpers/notification';
import React from 'react';

// ----------------------------------------------------------------------
// COMPONENTE DE MÁSCARA - FORA DO COMPONENTE PRINCIPAL PARA NÃO PERDER FOCO
// ----------------------------------------------------------------------
const NumericFormatCustom = React.forwardRef<NumericFormatProps, any>(
  function NumericFormatCustom(props, ref) {
    const { onChange, name, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: name,
              // MÁGICA AQUI: Usamos floatValue para enviar um NÚMERO REAL para o Formik
              // Isso evita que o useCalculeTotal some strings e adicione casas decimais malucas
              value: values.floatValue === undefined ? '' : values.floatValue,
            },
          });
        }}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2} // Trava ESTRITAMENTE em 2 casas decimais (bloqueia o 230,000000)
        allowNegative={false}
      />
    );
  },
);

export default function FinancialDetailFormContainer() {
  const { config } = useSysConfig();
  const { dollarRate, errorDollarRate, loadingDollarRate, reloadDollarRate } =
    useDollarRate();
  const { values, errors, touched, setFieldValue } =
    useFormikContext<InitialSolicitationFormValues>();
  const [showCountryGroupsDialog, setShowCountryGroupsDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useCalculeTotal();

  useEffect(() => {
    if (!values.isDolar) {
      setFieldValue('valorDiaria', config.valorDiariaBRL);
    }

    if (values.quantidadeDiariasSolicitadas === 0) {
      setFieldValue('valorDiaria', 0);
    }
  }, [values.isDolar, values.quantidadeDiariasSolicitadas]);

  useEffect(() => {
    if (loadingDollarRate) return;

    if (errorDollarRate) {
      console.error(errorDollarRate);
    }
    if (dollarRate && values.isDolar)
      setFieldValue('cotacaoMoeda', dollarRate.rate);
  }, [loadingDollarRate, dollarRate, errorDollarRate, values.isDolar]);

  const handleReload = async () => {
    const result = await reloadDollarRate();
    if (result.success) {
      Toast.success('Cotação do dólar atualizada com sucesso');
    } else {
      Toast.error('Erro ao obter cotação do dólar');
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
        <AttachMoney sx={{ mr: 1 }} /> Detalhes Financeiros
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
        {/* Valor da inscrição */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Receipt color="action" fontSize="small" sx={{ mr: 1 }} />
            <StyledFormLabel
              sx={{
                fontSize: '0.95rem',
                fontWeight: 'medium',
                color: 'text.primary',
                m: 0,
              }}
            >
              Informações de Inscrição
            </StyledFormLabel>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Field name="valorInscricao">
                {({ field }: any) => (
                  <StyledTextField
                    {...field}
                    label="Valor da inscrição/solicitação"
                    InputProps={{
                      inputComponent: NumericFormatCustom as any,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    error={Boolean(touched.valorInscricao && errors.valorInscricao)}
                    helperText={touched.valorInscricao && errors.valorInscricao}
                    required
                    fullWidth
                    sx={{ background: 'white' }}
                  />
                )}
              </Field>

              {config.textoAvisoValorInscricao && (
                <TextPreviewAlert
                  value={config.textoAvisoValorInscricao}
                  links={config.resourceLinks?.filter(
                    (link) => link.fieldName == 'textoAvisoValorInscricao',
                  )}
                  alertSeverity="warning"
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={8}>
              <Field name="linkPaginaInscricao">
                {({ field }: any) => (
                  <Box sx={{ position: 'relative' }}>
                    <StyledTextField
                      {...field}
                      label="Link da página da inscrição do evento"
                      error={Boolean(
                        touched.linkPaginaInscricao &&
                          errors.linkPaginaInscricao,
                      )}
                      helperText={
                        touched.linkPaginaInscricao &&
                        errors.linkPaginaInscricao
                      }
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Language color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ background: 'white' }}
                      placeholder="https://exemplo.com.br/inscricao"
                    />

                    <Tooltip
                      title="Deve conter o valor da inscrição solicitado"
                      placement="top"
                    >
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', right: -10, top: 14 }}
                        color="primary"
                      >
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Field>
            </Grid>
          </Grid>
        </Paper>

        {/* Diárias */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HotelOutlined color="action" fontSize="small" sx={{ mr: 1 }} />
            <StyledFormLabel
              required
              sx={{
                fontSize: '0.95rem',
                fontWeight: 'medium',
                color: 'text.primary',
                m: 0,
              }}
            >
              Diárias
            </StyledFormLabel>
            <Tooltip title="Informe a quantidade de diárias que você necessita para participar do evento">
              <IconButton size="small" sx={{ ml: 1 }}>
                <Help fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography
                variant="body2"
                fontWeight="medium"
                color="text.secondary"
              >
                Quantas diárias deseja solicitar?
              </Typography>

              <Field name="quantidadeDiariasSolicitadas">
                {({ field }: any) => (
                  <Select
                    {...field}
                    displayEmpty
                    sx={{ minWidth: 80, bgcolor: 'white', ml: 1 }}
                    size="small"
                    error={Boolean(
                      touched.quantidadeDiariasSolicitadas &&
                        errors.quantidadeDiariasSolicitadas,
                    )}
                    defaultValue={0}
                  >
                    <MenuItem key={0} value={0}>
                      0
                    </MenuItem>
                    {config.numMaxDiarias &&
                      Array.from({ length: config.numMaxDiarias }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              </Field>
            </Box>

            {touched.quantidadeDiariasSolicitadas &&
              errors.quantidadeDiariasSolicitadas && (
                <FormHelperText error sx={{ ml: 2 }}>
                  {errors.quantidadeDiariasSolicitadas}
                </FormHelperText>
              )}

            {config.textoInformacaoQtdDiarias && (
              <TextPreviewAlert
                value={config.textoInformacaoQtdDiarias}
                links={config.resourceLinks?.filter(
                  (link) => link.fieldName == 'textoInformacaoQtdDiarias',
                )}
                alertSeverity="info"
              />
            )}
          </Box>

          {values.quantidadeDiariasSolicitadas > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                background: 'white',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl
                    error={Boolean(touched.valorDiaria && errors.valorDiaria)}
                    fullWidth
                  >
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Moeda / Valor da diária
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Field name="isDolar">
                        {({ field }: any) => (
                          <Select
                            {...field}
                            displayEmpty
                            sx={{ width: '80px', bgcolor: 'white' }}
                            size="small"
                            defaultValue={false}
                            onChange={(e: any) => {
                              setFieldValue(
                                'isDolar',
                                e.target.value === 'true',
                              );
                            }}
                          >
                            <MenuItem value={'false'}>BRL</MenuItem>
                            <MenuItem value={'true'}>USD</MenuItem>
                          </Select>
                        )}
                      </Field>

                      <Field name="valorDiaria">
                        {({ field }: any) => (
                          <StyledTextField
                            {...field}
                            disabled
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                    {values.isDolar ? '$' : 'R$'}
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                            error={Boolean(
                              touched.valorDiaria && errors.valorDiaria,
                            )}
                            required
                            size="small"
                            sx={{
                              background: alpha(theme.palette.grey[100], 0.5),
                            }}
                          />
                        )}
                      </Field>

                      <Tooltip title="O valor é referente a uma diária">
                        <IconButton size="small">
                          <Info fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {touched.valorDiaria && errors.valorDiaria && (
                      <FormHelperText error>
                        {errors.valorDiaria}
                      </FormHelperText>
                    )}

                    {touched.isDolar && errors.isDolar && (
                      <FormHelperText error>{errors.isDolar}</FormHelperText>
                    )}
                  </FormControl>

                  {config.textoInformacaoValorDiaria && (
                    <TextPreviewAlert
                      value={config.textoInformacaoValorDiaria}
                      links={config.resourceLinks?.filter(
                        (link) =>
                          link.fieldName == 'textoInformacaoValorDiaria',
                      )}
                      alertSeverity="info"
                    />
                  )}
                </Grid>

                {values.quantidadeDiariasSolicitadas > 1 && (
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      error={Boolean(
                        touched.ultimaDiariaIntegral &&
                          errors.ultimaDiariaIntegral,
                      )}
                      fullWidth
                    >
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Deseja que a última diária seja no valor integral?
                      </Typography>

                      <Field name="ultimaDiariaIntegral">
                        {({ field }: { field: any }) => (
                          <RadioGroup
                            {...field}
                            row
                            value={field.value}
                            onChange={(event) => {
                              setFieldValue(
                                field.name,
                                event.target.value === 'true',
                              );
                            }}
                          >
                            <FormControlLabel
                              value={true}
                              control={<Radio color="primary" />}
                              label={
                                <Typography variant="body2">Sim</Typography>
                              }
                              sx={{ mr: 3 }}
                            />
                            <FormControlLabel
                              value={false}
                              control={<Radio color="primary" />}
                              label={
                                <Typography variant="body2">Não</Typography>
                              }
                            />
                          </RadioGroup>
                        )}
                      </Field>

                      {touched.ultimaDiariaIntegral &&
                        errors.ultimaDiariaIntegral && (
                          <FormHelperText>
                            {errors.ultimaDiariaIntegral}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* País de destino para USD */}
        {values.isDolar && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Public color="action" fontSize="small" sx={{ mr: 1 }} />
              <StyledFormLabel
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 'medium',
                  color: 'text.primary',
                  m: 0,
                }}
              >
                Grupo de país de destino
              </StyledFormLabel>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl
                  error={Boolean(touched.countryGroup && errors.countryGroup)}
                  fullWidth
                >
                  <Alert
                    severity={values.countryGroup ? 'success' : 'warning'}
                    sx={{ mb: 2, borderRadius: 1 }}
                    icon={values.countryGroup ? undefined : <Info />}
                  >
                    <Typography variant="body2">
                      Consulte a tabela de auxílio diário no exterior para
                      identificar o grupo do país de destino
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setShowCountryGroupsDialog(true);
                      }}
                      sx={{ mt: 1, borderRadius: 1 }}
                    >
                      Ver tabela de países
                    </Button>
                  </Alert>

                  <Field name="countryGroup">
                    {({ field }: any) => (
                      <Select
                        {...field}
                        displayEmpty
                        sx={{ width: '100%', bgcolor: 'white' }}
                        error={touched.countryGroup && !!errors.countryGroup}
                        onChange={(e: any) => {
                          const selectedGroup = config.countryGroups?.find(
                            (group) => group.groupName === e.target.value,
                          );
                          if (selectedGroup) {
                            setFieldValue(
                              'valorDiaria',
                              selectedGroup.valueUSD,
                            );
                          }
                          setFieldValue('countryGroup', e.target.value);
                        }}
                      >
                        <MenuItem value="" disabled>
                          Selecione o grupo
                        </MenuItem>
                        {config.countryGroups?.map((group) => (
                          <MenuItem
                            key={group.groupName}
                            value={group.groupName}
                          >
                            Grupo {group.groupName} - ${group.valueUSD}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>

                  {touched.countryGroup && errors.countryGroup && (
                    <FormHelperText error>{errors.countryGroup}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Cotação do dólar americano (USD)
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Field name="cotacaoMoeda">
                      {({ field }: any) => (
                        <StyledTextField
                          {...field}
                          disabled
                          type="number"
                          fullWidth
                          InputProps={{
                            inputProps: { min: 0, step: 0.01 },
                            startAdornment: (
                              <InputAdornment position="start">
                                <CurrencyExchange
                                  color="action"
                                  fontSize="small"
                                />
                              </InputAdornment>
                            ),
                            endAdornment: loadingDollarRate ? (
                              <InputAdornment position="end">
                                <CircularProgress size={20} />
                              </InputAdornment>
                            ) : null,
                          }}
                          error={Boolean(
                            touched.cotacaoMoeda && errors.cotacaoMoeda,
                          )}
                          helperText={
                            touched.cotacaoMoeda && errors.cotacaoMoeda
                              ? errors.cotacaoMoeda
                              : undefined
                          }
                          required
                          sx={{
                            background: alpha(theme.palette.grey[100], 0.5),
                          }}
                        />
                      )}
                    </Field>

                    <IconButton
                      onClick={handleReload}
                      size="small"
                      disabled={loadingDollarRate}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      {loadingDollarRate ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Refresh fontSize="small" color="primary" />
                      )}
                    </IconButton>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, ml: 1, display: 'block' }}
                  >
                    {!loadingDollarRate && dollarRate?.updatedAt
                      ? `Atualizado em ${new Date(parseInt(dollarRate.updatedAt)).toLocaleString()}`
                      : 'Cotação não disponível'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Passagem aérea para docentes */}
        {values.solicitanteDocente && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Flight color="action" fontSize="small" sx={{ mr: 1 }} />
              <StyledFormLabel
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 'medium',
                  color: 'text.primary',
                  m: 0,
                }}
              >
                Passagem Aérea
              </StyledFormLabel>
              <Tooltip title="Somente docentes podem solicitar passagem aérea">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Help fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field name="valorPassagem">
                  {({ field }: any) => (
                    <StyledTextField
                      {...field}
                      label="Valor aproximado da passagem aérea"
                      InputProps={{
                        inputComponent: NumericFormatCustom as any,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(
                        touched.valorPassagem && errors.valorPassagem,
                      )}
                      helperText={touched.valorPassagem && errors.valorPassagem}
                      required
                      fullWidth
                      sx={{ background: 'white' }}
                      placeholder="0,00"
                    />
                  )}
                </Field>

                {config.textoInformacaoValorPassagem && (
                  <TextPreviewAlert
                    value={config.textoInformacaoValorPassagem}
                    links={config.resourceLinks?.filter(
                      (link) =>
                        link.fieldName == 'textoInformacaoValorPassagem',
                    )}
                    alertSeverity="info"
                  />
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Valor total */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.success.light, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Calculate color="success" fontSize="small" sx={{ mr: 1 }} />
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              color="success.main"
            >
              Valor Total da Solicitação
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'white',
              borderRadius: 1,
              p: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Typography variant="body1" sx={{ mr: 2, fontWeight: 'medium' }}>
              Total:
            </Typography>

            <TextField
              disabled
              value={`R$ ${values.valorTotal.toFixed(2)}`}
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney color="success" />
                  </InputAdornment>
                ),
                readOnly: true,
                sx: {
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  color: theme.palette.success.main,
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: theme.palette.success.main,
                  },
                },
              }}
              sx={{
                width: '200px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(theme.palette.success.main, 0.3),
                  },
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Dialog de grupos de países */}
      <Dialog
        open={showCountryGroupsDialog}
        onClose={() => setShowCountryGroupsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Public sx={{ mr: 1 }} />
          Tabela de Auxílio Diário no Exterior
        </DialogTitle>

        <DialogContent>
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                >
                  <TableCell sx={{ fontWeight: 'bold' }}>Grupo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Países</TableCell>
                  <TableCell
                    sx={{
                      minWidth: 150,
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    Valor Diário (USD)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.countryGroups?.map((group, index) => (
                  <TableRow
                    key={group.groupName}
                    sx={{
                      bgcolor:
                        index % 2 === 0
                          ? 'white'
                          : alpha(theme.palette.grey[100], 0.5),
                    }}
                  >
                    <TableCell
                      sx={{ textAlign: 'center', fontWeight: 'medium' }}
                    >
                      {group.groupName}
                    </TableCell>
                    <TableCell>{group.countries.join(', ')}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      ${group.valueUSD}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowCountryGroupsDialog(false)}
            variant="contained"
            color="primary"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}