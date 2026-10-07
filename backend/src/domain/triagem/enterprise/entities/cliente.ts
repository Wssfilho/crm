import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { AcaoJudicial } from './acao-judicial';

export type StatusTriagem =
  'ACAO' | 'PENDENTE' | 'LIMPO_PRODUTO' | 'LIMPO_CLIENTE';

export type StatusEfetivo = StatusTriagem | 'ARQUIVADO';

export type ColunaKanban = 'NOVO' | 'DOCS' | 'ANALISE' | 'TRIADO' | 'APTO';

export type EtapaCliente = 'COMERCIAL' | 'PROTOCOLO' | 'CONCLUIDO';

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
  etapa: EtapaCliente;
  driveUrl?: string;
  observacao?: string;
  responsavelId?: UniqueEntityID;
  movidoPorId?: UniqueEntityID;
  movidoEm?: Date;
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

  get etapa() {
    return this.props.etapa;
  }

  get driveUrl() {
    return this.props.driveUrl;
  }

  get observacao() {
    return this.props.observacao;
  }

  get responsavelId() {
    return this.props.responsavelId;
  }

  get movidoPorId() {
    return this.props.movidoPorId;
  }

  get movidoEm() {
    return this.props.movidoEm;
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

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  set cpf(cpf: string) {
    this.props.cpf = cpf;
    this.touch();
  }

  set nascimento(nascimento: Date | undefined) {
    this.props.nascimento = nascimento;
    this.touch();
  }

  set telefone(telefone: string | undefined) {
    this.props.telefone = telefone;
    this.touch();
  }

  set municipio(municipio: string | undefined) {
    this.props.municipio = municipio;
    this.touch();
  }

  set nb(nb: string) {
    this.props.nb = nb;
    this.touch();
  }

  set especie(especie: string | undefined) {
    this.props.especie = especie;
    this.touch();
  }

  set rendaEmCentavos(rendaEmCentavos: number | undefined) {
    this.props.rendaEmCentavos = rendaEmCentavos;
    this.touch();
  }

  set driveUrl(driveUrl: string | undefined) {
    this.props.driveUrl = driveUrl;
    this.touch();
  }

  set observacao(observacao: string | undefined) {
    this.props.observacao = observacao;
    this.touch();
  }

  set responsavelId(responsavelId: UniqueEntityID | undefined) {
    this.props.responsavelId = responsavelId;
    this.touch();
  }

  /** Registra quem levou o cliente para outra etapa; mesma etapa não conta. */
  moverParaEtapa(etapa: EtapaCliente, movidoPorId: UniqueEntityID) {
    if (this.props.etapa === etapa) {
      return;
    }

    this.props.etapa = etapa;
    this.props.movidoPorId = movidoPorId;
    this.props.movidoEm = new Date();
    this.touch();
  }

  marcarComoApto() {
    this.props.coluna = 'APTO';
    this.touch();
  }

  moverParaColuna(coluna: ColunaKanban) {
    this.props.coluna = coluna;
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
      | 'etapa'
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
        etapa: props.etapa ?? 'COMERCIAL',
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return cliente;
  }
}
