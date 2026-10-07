import { Either, right } from '@/core/either';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { User } from '@/domain/account/enterprise/entities/user';

type FetchUsuariosUseCaseResponse = Either<
  null,
  {
    users: User[];
  }
>;

export class FetchUsuariosUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<FetchUsuariosUseCaseResponse> {
    const users = await this.usersRepository.findMany();

    return right({
      users,
    });
  }
}
