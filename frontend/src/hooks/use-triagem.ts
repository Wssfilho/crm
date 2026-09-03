import { useContext } from 'react';
import { TriagemContext } from '@/contexts/triagem-context';

export function useTriagem() {
  return useContext(TriagemContext);
}
