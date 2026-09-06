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
import { MoverColunaClienteUseCase } from '@/domain/triagem/application/use-cases/mover-coluna-cliente';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const moverColunaBodySchema = z.object({
  coluna: z.enum(['NOVO', 'DOCS', 'ANALISE', 'TRIADO', 'APTO']),
});

type MoverColunaBodySchema = z.infer<typeof moverColunaBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(moverColunaBodySchema);

@Controller('/clientes/:clienteId/coluna')
@UseGuards(AuthGuard('jwt'))
export class MoverColunaClienteController {
  constructor(private moverColunaCliente: MoverColunaClienteUseCase) {}

  @Patch()
  async handle(
    @Param('clienteId') clienteId: string,
    @Body(bodyValidationPipe) body: MoverColunaBodySchema,
  ) {
    const { coluna } = body;

    const result = await this.moverColunaCliente.execute({
      clienteId,
      coluna,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
