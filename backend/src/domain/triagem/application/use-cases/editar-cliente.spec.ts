import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { makeUser } from 'test/factories/make-user';
import { EditarClienteUseCase } from './editar-cliente';
import { ClienteAlreadyExistsError } from './errors/cliente-already-exists-error';

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

  it('should be able to edit the cadastro of a cliente', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente(
        { cpf: '517.204.933-91', telefone: '(73) 98888-0000' },
        new UniqueEntityID('cliente-1'),
      ),
    );

    const nascimento = new Date('1958-03-12');

    const result = await sut.execute({
      clienteId: 'cliente-1',
      name: 'Maria Aparecida de Souza',
      cpf: '042.318.765-17',
      nascimento,
      telefone: null,
      municipio: 'Itabuna-BA',
      nb: '142.887.001-5',
      especie: '41',
      rendaEmCentavos: 151800,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Maria Aparecida de Souza',
        cpf: '042.318.765-17',
        nascimento,
        telefone: undefined,
        municipio: 'Itabuna-BA',
        nb: '142.887.001-5',
        especie: '41',
        rendaEmCentavos: 151800,
      }),
    );
  });

  it('should be able to keep the same cpf when editing other fields', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({ cpf: '517.204.933-91' }, new UniqueEntityID('cliente-1')),
    );

    const result = await sut.execute({
      clienteId: 'cliente-1',
      cpf: '517.204.933-91',
      municipio: 'Ilhéus-BA',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items[0].municipio).toBe('Ilhéus-BA');
  });

  it('should not be able to use the cpf of another cliente', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({ cpf: '517.204.933-91' }, new UniqueEntityID('cliente-1')),
      makeCliente({ cpf: '042.318.765-17' }, new UniqueEntityID('cliente-2')),
    );

    const result = await sut.execute({
      clienteId: 'cliente-1',
      cpf: '042.318.765-17',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClienteAlreadyExistsError);
    expect(inMemoryClientesRepository.items[0].cpf).toBe('517.204.933-91');
  });
});
