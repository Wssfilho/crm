import { Either, right } from '@/core/either';
import { User } from '@/domain/account/enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';

type FetchUsersUseCaseResponse = Either<
  null,
  {
    users: User[];
  }
>;

export class FetchUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<FetchUsersUseCaseResponse> {
    const users = await this.usersRepository.findMany();

    return right({
      users,
    });
  }
}
