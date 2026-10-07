import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { HashComparer } from '../cryptography/hash-comparer';
import { HashGenerator } from '../cryptography/hash-generator';
import { UsersRepository } from '../repositories/users-repository';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

interface ChangeUserPasswordUseCaseRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

type ChangeUserPasswordUseCaseResponse = Either<
  ResourceNotFoundError | WrongCredentialsError,
  null
>;

export class ChangeUserPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangeUserPasswordUseCaseRequest): Promise<ChangeUserPasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    const isCurrentPasswordValid = await this.hashComparer.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return left(new WrongCredentialsError());
    }

    user.password = await this.hashGenerator.hash(newPassword);

    await this.usersRepository.save(user);

    return right(null);
  }
}
