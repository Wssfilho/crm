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
import { cpfEhValido, nbEhValido } from '@/core/validation/cpf';
import { CriarClienteUseCase } from '@/domain/triagem/application/use-cases/criar-cliente';
import { ClienteAlreadyExistsError } from '@/domain/triagem/application/use-cases/errors/cliente-already-exists-error';
import { ClientePresenter } from '@/infra/http/presenters/cliente-presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 120;
const ANO_EM_MS = 1000 * 60 * 60 * 24 * 365.25;

const criarClienteBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .refine((valor) => valor.split(/\s+/).filter(Boolean).length >= 2),
  cpf: z.string().refine(cpfEhValido),
  nascimento: z.iso
    .date()
    .refine((valor) => {
      const idade = (Date.now() - new Date(valor).getTime()) / ANO_EM_MS;

      return idade >= IDADE_MINIMA && idade <= IDADE_MAXIMA;
    })
    .optional(),
  telefone: z
    .string()
    .refine((valor) => [10, 11].includes(valor.replace(/\D/g, '').length))
    .optional(),
  municipio: z.string().trim().min(2).optional(),
  nb: z.string().refine(nbEhValido),
  especie: z.string().trim().min(1).optional(),
  rendaEmCentavos: z.number().int().positive().optional(),
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
