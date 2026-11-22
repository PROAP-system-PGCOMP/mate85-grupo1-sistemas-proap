import { describe, expect, it } from 'vitest';
import {
  isCapitalSpRj,
  normalizeText,
  resolveNationalDailyRate,
} from '../../src/helpers/dailyRate';

const config = {
  valorDiariaAlunoBRL: 320,
  valorDiariaDocenteBRL: 380,
  valorDiariaDocenteSpRjBRL: 425,
};

describe('normalizeText', () => {
  it('remove acentos, caixa, pontuação e espaços extras', () => {
    expect(normalizeText('  SÃO   Paulo - SP ')).toBe('sao paulo sp');
    expect(normalizeText(undefined)).toBe('');
  });
});

describe('isCapitalSpRj', () => {
  it.each([
    'São Paulo',
    'sao paulo',
    '  SÃO   PAULO ',
    'São Paulo - SP',
    'Sao Paulo/SP',
    'Rio de Janeiro',
    'rio de janeiro - RJ',
  ])('reconhece "%s"', (cidade) => {
    expect(isCapitalSpRj(cidade, 'Brasil')).toBe(true);
  });

  it.each([
    'Campinas',
    'Niterói',
    'Salvador',
    'São Paulo do Potengi',
    'Santos',
    'SP',
    '',
  ])('não reconhece "%s"', (cidade) => {
    expect(isCapitalSpRj(cidade, 'Brasil')).toBe(false);
  });

  it('não considera capital fora do Brasil', () => {
    expect(isCapitalSpRj('São Paulo', 'Portugal')).toBe(false);
  });
});

describe('resolveNationalDailyRate', () => {
  it('aluno: 320 em qualquer cidade', () => {
    expect(resolveNationalDailyRate(false, 'São Paulo', 'Brasil', config).valor).toBe(320);
    expect(resolveNationalDailyRate(false, 'Salvador', 'Brasil', config).valor).toBe(320);
  });

  it('docente em São Paulo ou Rio (capitais): 425', () => {
    expect(resolveNationalDailyRate(true, 'São Paulo', 'Brasil', config).valor).toBe(425);
    expect(resolveNationalDailyRate(true, 'Rio de Janeiro', 'Brasil', config).valor).toBe(425);
  });

  it('docente em outras capitais e interior (inclusive SP/RJ): 380', () => {
    expect(resolveNationalDailyRate(true, 'Salvador', 'Brasil', config).valor).toBe(380);
    expect(resolveNationalDailyRate(true, 'Campinas', 'Brasil', config).valor).toBe(380);
    expect(resolveNationalDailyRate(true, 'Niterói', 'Brasil', config).valor).toBe(380);
  });

  it('usa os valores padrão quando a configuração ainda não carregou', () => {
    expect(resolveNationalDailyRate(false, 'X', 'Brasil', undefined).valor).toBe(320);
    expect(resolveNationalDailyRate(true, 'X', 'Brasil', undefined).valor).toBe(380);
    expect(resolveNationalDailyRate(true, 'São Paulo', 'Brasil', undefined).valor).toBe(425);
  });

  it('aluno usa o valor global antigo se o novo campo não existir', () => {
    expect(
      resolveNationalDailyRate(false, 'X', 'Brasil', { valorDiariaBRL: 300 }).valor,
    ).toBe(300);
  });
});
