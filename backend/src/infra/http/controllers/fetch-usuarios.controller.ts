import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FetchUsuariosUseCase } from '@/domain/account/application/use-cases/fetch-usuarios';
import { UserPresenter } from '@/infra/http/presenters/user-presenter';

@Controller('/usuarios')
@UseGuards(AuthGuard('jwt'))
export class FetchUsuariosController {
  constructor(private fetchUsuarios: FetchUsuariosUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchUsuarios.execute();

    return { usuarios: result.value?.users.map(UserPresenter.toHTTP) ?? [] };
  }
}
