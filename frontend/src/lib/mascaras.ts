import { apenasDigitos } from './validacoes';

/** `000.000.000-00` */
export function mascaraCpf(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 11);

  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

/** `000.000.000-0` */
export function mascaraNb(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 10);

  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

/** `dd/mm/aaaa` */
export function mascaraData(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 8);

  return digitos
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

/** `(00) 00000-0000` */
export function mascaraTelefone(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^\((\d{2})\) (\d{4})(\d)/, '($1) $2-$3');
  }

  return digitos
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/^\((\d{2})\) (\d{5})(\d)/, '($1) $2-$3');
}

/** Moeda BRL a partir dos dígitos digitados: `1518` vira `R$ 15,18`. */
export function mascaraMoeda(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 11);

  if (!digitos) {
    return '';
  }

  const centavos = Number(digitos);

  return `R$ ${(centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Espécie do INSS: só dígitos, no máximo 3. */
export function mascaraEspecie(texto: string): string {
  return apenasDigitos(texto).slice(0, 3);
}
