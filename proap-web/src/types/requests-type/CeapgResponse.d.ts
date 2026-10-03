export interface CeapgResponse {
  id: number;
  valorAprovado: number;
  dataAvaliacaoProap: string;
  avaliadorProap: string;
  custoFinalCeapg: number;
  observacoesCeapg: string;
  avaliadorCeapg: string;
  dataAvaliacaoCeapg: string;
  numeroAta: string | number;
  nomeSolicitante?: string; 
  tipoDemanda?: string;
  statusCeapg?: string;
  diferencaCeapg?: number;
}