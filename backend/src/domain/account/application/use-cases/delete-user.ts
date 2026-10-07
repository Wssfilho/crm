import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UsersRepository } from '../repositories/users-repository';
import { CannotChangeOwnAccessError } from './errors/cannot-change-own-access-error';

interface DeleteUserUseCaseRequest {
  actorId: string;
  userId: string;
}

type DeleteUserUseCaseResponse = Either<
  ResourceNotFoundError | CannotChangeOwnAccessError,
  null
>;

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    actorId,
    userId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    if (user.id.toString() === actorId) {
      return left(new CannotChangeOwnAccessError());
    }

    await this.usersRepository.delete(user);

    return right(null);
  }
}
