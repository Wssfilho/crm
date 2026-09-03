import { createContext } from 'react';

export interface ToastContextValue {
  mensagem: string;
  mostrarToast: (mensagem: string) => void;
}

export const ToastContext = createContext({} as ToastContextValue);
