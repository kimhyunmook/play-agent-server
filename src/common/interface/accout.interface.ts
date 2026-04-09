import { Role } from '@prisma/client';

export class AccountJwt {
  sub: number;
  role: Role;
}
