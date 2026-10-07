import { User } from '@/domain/account/enterprise/entities/user';

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findMany(): Promise<User[]>;
  abstract save(user: User): Promise<void>;
  abstract create(user: User): Promise<void>;
}
