import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AcaoJudicial } from '@/domain/triagem/enterprise/entities/acao-judicial';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import {
  AcaoJudicial as PrismaAcaoJudicial,
  Cliente as PrismaCliente,
  Prisma,
} from '@/generated/prisma/client';

type PrismaClienteComAcoes = PrismaCliente & {
  acoes: PrismaAcaoJudicial[];
};

function toScalars(cliente: Cliente) {
  return {
    name: cliente.name,
    cpf: cliente.cpf,
    nascimento: cliente.nascimento,
    telefone: cliente.telefone,
    municipio: cliente.municipio,
    nb: cliente.nb,
    especie: cliente.especie,
    rendaEmCentavos: cliente.rendaEmCentavos,
    produtoId: cliente.produtoId?.toString() ?? null,
    status: cliente.status,
    coluna: cliente.coluna,
    contratos: cliente.contratos,
    valorEmCentavos: cliente.valorEmCentavos,
    arquivada: cliente.arquivada,
    procuracao: cliente.procuracao,
    extratoBeneficio: cliente.extratoBeneficio,
    extratoEmprestimos: cliente.extratoEmprestimos,
    etapa: cliente.etapa,
    driveUrl: cliente.driveUrl ?? null,
    observacao: cliente.observacao ?? null,
    responsavelId: cliente.responsavelId?.toString() ?? null,
    movidoPorId: cliente.movidoPorId?.toString() ?? null,
    movidoEm: cliente.movidoEm ?? null,
    createdAt: cliente.createdAt,
    updatedAt: cliente.updatedAt,
  };
}

export class PrismaClienteMapper {
  static toDomain(raw: PrismaClienteComAcoes): Cliente {
    return Cliente.create(
      {
        name: raw.name,
        cpf: raw.cpf,
        nascimento: raw.nascimento ?? undefined,
        telefone: raw.telefone ?? undefined,
        municipio: raw.municipio ?? undefined,
        nb: raw.nb,
        especie: raw.especie ?? undefined,
        rendaEmCentavos: raw.rendaEmCentavos ?? undefined,
        produtoId: raw.produtoId
          ? new UniqueEntityID(raw.produtoId)
          : undefined,
        status: raw.status,
        coluna: raw.coluna,
        contratos: raw.contratos,
        valorEmCentavos: raw.valorEmCentavos,
        arquivada: raw.arquivada,
        procuracao: raw.procuracao,
        extratoBeneficio: raw.extratoBeneficio,
        extratoEmprestimos: raw.extratoEmprestimos,
        acoes: raw.acoes.map((acao) =>
          AcaoJudicial.create(
            {
              name: acao.name,
              base: acao.base,
              ordem: acao.ordem,
            },
            new UniqueEntityID(acao.id),
          ),
        ),
        etapa: raw.etapa,
        driveUrl: raw.driveUrl ?? undefined,
        observacao: raw.observacao ?? undefined,
        responsavelId: raw.responsavelId
          ? new UniqueEntityID(raw.responsavelId)
          : undefined,
        movidoPorId: raw.movidoPorId
          ? new UniqueEntityID(raw.movidoPorId)
          : undefined,
        movidoEm: raw.movidoEm ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(cliente: Cliente): Prisma.ClienteUncheckedUpdateInput {
    return {
      id: cliente.id.toString(),
      ...toScalars(cliente),
    };
  }

  static toPrismaCreate(cliente: Cliente): Prisma.ClienteUncheckedCreateInput {
    return {
      id: cliente.id.toString(),
      ...toScalars(cliente),
    };
  }
}
