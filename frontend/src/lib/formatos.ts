/**
 * Converte um valor em reais digitado livremente para centavos.
 *
 * @example
 * ```ts
 * paraCentavos('R$ 1.518,00'); // 151800
 * ```
 */
export function paraCentavos(texto: string): number | undefined {
  const digitos = texto.replace(/[^\d,]/g, '').replace(',', '.');

  if (!digitos) {
    return undefined;
  }

  const valor = Number(digitos);

  if (Number.isNaN(valor)) {
    return undefined;
  }

  return Math.round(valor * 100);
}
