import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { makeUser } from 'test/factories/make-user';
import { MoverEtapaClienteUseCase } from './mover-etapa-cliente';

let inMemoryClientesRepository: InMemoryClientesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: MoverEtapaClienteUseCase;

describe('Mover Etapa Cliente', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new MoverEtapaClienteUseCase(
      inMemoryClientesRepository,
      inMemoryUsersRepository,
    );

    inMemoryUsersRepository.items.push(
      makeUser({}, new UniqueEntityID('user-1')),
    );
  });

  it('should be able to move a cliente to another etapa', async () => {
    const cliente = makeCliente({}, new UniqueEntityID('cliente-1'));

    inMemoryClientesRepository.items.push(cliente);

    const result = await sut.execute({
      clienteId: 'cliente-1',
      etapa: 'PROTOCOLO',
      usuarioId: 'user-1',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].etapa).toBe('PROTOCOLO');
    expect(inMemoryClientesRepository.items[0].movidoPorId?.toString()).toBe(
      'user-1',
    );
    expect(inMemoryClientesRepository.items[0].movidoEm).toBeInstanceOf(Date);
  });

  it('should be able to keep who moved it when the etapa is the same', async () => {
    const movidoEm = new Date(2026, 0, 1);

    const cliente = makeCliente(
      {
        etapa: 'PROTOCOLO',
        movidoPorId: new UniqueEntityID('user-0'),
        movidoEm,
      },
      new UniqueEntityID('cliente-1'),
    );

    inMemoryClientesRepository.items.push(cliente);

    const result = await sut.execute({
      clienteId: 'cliente-1',
      etapa: 'PROTOCOLO',
      usuarioId: 'user-1',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].movidoPorId?.toString()).toBe(
      'user-0',
    );
    expect(inMemoryClientesRepository.items[0].movidoEm).toBe(movidoEm);
  });

  it('should not be able to move a cliente that does not exist', async () => {
    const result = await sut.execute({
      clienteId: 'cliente-inexistente',
      etapa: 'PROTOCOLO',
      usuarioId: 'user-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to move a cliente as a user that no longer exists', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({}, new UniqueEntityID('cliente-1')),
    );

    const result = await sut.execute({
      clienteId: 'cliente-1',
      etapa: 'PROTOCOLO',
      usuarioId: 'user-excluido',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryClientesRepository.items[0].etapa).toBe('COMERCIAL');
  });
});
