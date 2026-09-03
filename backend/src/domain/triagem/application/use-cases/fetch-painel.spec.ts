import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryExecucoesRepository } from 'test/repositories/in-memory-execucoes-repository';
import { InMemoryWorkflowRepository } from 'test/repositories/in-memory-workflow-repository';
import { makeExecucaoDiaria } from 'test/factories/make-execucao-diaria';
import { makeWorkflow } from 'test/factories/make-workflow';
import { FetchPainelUseCase } from './fetch-painel';

let inMemoryExecucoesRepository: InMemoryExecucoesRepository;
let inMemoryWorkflowRepository: InMemoryWorkflowRepository;
let sut: FetchPainelUseCase;

describe('Fetch Painel', () => {
  beforeEach(() => {
    inMemoryExecucoesRepository = new InMemoryExecucoesRepository();
    inMemoryWorkflowRepository = new InMemoryWorkflowRepository();

    sut = new FetchPainelUseCase(
      inMemoryExecucoesRepository,
      inMemoryWorkflowRepository,
    );
  });

  it('should be able to fetch the painel data', async () => {
    inMemoryWorkflowRepository.items.push(makeWorkflow());
    inMemoryExecucoesRepository.items.push(
      makeExecucaoDiaria({ comAcao: 4, semIrregularidade: 2 }),
    );

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.workflow.nome).toBe('triagem-consignado-v3');
      expect(result.value.execucoes).toHaveLength(1);
    }
  });

  it('should not be able to fetch the painel without a workflow', async () => {
    const result = await sut.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
