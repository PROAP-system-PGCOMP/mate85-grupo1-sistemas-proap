import { Box, Paper, Typography } from '@mui/material';
import {
  budgetFormSchema,
  BudgetFormValues,
  INITIAL_FORM_VALUES,
} from './../BudgetFormSchema';
import { InfoOutlined } from '@mui/icons-material';
import { Formik } from 'formik';
import BudgetForm from '../../../components/custom/BudgetForm';

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
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Configure o orçamento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defina o valor do orçamento anual para acompanhar os gastos e
              solicitações aprovadas. Este valor será utilizado para calcular o
              saldo disponível.
            </Typography>
          </Box>

          <Formik
            initialValues={{ 
              budget: totalBudget, // Se for 0 ou null, fica vazio para mostrar o placeholder
              year: new Date().getFullYear() 
            }}
            validationSchema={budgetFormSchema}
            onSubmit={handleBudgetSubmit}
            enableReinitialize
          >
            {(formikProps) => (
              <>
                <BudgetForm onSubmit={handleBudgetSubmit} loading={loading} totalBudget={totalBudget}/>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mt: 3,
                    p: 2,
                    bgcolor: 'info.lighter',
                    borderRadius: 1,
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
