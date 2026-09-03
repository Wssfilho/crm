export type StatusTriagem =
  'ACAO' | 'PENDENTE' | 'LIMPO_PRODUTO' | 'LIMPO_CLIENTE' | 'ARQUIVADO';

export type ColunaKanban = 'NOVO' | 'DOCS' | 'ANALISE' | 'TRIADO' | 'APTO';

export interface AcaoJudicial {
  id: string;
  name: string;
  base: string;
}

export interface Cliente {
  id: string;
  name: string;
  cpf: string;
  nascimento: string | null;
  idade: number | null;
  telefone: string | null;
  municipio: string | null;
  nb: string;
  especie: string | null;
  rendaEmCentavos: number | null;
  produtoId: string | null;
  status: StatusTriagem;
  coluna: ColunaKanban;
  docs: number;
  contratos: number;
  valorEmCentavos: number;
  procuracao: boolean;
  extratoBeneficio: boolean;
  extratoEmprestimos: boolean;
  acoes: AcaoJudicial[];
}

export interface NovoCliente {
  name: string;
  cpf: string;
  nascimento?: string;
  telefone?: string;
  municipio?: string;
  nb: string;
  especie?: string;
  rendaEmCentavos?: number;
  procuracao: boolean;
  extratoBeneficio: boolean;
  extratoEmprestimos: boolean;
  enviarParaAnalise: boolean;
}

export interface Produto {
  id: string;
  slug: string;
  name: string;
  mono: string;
  gradiente: string;
}

export interface ExecucaoDiaria {
  id: string;
  data: string;
  comAcao: number;
  semIrregularidade: number;
}

export interface Workflow {
  id: string;
  nome: string;
  ativo: boolean;
  sincronizadoEm: string | null;
}

export interface Painel {
  execucoes: ExecucaoDiaria[];
  workflow: Workflow;
}
