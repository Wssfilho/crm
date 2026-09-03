import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';

export class ClientePresenter {
  static toHTTP(cliente: Cliente) {
    return {
      id: cliente.id.toString(),
      name: cliente.name,
      cpf: cliente.cpf,
      nascimento: cliente.nascimento ?? null,
      idade: cliente.idade ?? null,
      telefone: cliente.telefone ?? null,
      municipio: cliente.municipio ?? null,
      nb: cliente.nb,
      especie: cliente.especie ?? null,
      rendaEmCentavos: cliente.rendaEmCentavos ?? null,
      produtoId: cliente.produtoId?.toString() ?? null,
      status: cliente.statusEfetivo,
      coluna: cliente.coluna,
      docs: cliente.docs,
      contratos: cliente.contratos,
      valorEmCentavos: cliente.valorEmCentavos,
      procuracao: cliente.procuracao,
      extratoBeneficio: cliente.extratoBeneficio,
      extratoEmprestimos: cliente.extratoEmprestimos,
      acoes: cliente.acoes.map((acao) => ({
        id: acao.id.toString(),
        name: acao.name,
        base: acao.base,
      })),
    };
  }
}
