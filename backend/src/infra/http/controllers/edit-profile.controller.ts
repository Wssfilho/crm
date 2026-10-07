import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { EditUserProfileUseCase } from '@/domain/account/application/use-cases/edit-user-profile';
import { UserAlreadyExistsError } from '@/domain/account/application/use-cases/errors/user-already-exists-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { UserPresenter } from '@/infra/http/presenters/user-presenter';

const editProfileBodySchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().toLowerCase().email(),
});

type EditProfileBodySchema = z.infer<typeof editProfileBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editProfileBodySchema);

@Controller('/me')
@UseGuards(AuthGuard('jwt'))
export class EditProfileController {
  constructor(private editUserProfile: EditUserProfileUseCase) {}

  @Patch()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: EditProfileBodySchema,
  ) {
    const { name, email } = body;

    const result = await this.editUserProfile.execute({
      userId: user.sub,
      name,
      email,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(
            'User with same email address already exists',
          );
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
