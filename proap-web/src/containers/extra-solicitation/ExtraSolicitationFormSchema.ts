import * as Yup from 'yup';
import { ExtraRequest } from '../../types/requests-type/ExtraRequest';
import { RequestReview } from '../../types/requests-type/RequestReview';

export interface ExtraSolicitationFormValues
  extends Omit<ExtraRequest, 'automaticDecText' | 'createdAt' | 'updatedAt'> {
  aceiteFinal: boolean;
}

export const extraSolicitantDataSchema = Yup.object({
  titulo: Yup.string()
    .trim()
    .required('Campo obrigatório')
    .max(500, 'O título não pode conter mais que 500 caracteres.'),
  valorSolicitado: Yup.number()
    .typeError('O valor precisa ser um número válido')
    .min(0, 'Insira um valor válido')
    .defined()
    .required('Campo obrigatório'),
  justificativa: Yup.string()
    .trim()
    .required('Campo obrigatório')
    .max(500, 'A justificativa não pode conter mais que 500 caracteres.'),
});

export const EXTRA_SOLICITATION_INITIAL_VALUES: ExtraSolicitationFormValues = {
  id: 0,
  nomeSolicitacao: '',
  dataAvaliacaoProap: '',
  itemSolicitado: '',
  justificativa: '',
  valorSolicitado: null,
  solicitacaoApoio: false,
  solicitacaoAuxilioOutrasFontes: false,
  nomeAgenciaFomento: '',
  aceiteFinal: false,
  situacao: 2,
  numeroAta: '',
  observacao: '',
  valorAprovado: null,

  user: {
    alternativePhone: '',
    cpf: '',
    email: '',
    id: 0,
    name: '',
    password: '',
  },
};
