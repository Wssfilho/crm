import { useEffect, useRef, useState } from 'react';

/** Duração padrão, em milissegundos, das animações dos gráficos. */
export const duracaoDaAnimacaoEmMs = 700;

/** Verdadeiro quando o sistema pede menos movimento na interface. */
export function prefereMenosMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Interpola um número até o alvo sempre que ele muda, desacelerando no fim.
 * Começa em zero na montagem, para o valor "crescer" quando a página abre.
 *
 * @example
 * ```ts
 * const analisados = useValorAnimado(totalAnalisado);
 * ```
 */
export function useValorAnimado(alvo: number, duracao = duracaoDaAnimacaoEmMs) {
  const [valor, setValor] = useState(0);
  const valorRef = useRef(0);

  useEffect(() => {
    if (prefereMenosMovimento()) {
      valorRef.current = alvo;
      setValor(alvo);
      return;
    }

    const inicio = valorRef.current;
    const distancia = alvo - inicio;

    if (distancia === 0) {
      return;
    }

    const comecouEm = performance.now();
    let quadro = 0;

    const avancar = (agora: number) => {
      const progresso = Math.min((agora - comecouEm) / duracao, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);

      valorRef.current = inicio + distancia * suavizado;
      setValor(valorRef.current);

      if (progresso < 1) {
        quadro = requestAnimationFrame(avancar);
      }
    };

    quadro = requestAnimationFrame(avancar);

    return () => cancelAnimationFrame(quadro);
  }, [alvo, duracao]);

  return valor;
}
