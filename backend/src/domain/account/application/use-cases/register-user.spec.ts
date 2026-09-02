import { RegisterUserUseCase } from './register-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { makeUser } from 'test/factories/make-user';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let sut: RegisterUserUseCase;

describe('Register User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakeHasher = new FakeHasher();

    sut = new RegisterUserUseCase(inMemoryUsersRepository, fakeHasher);
  });

  it('should be able to register a new user', async () => {
    const result = await sut.execute({
      name: 'Eric Melo',
      email: 'eric@advocacia.com.br',
      password: 'senha123',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0]).toMatchObject({
      props: expect.objectContaining({ email: 'eric@advocacia.com.br' }),
    });
  });

  it('should hash the user password upon registration', async () => {
    await sut.execute({
      name: 'Eric Melo',
      email: 'eric@advocacia.com.br',
      password: 'senha123',
    });

    expect(inMemoryUsersRepository.items[0].password).toBe('senha123-hashed');
  });

  it('should not be able to register a user with an email already in use', async () => {
    inMemoryUsersRepository.items.push(
      makeUser({ email: 'eric@advocacia.com.br' }),
    );

    const result = await sut.execute({
      name: 'Eric Melo',
      email: 'eric@advocacia.com.br',
      password: 'senha123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
  });
});
