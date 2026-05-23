import { Box, Paper, Typography } from '@mui/material';
import {
  budgetFormSchema,
  BudgetFormValues,
  INITIAL_FORM_VALUES,
} from './../BudgetFormSchema';
import { InfoOutlined } from '@mui/icons-material';
import { Formik } from 'formik';
import BudgetForm from '../../../components/custom/BudgetForm'; // O erro está dentro deste arquivo!
import { useEffect, useState } from 'react';
import { getBudgetByYear } from '../../../services/budgetService';

interface BudgetSettingsContainerProps {
  handleBudgetSubmit: (values: BudgetFormValues) => Promise<void>;
  loading: boolean;
  totalBudget: number;
}

export default function BudgetSettingsContainer({
  handleBudgetSubmit,
  loading,
  totalBudget,
}: BudgetSettingsContainerProps) {
  const [initialValues, setInitialValues] = useState<BudgetFormValues>(INITIAL_FORM_VALUES);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    getBudgetByYear(currentYear)
      .then((data) => {
        if (data) {
          setInitialValues({ 
            budget: data.orcamentoAnual ?? 0, 
            year: data.year ?? currentYear 
          });
        }
      })
      .catch(() => {
        // Mantém os valores iniciais caso não encontre orçamento
      });
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        justifyContent: 'center',
      }}
    >
      <Box sx={{ maxWidth: 600 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              Configure o orçamento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defina o valor do orçamento anual para acompanhar os gastos e
              solicitações aprovadas.
            </Typography>
          </Box>

          <Formik
            initialValues={initialValues}
            validationSchema={budgetFormSchema}
            onSubmit={handleBudgetSubmit}
            enableReinitialize // Essencial para o Formik atualizar quando o initialValues mudar
          >
            {() => (
              <>
                {/* O componente BudgetForm deve conter os inputs e o botão de submit */}
                <BudgetForm 
                  onSubmit={handleBudgetSubmit} 
                  loading={loading} 
                  totalBudget={totalBudget}
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mt: 3,
                    p: 2,
                    bgcolor: 'info.lighter',
                    borderRadius: 1,
                    opacity: 0.9
                  }}
                >
                  <Box sx={{ color: 'info.main', display: 'flex' }}>
                    <InfoOutlined fontSize="small" />
                  </Box>
                  <Typography variant="body2" color="info.dark">
                    Ao definir um novo orçamento para um ano já existente, o
                    valor anterior será substituído.
                  </Typography>
                </Box>
              </>
            )}
          </Formik>
        </Paper>
      </Box>
    </Box>
  );
}