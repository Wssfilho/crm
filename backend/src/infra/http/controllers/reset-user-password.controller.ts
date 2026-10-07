import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { ResetUserPasswordUseCase } from '@/domain/account/application/use-cases/reset-user-password';
import { Roles } from '@/infra/auth/roles.decorator';
import { RolesGuard } from '@/infra/auth/roles.guard';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const resetUserPasswordBodySchema = z.object({
  newPassword: z.string().min(6),
});

type ResetUserPasswordBodySchema = z.infer<typeof resetUserPasswordBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(resetUserPasswordBodySchema);

@Controller('/users/:userId/password')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class ResetUserPasswordController {
  constructor(private resetUserPassword: ResetUserPasswordUseCase) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('userId') userId: string,
    @Body(bodyValidationPipe) body: ResetUserPasswordBodySchema,
  ) {
    const result = await this.resetUserPassword.execute({
      userId,
      newPassword: body.newPassword,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
  }
}
