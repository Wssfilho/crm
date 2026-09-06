import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { MoverColunaClienteUseCase } from './mover-coluna-cliente';

let inMemoryClientesRepository: InMemoryClientesRepository;
let sut: MoverColunaClienteUseCase;

describe('Mover Coluna Cliente', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();
    sut = new MoverColunaClienteUseCase(inMemoryClientesRepository);
  });

  it('should be able to move a cliente to another kanban column', async () => {
    const cliente = makeCliente(
      { coluna: 'NOVO' },
      new UniqueEntityID('cliente-1'),
    );

    inMemoryClientesRepository.items.push(cliente);

    const result = await sut.execute({
      clienteId: 'cliente-1',
      coluna: 'ANALISE',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].coluna).toBe('ANALISE');
    expect(inMemoryClientesRepository.items[0].updatedAt).toEqual(
      expect.any(Date),
    );
  });

  it('should not be able to move an inexistent cliente', async () => {
    const result = await sut.execute({
      clienteId: 'cliente-inexistente',
      coluna: 'DOCS',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
