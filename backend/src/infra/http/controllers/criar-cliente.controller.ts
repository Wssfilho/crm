import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { CriarClienteUseCase } from '@/domain/triagem/application/use-cases/criar-cliente';
import { ClienteAlreadyExistsError } from '@/domain/triagem/application/use-cases/errors/cliente-already-exists-error';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { dadosDoClienteSchema } from '@/infra/http/schemas/dados-do-cliente-schema';

const criarClienteBodySchema = z.object({
  name: dadosDoClienteSchema.name,
  cpf: dadosDoClienteSchema.cpf,
  nascimento: dadosDoClienteSchema.nascimento.optional(),
  telefone: dadosDoClienteSchema.telefone.optional(),
  municipio: dadosDoClienteSchema.municipio.optional(),
  nb: dadosDoClienteSchema.nb,
  especie: dadosDoClienteSchema.especie.optional(),
  rendaEmCentavos: dadosDoClienteSchema.rendaEmCentavos.optional(),
  procuracao: z.boolean().optional(),
  extratoBeneficio: z.boolean().optional(),
  extratoEmprestimos: z.boolean().optional(),
  enviarParaAnalise: z.boolean().optional(),
});

type CriarClienteBodySchema = z.infer<typeof criarClienteBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(criarClienteBodySchema);

@Controller('/clientes')
@UseGuards(AuthGuard('jwt'))
export class CriarClienteController {
  constructor(private criarCliente: CriarClienteUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CriarClienteBodySchema) {
    const { nascimento, ...dados } = body;

    const result = await this.criarCliente.execute({
      ...dados,
      nascimento: nascimento ? new Date(nascimento) : undefined,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ClienteAlreadyExistsError:
          throw new ConflictException('Já existe um cliente com esse CPF');
        default:
          throw new BadRequestException(error.message);
      }
    }

    return { cliente: ClientePresenter.toHTTP(result.value.cliente) };
  }
}
