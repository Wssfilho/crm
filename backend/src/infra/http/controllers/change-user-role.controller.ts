import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { ChangeUserRoleUseCase } from '@/domain/account/application/use-cases/change-user-role';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { RolesGuard } from '@/infra/auth/roles.guard';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { UserPresenter } from '@/infra/http/presenters/user-presenter';

const changeUserRoleBodySchema = z.object({
  role: z.enum(['ADMIN', 'USER']),
});

type ChangeUserRoleBodySchema = z.infer<typeof changeUserRoleBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(changeUserRoleBodySchema);

@Controller('/users/:userId/role')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class ChangeUserRoleController {
  constructor(private changeUserRole: ChangeUserRoleUseCase) {}

  @Patch()
  async handle(
    @CurrentUser() actor: UserPayload,
    @Param('userId') userId: string,
    @Body(bodyValidationPipe) body: ChangeUserRoleBodySchema,
  ) {
    const result = await this.changeUserRole.execute({
      actorId: actor.sub,
      userId,
      role: body.role,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
