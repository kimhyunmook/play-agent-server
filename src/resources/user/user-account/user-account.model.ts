import { AuthProvider, UserAccount, UserStatus } from '@prisma/client';
import { Property } from 'ts-deco';

export class UserAccountModel implements UserAccount {
    @Property({ description: '인증 제공자', enum: AuthProvider, nullable: false })
    provider: AuthProvider;

    @Property({ description: '인증 제공자 아이디', type: String, nullable: true })
    providerId: string | null;

    @Property({ description: '아이디', type: String, nullable: false })
    id: string;

    @Property({ description: '상태', enum: UserStatus, nullable: false })
    status: UserStatus;

    @Property({ description: '유저 아이디', type: Number, nullable: false })
    userId: number;

    @Property({ description: '로그인 아이디', type: String, nullable: false })
    loginId: string;

    @Property({ description: '비밀번호', type: String, nullable: false })
    password: string;

    @Property({ description: '최근 로그인 시간', type: Date, nullable: true })
    lastLoginAt: Date | null;
}
