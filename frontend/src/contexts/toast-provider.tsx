import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ToastContext, type ToastContextValue } from './toast-context';

const DURACAO_EM_MS = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const mostrarToast = useCallback((texto: string) => {
    clearTimeout(temporizador.current);
    setMensagem(texto);

    temporizador.current = setTimeout(() => setMensagem(''), DURACAO_EM_MS);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const value = useMemo<ToastContextValue>(
    () => ({ mensagem, mostrarToast }),
    [mensagem, mostrarToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
