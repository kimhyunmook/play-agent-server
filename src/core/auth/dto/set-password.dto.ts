import { Property } from 'ts-deco';

/** Google OAuth 회원가입 후 비밀번호 설정용 */
export class SetPasswordDto {
    @Property({
        type: String,
        nullable: false,
        isNotEmpty: true,
        notEmptyMessage: 'token은 필수입니다.',
    })
    token: string;

    @Property({
        type: String,
        nullable: false,
        isNotEmpty: true,
        notEmptyMessage: 'password는 필수입니다.',
    })
    password: string;
}
