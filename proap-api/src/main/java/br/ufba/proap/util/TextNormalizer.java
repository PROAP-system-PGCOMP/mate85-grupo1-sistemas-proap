package br.ufba.proap.util;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Normalização de texto livre para comparações (cidade, país etc.).
 */
public final class TextNormalizer {

    private TextNormalizer() {
    }

    /**
     * Minúsculas, sem acentos, com qualquer sequência de caracteres não
     * alfanuméricos trocada por um único espaço e sem espaços nas pontas.
     * Ex.: "  São   Paulo - SP " vira "sao paulo sp".
     */
    public static String normalize(String text) {
        if (text == null) {
            return "";
        }
        String decomposed = Normalizer.normalize(text, Normalizer.Form.NFD);
        String withoutAccents = decomposed.replaceAll("\\p{M}+", "");
        return withoutAccents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }
}
