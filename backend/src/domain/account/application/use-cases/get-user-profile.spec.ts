import { GetUserProfileUseCase } from './get-user-profile';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: GetUserProfileUseCase;

describe('Get User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new GetUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to get a user profile', async () => {
    const user = makeUser({ name: 'Eric Melo' }, new UniqueEntityID('user-1'));

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({ userId: 'user-1' });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.user.name).toBe('Eric Melo');
    }
  });

  it('should not be able to get the profile of an inexistent user', async () => {
    const result = await sut.execute({ userId: 'user-inexistente' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
