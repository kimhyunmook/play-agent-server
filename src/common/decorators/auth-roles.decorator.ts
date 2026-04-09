import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guard';
import { UseRoleGuard } from './role-guard.decorator';

/**
 * 인증 + 역할 검사 통합 데코레이터
 * - AuthGuard(JWT 검증) + UseRoleGuard(역할 메타데이터)를 한 번에 적용
 *
 * @example
 * @AuthRoles(Role.USER, Role.ADMIN)
 */
export const AuthRoles = (...roles: Role[]) =>
  applyDecorators(UseGuards(AuthGuard), UseRoleGuard(...roles));
