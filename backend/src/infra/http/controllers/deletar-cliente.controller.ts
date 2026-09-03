import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DeletarClienteUseCase } from '@/domain/triagem/application/use-cases/deletar-cliente';

@Controller('/clientes/:clienteId')
@UseGuards(AuthGuard('jwt'))
export class DeletarClienteController {
  constructor(private deletarCliente: DeletarClienteUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('clienteId') clienteId: string) {
    const result = await this.deletarCliente.execute({ clienteId });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
  }
}
