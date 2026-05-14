import {
  Typography,
  FormControlLabel,
  FormHelperText,
  FormControl,
  Checkbox,
  Box,
  Link,
  Paper,
  alpha,
  useTheme,
  Divider,
  Button,
} from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { InitialSolicitationFormValues } from '../SolicitationFormSchema';
import { Gavel, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

export default function AcceptanceFormContainer() {
  const { errors, touched } = useFormikContext<InitialSolicitationFormValues>();
  const theme = useTheme();

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
        <Gavel sx={{ mr: 1 }} /> Termos e Condições
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.info.light, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
            Confirmo que li e estou ciente dos termos da{' '}
            <Typography component="span" fontWeight="bold" color="primary.main">
              Resolução PROAP
            </Typography>{' '}
            mais atual disponível no{' '}
            <Link
              href="https://pgcomp.ufba.br/normas"
              target="_blank"
              rel="noopener"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              site da PGCOMP
            </Link>
            .
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <FormControl
              error={Boolean(touched.aceiteFinal && errors.aceiteFinal)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
              fullWidth
            >
              <Field name="aceiteFinal">
                {({ field }: any) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        color="primary"
                        icon={<RadioButtonUnchecked color="disabled" />}
                        checkedIcon={<CheckCircle color="success" />}
                        sx={{
                          '& .MuiSvgIcon-root': {
                            fontSize: 24,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color={field.value ? 'success.main' : 'text.primary'}
                      >
                        Estou de acordo com os termos e condições
                      </Typography>
                    }
                  />
                )}
              </Field>
              {touched.aceiteFinal && errors.aceiteFinal && (
                <FormHelperText error sx={{ ml: 4, mt: 0 }}>
                  {errors.aceiteFinal}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
