import {
  Controller,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArquivarTriagemUseCase } from '@/domain/triagem/application/use-cases/arquivar-triagem';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';

@Controller('/clientes/:clienteId/arquivar')
@UseGuards(AuthGuard('jwt'))
export class ArquivarTriagemController {
  constructor(private arquivarTriagem: ArquivarTriagemUseCase) {}

  @Patch()
  async handle(@Param('clienteId') clienteId: string) {
    const result = await this.arquivarTriagem.execute({ clienteId });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
