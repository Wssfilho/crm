import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { MarcarClienteAptoUseCase } from './marcar-cliente-apto';

let inMemoryClientesRepository: InMemoryClientesRepository;
let sut: MarcarClienteAptoUseCase;

describe('Marcar Cliente Apto', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();

    sut = new MarcarClienteAptoUseCase(inMemoryClientesRepository);
  });

  it('should be able to move a cliente to the apto column', async () => {
    const cliente = makeCliente(
      { coluna: 'TRIADO' },
      new UniqueEntityID('cliente-1'),
    );

    inMemoryClientesRepository.items.push(cliente);

    const result = await sut.execute({ clienteId: 'cliente-1' });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].coluna).toBe('APTO');
    expect(inMemoryClientesRepository.items[0].updatedAt).toEqual(
      expect.any(Date),
    );
  });

  it('should not be able to move an inexistent cliente', async () => {
    const result = await sut.execute({ clienteId: 'cliente-inexistente' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
