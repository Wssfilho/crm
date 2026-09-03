import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';
import { Prisma, Workflow as PrismaWorkflow } from '@/generated/prisma/client';

export class PrismaWorkflowMapper {
  static toDomain(raw: PrismaWorkflow): Workflow {
    return Workflow.create(
      {
        nome: raw.nome,
        ativo: raw.ativo,
        sincronizadoEm: raw.sincronizadoEm ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(workflow: Workflow): Prisma.WorkflowUncheckedUpdateInput {
    return {
      id: workflow.id.toString(),
      nome: workflow.nome,
      ativo: workflow.ativo,
      sincronizadoEm: workflow.sincronizadoEm,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }
}
