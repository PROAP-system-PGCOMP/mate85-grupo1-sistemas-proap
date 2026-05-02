import React, { useState, useEffect } from 'react';

import { SolicitationFormValues } from '../SolicitationFormSchema';
import { Field, useFormikContext } from 'formik';
import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  StyledData,
  StyledFormLabel,
  StyledTextField,
} from '../SolicitationFormContainer.style';
import {
  InfoOutlined,
  Edit,
  Delete,
  Restore,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useBudgetPercentage } from '../../../hooks/budget/useBudgetPercentage';

export default function ReviewDataFormContainer() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<SolicitationFormValues>();
  const [isEditingDate, setIsEditingDate] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const maxDiarias = values.quantidadeDiariasSolicitadas || 0;
  const diariasOptions = Array.from({ length: maxDiarias + 1 }, (_, i) => i);

  const { totalBudget, percentageOfBudget, isLoading } = useBudgetPercentage({
    year: values.createdAt,
    value: values.valorTotal,
  });

  useEffect(() => {
    if (!values.dataAvaliacaoProap) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setFieldValue('dataAvaliacaoProap', formattedDate);
    }
  }, []);

  const handleSetCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFieldValue('dataAvaliacaoProap', formattedDate);
    setIsEditingDate(false);
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleDecisionSelect = (value: number) => {
    setFieldValue('situacao', value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Avaliação da solicitação
      </Typography>

      {/* Data e Número ATA */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1, mb: isMobile ? 2 : 0 }}>
          {isEditingDate ? (
            <Box sx={{ position: 'relative' }}>
              <Field
                as={StyledTextField}
                fullWidth
                required
                label="Data da avaliação da solicitação"
                name="dataAvaliacaoProap"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={Boolean(
                  touched.dataAvaliacaoProap && errors.dataAvaliacaoProap,
                )}
                helperText={
                  touched.dataAvaliacaoProap && errors.dataAvaliacaoProap
                }
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIsEditingDate(false)}
                  startIcon={<Restore />}
                >
                  Cancelar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleSetCurrentDate}
                  startIcon={<Delete />}
                >
                  Resetar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledFormLabel required>
                Data da avaliação da solicitação
              </StyledFormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  {formatDisplayDate(values.dataAvaliacaoProap)}
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={() => setIsEditingDate(true)}
                  startIcon={<Edit />}
                  sx={{ ml: 2 }}
                >
                  Alterar
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Field
            as={StyledTextField}
            fullWidth
            label="Número da ATA"
            required
            name="numeroAta"
            type="number"
            error={Boolean(touched.numeroAta && errors.numeroAta)}
            helperText={touched.numeroAta && errors.numeroAta}
          />
        </Box>
      </Box>

      {/* Valores */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 4,
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <StyledData>
              <StyledFormLabel>Valor total da solicitação</StyledFormLabel>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: 1,
                  mt: 1,
                }}
              >
                <Typography variant="h6" color="primary">
                  R${' '}
                  {values.valorTotal?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : percentageOfBudget !== null ? (
                  <Tooltip
                    title={`Esta solicitação representa ${percentageOfBudget}% do orçamento anual total (R$ ${totalBudget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`}
                    arrow
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'primary.main',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight="medium"
                        sx={{ mr: 0.5 }}
                      >
                        ({percentageOfBudget}% do orçamento)
                      </Typography>
                      <InfoOutlined fontSize="small" color="primary" />
                    </Box>
                  </Tooltip>
                ) : null}
              </Box>
            </StyledData>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Field
              as={StyledTextField}
              required
              fullWidth
              label="Valor total aprovado (R$)"
              name="valorAprovado"
              type="number"
              InputProps={{
                inputProps: { min: 0, step: 0.01, max: values.valorTotal },
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
              error={Boolean(touched.valorAprovado && errors.valorAprovado)}
              helperText={touched.valorAprovado && errors.valorAprovado}
            />
          </Box>
        </Box>
      </Box>

      {/* Diárias */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <StyledData>
              <StyledFormLabel>Diárias solicitadas</StyledFormLabel>
              <Typography variant="h6" color="primary">
                {values.quantidadeDiariasSolicitadas}
              </Typography>
            </StyledData>
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormControl
              fullWidth
              error={Boolean(
                touched.numeroDiariasAprovadas && errors.numeroDiariasAprovadas,
              )}
            >
              <StyledFormLabel required>Diárias aprovadas</StyledFormLabel>
              <Field
                as={Select}
                displayEmpty
                name="numeroDiariasAprovadas"
                defaultValue={0}
                sx={{ maxWidth: isMobile ? '100%' : '100px' }}
              >
                {diariasOptions.map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Field>
              {touched.numeroDiariasAprovadas &&
                errors.numeroDiariasAprovadas && (
                  <FormHelperText>
                    {errors.numeroDiariasAprovadas}
                  </FormHelperText>
                )}
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Observação */}
      <Box sx={{ mb: 3 }}>
        <Field
          as={StyledTextField}
          fullWidth
          label="Observação"
          name="observacao"
          error={Boolean(touched.observacao && errors.observacao)}
          helperText={touched.observacao && errors.observacao}
          multiline
          rows={4}
        />
      </Box>

      {/* Situação (Movido para o final) */}
      <Box sx={{ mb: 3 }}>
        <StyledFormLabel required sx={{ mb: 1.5 }}>
          Decisão
        </StyledFormLabel>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Button
            variant={values.situacao === 1 ? 'contained' : 'outlined'}
            color="success"
            onClick={() => handleDecisionSelect(1)}
            startIcon={
              <CheckCircle
                sx={{ color: values.situacao === 1 ? 'white' : undefined }}
              />
            }
            sx={{
              flex: 1,
              py: 1,
              borderRadius: '12px',
              fontWeight: values.situacao === 1 ? 'bold' : 'normal',
              color: values.situacao === 1 ? 'white' : undefined,
            }}
          >
            Aprovar
          </Button>

          <Button
            variant={values.situacao === 2 ? 'contained' : 'outlined'}
            color="error"
            onClick={() => handleDecisionSelect(2)}
            startIcon={
              <Cancel
                sx={{ color: values.situacao === 2 ? 'white' : undefined }}
              />
            }
            sx={{
              flex: 1,
              py: 1,
              borderRadius: '12px',
              fontWeight: values.situacao === 2 ? 'bold' : 'normal',
              color: values.situacao === 2 ? 'white' : undefined,
            }}
          >
            Reprovar
          </Button>
        </Box>

        {/* Hidden field to maintain formik validation */}
        <Field type="hidden" name="situacao" />
        {touched.situacao && errors.situacao && (
          <FormHelperText error>{errors.situacao}</FormHelperText>
        )}
      </Box>
    </Box>
  );
}