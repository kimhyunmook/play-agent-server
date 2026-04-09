import { Prisma } from '@prisma/client';

/** findUniqueByLoginId 등 userAccount include 쿼리 결과 (Prisma include 기반) - 직접 사용 가능 */
export type UserWithAccountPayload = Prisma.UserGetPayload<{
    include: { userAccount: { select: { loginId: true; password: true } } };
}>;

/** userAccount 존재가 보장된 유저 (체크 후 반환 시 사용) */
export type UserWithAccount = UserWithAccountPayload & {
    userAccount: NonNullable<UserWithAccountPayload['userAccount']>;
};
