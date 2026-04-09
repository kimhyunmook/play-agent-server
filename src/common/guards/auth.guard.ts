import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { DatabaseService } from 'src/core/database/database.service';
import { AppLoggerService } from 'src/core/logger/app-logger.service';
import { AccountJwt } from '../interface/accout.interface';

export const ROLE_KEY = 'role';

/**
 * 통합 인증/인가 Guard
 * - @UseRoleGuard(...roles) → JWT 인증 + role 검사
 * - ADMIN은 항상 모든 접근 허용
 * - 그 외 → 인증 불필요 (Public)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: DatabaseService,
    private readonly reflector: Reflector,
    private readonly logger: AppLoggerService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: AccountJwt } & Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccountJwt>(token, {
        secret: this.configService.get<string>('ACCESS_JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          role: true,
          deletedAt: true,
          userAccount: { select: { status: true } },
        },
      });

      if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      if (user.deletedAt)
        throw new UnauthorizedException('삭제된 사용자입니다.');

      if (user.userAccount?.status !== UserStatus.ACTIVE) {
        const statusMessages: Record<Exclude<UserStatus, 'ACTIVE'>, string> = {
          INACTIVE: '비활성화된 계정입니다.',
          SUSPENDED: '정지된 계정입니다.',
          BANNED: '차단된 계정입니다.',
        };
        throw new UnauthorizedException(
          statusMessages[user.userAccount?.status as UserStatus] ||
            '사용할 수 없는 계정입니다.',
        );
      }

      request.user = {
        sub: user.id,
        role: user.role,
      };

      const userRole = user.role;

      if (userRole === Role.ADMIN) {
        return true;
      }

      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `접근 권한이 없습니다. 필요한 권한: ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(error.message, error.stack, 'guard');
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractToken(request: Request): string | null {
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
