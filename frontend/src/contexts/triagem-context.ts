import { createContext } from 'react';
import type { FiltroDeTriagem } from '@/lib/triagem';
import type {
  Cliente,
  ColunaKanban,
  ExecucaoDiaria,
  NovoCliente,
  Produto,
  Workflow,
} from '@/types/triagem';

export interface ContagensDeTriagem {
  todos: number;
  acao: number;
  pendente: number;
  limpo: number;
}

export interface TriagemContextValue {
  busca: string;
  definirBusca: (busca: string) => void;

  filtro: FiltroDeTriagem;
  definirFiltro: (filtro: FiltroDeTriagem) => void;

  clientes: Cliente[];
  clientesFiltrados: Cliente[];
  contagens: ContagensDeTriagem;
  totalDeClientes: number;
  totalAnalisado: number;

  produtos: Produto[];
  produtoDe: (cliente: Cliente) => Produto | undefined;

  clienteSelecionado?: Cliente;
  selecionar: (id: string) => void;

  marcarApto: () => void;
  moverColuna: (clienteId: string, coluna: ColunaKanban) => void;
  arquivar: () => void;
  deletarCliente: (cliente: Cliente) => void;

  novoAberto: boolean;
  abrirNovo: () => void;
  fecharNovo: () => void;
  criarCliente: (dados: NovoCliente, aoConcluir: () => void) => void;
  salvando: boolean;

  execucoes: ExecucaoDiaria[];
  workflow: Workflow;
  alternarWorkflow: () => void;

  csvAberto: boolean;
  abrirCsv: () => void;
  fecharCsv: () => void;
  confirmarCsv: () => void;
}

export const TriagemContext = createContext({} as TriagemContextValue);
