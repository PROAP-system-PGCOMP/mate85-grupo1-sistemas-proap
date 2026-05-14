import React, { useEffect } from 'react';
import { Field, Form, useFormikContext } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { BudgetFormValues } from '../../containers/admin-panel/BudgetFormSchema';
import { formatNumberToBRL } from '../../helpers/formatter';
import { getBudgetByYear } from '../../services/budgetService';

interface BudgetFormProps {
  onSubmit: (values: BudgetFormValues) => void;
  loading: boolean;
  totalBudget?: number; 
}

const StyledTextField = (props: any) => (
  <TextField
    fullWidth
    variant="outlined"
    margin="normal"
    size="small"
    {...props}
  />
);

const StyledFormLabel = ({ children, ...props }: any) => (
  <Typography
    variant="subtitle1"
    fontWeight="medium"
    color="text.primary"
    sx={{ mb: 1 }}
    {...props}
  >
    {children}
    {props.required && (
      <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
        *
      </Box>
    )}
  </Typography>
);

const BudgetForm: React.FC<BudgetFormProps> = ({ loading, totalBudget }) => {
  const { errors, touched, values, setFieldValue } = useFormikContext<BudgetFormValues>();

  useEffect(() => {
    const year = Number(values.year);
    // Validação simples para evitar chamadas desnecessárias à API
    if (!year || year < 2000 || year > 2100) return;

    getBudgetByYear(year)
      .then((data) => {
        if (data) {
          setFieldValue('budget', data.orcamentoAnual ?? 0);
        }
      })
      .catch(() => {
        // Se não encontrar orçamentos para o ano, opcionalmente resetar ou manter
        setFieldValue('budget', 0);
      });
  }, [values.year, setFieldValue]);

  return (
    <Form>
      <Stack spacing={2}>
        <Box>
          <StyledFormLabel required>Valor do orçamento (R$)</StyledFormLabel>
          <Field
            as={StyledTextField}
            fullWidth
            name="budget"
            placeholder={formatNumberToBRL(Number(totalBudget || 0))}
            type="number"
            InputProps={{
              inputProps: { min: 0, step: 0.01 },
            }}
            error={touched.budget && Boolean(errors.budget)}
            helperText={touched.budget && errors.budget}
          />
        </Box>

        <Box>
          <StyledFormLabel required>Ano</StyledFormLabel>
          <Field
            as={StyledTextField}
            fullWidth
            name="year"
            placeholder="2025"
            type="number"
            InputProps={{
              inputProps: { min: 2000, max: 2100 },
              startAdornment: (
                <Box sx={{ color: 'text.secondary', mr: 1 }}>
                  <CalendarToday fontSize="small" />
                </Box>
              ),
            }}
            error={touched.year && Boolean(errors.year)}
            helperText={touched.year && errors.year}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            mt: 2,
            py: 1,
            fontWeight: 'medium',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          {loading ? 'Salvando...' : 'Definir Orçamento'}
        </Button>
      </Stack>
    </Form>
  );
};

export default BudgetForm;