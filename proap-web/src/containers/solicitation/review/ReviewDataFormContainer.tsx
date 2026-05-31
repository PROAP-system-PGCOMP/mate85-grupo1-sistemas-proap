import React, { useState, useEffect } from 'react';
import { Field, useFormikContext } from 'formik';
import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
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
  Undo,
} from '@mui/icons-material';
import { SolicitationFormValues } from '../SolicitationFormSchema';
import { useBudgetPercentage } from '../../../hooks/budget/useBudgetPercentage';

export default function ReviewDataFormContainer() {
  const { values, errors, touched, setFieldValue, submitForm } =
    useFormikContext<SolicitationFormValues>();
  const [isEditingDate, setIsEditingDate] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const maxDiarias = values.quantidadeDiariasSolicitadas || 0;
  const diariasOptions = Array.from({ length: maxDiarias + 1 }, (_, i) => i);

  // Hook para cálculo de impacto no orçamento
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
  }, [values.dataAvaliacaoProap, setFieldValue]);

  const handleSetCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFieldValue('dataAvaliacaoProap', formattedDate);
    setIsEditingDate(false);
  };

  
  const handleRemoveEvaluation = async () => {
    setFieldValue('situacao', 0);
    
    setFieldValue('valorAprovado', '');
    setFieldValue('numeroDiariasAprovadas', 0);
    setFieldValue('numeroAta', '');
    setFieldValue('observacao', '');

  
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

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1, mb: isMobile ? 2 : 0 }}>
          {isEditingDate ? (
            <Box sx={{ position: 'relative' }}>
              <Field
                as={StyledTextField}
                fullWidth
                required
                label="Data da avaliação"
                name="dataAvaliacaoProap"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={Boolean(touched.dataAvaliacaoProap && errors.dataAvaliacaoProap)}
                helperText={touched.dataAvaliacaoProap && errors.dataAvaliacaoProap}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => setIsEditingDate(false)} startIcon={<Restore />}>
                  Cancelar
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={handleSetCurrentDate} startIcon={<Delete />}>
                  Resetar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledFormLabel required>Data da avaliação da solicitação</StyledFormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">{formatDisplayDate(values.dataAvaliacaoProap)}</Typography>
                <Button variant="text" color="primary" size="small" onClick={() => setIsEditingDate(true)} startIcon={<Edit />} sx={{ ml: 2 }}>
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
            required={values.situacao !== 0}
            name="numeroAta"
            type="number"
            error={Boolean(touched.numeroAta && errors.numeroAta)}
            helperText={touched.numeroAta && errors.numeroAta}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 4 }}>
          <Box sx={{ flex: 1 }}>
            <StyledData>
              <StyledFormLabel>Valor total da solicitação</StyledFormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h6" color="primary">
                  {values.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : percentageOfBudget !== null ? (
                  <Tooltip title={`Representa ${percentageOfBudget}% do orçamento anual.`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'help' }}>
                      <Typography variant="body2" color="primary" sx={{ ml: 1, mr: 0.5 }}>({percentageOfBudget}%)</Typography>
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
              required={values.situacao !== 0}
              fullWidth
              label="Valor aprovado"
              name="valorAprovado"
              type="number"
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              error={Boolean(touched.valorAprovado && errors.valorAprovado)}
              helperText={touched.valorAprovado && errors.valorAprovado}
            />
          </Box>
        </Box>
      </Box>

      {/* Seção: Diárias */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 4 }}>
          <Box sx={{ flex: 1 }}>
            <StyledFormLabel>Diárias solicitadas</StyledFormLabel>
            <Typography variant="h6" color="primary">{values.quantidadeDiariasSolicitadas}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth error={Boolean(touched.numeroDiariasAprovadas && errors.numeroDiariasAprovadas)}>
              <StyledFormLabel required={values.situacao !== 0}>Diárias aprovadas</StyledFormLabel>
              <Field as={Select} name="numeroDiariasAprovadas" size="small">
                {diariasOptions.map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Field>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Field as={StyledTextField} fullWidth label="Observação" name="observacao" multiline rows={3} />
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <StyledFormLabel required sx={{ mb: 2 }}>Decisão da Avaliação PROAP</StyledFormLabel>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
          <Button
            variant={values.situacao === 1 ? 'contained' : 'outlined'}
            color="success"
            fullWidth
            onClick={() => handleDecisionSelect(1)}
            startIcon={<CheckCircle />}
            sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', color: 'white' }}
          >
            Aprovar
          </Button>

          <Button
            variant={values.situacao === 2 ? 'contained' : 'outlined'}
            color="error"
            fullWidth
            onClick={() => handleDecisionSelect(2)}
            startIcon={<Cancel />}
            sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold' }}
          >
            Reprovar
          </Button>

          <Tooltip title="Remove a decisão atual e permite salvar como pendente">
            <Button
              variant="outlined"
              color="warning"
              fullWidth
              disabled={values.situacao === 0}
              onClick={handleRemoveEvaluation}
              startIcon={<Undo />}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                borderColor: 'warning.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.warning.main, 0.08),
                },
              }}
            >
              Remover Avaliação
            </Button>
          </Tooltip>
        </Box>
        {touched.situacao && errors.situacao && (
          <FormHelperText error sx={{ mt: 1 }}>{errors.situacao}</FormHelperText>
        )}
      </Box>
    </Box>
  );
}