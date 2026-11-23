import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormikValues } from 'formik';

import SolicitationFormContainer from '../../containers/solicitation/SolicitationFormContainer';
import { updateSolicitation } from '../../services/solicitationService';
import useSolicitation from '../../hooks/solicitation/useSolicitation';
import LinearProgress from '@mui/material/LinearProgress';
import { useAuth } from '../../hooks';
import {
  INITIAL_FORM_VALUES,
  SolicitationFormValues,
} from '../../containers/solicitation/SolicitationFormSchema';
import Toast from '../../helpers/notification';
import { dateToLocalDate } from '../../helpers/conversion';
import { useDispatch } from 'react-redux';
import useHasPermission from '../../hooks/auth/useHasPermission';
import { UnauthorizedPage } from '../unauthorized/UnauthorizedPage';

export default function EditSolicitationPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { solicitation, isLoading, hasError } = useSolicitation(id);
  const userCanApproveRequests = useHasPermission('APPROVE_REQUEST');

  const navigate = useNavigate();

  useEffect(() => {
    if (hasError) navigate('not-found');
  }, [hasError]);

  const handleEditSolicitationSubmit = useCallback(
    async (values: FormikValues) => {
      const valuesWithCorrectDates: SolicitationFormValues = {
        ...(values as SolicitationFormValues),
        dataInicio: dateToLocalDate(values.dataInicio),
        dataFim: dateToLocalDate(values.dataFim),
        dataAvaliacaoProap:
          values.dataAvaliacaoProap &&
          dateToLocalDate(values.dataAvaliacaoProap),
        createdAt: undefined,
        updatedAt: undefined,
      };
      await updateSolicitation(valuesWithCorrectDates, values.file as File);
      Toast.success('Solicitação avaliada com sucesso!');
      navigate('/');
    },
    [dispatch],
  );

  const statusIsNotPending = solicitation.situacao !== 0;

  if (statusIsNotPending && !userCanApproveRequests) {
    return <UnauthorizedPage />;
  }

  return (
    <>
      {isLoading && <LinearProgress />}
      {!isLoading && !hasError && (
        <>
          {
            <SolicitationFormContainer
              onSubmit={handleEditSolicitationSubmit}
              initialValues={{
                ...solicitation,
                countryGroup: solicitation.countryGroup ?? '',
                aceiteFinal: false,
                file: null,
              }}
              title="Editar solicitação de auxílio"
              labels={{
                submit: 'Editar solicitação',
              }}
            />
          }
        </>
      )}
    </>
  );
}
