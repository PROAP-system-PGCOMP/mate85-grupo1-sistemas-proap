import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { FormikValues } from 'formik';

import ExtraSolicitationFormContainer from '../../containers/extra-solicitation/ExtraSolicitationFormContainer';
import useExtraSolicitation from '../../hooks/solicitation/useExtraSolicitation';
import Toast from '../../helpers/notification';
import { updateExtraAssistanceRequest } from '../../services/extraAssistanceRequestService';
import { ExtraRequest } from '../../types';

export default function EditExtraSolicitationPage() {
  const { id } = useParams();
  const { solicitation, isLoading, hasError } = useExtraSolicitation(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasError) navigate('not-found');
  }, [hasError]);

  const handleSubmit = (values: FormikValues) => {
    return updateExtraAssistanceRequest(values as ExtraRequest)
      .then(() => {
        Toast.success('Solicitação alterada com sucesso');
        navigate('/');
      })
      .catch(() => {
        Toast.error('Não foi possível alterar a solicitação.');
      });
  };

  const requestData = (solicitation as any)?.data || solicitation || {};
  const hasData = !!requestData?.id;

  const safeInitialValues = {
    ...requestData,
    id: requestData?.id || '',
    titulo: requestData?.titulo || requestData?.nomeSolicitacao || '',
    itemSolicitado: requestData?.itemSolicitado || '',
    justificativa: requestData?.justificativa || '',
    valorSolicitado: requestData?.valorSolicitado ?? '', 
    solicitacaoApoio: requestData?.solicitacaoApoio ?? false,
    solicitacaoAuxilioOutrasFontes: requestData?.solicitacaoAuxilioOutrasFontes ?? false,
    nomeSolicitacao: requestData?.nomeSolicitacao || '',
    nomeAgenciaFomento: requestData?.nomeAgenciaFomento || '',
    valorSolicitadoAgenciaFormento: requestData?.valorSolicitadoAgenciaFormento || '',
    userName: requestData?.userName || '',
    userEmail: requestData?.userEmail || '',
  };

  return (
    <>
      {isLoading && <LinearProgress />}
      {!isLoading && !hasError && hasData && (
        <ExtraSolicitationFormContainer
          title="Editar solicitação extra"
          initialValues={safeInitialValues}
          onSubmit={handleSubmit}
          labels={{
            submit: 'Editar solicitação',
          }}
        />
      )}
    </>
  );
}