import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import type { UserRole } from '@/domain/account/enterprise/entities/user';
import type { UserPayload } from './jwt.strategy';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const { user: payload } = context
      .switchToHttp()
      .getRequest<{ user?: UserPayload }>();

    const user = payload
      ? await this.usersRepository.findById(payload.sub)
      : null;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Not allowed');
    }

    return true;
  }
}
