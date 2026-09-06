import type {
  Cliente,
  ColunaKanban,
  Produto,
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

/**
 * Normaliza um texto para busca:
 * - Converte caracteres acentuados para sua forma base (ex: 'José' -> 'jose')
 * - Converte para caixa baixa
 * - Remove espaços extras nas pontas
 */
export function normalizarParaBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Retorna apenas os dígitos de uma string (útil para CPF, NB, telefone).
 */
export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

function atendeToken(
  cliente: Cliente,
  token: string,
  produto?: Produto,
): boolean {
  // 1. Busca textual por nome do cliente (sem acento, case-insensitive)
  if (normalizarParaBusca(cliente.name).includes(token)) {
    return true;
  }

  const tokenDigitos = apenasDigitos(token);

  // 2. Busca por CPF (com pontuação ou somente números)
  if (cliente.cpf) {
    if (cliente.cpf.toLowerCase().includes(token)) {
      return true;
    }
    if (
      tokenDigitos.length > 0 &&
      apenasDigitos(cliente.cpf).includes(tokenDigitos)
    ) {
      return true;
    }
  }

  // 3. Busca por NB - Número do Benefício (com pontuação ou somente números)
  if (cliente.nb) {
    if (cliente.nb.toLowerCase().includes(token)) {
      return true;
    }
    if (
      tokenDigitos.length > 0 &&
      apenasDigitos(cliente.nb).includes(tokenDigitos)
    ) {
      return true;
    }
  }

  // 4. Busca por Município
  if (
    cliente.municipio &&
    normalizarParaBusca(cliente.municipio).includes(token)
  ) {
    return true;
  }

  // 5. Busca por Espécie de benefício
  if (cliente.especie && normalizarParaBusca(cliente.especie).includes(token)) {
    return true;
  }

  // 6. Busca por Telefone (se informado com dígitos)
  if (
    cliente.telefone &&
    tokenDigitos.length >= 3 &&
    apenasDigitos(cliente.telefone).includes(tokenDigitos)
  ) {
    return true;
  }

  // 7. Busca por Produto / Tese
  if (
    produto &&
    (normalizarParaBusca(produto.name).includes(token) ||
      normalizarParaBusca(produto.slug).includes(token))
  ) {
    return true;
  }

  // 8. Busca por Ação Judicial associada
  if (cliente.acoes && cliente.acoes.length > 0) {
    const temAcao = cliente.acoes.some(
      (acao) =>
        normalizarParaBusca(acao.name).includes(token) ||
        normalizarParaBusca(acao.base).includes(token),
    );
    if (temAcao) {
      return true;
    }
  }

  return false;
}

export function atendeABusca(
  cliente: Cliente,
  busca: string,
  produtos?: Produto[],
): boolean {
  const buscaLimpa = busca.trim();
  if (!buscaLimpa) {
    return true;
  }

  const termoNormalizado = normalizarParaBusca(buscaLimpa);
  const digitosCompletos = apenasDigitos(buscaLimpa);

  // Verificação rápida para CPF ou NB com dígitos parciais/completos ou com espaços
  if (digitosCompletos.length >= 4) {
    if (cliente.cpf && apenasDigitos(cliente.cpf).includes(digitosCompletos)) {
      return true;
    }
    if (cliente.nb && apenasDigitos(cliente.nb).includes(digitosCompletos)) {
      return true;
    }
  }

  const produto = produtos?.find((p) => p.id === cliente.produtoId);

  // Se a busca completa corresponder diretamente a qualquer campo
  if (atendeToken(cliente, termoNormalizado, produto)) {
    return true;
  }

  // Busca multi-palavras: todos os termos devem ser satisfeitos pelo cliente
  const tokens = termoNormalizado.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every((token) => atendeToken(cliente, token, produto));
  }

  return false;
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
