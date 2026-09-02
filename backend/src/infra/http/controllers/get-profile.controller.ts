import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUserProfileUseCase } from '@/domain/account/application/use-cases/get-user-profile';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { UserPresenter } from '@/infra/http/presenters/user-presenter';

@Controller('/me')
@UseGuards(AuthGuard('jwt'))
export class GetProfileController {
  constructor(private getUserProfile: GetUserProfileUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getUserProfile.execute({ userId: user.sub });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
