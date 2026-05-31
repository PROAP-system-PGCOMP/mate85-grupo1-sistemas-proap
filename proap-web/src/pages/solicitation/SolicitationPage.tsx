import { useCallback, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FormikValues } from 'formik';

import SolicitationFormContainer from '../../containers/solicitation/SolicitationFormContainer';
import {
  INITIAL_FORM_VALUES,
  InitialSolicitationFormValues,
} from '../../containers/solicitation/SolicitationFormSchema';
import { submitSolicitation } from '../../services/solicitationService';
import { dateToLocalDate } from '../../helpers/conversion';
import Toast from '../../helpers/notification';
import useHasPermission from '../../hooks/auth/useHasPermission';
import { UnauthorizedPage } from '../unauthorized/UnauthorizedPage';
import { useSysConfig } from '../../hooks/admin/useSysConfig';
import SolicitationsDisabled from '../../components/disabled-features/SolicitationsDisabled';
import useSolicitation from '../../hooks/solicitation/useSolicitation';
import { CircularProgress, Box } from '@mui/material';

export default function SolicitationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userCanCreateRequest = useHasPermission('CREATE_REQUEST');
  const { config } = useSysConfig();

  const [searchParams] = useSearchParams();
  const cloneFromId = searchParams.get('cloneFrom');

  const { solicitation: cloneSource, isLoading: isCloneLoading } =
    useSolicitation(cloneFromId ?? undefined);

  useEffect(() => {
    if (!cloneFromId) {
      sessionStorage.removeItem('rascunho-solicitacao-proap');
    }
  }, [cloneFromId]);

  const handleSubmitSolicitation = useCallback(
    (values: FormikValues) => {
      const valuesWithCorrectDates: InitialSolicitationFormValues = {
        ...(values as InitialSolicitationFormValues),
        dataInicio: dateToLocalDate(values.dataInicio),
        dataFim: dateToLocalDate(values.dataFim),
      };
      return submitSolicitation(valuesWithCorrectDates).then(() => {
        Toast.success('Solicitação criada com sucesso!');
        navigate('/');
      });
    },
    [dispatch],
  );

  if (!userCanCreateRequest) {
    return <UnauthorizedPage />;
  }

  if (!config.enableSolicitation) {
    return <SolicitationsDisabled />;
  }

  if (cloneFromId && isCloneLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const initialValues: InitialSolicitationFormValues | undefined = cloneFromId
    ? {
        ...INITIAL_FORM_VALUES,
        solicitanteDocente: cloneSource.solicitanteDocente,
        nomeDocente: cloneSource.nomeDocente,
        nomeDiscente: cloneSource.nomeDiscente,
        discenteNoPrazoDoCurso: cloneSource.discenteNoPrazoDoCurso,
        mesesAtrasoCurso: cloneSource.mesesAtrasoCurso,
        coautores: cloneSource.coautores || [],
        algumCoautorPGCOMP: cloneSource.algumCoautorPGCOMP,
        nomeEvento: cloneSource.nomeEvento,
        eventoInternacional: cloneSource.eventoInternacional,
        dataInicio: cloneSource.dataInicio,
        dataFim: cloneSource.dataFim,
        qtdDiasEvento: cloneSource.qtdDiasEvento,
        linkHomePageEvento: cloneSource.linkHomePageEvento,
        cidade: cloneSource.cidade,
        pais: cloneSource.pais,
        qualis: cloneSource.qualis,
        modalidadeParticipacao: cloneSource.modalidadeParticipacao,
        valorInscricao: cloneSource.valorInscricao,
        linkPaginaInscricao: cloneSource.linkPaginaInscricao,
        quantidadeDiariasSolicitadas:
          cloneSource.quantidadeDiariasSolicitadas,
        valorDiaria: cloneSource.valorDiaria,
        ultimaDiariaIntegral: cloneSource.ultimaDiariaIntegral,
        isDolar: cloneSource.isDolar,
        cotacaoMoeda: cloneSource.cotacaoMoeda,
        valorPassagem: cloneSource.valorPassagem,
        valorTotal: cloneSource.valorTotal,
        tituloPublicacao: cloneSource.tituloPublicacao,
        cartaAceite: cloneSource.cartaAceite,
        file: null,
        aceiteFinal: false,
        justificativa: cloneSource.justificativa || '',
      }
    : undefined;

  return (
    <SolicitationFormContainer
      key={cloneFromId || 'new'}
      onSubmit={handleSubmitSolicitation}
      {...(initialValues ? { initialValues } : {})}
      title={
        cloneFromId
          ? 'Clonar solicitação de auxílio'
          : 'Nova solicitação de auxílio'
      }
    />
  );
}
