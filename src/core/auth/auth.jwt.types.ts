import { Role } from '@prisma/client';

/**
 * 액세스 JWT에 담기는 클레임 (서명 검증 후 반환)
 */
export interface AccessTokenJwtPayload {
    sub: number;
    role: Role;
    iat: number;
    exp: number;
}
