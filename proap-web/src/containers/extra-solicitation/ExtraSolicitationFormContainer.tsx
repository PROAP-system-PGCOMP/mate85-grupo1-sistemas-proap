import React, { useMemo } from 'react';
import StepperForm, {
  FormStep,
} from '../../components/stepper-form/StepperForm';
import { Typography } from '@mui/material';
import { FormikValues } from 'formik';

import ExtraSolicitationDetailsFormContainer from './steps/ExtraSolicitationDetailsContainer';
import ExtraSolicitantDataContainer from './steps/ExtraSolicitantDataContainer';
import {
  ExtraSolicitationFormValues,
  extraSolicitantDataSchema,
} from './ExtraSolicitationFormSchema';
import { confirmationDataFormSchema } from '../solicitation/SolicitationFormSchema';

interface ExtraSolicitationFormContainerProps {
  initialValues: ExtraSolicitationFormValues;
  onSubmit: (values: FormikValues) => Promise<any>;
  labels?: object;
  title: string;
}

export default function ExtraSolicitationFormContainer(
  props: ExtraSolicitationFormContainerProps,
) {
  const { title, initialValues, labels, onSubmit } = props;

  const formInitialValues = useMemo(() => {
    const rascunhoSalvo = sessionStorage.getItem('rascunho-solicitacao-extra-proap');
    
    if (rascunhoSalvo) {
      try {
        return JSON.parse(rascunhoSalvo);
      } catch (error) {
        console.error("Erro ao ler o rascunho extra, restaurando padrão.", error);
        sessionStorage.removeItem('rascunho-solicitacao-extra-proap');
      }
    }
    
    return initialValues;
  }, []); 

  const handleFormSubmit = async (values: FormikValues) => {
    await onSubmit(values); 
    sessionStorage.removeItem('rascunho-solicitacao-extra-proap'); 
  };

  const extraSolicitationFormSteps: FormStep[] = useMemo(
    () => [
      {
        label: 'Solicitante',
        component: ExtraSolicitantDataContainer,
        schema: extraSolicitantDataSchema,
      },
      {
        label: 'Detalhes',
        component: ExtraSolicitationDetailsFormContainer,
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
        steps={extraSolicitationFormSteps}
        validateOnChange={false}
        enableReinitialize={true}
        autoSaveKey="rascunho-solicitacao-extra-proap"
        labels={
          labels || {
            submit: 'Criar solicitação',
          }
        }
      />
    </>
  );
}