import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { ArquivarTriagemUseCase } from './arquivar-triagem';

let inMemoryClientesRepository: InMemoryClientesRepository;
let sut: ArquivarTriagemUseCase;

describe('Arquivar Triagem', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();

    sut = new ArquivarTriagemUseCase(inMemoryClientesRepository);
  });

  it('should be able to archive a triagem', async () => {
    const cliente = makeCliente(
      { status: 'LIMPO_CLIENTE' },
      new UniqueEntityID('cliente-1'),
    );

    inMemoryClientesRepository.items.push(cliente);

    const result = await sut.execute({ clienteId: 'cliente-1' });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].arquivada).toBe(true);
  });

  it('should present an archived triagem as ARQUIVADO', async () => {
    const cliente = makeCliente(
      { status: 'ACAO' },
      new UniqueEntityID('cliente-1'),
    );

    inMemoryClientesRepository.items.push(cliente);

    await sut.execute({ clienteId: 'cliente-1' });

    expect(inMemoryClientesRepository.items[0].statusEfetivo).toBe('ARQUIVADO');
  });

  it('should not be able to archive an inexistent cliente', async () => {
    const result = await sut.execute({ clienteId: 'cliente-inexistente' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
