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
import { MoverEtapaClienteUseCase } from '@/domain/triagem/application/use-cases/mover-etapa-cliente';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const moverEtapaBodySchema = z.object({
  etapa: z.enum(['COMERCIAL', 'PROTOCOLO', 'CONCLUIDO']),
});

type MoverEtapaBodySchema = z.infer<typeof moverEtapaBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(moverEtapaBodySchema);

@Controller('/clientes/:clienteId/etapa')
@UseGuards(AuthGuard('jwt'))
export class MoverEtapaClienteController {
  constructor(private moverEtapaCliente: MoverEtapaClienteUseCase) {}

  @Patch()
  async handle(
    @Param('clienteId') clienteId: string,
    @Body(bodyValidationPipe) body: MoverEtapaBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { etapa } = body;

    const result = await this.moverEtapaCliente.execute({
      clienteId,
      etapa,
      usuarioId: user.sub,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
