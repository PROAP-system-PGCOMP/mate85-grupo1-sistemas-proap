import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormikValues } from 'formik';
import {
  reviewSolicitation,
  reviewSolicitationCeapg,
} from '../../services/solicitationService';
import useSolicitation from '../../hooks/solicitation/useSolicitation';
import LinearProgress from '@mui/material/LinearProgress';

import { SolicitationFormValues } from '../../containers/solicitation/SolicitationFormSchema';
import Toast from '../../helpers/notification';
import { dateToLocalDate } from '../../helpers/conversion';
import AdminSolicitationFormContainer from '../../containers/solicitation/AdminSolicitationFormContainer';
import { useDispatch } from 'react-redux';
import useHasPermission from '../../hooks/auth/useHasPermission';
import { UnauthorizedPage } from '../unauthorized/UnauthorizedPage';

export default function ReviewSolicitationPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { solicitation, isLoading, hasError } = useSolicitation(id);
  const isCeapg = useHasPermission('CEAPG_ROLE');
  const userCanViewPage = useHasPermission('APPROVE_REQUEST') || isCeapg;

  const navigate = useNavigate();

  useEffect(() => {
    if (hasError) navigate('not-found');
  }, [hasError]);

  const handleReviewSolicitationSubmit = useCallback(
    (values: FormikValues) => {
      const valuesWithCorrectDates: SolicitationFormValues = {
        ...(values as SolicitationFormValues),
        dataInicio: dateToLocalDate(values.dataInicio),
        dataFim: dateToLocalDate(values.dataFim),
        dataAvaliacaoProap: dateToLocalDate(values.dataAvaliacaoProap),
        createdAt: undefined,
        updatedAt: undefined,
      };

      return reviewSolicitation(valuesWithCorrectDates)
        .then(() => {
          Toast.success('Solicitação avaliada com sucesso!');
          navigate('/');
        })
        .catch((error) => {
          Toast.error(error.response.data.message);
        });
    },
    [dispatch],
  );

  const handleReviewSolicitationCeapgSubmit = useCallback(
    (values: FormikValues) => {
      return reviewSolicitationCeapg(Number(id), {
        custoFinalCeapg: values.custoFinalCeapg,
        observacoesCeapg: values.observacoesCeapg,
      })
        .then(() => {
          Toast.success('Solicitação avaliada com sucesso!');
          navigate('/');
        })
        .catch((error) => {
          Toast.error(error.response.data.message);
        });
    },
    [dispatch, id],
  );

  if (!userCanViewPage) {
    return <UnauthorizedPage />;
  }

  return (
    <>
      {isLoading && <LinearProgress />}
      {!isLoading && !hasError && (
        <>
          {
            <AdminSolicitationFormContainer
              onSubmit={
                isCeapg
                  ? handleReviewSolicitationCeapgSubmit
                  : handleReviewSolicitationSubmit
              }
              initialValues={{
                ...solicitation,
              }}
              isCeapg={isCeapg}
              title="Avaliar solicitação de auxílio"
              hideSubmit={true}
            />
          }
        </>
      )}
    </>
  );
}
