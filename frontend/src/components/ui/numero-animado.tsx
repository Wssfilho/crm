import { useValorAnimado } from '@/hooks/use-valor-animado';

interface NumeroAnimadoProps {
  valor: number;
  sufixo?: string;
}

export function NumeroAnimado({ valor, sufixo = '' }: NumeroAnimadoProps) {
  const animado = useValorAnimado(valor);

  return (
    <>
      {Math.round(animado)}
      {sufixo}
    </>
  );
}
