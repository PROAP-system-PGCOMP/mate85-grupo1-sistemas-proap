import { User } from '../auth-type/user';

export interface AssistanceRequest {
  id: number | undefined;
  automaticDecText: string;

  tituloPublicacao: string;
  coautores: string[];
  algumCoautorPGCOMP: boolean | null;
  solicitanteDocente: boolean;
  nomeDocente: string;
  nomeDiscente: string;
  nomeEvento: string;
  eventoInternacional: boolean;
  dataInicio: string;
  dataFim: string;
  qtdDiasEvento: number | null;
  linkHomePageEvento: string;
  cidade: string;
  pais: string;
  qualis: string;
  modalidadeParticipacao: string;
  valorInscricao: number;
  linkPaginaInscricao: string;
  quantidadeDiariasSolicitadas: number;
  valorDiaria: number;
  ultimaDiariaIntegral: boolean;
  isDolar: boolean;
  cotacaoMoeda: number;
  valorPassagem: number;
  valorTotal: number;
  valorAprovado: number;
  cartaAceite: string | null;
  justificativa: string;
  comprovantePagamento: string | null;
  situacao: number;
  dataAvaliacaoProap: string;
  numeroAta: number;
  numeroDiariasAprovadas: number;
  observacao: string;
  percentualOrcamentoAnual: number;
  custoFinalCeapg: number;
  observacoesCeapg: string;

  avaliadorProap: User;
  avaliadorCeapg: User;

  createdAt: string | undefined;
  updatedAt: string | undefined;

  user: User;
}
