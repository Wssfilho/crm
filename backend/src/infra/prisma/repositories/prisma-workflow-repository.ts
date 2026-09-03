import { Injectable } from '@nestjs/common';
import { WorkflowRepository } from '@/domain/triagem/application/repositories/workflow-repository';
import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';
import { PrismaService } from '../prisma.service';
import { PrismaWorkflowMapper } from '../mappers/prisma-workflow-mapper';

@Injectable()
export class PrismaWorkflowRepository implements WorkflowRepository {
  constructor(private prisma: PrismaService) {}

  async findFirst() {
    const workflow = await this.prisma.workflow.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!workflow) {
      return null;
    }

    return PrismaWorkflowMapper.toDomain(workflow);
  }

  async save(workflow: Workflow) {
    const data = PrismaWorkflowMapper.toPrisma(workflow);

    await this.prisma.workflow.update({
      where: { id: workflow.id.toString() },
      data,
    });
  }
}
