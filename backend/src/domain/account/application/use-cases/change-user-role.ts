import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { User, UserRole } from '@/domain/account/enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { CannotChangeOwnAccessError } from './errors/cannot-change-own-access-error';

interface ChangeUserRoleUseCaseRequest {
  actorId: string;
  userId: string;
  role: UserRole;
}

type ChangeUserRoleUseCaseResponse = Either<
  ResourceNotFoundError | CannotChangeOwnAccessError,
  {
    user: User;
  }
>;

export class ChangeUserRoleUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    actorId,
    userId,
    role,
  }: ChangeUserRoleUseCaseRequest): Promise<ChangeUserRoleUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    if (user.id.toString() === actorId && role !== 'ADMIN') {
      return left(new CannotChangeOwnAccessError());
    }

    user.role = role;

    await this.usersRepository.save(user);

    return right({
      user,
    });
  }
}
