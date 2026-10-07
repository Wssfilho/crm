import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { User } from '@/domain/account/enterprise/entities/user';

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async findById(id: string) {
    const user = this.items.find((item) => item.id.toString() === id);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email);

    if (!user) {
      return null;
    }

    return user;
  }

  async findMany() {
    return [...this.items].sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(user: User) {
    this.items.push(user);
  }

  async save(user: User) {
    const itemIndex = this.items.findIndex((item) => item.id.equals(user.id));

    this.items[itemIndex] = user;
  }
}
