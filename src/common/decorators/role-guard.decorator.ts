import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLE_KEY } from '../guards/auth.guard';

/**
 * Role 데코레이터
 * - 나열한 Role 중 하나라도 일치하면 접근 허용
 * - ADMIN은 항상 모든 접근 허용
 *
 * @example
 * @UseRoleGuard(Role.ADMIN)
 * @UseRoleGuard(Role.USER, Role.ADMIN)
 * @Delete(':id')
 * deleteUser(@Param('id') id: number) {
 *   return this.userService.delete(id);
 * }
 */
export const UseRoleGuard = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);
