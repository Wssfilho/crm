import {
  Controller,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MarcarClienteAptoUseCase } from '@/domain/triagem/application/use-cases/marcar-cliente-apto';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';

@Controller('/clientes/:clienteId/apto')
@UseGuards(AuthGuard('jwt'))
export class MarcarClienteAptoController {
  constructor(private marcarClienteApto: MarcarClienteAptoUseCase) {}

  @Patch()
  async handle(@Param('clienteId') clienteId: string) {
    const result = await this.marcarClienteApto.execute({ clienteId });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
