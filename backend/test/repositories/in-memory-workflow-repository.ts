import { WorkflowRepository } from '@/domain/triagem/application/repositories/workflow-repository';
import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';

export class InMemoryWorkflowRepository implements WorkflowRepository {
  public items: Workflow[] = [];

  async findFirst() {
    return this.items[0] ?? null;
  }

  async save(workflow: Workflow) {
    const itemIndex = this.items.findIndex((item) =>
      item.id.equals(workflow.id),
    );

    this.items[itemIndex] = workflow;
  }
}
