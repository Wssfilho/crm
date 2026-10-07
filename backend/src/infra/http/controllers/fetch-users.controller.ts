import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FetchUsersUseCase } from '@/domain/account/application/use-cases/fetch-users';
import { Roles } from '@/infra/auth/roles.decorator';
import { RolesGuard } from '@/infra/auth/roles.guard';
import { UserPresenter } from '@/infra/http/presenters/user-presenter';

@Controller('/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class FetchUsersController {
  constructor(private fetchUsers: FetchUsersUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchUsers.execute();

    return {
      users:
        result.value?.users.map((user) => UserPresenter.toHTTP(user)) ?? [],
    };
  }
}
