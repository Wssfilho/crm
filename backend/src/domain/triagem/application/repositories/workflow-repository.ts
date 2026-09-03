import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';

export abstract class WorkflowRepository {
  abstract findFirst(): Promise<Workflow | null>;
  abstract save(workflow: Workflow): Promise<void>;
}
