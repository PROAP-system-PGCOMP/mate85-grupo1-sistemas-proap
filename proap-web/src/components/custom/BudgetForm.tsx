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
// Importando o helper que você já usa no Overview
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
  const { errors, touched } = useFormikContext<BudgetFormValues>();
const BudgetForm: React.FC<BudgetFormProps> = ({ loading }) => {
  const { errors, touched, values, setFieldValue } = useFormikContext<BudgetFormValues>();

  useEffect(() => {
    const year = Number(values.year);
    if (!year || year < 2000 || year > 2100) return;

    getBudgetByYear(year)
      .then((data) => {
        setFieldValue('budget', data.orcamentoAnual ?? 0);
      })
      .catch(() => {
        setFieldValue('budget', 0);
      });
  }, [values.year]);

  return (
    <Form>
      <Stack spacing={2}>
        <Box>
          <StyledFormLabel required>Valor do orçamento (R$)</StyledFormLabel>
          <Field
            as={StyledTextField}
            fullWidth
            name="budget"
            // Lógica copiada exatamente do StatCard do seu BudgetOverview
            placeholder={formatNumberToBRL(Number(totalBudget))}
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
          startIcon={loading ? <CircularProgress size={20} /> : null}
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
          Definir Orçamento
        </Button>
      </Stack>
    </Form>
  );
};

export default BudgetForm;