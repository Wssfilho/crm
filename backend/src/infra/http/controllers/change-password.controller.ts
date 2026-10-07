import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { ChangeUserPasswordUseCase } from '@/domain/account/application/use-cases/change-user-password';
import { WrongCredentialsError } from '@/domain/account/application/use-cases/errors/wrong-credentials-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const changePasswordBodySchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

type ChangePasswordBodySchema = z.infer<typeof changePasswordBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(changePasswordBodySchema);

@Controller('/me/password')
@UseGuards(AuthGuard('jwt'))
export class ChangePasswordController {
  constructor(private changeUserPassword: ChangeUserPasswordUseCase) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: ChangePasswordBodySchema,
  ) {
    const { currentPassword, newPassword } = body;

    const result = await this.changeUserPassword.execute({
      userId: user.sub,
      currentPassword,
      newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new BadRequestException('Current password is invalid');
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }
  }
}
