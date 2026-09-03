import type {
  Cliente,
  ColunaKanban,
  StatusTriagem,
  Workflow,
} from '@/types/triagem';

export type FiltroDeTriagem = 'todos' | 'acao' | 'pendente' | 'limpo';

/** Como um cliente ainda sem tese atribuída aparece na interface. */
export const PRODUTO_NAO_DEFINIDO = 'Tese não definida';
export const GRADIENTE_SEM_PRODUTO = 'linear-gradient(135deg,#a5b3c4,#7286aa)';

interface EstiloDeStatus {
  label: string;
  dot: string;
  text: string;
}

export const estilosDeStatus: Record<StatusTriagem, EstiloDeStatus> = {
  ACAO: {
    label: 'Com ação',
    dot: 'bg-status-acao',
    text: 'text-status-acao',
  },
  PENDENTE: {
    label: 'Na fila',
    dot: 'bg-status-fila',
    text: 'text-status-fila',
  },
  ARQUIVADO: {
    label: 'Arquivado',
    dot: 'bg-status-neutro',
    text: 'text-status-neutro',
  },
  LIMPO_PRODUTO: {
    label: 'Sem irregular.',
    dot: 'bg-status-neutro',
    text: 'text-status-neutro',
  },
  LIMPO_CLIENTE: {
    label: 'Sem irregular.',
    dot: 'bg-status-neutro',
    text: 'text-status-neutro',
  },
};

export const rotulosDeFiltro: Record<FiltroDeTriagem, string> = {
  todos: 'Todos',
  acao: 'Com ação',
  pendente: 'Na fila',
  limpo: 'Sem irregularidade',
};

export const colunasDoKanban: {
  key: ColunaKanban;
  label: string;
  color: string;
}[] = [
  { key: 'NOVO', label: 'Cadastro', color: '#94a3b4' },
  { key: 'DOCS', label: 'Documentos', color: '#f59e0b' },
  { key: 'ANALISE', label: 'Análise n8n', color: '#4f46e5' },
  { key: 'TRIADO', label: 'Triado', color: '#0891b2' },
  { key: 'APTO', label: 'Apto para ação', color: '#16a34a' },
];

export function atendeAoFiltro(
  status: StatusTriagem,
  filtro: FiltroDeTriagem,
): boolean {
  if (filtro === 'acao') {
    return status === 'ACAO';
  }

  if (filtro === 'pendente') {
    return status === 'PENDENTE';
  }

  if (filtro === 'limpo') {
    return status !== 'ACAO' && status !== 'PENDENTE';
  }

  return true;
}

export function atendeABusca(cliente: Cliente, busca: string): boolean {
  if (!busca) {
    return true;
  }

  return (
    cliente.name.toLowerCase().includes(busca) ||
    cliente.cpf.includes(busca) ||
    cliente.nb.includes(busca)
  );
}

/**
 * Primeira letra do primeiro e do último nome.
 *
 * @example
 * ```ts
 * iniciaisDe('José Raimundo dos Santos'); // 'JS'
 * ```
 */
export function iniciaisDe(nome: string): string {
  const partes = nome.split(' ');

  return (partes[0][0] + (partes[partes.length - 1][0] ?? '')).toUpperCase();
}

export function formatarMoeda(valorEmCentavos: number): string {
  return `R$ ${(valorEmCentavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function tempoRelativo(iso: string | null): string {
  if (!iso) {
    return 'ainda não realizada';
  }

  const minutos = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60_000),
  );

  if (minutos < 1) {
    return 'agora há pouco';
  }

  if (minutos < 60) {
    return `há ${minutos} min`;
  }

  const horas = Math.round(minutos / 60);

  if (horas < 24) {
    return `há ${horas} h`;
  }

  return `há ${Math.round(horas / 24)} d`;
}

export function rotuloDeSincronizacao(
  workflow: Workflow,
  analisados: number,
  total: number,
): string {
  if (!workflow.ativo) {
    return 'Sincronização pausada · nenhuma execução agendada';
  }

  return `Última sincronização ${tempoRelativo(workflow.sincronizadoEm)} · ${analisados} de ${total} clientes analisados`;
}

export function diaDoMes(iso: string): string {
  return String(new Date(iso).getUTCDate()).padStart(2, '0');
}
