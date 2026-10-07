import { FetchUsersUseCase } from './fetch-users';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: FetchUsersUseCase;

describe('Fetch Users', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new FetchUsersUseCase(inMemoryUsersRepository);
  });

  it('should be able to fetch users ordered by name', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({ name: 'Mariana Souza' }),
      makeUser({ name: 'Eric Melo' }),
    );

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value?.users.map((user) => user.name)).toEqual([
      'Eric Melo',
      'Mariana Souza',
    ]);
  });

  it('should be able to return an empty list when there are no users', async () => {
    const result = await sut.execute();

    expect(result.value?.users).toHaveLength(0);
  });
});
