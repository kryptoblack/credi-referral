import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

import { IS_PUBLIC_KEY } from 'src/auth/auth.constant';
import { IAuthenticatedUser } from 'src/auth/auth.interface';
import { API_PREFIX, routes } from 'src/common/common.constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * If the route is public, we don't need to check for a JWT token.
     * We can just return true and the request will continue.
     *
     * If the route is not public, we will attempt to get the JWT token from
     * the request. If there is no token, we throw an UnauthorizedException.
     *
     * If there is a token, we attempt to verify it. If it's not valid, we
     * throw an UnauthorizedException. If it is valid, we attach the payload
     * to the request object and return true, allowing the request to continue.
     *
     * @param context The execution context.
     * @returns A boolean indicating whether the request can continue.
     */

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('APP.secret'),
      });

      if (
        (payload.type === 'refresh' &&
          request.path === `${API_PREFIX}${routes.auth.REFRESH}`) ||
        payload.type === 'access'
      ) {
        // We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = {
          id: payload.sub,
        } as IAuthenticatedUser;
      } else throw new UnauthorizedException();
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    /**
     * This method extracts the JWT token from the request header.
     * If there is no token, it returns undefined.
     *
     * @param request The request object.
     * @returns The JWT token or undefined.
     */

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
