import * as Yup from 'yup';
import { AssistanceRequest } from '../../types';

const minDate = new Date('1900-01-01');
const maxDate = new Date('2099-12-31');
const validacaoNome = Yup.string()
  .required('Campo obrigatório')
  .test(
    'sem-espacos-falsos',
    'O campo não pode conter apenas espaços',
    (value) => !!value && value.trim().length > 0
  )
  .min(3, 'O nome deve ter no mínimo 3 caracteres')
  .matches(
    /^[a-zA-ZÀ-ÿ\s]+$/, 
    'O nome não pode conter números ou caracteres especiais'
  );
export const solicitantionDataFormSchema = Yup.object({
  tituloPublicacao: Yup.string()
    .required('Campo obrigatório')
    .max(500, 'O título deve ter no máximo 500 caracteres'),
  coautores: Yup.array().of(Yup.string()),
  algumCoautorPGCOMP: Yup.boolean().when('coautores', {
    is: (coautores: string[]) => coautores && coautores.length > 0,
    then: () => Yup.string().required('Campo obrigatório'),
    otherwise: () => Yup.string().notRequired(),
  }),
  file: Yup.mixed<File>()
    .nullable()
    .notRequired()
    .test('fileSize', 'O arquivo deve ter no máximo 10MB', (value) => {
      if (!value) return true;
      return value.size <= 10000000;
    }),
});

export const solicitantDetailFormSchema = Yup.object({
  solicitanteDocente: Yup.boolean().required('Campo obrigatório'),
  nomeDocente: validacaoNome,
  nomeDiscente: Yup.string().when('solicitanteDocente', {
    is: false,
    then: () => validacaoNome,
    otherwise: () => Yup.string().notRequired(),
  }),
  discenteNoPrazoDoCurso: Yup.boolean().when('solicitanteDocente', {
    is: true,
    then: () => Yup.boolean().notRequired(),
    otherwise: () => Yup.boolean().required('Campo obrigatório'),
  }),
  mesesAtrasoCurso: Yup.number()
    .when('discenteNoPrazoDoCurso', {
      is: false,
      then: () => Yup.number().required('Campo obrigatório'),
      otherwise: () => Yup.number().notRequired(),
    })
    .integer('Deve ser um número inteiro')
    .min(1, 'O valor mínimo é 1'),
});
export const eventDetailFormSchema = Yup.object({
  nomeEvento: Yup.string().required('Campo obrigatório')
    .max(255, 'O nome do evento não pode conter mais que 255 caracteres.'),
  eventoInternacional: Yup.boolean().required('Campo obrigatório'),
  dataInicio: Yup.string()
    .required('Campo obrigatório')
    .test(
      'ano-valido-inicio',
      'Insira um ano válido',
      function (value) {
        if (!value) return true; 
        const year = new Date(value).getFullYear();
        return year >= 1900 && year <= 2099;
      }
    ),

  dataFim: Yup.string()
    .required('Campo obrigatório')
    .test(
      'ano-valido-fim',
      'Insira um ano válido',
      function (value) {
        if (!value) return true; 
        const year = new Date(value).getFullYear();
        return year >= 1900 && year <= 2099;
      }
    )
    .test(
      'dataFim-maior-que-dataInicio',
      'Data de término deve ser maior ou igual a data de início',
      function (value) {
        const { dataInicio } = this.parent;
        return value && dataInicio && new Date(value) >= new Date(dataInicio);
      },
    ),
  qtdDiasEvento: Yup.number().min(0, 'Insira um valor válido').required('Campo obrigatório').nullable(),
  linkHomePageEvento: Yup.string()
    .url('Insira uma URL válida')
    .max(255, 'O link deve ter no máximo 255 caracteres'),
  cidade: Yup.string().required('Campo obrigatório')
    .max(255, 'A cidade não pode conter mais que 255 caracteres.'),
  pais: Yup.string().required('Campo obrigatório')
    .max(255, 'O país não pode conter mais que 255 caracteres.'),
  qualis: Yup.string().required('Campo obrigatório'),
  modalidadeParticipacao: Yup.string().required('Campo obrigatório'),
});

export const financialDetailFormSchema = Yup.object({
  valorInscricao: Yup.number()
    .min(0, 'Insira um valor válido')
    .defined()
    .required('Campo obrigatório'),
  linkPaginaInscricao: Yup.string()
    .url('Insira uma URL válida')
    .max(255, 'O link deve ter no máximo 255 caracteres')
    .required('Campo obrigatório'),
  quantidadeDiariasSolicitadas: Yup.number()
    .min(0, 'Insira um valor válido')
    .defined()
    .required('Campo obrigatório'),
  valorDiaria: Yup.number()
    .min(0, 'Insira um valor válido')
    .defined()
    .when('quantidadeDiariasSolicitadas', {
      is: (quantidadeDiariasSolicitadas: number) =>
        quantidadeDiariasSolicitadas > 0,
      then: () => Yup.number().required('Campo obrigatório'),
      otherwise: () => Yup.number().notRequired(),
    }),
  ultimaDiariaIntegral: Yup.boolean().required('Campo obrigatório'),
  isDolar: Yup.boolean().required('Campo obrigatório'),
  cotacaoMoeda: Yup.number()
    .when('isDolar', {
      is: true,
      then: () => Yup.number().required('Campo obrigatório'),
      otherwise: () => Yup.number().notRequired(),
    })
    .defined()
    .min(1, 'Insira um valor válido'),
  valorPassagem: Yup.number()
    .min(0, 'Insira um valor válido')
    .defined()
    .when('solitanteDocente', {
      is: true,
      then: () => Yup.number().required('Campo obrigatório'),
      otherwise: () => Yup.number().notRequired(),
    }),
  countryGroup: Yup.string().when('isDolar', {
    is: true,
    then: () => Yup.string().required('Selecione o grupo do país'),
    otherwise: () => Yup.string().notRequired(),
  }),
});
export const confirmationDataFormSchema = Yup.object({
  aceiteFinal: Yup.boolean()
    .nullable()
    .required('É necessário aceitar os termos para continuar')
    .isTrue('É necessário aceitar os termos para continuar'),
});

export const reviewDataFormSchema = Yup.object({
  situacao: Yup.number()
    .required('Campo obrigatório')
    .oneOf([0, 1, 2], 'Situação deve ser Aprovado, Reprovado ou Pendente'),
  
  dataAvaliacaoProap: Yup.string().required('Campo obrigatório'),

  numeroAta: Yup.number()
    .nullable() 
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
    .when('situacao', {
      is: (situacao : number) => situacao !== 0, 
      then: (schema) => schema.required('Campo obrigatório'),
      otherwise: (schema) => schema.notRequired(),
    }),

  numeroDiariasAprovadas: Yup.number()
    .nullable()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
    .when('situacao', {
      is: (situacao: number) => situacao !== 0,
      then: (schema) => schema.required('Campo obrigatório'),
      otherwise: (schema) => schema.notRequired(),
    }),

  valorAprovado: Yup.number()
    .nullable()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
    .when('situacao', {
      is: (situacao: number) => situacao !== 0 && situacao !== 2,
      then: (schema) => schema.required('Campo obrigatório'),
      otherwise: (schema) => schema.notRequired(),
    }),

  observacao: Yup.string().notRequired()
    .max(1000, 'A observação não pode conter mais que 1000 caracteres.'),
});

export const ceapgDataFormSchema = Yup.object({
  custoFinalCeapg: Yup.number().required('Campo obrigatório'),
  observacoesCeapg: Yup.string().notRequired()
    .max(1000, 'A observação não pode conter mais que 1000 caracteres.'),
});

export interface SolicitationFormValues
  extends Omit<AssistanceRequest, 'automaticDecText'> {
  aceiteFinal: boolean | undefined;
}

export type InitialSolicitationFormValues = Pick<
  AssistanceRequest,
  | 'tituloPublicacao'
  | 'coautores'
  | 'algumCoautorPGCOMP'
  | 'solicitanteDocente'
  | 'nomeDocente'
  | 'nomeDiscente'
  | 'discenteNoPrazoDoCurso'
  | 'mesesAtrasoCurso'
  | 'nomeEvento'
  | 'eventoInternacional'
  | 'dataInicio'
  | 'dataFim'
  | 'qtdDiasEvento'
  | 'linkHomePageEvento'
  | 'cidade'
  | 'pais'
  | 'qualis'
  | 'modalidadeParticipacao'
  | 'valorInscricao'
  | 'linkPaginaInscricao'
  | 'quantidadeDiariasSolicitadas'
  | 'valorDiaria'
  | 'ultimaDiariaIntegral'
  | 'isDolar'
  | 'cotacaoMoeda'
  | 'valorPassagem'
  | 'valorTotal'
  | 'justificativa'
  | 'cartaAceite'
> & {
  file: File | null;
  aceiteFinal: boolean | undefined;
  countryGroup?: string;
};

export const INITIAL_FORM_VALUES: InitialSolicitationFormValues = {
  tituloPublicacao: '',
  coautores: [],
  eventoInternacional: false,
  qtdDiasEvento: 0,
  linkHomePageEvento: '',
  modalidadeParticipacao: '',
  linkPaginaInscricao: '',
  valorDiaria: 0,
  ultimaDiariaIntegral: false,
  isDolar: false,
  cotacaoMoeda: 1,
  valorPassagem: 0,
  valorTotal: 0,
  algumCoautorPGCOMP: false,
  solicitanteDocente: false,
  nomeDocente: '',
  nomeDiscente: '',
  discenteNoPrazoDoCurso: null,
  mesesAtrasoCurso: null,
  dataInicio: '',
  dataFim: '',
  pais: '',
  cidade: '',
  valorInscricao: 0,
  qualis: 'A1',
  nomeEvento: '',
  quantidadeDiariasSolicitadas: 0,
  file: null,
  aceiteFinal: false,
  justificativa: '',
  cartaAceite: null,
  countryGroup: '',
};

export const INITIAL_REVIEW_FORM_VALUES: SolicitationFormValues = {
  id: undefined,
  tituloPublicacao: '',
  coautores: [],
  eventoInternacional: false,
  qtdDiasEvento: null,
  linkHomePageEvento: '',
  modalidadeParticipacao: '',
  linkPaginaInscricao: '',
  valorDiaria: 0,
  ultimaDiariaIntegral: false,
  isDolar: false,
  cotacaoMoeda: 1,
  valorPassagem: 0,
  valorTotal: 0,
  algumCoautorPGCOMP: false,
  solicitanteDocente: false,
  nomeDocente: '',
  nomeDiscente: '',
  discenteNoPrazoDoCurso: null,
  mesesAtrasoCurso: null,
  dataInicio: '',
  dataFim: '',
  pais: '',
  cidade: '',
  valorInscricao: 0,
  qualis: 'A1',
  nomeEvento: '',
  quantidadeDiariasSolicitadas: 0,
  cartaAceite: null,
  aceiteFinal: false,
  justificativa: '',
  situacao: 0,
  dataAvaliacaoProap: '',
  numeroAta: 0,
  numeroDiariasAprovadas: 0,
  observacao: '',
  valorAprovado: 0,
  comprovantePagamento: null,
  createdAt: undefined,
  updatedAt: undefined,
  percentualOrcamentoAnual: 0,
  custoFinalCeapg: 0,
  observacoesCeapg: '',
  user: {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    alternativePhone: '',
    registrationNumber: '',
    profileName: '',
  },
  avaliadorProap: {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    alternativePhone: '',
    registrationNumber: '',
    profileName: '',
  },
  avaliadorCeapg: {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    alternativePhone: '',
    registrationNumber: '',
    profileName: '',
  },
};
