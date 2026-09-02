import { AuthenticateUserUseCase } from './authenticate-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { makeUser } from 'test/factories/make-user';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakeHasher = new FakeHasher();
    fakeEncrypter = new FakeEncrypter();

    sut = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      fakeEncrypter,
    );
  });

  it('should be able to authenticate a user', async () => {
    const user = makeUser({
      email: 'eric@advocacia.com.br',
      password: await fakeHasher.hash('senha123'),
    });

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      email: 'eric@advocacia.com.br',
      password: 'senha123',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('should not be able to authenticate with a wrong password', async () => {
    const user = makeUser({
      email: 'eric@advocacia.com.br',
      password: await fakeHasher.hash('senha123'),
    });

    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      email: 'eric@advocacia.com.br',
      password: 'senha-errada',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it('should not be able to authenticate an unregistered email', async () => {
    const result = await sut.execute({
      email: 'naoexiste@advocacia.com.br',
      password: 'senha123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });
});
