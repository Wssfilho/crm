import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { EditarClienteUseCase } from '@/domain/triagem/application/use-cases/editar-cliente';
import { ClienteAlreadyExistsError } from '@/domain/triagem/application/use-cases/errors/cliente-already-exists-error';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { dadosDoClienteSchema } from '@/infra/http/schemas/dados-do-cliente-schema';

const editarClienteBodySchema = z.object({
  name: dadosDoClienteSchema.name.optional(),
  cpf: dadosDoClienteSchema.cpf.optional(),
  nascimento: dadosDoClienteSchema.nascimento.nullable().optional(),
  telefone: dadosDoClienteSchema.telefone.nullable().optional(),
  municipio: dadosDoClienteSchema.municipio.nullable().optional(),
  nb: dadosDoClienteSchema.nb.optional(),
  especie: dadosDoClienteSchema.especie.nullable().optional(),
  rendaEmCentavos: dadosDoClienteSchema.rendaEmCentavos.nullable().optional(),
  driveUrl: z
    .url({ protocol: /^https?$/ })
    .max(2048)
    .nullable()
    .optional(),
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
    const { nascimento, ...dados } = body;

    const result = await this.editarCliente.execute({
      clienteId,
      ...dados,
      nascimento:
        typeof nascimento === 'string' ? new Date(nascimento) : nascimento,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ClienteAlreadyExistsError) {
        throw new ConflictException('Já existe um cliente com esse CPF');
      }

      throw new NotFoundException(error.message);
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
