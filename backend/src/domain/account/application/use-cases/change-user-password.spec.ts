import { ChangeUserPasswordUseCase } from './change-user-password';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { makeUser } from 'test/factories/make-user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let sut: ChangeUserPasswordUseCase;

describe('Change User Password', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakeHasher = new FakeHasher();

    sut = new ChangeUserPasswordUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      fakeHasher,
    );
  });

  it('should be able to change the user password', async () => {
    const user = makeUser(
      { password: await fakeHasher.hash('123456') },
      new UniqueEntityID('user-1'),
    );

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: 'user-1',
      currentPassword: '123456',
      newPassword: 'nova-senha',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0].password).toBe(
      await fakeHasher.hash('nova-senha'),
    );
  });

  it('should not be able to change the password with a wrong current password', async () => {
    const user = makeUser(
      { password: await fakeHasher.hash('123456') },
      new UniqueEntityID('user-1'),
    );

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: 'user-1',
      currentPassword: 'senha-errada',
      newPassword: 'nova-senha',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it('should not be able to change the password of an inexistent user', async () => {
    const result = await sut.execute({
      userId: 'user-inexistente',
      currentPassword: '123456',
      newPassword: 'nova-senha',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
