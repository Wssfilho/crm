import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { User } from '@/domain/account/enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

interface EditUserProfileUseCaseRequest {
  userId: string;
  name: string;
  email: string;
}

type EditUserProfileUseCaseResponse = Either<
  ResourceNotFoundError | UserAlreadyExistsError,
  {
    user: User;
  }
>;

export class EditUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    name,
    email,
  }: EditUserProfileUseCaseRequest): Promise<EditUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail && !userWithSameEmail.id.equals(user.id)) {
      return left(new UserAlreadyExistsError(email));
    }

    user.name = name;
    user.email = email;

    await this.usersRepository.save(user);

    return right({
      user,
    });
  }
}
