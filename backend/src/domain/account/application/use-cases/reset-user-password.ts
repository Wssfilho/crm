import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { HashGenerator } from '../cryptography/hash-generator';
import { UsersRepository } from '../repositories/users-repository';

interface ResetUserPasswordUseCaseRequest {
  userId: string;
  newPassword: string;
}

type ResetUserPasswordUseCaseResponse = Either<ResourceNotFoundError, null>;

export class ResetUserPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    userId,
    newPassword,
  }: ResetUserPasswordUseCaseRequest): Promise<ResetUserPasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    user.password = await this.hashGenerator.hash(newPassword);

    await this.usersRepository.save(user);

    return right(null);
  }
}
