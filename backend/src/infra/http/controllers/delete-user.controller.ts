import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { DeleteUserUseCase } from '@/domain/account/application/use-cases/delete-user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { RolesGuard } from '@/infra/auth/roles.guard';

@Controller('/users/:userId')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class DeleteUserController {
  constructor(private deleteUser: DeleteUserUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser() actor: UserPayload,
    @Param('userId') userId: string,
  ) {
    const result = await this.deleteUser.execute({
      actorId: actor.sub,
      userId,
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
  }
}
