import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { makeUser } from 'test/factories/make-user';
import { EditarClienteUseCase } from './editar-cliente';

let inMemoryClientesRepository: InMemoryClientesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: EditarClienteUseCase;

describe('Editar Cliente', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new EditarClienteUseCase(
      inMemoryClientesRepository,
      inMemoryUsersRepository,
    );
  });

  it('should be able to edit drive link, note and responsavel', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({}, new UniqueEntityID('cliente-1')),
    );
    inMemoryUsersRepository.items.push(
      makeUser({}, new UniqueEntityID('user-1')),
    );

    const result = await sut.execute({
      clienteId: 'cliente-1',
      driveUrl: 'https://drive.google.com/drive/folders/abc',
      observacao: 'Falta RG',
      responsavelId: 'user-1',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0]).toEqual(
      expect.objectContaining({
        driveUrl: 'https://drive.google.com/drive/folders/abc',
        observacao: 'Falta RG',
      }),
    );
    expect(inMemoryClientesRepository.items[0].responsavelId?.toString()).toBe(
      'user-1',
    );
  });

  it('should be able to clear a field with null and keep fields left undefined', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente(
        {
          driveUrl: 'https://drive.google.com/drive/folders/abc',
          observacao: 'Falta RG',
          responsavelId: new UniqueEntityID('user-1'),
        },
        new UniqueEntityID('cliente-1'),
      ),
    );

    const result = await sut.execute({
      clienteId: 'cliente-1',
      observacao: null,
      responsavelId: null,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].observacao).toBeUndefined();
    expect(inMemoryClientesRepository.items[0].responsavelId).toBeUndefined();
    expect(inMemoryClientesRepository.items[0].driveUrl).toBe(
      'https://drive.google.com/drive/folders/abc',
    );
  });

  it('should not be able to edit a cliente that does not exist', async () => {
    const result = await sut.execute({
      clienteId: 'cliente-inexistente',
      observacao: 'Falta RG',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to set a responsavel that does not exist', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({}, new UniqueEntityID('cliente-1')),
    );

    const result = await sut.execute({
      clienteId: 'cliente-1',
      responsavelId: 'user-inexistente',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryClientesRepository.items[0].responsavelId).toBeUndefined();
  });
});
