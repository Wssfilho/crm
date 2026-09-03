import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FetchClientesUseCase } from '@/domain/triagem/application/use-cases/fetch-clientes';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';

@Controller('/clientes')
@UseGuards(AuthGuard('jwt'))
export class FetchClientesController {
  constructor(private fetchClientes: FetchClientesUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchClientes.execute();

    if (result.isLeft()) {
      return { clientes: [] };
    }

    return {
      clientes: result.value.clientes.map((cliente) =>
        ClientePresenter.toHTTP(cliente),
      ),
    };
  }
}
