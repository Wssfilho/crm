import { ChangeUserRoleUseCase } from './change-user-role';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { CannotChangeOwnAccessError } from './errors/cannot-change-own-access-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: ChangeUserRoleUseCase;

describe('Change User Role', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new ChangeUserRoleUseCase(inMemoryUsersRepository);
  });

  it('should be able to promote a user to admin', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({ role: 'USER' }, new UniqueEntityID('user-1')),
    );

    const result = await sut.execute({
      actorId: 'admin-1',
      userId: 'user-1',
      role: 'ADMIN',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0].isAdmin).toBe(true);
  });

  it('should not be able to remove the own admin access', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({ role: 'ADMIN' }, new UniqueEntityID('admin-1')),
    );

    const result = await sut.execute({
      actorId: 'admin-1',
      userId: 'admin-1',
      role: 'USER',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CannotChangeOwnAccessError);
  });

  it('should not be able to change the role of an inexistent user', async () => {
    const result = await sut.execute({
      actorId: 'admin-1',
      userId: 'user-inexistente',
      role: 'ADMIN',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
