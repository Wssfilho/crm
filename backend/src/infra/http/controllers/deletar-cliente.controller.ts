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
import { Roles } from '@/infra/auth/roles.decorator';
import { RolesGuard } from '@/infra/auth/roles.guard';

@Controller('/clientes/:clienteId')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
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
