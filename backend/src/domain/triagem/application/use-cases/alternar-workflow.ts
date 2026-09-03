import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';
import { WorkflowRepository } from '../repositories/workflow-repository';

type AlternarWorkflowUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    workflow: Workflow;
  }
>;

export class AlternarWorkflowUseCase {
  constructor(private workflowRepository: WorkflowRepository) {}

  async execute(): Promise<AlternarWorkflowUseCaseResponse> {
    const workflow = await this.workflowRepository.findFirst();

    if (!workflow) {
      return left(new ResourceNotFoundError());
    }

    workflow.alternar();

    await this.workflowRepository.save(workflow);

    return right({
      workflow,
    });
  }
}
