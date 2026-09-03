import { useEffect, useState } from 'react';
import { prefereMenosMovimento } from '@/hooks/use-valor-animado';

/**
 * Fica verdadeiro logo depois do primeiro quadro pintado, para que as
 * transições de CSS partam do estado inicial quando a página abre.
 *
 * @example
 * ```tsx
 * const entrou = useEntradaAnimada();
 * <div style={{ height: entrou ? altura : 0 }} className="transition-[height]" />
 * ```
 */
export function useEntradaAnimada() {
  const [entrou, setEntrou] = useState(false);

  useEffect(() => {
    if (prefereMenosMovimento()) {
      setEntrou(true);
      return;
    }

    let interno = 0;

    const quadro = requestAnimationFrame(() => {
      interno = requestAnimationFrame(() => setEntrou(true));
    });

    return () => {
      cancelAnimationFrame(quadro);
      cancelAnimationFrame(interno);
    };
  }, []);

  return entrou;
}
