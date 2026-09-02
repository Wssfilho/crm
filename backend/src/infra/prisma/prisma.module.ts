import { Module } from '@nestjs/common';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { PrismaService } from './prisma.service';
import { PrismaUsersRepository } from './repositories/prisma-users-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [PrismaService, UsersRepository],
})
export class PrismaModule {}
