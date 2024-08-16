import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PERMISSION_MESSAGE } from 'src/constants/response.messages';
import {
  IS_NOT_CHECK_PERMISSION_KEY,
  IS_PUBLIC_KEY,
} from 'src/decorators/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    const request: Request = context.switchToHttp().getRequest();
    if (err || !user) {
      throw err || new UnauthorizedException('Token is invalid');
    }
    const isNotCheckPermission = this.reflector.getAllAndOverride<boolean>(
      IS_NOT_CHECK_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isNotCheckPermission) return user;

    const method = request.method;
    const targetEndPoint = request.route?.path as string;

    if (targetEndPoint.includes('auth')) return user;

    const permissions = user?.permissions ?? [];

    const isExist = permissions.find(
      (permission) =>
        permission.method === method && permission.apiPath === targetEndPoint,
    );

    if (!isExist)
      throw new ForbiddenException(PERMISSION_MESSAGE.PERMISSION_DENY);

    return user;
  }
}
