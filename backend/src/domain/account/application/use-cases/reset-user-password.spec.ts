import { ResetUserPasswordUseCase } from './reset-user-password';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let sut: ResetUserPasswordUseCase;

describe('Reset User Password', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakeHasher = new FakeHasher();

    sut = new ResetUserPasswordUseCase(inMemoryUsersRepository, fakeHasher);
  });

  it('should be able to reset a user password', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({}, new UniqueEntityID('user-1')),
    );

    const result = await sut.execute({
      userId: 'user-1',
      newPassword: 'senha-provisoria',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0].password).toBe(
      await fakeHasher.hash('senha-provisoria'),
    );
  });

  it('should not be able to reset the password of an inexistent user', async () => {
    const result = await sut.execute({
      userId: 'user-inexistente',
      newPassword: 'senha-provisoria',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
