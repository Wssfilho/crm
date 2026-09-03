import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryWorkflowRepository } from 'test/repositories/in-memory-workflow-repository';
import { makeWorkflow } from 'test/factories/make-workflow';
import { AlternarWorkflowUseCase } from './alternar-workflow';

let inMemoryWorkflowRepository: InMemoryWorkflowRepository;
let sut: AlternarWorkflowUseCase;

describe('Alternar Workflow', () => {
  beforeEach(() => {
    inMemoryWorkflowRepository = new InMemoryWorkflowRepository();

    sut = new AlternarWorkflowUseCase(inMemoryWorkflowRepository);
  });

  it('should be able to pause a running workflow', async () => {
    inMemoryWorkflowRepository.items.push(makeWorkflow({ ativo: true }));

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    expect(inMemoryWorkflowRepository.items[0].ativo).toBe(false);
  });

  it('should be able to resume a paused workflow', async () => {
    inMemoryWorkflowRepository.items.push(makeWorkflow({ ativo: false }));

    await sut.execute();

    expect(inMemoryWorkflowRepository.items[0].ativo).toBe(true);
  });

  it('should not be able to toggle an inexistent workflow', async () => {
    const result = await sut.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
