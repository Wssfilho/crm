import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/account/application/use-cases/authenticate-user';
import { GetUserProfileUseCase } from '@/domain/account/application/use-cases/get-user-profile';
import { RegisterUserUseCase } from '@/domain/account/application/use-cases/register-user';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { Encrypter } from '@/domain/account/application/cryptography/encrypter';
import { HashComparer } from '@/domain/account/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/account/application/cryptography/hash-generator';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { PrismaModule } from '@/infra/prisma/prisma.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CreateAccountController } from './controllers/create-account.controller';
import { GetProfileController } from './controllers/get-profile.controller';

@Module({
  imports: [PrismaModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    GetProfileController,
  ],
  providers: [
    {
      provide: RegisterUserUseCase,
      useFactory: (
        usersRepository: UsersRepository,
        hashGenerator: HashGenerator,
      ) => new RegisterUserUseCase(usersRepository, hashGenerator),
      inject: [UsersRepository, HashGenerator],
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (
        usersRepository: UsersRepository,
        hashComparer: HashComparer,
        encrypter: Encrypter,
      ) =>
        new AuthenticateUserUseCase(usersRepository, hashComparer, encrypter),
      inject: [UsersRepository, HashComparer, Encrypter],
    },
    {
      provide: GetUserProfileUseCase,
      useFactory: (usersRepository: UsersRepository) =>
        new GetUserProfileUseCase(usersRepository),
      inject: [UsersRepository],
    },
  ],
})
export class HttpModule {}
