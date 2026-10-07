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
import { RegisterUserUseCase } from '@/domain/account/application/use-cases/register-user';
import { UserAlreadyExistsError } from '@/domain/account/application/use-cases/errors/user-already-exists-error';
import { Roles } from '@/infra/auth/roles.decorator';
import { RolesGuard } from '@/infra/auth/roles.guard';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { UserPresenter } from '@/infra/http/presenters/user-presenter';

const createUserBodySchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER']),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createUserBodySchema);

@Controller('/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class CreateUserController {
  constructor(private registerUser: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateUserBodySchema) {
    const { name, email, password, role } = body;

    const result = await this.registerUser.execute({
      name,
      email,
      password,
      role,
    });

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

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
