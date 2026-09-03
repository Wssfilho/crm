function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/**
 * Valida o CPF pelos dois dígitos verificadores (módulo 11).
 *
 * @example
 * ```ts
 * cpfEhValido('529.982.247-25'); // true
 * cpfEhValido('111.111.111-11'); // false — sequência repetida
 * ```
 */
export function cpfEhValido(valor: string): boolean {
  const digitos = somenteDigitos(valor);

  if (digitos.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  const digitoVerificador = (ate: number) => {
    let soma = 0;

    for (let i = 0; i < ate; i++) {
      soma += Number(digitos[i]) * (ate + 1 - i);
    }

    const resto = (soma * 10) % 11;

    return resto === 10 ? 0 : resto;
  };

  return (
    digitoVerificador(9) === Number(digitos[9]) &&
    digitoVerificador(10) === Number(digitos[10])
  );
}

export function nbEhValido(valor: string): boolean {
  return somenteDigitos(valor).length === 10;
}
