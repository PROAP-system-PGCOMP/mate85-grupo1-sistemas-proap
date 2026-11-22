export interface UrlMapper {
  id?: string;
  url: string;
  fieldName: string;
  urlTitle: string;
}

export interface CountryGroup {
  id?: string;
  groupName: string;
  valueUSD: number;
  countries: string[];
}

export interface SystemConfiguration {
  id: string;
  qualis: string[];
  sitePgcompURL: string | null;
  resolucaoProapURL: string | null;
  numMaxDiarias: number;
  /** @deprecated substituído pelos valores por perfil/localidade abaixo */
  valorDiariaBRL: number;
  valorDiariaAlunoBRL: number;
  valorDiariaDocenteBRL: number;
  valorDiariaDocenteSpRjBRL: number;
  textoAvisoQualis: string;
  textoAvisoValorInscricao: string;
  textoInformacaoQtdDiarias: string;
  textoAvisoEnvioArquivoCarta: string;
  textoInformacaoCalcularQualis: string;
  textoInformacaoValorDiaria: string;
  textoInformacaoValorPassagem: string;
  resourceLinks?: UrlMapper[];
  countryGroups?: CountryGroup[];
  enableSolicitation: boolean;
  startDate?: string | null;
  endDate?: string | null;
}
