export const UNIDADES_FEDERATIVAS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

export const IDADE_MINIMA = 16;
export const IDADE_MAXIMA = 120;

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/**
 * Valida um CPF pelos dois dígitos verificadores (módulo 11).
 *
 * @example
 * ```ts
 * cpfEhValido('529.982.247-25'); // true
 * cpfEhValido('111.111.111-11'); // false — sequência repetida
 * ```
 */
export function cpfEhValido(texto: string): boolean {
  const digitos = apenasDigitos(texto);

  if (digitos.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  const digitoVerificador = (ate: number) => {
    let soma = 0;

    for (let posicao = 0; posicao < ate; posicao++) {
      soma += Number(digitos[posicao]) * (ate + 1 - posicao);
    }

    const resto = (soma * 10) % 11;

    return resto === 10 ? 0 : resto;
  };

  return (
    digitoVerificador(9) === Number(digitos[9]) &&
    digitoVerificador(10) === Number(digitos[10])
  );
}

/** O número do benefício do INSS tem 10 dígitos. */
export function nbEhValido(texto: string): boolean {
  return apenasDigitos(texto).length === 10;
}

/** Telefone brasileiro: 10 dígitos (fixo) ou 11 com o 9 do celular. */
export function telefoneEhValido(texto: string): boolean {
  const digitos = apenasDigitos(texto);

  if (digitos.length === 10) {
    return true;
  }

  return digitos.length === 11 && digitos[2] === '9';
}

/** Município no formato `Cidade-UF`, com UF existente. */
export function municipioEhValido(texto: string): boolean {
  const partes = texto.trim().match(/^(.+?)\s*-\s*([A-Za-z]{2})$/);

  if (!partes) {
    return false;
  }

  return (
    partes[1].trim().length >= 2 &&
    UNIDADES_FEDERATIVAS.includes(partes[2].toUpperCase())
  );
}

/** Código de espécie de benefício do INSS: 1 a 3 dígitos. */
export function especieEhValida(texto: string): boolean {
  return /^\d{1,3}$/.test(texto.trim());
}

interface DataAnalisada {
  data: Date;
  iso: string;
  idade: number;
}

/**
 * Interpreta `dd/mm/aaaa` recusando datas que não existem no calendário.
 *
 * @example
 * ```ts
 * analisarData('31/02/1954'); // null — fevereiro não tem 31
 * ```
 */
export function analisarData(texto: string): DataAnalisada | null {
  const partes = texto.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!partes) {
    return null;
  }

  const [, dia, mes, ano] = partes.map(Number) as unknown as number[];
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  const existeNoCalendario =
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia;

  if (!existeNoCalendario) {
    return null;
  }

  const idade = Math.floor(
    (Date.now() - data.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );

  return {
    data,
    iso: `${partes[3]}-${partes[2]}-${partes[1]}`,
    idade,
  };
}

export function nascimentoEhValido(texto: string): boolean {
  const analisada = analisarData(texto);

  if (!analisada) {
    return false;
  }

  return analisada.idade >= IDADE_MINIMA && analisada.idade <= IDADE_MAXIMA;
}
