import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { User } from '@/domain/account/enterprise/entities/user';
import { PrismaService } from '../prisma.service';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async create(user: User) {
    const data = PrismaUserMapper.toPrisma(user);

    await this.prisma.user.create({ data });
  }

  async save(user: User) {
    const data = PrismaUserMapper.toPrisma(user);

    await this.prisma.user.update({
      where: { id: data.id },
      data,
    });
  }
}
