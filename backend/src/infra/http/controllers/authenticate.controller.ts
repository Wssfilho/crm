import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { z } from 'zod';
import { AuthenticateUserUseCase } from '@/domain/account/application/use-cases/authenticate-user';
import { WrongCredentialsError } from '@/domain/account/application/use-cases/errors/wrong-credentials-error';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema);

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
export class AuthenticateController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: AuthenticateBodySchema) {
    const { email, password } = body;

    const result = await this.authenticateUser.execute({ email, password });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException('Email or password invalid');
        default:
          throw new BadRequestException();
      }
    }

    const { accessToken } = result.value;

    return {
      access_token: accessToken,
    };
  }
}
