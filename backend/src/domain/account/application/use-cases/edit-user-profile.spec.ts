import { EditUserProfileUseCase } from './edit-user-profile';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: EditUserProfileUseCase;

describe('Edit User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new EditUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to edit the user profile', async () => {
    const user = makeUser(
      { name: 'Eric Melo', email: 'eric@advocacia.com.br' },
      new UniqueEntityID('user-1'),
    );

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Eric Melo Santos',
      email: 'contato@advocacia.com.br',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0]).toMatchObject({
      name: 'Eric Melo Santos',
      email: 'contato@advocacia.com.br',
    });
  });

  it('should be able to keep the same email', async () => {
    const user = makeUser(
      { email: 'eric@advocacia.com.br' },
      new UniqueEntityID('user-1'),
    );

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Eric Melo',
      email: 'eric@advocacia.com.br',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should not be able to use an email from another user', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({}, new UniqueEntityID('user-1')),
      makeUser({ email: 'outro@advocacia.com.br' }),
    );

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Eric Melo',
      email: 'outro@advocacia.com.br',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
  });

  it('should not be able to edit the profile of an inexistent user', async () => {
    const result = await sut.execute({
      userId: 'user-inexistente',
      name: 'Eric Melo',
      email: 'eric@advocacia.com.br',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
