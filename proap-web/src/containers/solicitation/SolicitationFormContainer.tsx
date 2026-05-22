import { useMemo } from 'react';

import { Typography } from '@mui/material';
import { FormikValues } from 'formik';

import SolicitationDataFormContainer from './create/SolicitationDataFormContainer';

import {
  financialDetailFormSchema,
  eventDetailFormSchema,
  INITIAL_FORM_VALUES,
  solicitantionDataFormSchema,
  solicitantDetailFormSchema,
  InitialSolicitationFormValues,
  confirmationDataFormSchema,
} from './SolicitationFormSchema';
import StepperForm, {
  FormStep,
} from '../../components/stepper-form/StepperForm';
import SolicitantDetailFormContainer from './create/SolicitantDetailFormContainer';
import ConfirmationFormContainer from './create/ConfirmationFormContainer';
import EventDetailFormContainer from './create/EventDetailFormContainer';
import FinancialDetailFormContainer from './create/FinancialDetailFormContainer';

interface SolicitationFormContainerProps {
  onSubmit: (values: FormikValues) => void;
  initialValues?: InitialSolicitationFormValues;
  title?: string;
  labels?: {
    previous?: string;
    submit?: string;
    next?: string;
  };
}

const defaultProps: SolicitationFormContainerProps = {
  title: 'Nova solicitação de auxílio',
  initialValues: INITIAL_FORM_VALUES,
  labels: {
    submit: 'Enviar solicitação',
  },
  onSubmit: () => {},
};

export default function SolicitationFormContainer({
  title = defaultProps.title,
  initialValues = defaultProps.initialValues,
  labels = defaultProps.labels,
  onSubmit = defaultProps.onSubmit,
}: SolicitationFormContainerProps) {
  
  const formInitialValues = useMemo(() => {
    const rascunhoSalvo = sessionStorage.getItem('rascunho-solicitacao-proap');
    
    if (rascunhoSalvo) {
      try {
        return JSON.parse(rascunhoSalvo);
      } catch (error) {
        console.error("Erro ao ler o rascunho, restaurando padrão.", error);
        sessionStorage.removeItem('rascunho-solicitacao-proap');
      }
    }
    
    return initialValues;
  }, []);

  const handleFormSubmit = (values: FormikValues) => {
    onSubmit(values); 
    sessionStorage.removeItem('rascunho-solicitacao-proap'); 
  };

  const registerFormSteps: FormStep[] = useMemo(
    () => [
      {
        label: 'Detalhes do Solicitante',
        component: SolicitantDetailFormContainer,
        schema: solicitantDetailFormSchema,
      },
      {
        label: 'Dados da Solicitação',
        component: SolicitationDataFormContainer,
        schema: solicitantionDataFormSchema,
      },
      {
        label: 'Detalhamento do Evento',
        component: EventDetailFormContainer,
        schema: eventDetailFormSchema,
      },
      {
        label: 'Detalhamento Financeiro',
        component: FinancialDetailFormContainer,
        schema: financialDetailFormSchema,
      },
      {
        label: 'Confirmação e Revisão',
        component: ConfirmationFormContainer,
        schema: confirmationDataFormSchema,
      },
    ],
    [],
  );

  return (
    <>
      <Typography
        variant="h4"
        color="primary"
        fontWeight="bold"
        marginBottom={2}
      >
        {title}
      </Typography>
      <StepperForm
        initialValues={formInitialValues as FormikValues}
        onSubmit={handleFormSubmit}
        steps={registerFormSteps}
        validateOnChange={false}
        enableReinitialize={true} 
        autoSaveKey="rascunho-solicitacao-proap"
        labels={
          labels || {
            submit: 'Enviar solicitação',
          }
        }
      />
    </>
  );
}