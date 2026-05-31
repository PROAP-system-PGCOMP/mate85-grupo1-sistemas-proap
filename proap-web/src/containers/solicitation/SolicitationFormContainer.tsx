import { useCallback, useMemo, useState } from 'react';

import { Typography } from '@mui/material';
import { FormikValues } from 'formik';
import { useNavigate } from 'react-router-dom';

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
import useUnsavedChangesWarning from '../../hooks/useUnsavedChangesWarning';
import { useNavigationGuard } from '../../contexts/NavigationGuardContext';
import { ConfirmationDialog } from '../../components/dialogs';

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
  const navigate = useNavigate();
  const { setDirty: setGlobalDirty } = useNavigationGuard();
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isUsingCustomInitialValues = initialValues !== defaultProps.initialValues;

  useUnsavedChangesWarning(isDirty);

  const formInitialValues = useMemo(() => {
    if (isUsingCustomInitialValues) {
      sessionStorage.removeItem('rascunho-solicitacao-proap');
      return initialValues;
    }

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
    setIsDirty(false);
    setGlobalDirty(false);
    onSubmit(values);
    sessionStorage.removeItem('rascunho-solicitacao-proap');
  };

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      sessionStorage.removeItem('rascunho-solicitacao-proap');
      navigate('/home');
    }
  }, [isDirty, navigate]);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelDialog(false);
    setIsDirty(false);
    setGlobalDirty(false);
    sessionStorage.removeItem('rascunho-solicitacao-proap');
    navigate('/home');
  }, [navigate, setGlobalDirty]);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    const newDirty = dirty || isUsingCustomInitialValues;
    setIsDirty(newDirty);
    setGlobalDirty(newDirty);
  }, [isUsingCustomInitialValues, setGlobalDirty]);

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
        onCancel={handleCancel}
        onDirtyChange={handleDirtyChange}
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

      <ConfirmationDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar solicitação"
        message="Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos."
        confirmLabel="Sim, cancelar"
        cancelLabel="Continuar editando"
      />
    </>
  );
}
