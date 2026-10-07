import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { EditarClienteUseCase } from '@/domain/triagem/application/use-cases/editar-cliente';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editarClienteBodySchema = z.object({
  driveUrl: z.string().url().nullable().optional(),
  observacao: z.string().trim().max(280).nullable().optional(),
  responsavelId: z.string().uuid().nullable().optional(),
});

type EditarClienteBodySchema = z.infer<typeof editarClienteBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editarClienteBodySchema);

@Controller('/clientes/:clienteId')
@UseGuards(AuthGuard('jwt'))
export class EditarClienteController {
  constructor(private editarCliente: EditarClienteUseCase) {}

  @Patch()
  async handle(
    @Param('clienteId') clienteId: string,
    @Body(bodyValidationPipe) body: EditarClienteBodySchema,
  ) {
    const { driveUrl, observacao, responsavelId } = body;

    const result = await this.editarCliente.execute({
      clienteId,
      driveUrl,
      observacao,
      responsavelId,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
