import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { RegisterUserUseCase } from '@/domain/account/application/use-cases/register-user';
import { UserAlreadyExistsError } from '@/domain/account/application/use-cases/errors/user-already-exists-error';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createAccountBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema);

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
export class CreateAccountController {
  constructor(private registerUser: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateAccountBodySchema) {
    const { name, email, password } = body;

    const result = await this.registerUser.execute({ name, email, password });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(
            'User with same email address already exists',
          );
        default:
          throw new BadRequestException();
      }
    }
  }
}
