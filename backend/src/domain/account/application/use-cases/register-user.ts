import { Either, left, right } from '@/core/either';
import { HashGenerator } from '../cryptography/hash-generator';
import { UsersRepository } from '../repositories/users-repository';
import { User, UserRole } from '@/domain/account/enterprise/entities/user';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

interface RegisterUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

type RegisterUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: User;
  }
>;

export class RegisterUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
    role,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await this.usersRepository.create(user);

    return right({
      user,
    });
  }
}
