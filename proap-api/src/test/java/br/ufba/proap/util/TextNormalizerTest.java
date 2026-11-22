package br.ufba.proap.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class TextNormalizerTest {

    @Test
    void removeAcentosCaixaEEspacos() {
        assertEquals("sao paulo", TextNormalizer.normalize("  SÃO   Paulo "));
    }

    @Test
    void trocaPontuacaoPorEspaco() {
        assertEquals("sao paulo sp", TextNormalizer.normalize("São Paulo - SP"));
        assertEquals("rio de janeiro rj", TextNormalizer.normalize("Rio de Janeiro/RJ"));
    }

    @Test
    void nuloOuVazioViraVazio() {
        assertEquals("", TextNormalizer.normalize(null));
        assertEquals("", TextNormalizer.normalize("   "));
    }
}
