import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { AcaoJudicial } from './acao-judicial';

export type StatusTriagem =
  'ACAO' | 'PENDENTE' | 'LIMPO_PRODUTO' | 'LIMPO_CLIENTE';

export type StatusEfetivo = StatusTriagem | 'ARQUIVADO';

export type ColunaKanban = 'NOVO' | 'DOCS' | 'ANALISE' | 'TRIADO' | 'APTO';

const MILISSEGUNDOS_POR_ANO = 1000 * 60 * 60 * 24 * 365.25;

export interface ClienteProps {
  name: string;
  cpf: string;
  nascimento?: Date;
  telefone?: string;
  municipio?: string;
  nb: string;
  especie?: string;
  rendaEmCentavos?: number;
  produtoId?: UniqueEntityID;
  status: StatusTriagem;
  coluna: ColunaKanban;
  contratos: number;
  valorEmCentavos: number;
  arquivada: boolean;
  procuracao: boolean;
  extratoBeneficio: boolean;
  extratoEmprestimos: boolean;
  acoes: AcaoJudicial[];
  createdAt: Date;
  updatedAt?: Date;
}

export class Cliente extends Entity<ClienteProps> {
  get name() {
    return this.props.name;
  }

  get cpf() {
    return this.props.cpf;
  }

  get nascimento() {
    return this.props.nascimento;
  }

  get telefone() {
    return this.props.telefone;
  }

  get municipio() {
    return this.props.municipio;
  }

  get nb() {
    return this.props.nb;
  }

  get especie() {
    return this.props.especie;
  }

  get rendaEmCentavos() {
    return this.props.rendaEmCentavos;
  }

  get produtoId() {
    return this.props.produtoId;
  }

  get status() {
    return this.props.status;
  }

  get coluna() {
    return this.props.coluna;
  }

  get contratos() {
    return this.props.contratos;
  }

  get valorEmCentavos() {
    return this.props.valorEmCentavos;
  }

  get arquivada() {
    return this.props.arquivada;
  }

  get procuracao() {
    return this.props.procuracao;
  }

  get extratoBeneficio() {
    return this.props.extratoBeneficio;
  }

  get extratoEmprestimos() {
    return this.props.extratoEmprestimos;
  }

  get acoes() {
    return this.props.acoes;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  /** Idade em anos completos, quando a data de nascimento é conhecida. */
  get idade(): number | undefined {
    if (!this.props.nascimento) {
      return undefined;
    }

    return Math.floor(
      (Date.now() - this.props.nascimento.getTime()) / MILISSEGUNDOS_POR_ANO,
    );
  }

  /** Quantos dos três documentos exigidos pela triagem já foram anexados. */
  get docs(): number {
    return [
      this.props.procuracao,
      this.props.extratoBeneficio,
      this.props.extratoEmprestimos,
    ].filter(Boolean).length;
  }

  /**
   * Status apresentado na triagem: uma triagem arquivada sobrepõe o status
   * apurado pelo fluxo n8n.
   */
  get statusEfetivo(): StatusEfetivo {
    if (this.props.arquivada) {
      return 'ARQUIVADO';
    }

    return this.props.status;
  }

  get analisado() {
    return this.props.status !== 'PENDENTE';
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  marcarComoApto() {
    this.props.coluna = 'APTO';
    this.touch();
  }

  arquivar() {
    this.props.arquivada = true;
    this.touch();
  }

  static create(
    props: Optional<
      ClienteProps,
      | 'status'
      | 'coluna'
      | 'contratos'
      | 'valorEmCentavos'
      | 'arquivada'
      | 'procuracao'
      | 'extratoBeneficio'
      | 'extratoEmprestimos'
      | 'acoes'
      | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    const cliente = new Cliente(
      {
        ...props,
        status: props.status ?? 'PENDENTE',
        coluna: props.coluna ?? 'NOVO',
        contratos: props.contratos ?? 0,
        valorEmCentavos: props.valorEmCentavos ?? 0,
        arquivada: props.arquivada ?? false,
        procuracao: props.procuracao ?? false,
        extratoBeneficio: props.extratoBeneficio ?? false,
        extratoEmprestimos: props.extratoEmprestimos ?? false,
        acoes: props.acoes ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return cliente;
  }
}
