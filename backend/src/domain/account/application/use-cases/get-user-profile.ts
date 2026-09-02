import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { User } from '@/domain/account/enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';

interface GetUserProfileUseCaseRequest {
  userId: string;
}

type GetUserProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: User;
  }
>;

export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    return right({
      user,
    });
  }
}
