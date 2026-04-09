import { Role } from '@prisma/client';

export interface AccountJwt {
    sub: number;
    role: Role;
}
