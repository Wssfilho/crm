import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { ExecucaoDiaria } from '@/domain/triagem/enterprise/entities/execucao-diaria';
import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';
import { ExecucoesRepository } from '../repositories/execucoes-repository';
import { WorkflowRepository } from '../repositories/workflow-repository';

type FetchPainelUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    execucoes: ExecucaoDiaria[];
    workflow: Workflow;
  }
>;

export class FetchPainelUseCase {
  constructor(
    private execucoesRepository: ExecucoesRepository,
    private workflowRepository: WorkflowRepository,
  ) {}

  async execute(): Promise<FetchPainelUseCaseResponse> {
    const workflow = await this.workflowRepository.findFirst();

    if (!workflow) {
      return left(new ResourceNotFoundError());
    }

    const execucoes = await this.execucoesRepository.findMany();

    return right({
      execucoes,
      workflow,
    });
  }
}
