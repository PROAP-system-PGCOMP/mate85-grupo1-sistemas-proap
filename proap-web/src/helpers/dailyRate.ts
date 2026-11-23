/**
 * Regras do valor da diária nacional (BRL). Espelha o `DailyRateCalculator`
 * do backend, que é quem valida o valor na criação/edição da solicitação.
 *
 * - Aluno: valor padrão do aluno (R$ 320,00);
 * - Docente nas capitais de São Paulo e Rio de Janeiro: R$ 425,00;
 * - Docente em qualquer outro lugar do país (outras capitais e interior,
 *   inclusive interior de SP/RJ): R$ 380,00.
 */

export const DEFAULT_DIARIA_ALUNO = 320;
export const DEFAULT_DIARIA_DOCENTE = 380;
export const DEFAULT_DIARIA_DOCENTE_SP_RJ = 425;

export type DailyRateConfig = {
  valorDiariaBRL?: number | null;
  valorDiariaAlunoBRL?: number | null;
  valorDiariaDocenteBRL?: number | null;
  valorDiariaDocenteSpRjBRL?: number | null;
};

export type NationalDailyRate = {
  valor: number;
  descricao: string;
};

/** Minúsculas, sem acentos e com qualquer pontuação trocada por espaço. */
export const normalizeText = (text?: string | null): string =>
  (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// "sao paulo", "sao paulo sp", "rio de janeiro rj brasil"...
const CAPITAL_SP_RJ =
  /^(sao paulo|rio de janeiro)( (sp|rj))?( (brasil|brazil))?$/;

/** Verdadeiro para as capitais São Paulo e Rio de Janeiro (país em branco vale Brasil). */
export const isCapitalSpRj = (
  cidade?: string | null,
  pais?: string | null,
): boolean => {
  const paisNormalizado = normalizeText(pais);
  if (
    paisNormalizado !== '' &&
    paisNormalizado !== 'brasil' &&
    paisNormalizado !== 'brazil'
  ) {
    return false;
  }
  return CAPITAL_SP_RJ.test(normalizeText(cidade));
};

const valid = (value?: number | null): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export const resolveNationalDailyRate = (
  solicitanteDocente: boolean | undefined,
  cidade: string | undefined,
  pais: string | undefined,
  config?: DailyRateConfig | null,
): NationalDailyRate => {
  if (!solicitanteDocente) {
    const valor = valid(config?.valorDiariaAlunoBRL)
      ? config!.valorDiariaAlunoBRL!
      : valid(config?.valorDiariaBRL)
        ? config!.valorDiariaBRL!
        : DEFAULT_DIARIA_ALUNO;
    return { valor, descricao: 'Discente' };
  }

  if (isCapitalSpRj(cidade, pais)) {
    const valor = valid(config?.valorDiariaDocenteSpRjBRL)
      ? config!.valorDiariaDocenteSpRjBRL!
      : DEFAULT_DIARIA_DOCENTE_SP_RJ;
    return {
      valor,
      descricao: 'Docente · capitais de São Paulo e Rio de Janeiro',
    };
  }

  const valor = valid(config?.valorDiariaDocenteBRL)
    ? config!.valorDiariaDocenteBRL!
    : DEFAULT_DIARIA_DOCENTE;
  return { valor, descricao: 'Docente · demais localidades' };
};
