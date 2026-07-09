import * as Yup from 'yup';

const minDate = new Date('1900-01-01');
const maxDate = new Date('2099-12-31');

export const systemConfigSchema = Yup.object().shape({
  id: Yup.string().required('ID é obrigatório'),
  qualis: Yup.array().of(Yup.string().required()),
  sitePgcompURL: Yup.string().url('Insira uma URL válida').nullable(),
  resolucaoProapURL: Yup.string().url('Insira uma URL válida').nullable(),
  numMaxDiarias: Yup.number()
    .required('Número máximo de diárias é obrigatório')
    .min(0, 'Número máximo de diárias deve ser pelo menos 0')
    .integer('Número máximo de diárias deve ser um número inteiro'),
  valorDiariaBRL: Yup.number()
    .required('Valor da diária é obrigatório')
    .min(0, 'Valor da diária deve ser maior que 0'),

  enableSolicitation: Yup.boolean().notRequired(),
  
  startDate: Yup.date()
    .nullable()
    .notRequired()
    .min(minDate, 'Insira um ano válido')
    .max(maxDate, 'Insira um ano válido'),
    
  endDate: Yup.date()
    .nullable()
    .max(maxDate, 'Insira um ano válido')
    .when(['startDate'], {
      is: (startDate: any) => !!startDate,
      then: (schema) => 
        schema
          .min(Yup.ref('startDate'), 'Data de fim deve ser após a data de início')
          .notRequired(),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    
  textoAvisoQualis: Yup.string().required(
    'Texto de aviso Qualis é obrigatório',
  ),
  textoAvisoValorInscricao: Yup.string().required(
    'Texto de aviso sobre valor de inscrição é obrigatório',
  ),
  textoInformacaoQtdDiarias: Yup.string().required(
    'Texto com informações sobre quantidade de diárias é obrigatório',
  ),
  textoAvisoEnvioArquivoCarta: Yup.string().required(
    'Texto de aviso sobre envio de arquivo de carta é obrigatório',
  ),
  textoInformacaoCalcularQualis: Yup.string().required(
    'Texto com informações sobre como calcular Qualis é obrigatório',
  ),
  textoInformacaoValorDiaria: Yup.string().required(
    'Texto com informações sobre valor da diária é obrigatório',
  ),
  textoInformacaoValorPassagem: Yup.string().required(
    'Texto com informações sobre valor da passagem é obrigatório',
  ),
  resourceLinks: Yup.array().of(
    Yup.object().shape({
      url: Yup.string().url('URL inválida').required('URL é obrigatória'),
      urlTitle: Yup.string().required('Título do link é obrigatório'),
      fieldName: Yup.string().required('Nome do campo é obrigatório'),
    }),
  ),
});