import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  useTheme,
  useMediaQuery,
  Typography,
  styled,
} from '@mui/material';
import {
  Form,
  Formik,
  FormikConfig,
  FormikHelpers,
  FormikValues,
  useFormikContext,
} from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react'; // 👇 useEffect ADICIONADO AQUI
import { AnySchema } from 'yup';
import { StepperCircularProgress } from './StepperForm.style';

export interface FormStep {
  component: React.FC;
  schema?: AnySchema;
  label: string;
}

export interface StepperFormProps<T> extends FormikConfig<T> {
  steps: FormStep[];
  activeStep?: number;
  autoSaveKey?: string;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  labels: {
    previous?: string;
    submit?: string;
    next?: string;
    cancel?: string;
  };
}

const MobileStepLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
}));

function AutoSaveWatcher({ cacheKey }: { cacheKey: string }) {
  const { values } = useFormikContext();

  useEffect(() => {
    if (cacheKey && values && Object.keys(values).length > 0) {
      sessionStorage.setItem(cacheKey, JSON.stringify(values));
    }
  }, [values, cacheKey]);

  return null;
}

function DirtyWatcher({ onChange }: { onChange: (dirty: boolean) => void }) {
  const { dirty } = useFormikContext();

  useEffect(() => {
    onChange(dirty);
  }, [dirty, onChange]);

  return null;
}

export default function StepperForm({
  activeStep: initialActiveStep = 0,
  onSubmit,
  autoSaveKey,
  onCancel,
  onDirtyChange,
  labels = {
    previous: 'Anterior',
    submit: 'Enviar',
    next: 'Próximo',
    cancel: 'Cancelar',
  },
  steps,
  ...formikProps
}: StepperFormProps<FormikValues>) {
  const [activeStep, setActiveStep] = useState(initialActiveStep);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentValidationSchema = useMemo(() => {
    const { schema } = steps.at(activeStep) ?? {};
    return schema;
  }, [activeStep]);

  const isLastStep = useMemo(
    () => activeStep === steps.length - 1,
    [activeStep],
  );

  const componentLabels = useMemo(
    () => ({
      previous: 'Anterior',
      submit: 'Enviar',
      next: 'Próximo',
      cancel: 'Cancelar',
      ...labels,
    }),
    [],
  );

  const handleClickPreviousStep = useCallback(() => {
    setActiveStep(Math.max(activeStep - 1, 0));
  }, [activeStep]);

  const handleClickSubmit = useCallback(
    (values: FormikValues, helpers: FormikHelpers<FormikValues>) => {
      if (isLastStep) return onSubmit(values, helpers);
      else {
        setActiveStep(Math.min(activeStep + 1, steps.length));
        helpers.setSubmitting(false);
        helpers.setTouched({});
      }
    },
    [isLastStep, activeStep, onSubmit],
  );

  return (
    <>
      <Box sx={{ width: '100%', overflowX: 'auto', mb: 2 }}>
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? 'horizontal' : 'horizontal'}
          alternativeLabel={true}
          sx={{
            minWidth: isMobile ? steps.length * 80 : 'auto',
            '& .MuiStepLabel-root': {
              flexDirection: 'column',
            },
            '& .MuiStepLabel-labelContainer': {
              width: isMobile ? 70 : 'auto',
              overflow: 'hidden',
              textAlign: 'center',
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={`step-${index}`}>
              <StepLabel>
                {isMobile ? (
                  <MobileStepLabel>{step.label}</MobileStepLabel>
                ) : (
                  step.label
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Formik
        validationSchema={currentValidationSchema}
        onSubmit={handleClickSubmit}
        {...formikProps}
      >
        {({ isSubmitting }) => (
          <Form id="stepper-form" noValidate>
            
            {autoSaveKey && <AutoSaveWatcher cacheKey={autoSaveKey} />}
            {onDirtyChange && <DirtyWatcher onChange={onDirtyChange} />}

            {steps.map(
              ({ component: FormComponent }, index) =>
                index === activeStep && (
                  <FormComponent key={`form-wrapper-${index}`} />
                ),
            )}
            <Box
              sx={{
                display: 'flex',
                marginTop: 2,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 1,
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="outlined"
                    color="error"
                    type="button"
                    fullWidth={isMobile}
                  >
                    {componentLabels.cancel}
                  </Button>
                )}
                {activeStep > 0 && (
                  <Button
                    onClick={handleClickPreviousStep}
                    disabled={isSubmitting || activeStep === 0}
                    variant="outlined"
                    type="button"
                    fullWidth={isMobile}
                  >
                    {componentLabels.previous}
                  </Button>
                )}
              </Box>
              <Button
                variant="contained"
                type="submit"
                form="stepper-form"
                disabled={isSubmitting}
                fullWidth={isMobile}
              >
                {isSubmitting && (
                  <StepperCircularProgress color="info" size={25} />
                )}
                {!isLastStep ? componentLabels.next : componentLabels.submit}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
}