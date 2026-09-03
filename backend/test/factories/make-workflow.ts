import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Workflow,
  WorkflowProps,
} from '@/domain/triagem/enterprise/entities/workflow';

export function makeWorkflow(
  override: Partial<WorkflowProps> = {},
  id?: UniqueEntityID,
) {
  const workflow = Workflow.create(
    {
      nome: 'triagem-consignado-v3',
      ...override,
    },
    id,
  );

  return workflow;
}
