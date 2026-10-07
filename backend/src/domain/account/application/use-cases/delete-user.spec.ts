import { DeleteUserUseCase } from './delete-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { CannotChangeOwnAccessError } from './errors/cannot-change-own-access-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: DeleteUserUseCase;

describe('Delete User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new DeleteUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to delete a user', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({}, new UniqueEntityID('user-1')),
    );

    const result = await sut.execute({ actorId: 'admin-1', userId: 'user-1' });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
  });

  it('should not be able to delete the own account', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({ role: 'ADMIN' }, new UniqueEntityID('admin-1')),
    );

    const result = await sut.execute({ actorId: 'admin-1', userId: 'admin-1' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CannotChangeOwnAccessError);
  });

  it('should not be able to delete an inexistent user', async () => {
    const result = await sut.execute({
      actorId: 'admin-1',
      userId: 'user-inexistente',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
