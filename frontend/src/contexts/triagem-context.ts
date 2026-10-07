import { createContext } from 'react';
import type { FiltroDeTriagem } from '@/lib/triagem';
import type {
  Cliente,
  ColunaKanban,
  EdicaoDeCliente,
  EtapaCliente,
  ExecucaoDiaria,
  NovoCliente,
  Produto,
  Usuario,
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

  usuarios: Usuario[];
  usuarioDe: (id: string | null) => Usuario | undefined;
  moverEtapa: (clienteId: string, etapa: EtapaCliente) => void;
  editarCliente: (
    clienteId: string,
    dados: EdicaoDeCliente,
    aoConcluir: () => void,
  ) => void;
  editando: boolean;
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
