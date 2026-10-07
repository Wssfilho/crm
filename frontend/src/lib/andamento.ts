import type { EtapaCliente } from '@/types/triagem';

export const etapasDoKanban: {
  key: EtapaCliente;
  label: string;
  descricao: string;
  color: string;
}[] = [
  {
    key: 'COMERCIAL',
    label: 'Comercial',
    descricao: 'Cliente chegou · documentação no Drive',
    color: '#f59e0b',
  },
  {
    key: 'PROTOCOLO',
    label: 'Protocolo',
    descricao: 'Documentação pronta · protocolar',
    color: '#4f46e5',
  },
  {
    key: 'CONCLUIDO',
    label: 'Concluído',
    descricao: 'Todos os processos finalizados',
    color: '#16a34a',
  },
];

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Descreve há quanto tempo algo aconteceu, no tom curto usado nos cards.
 *
 * @example
 * ```ts
 * tempoRelativo('2026-10-07T12:00:00', new Date('2026-10-07T15:00:00')); // 'há 3 h'
 * ```
 */
export function tempoRelativo(iso: string, agora = new Date()): string {
  const data = new Date(iso);
  const decorrido = agora.getTime() - data.getTime();

  if (decorrido < MINUTO) {
    return 'agora';
  }

  if (decorrido < HORA) {
    return `há ${Math.floor(decorrido / MINUTO)} min`;
  }

  if (decorrido < DIA) {
    return `há ${Math.floor(decorrido / HORA)} h`;
  }

  const dias = Math.floor(decorrido / DIA);

  if (dias === 1) {
    return 'ontem';
  }

  if (dias <= 30) {
    return `há ${dias} dias`;
  }

  return `em ${data.toLocaleDateString('pt-BR')}`;
}
