import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { DeletarClienteUseCase } from './deletar-cliente';

let inMemoryClientesRepository: InMemoryClientesRepository;
let sut: DeletarClienteUseCase;

describe('Deletar Cliente', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();

    sut = new DeletarClienteUseCase(inMemoryClientesRepository);
  });

  it('should be able to delete a cliente', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({}, new UniqueEntityID('cliente-1')),
      makeCliente({}, new UniqueEntityID('cliente-2')),
    );

    const result = await sut.execute({ clienteId: 'cliente-1' });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items).toHaveLength(1);
    expect(inMemoryClientesRepository.items[0].id.toString()).toBe('cliente-2');
  });

  it('should not be able to delete an inexistent cliente', async () => {
    const result = await sut.execute({ clienteId: 'cliente-inexistente' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
