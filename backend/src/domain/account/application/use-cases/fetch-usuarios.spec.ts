import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { FetchUsuariosUseCase } from './fetch-usuarios';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: FetchUsuariosUseCase;

describe('Fetch Usuarios', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new FetchUsuariosUseCase(inMemoryUsersRepository);
  });

  it('should be able to fetch users ordered by name', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({ name: 'Carla Souza' }),
      makeUser({ name: 'Ana Lima' }),
    );

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value?.users.map((user) => user.name)).toEqual([
      'Ana Lima',
      'Carla Souza',
    ]);
  });

  it('should be able to fetch an empty list when there are no users', async () => {
    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value?.users).toEqual([]);
  });
});
