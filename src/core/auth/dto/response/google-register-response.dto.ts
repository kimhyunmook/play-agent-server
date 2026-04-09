import { ApiProperty } from '@nestjs/swagger';

/** Google OAuth 회원가입 - 신규 사용자 (비밀번호 설정 필요) */
export class GoogleRegisterNewUserDto {
    @ApiProperty({ description: '비밀번호 설정용 토큰 (POST /auth/set-password에서 사용)' })
    setPasswordToken: string;

    @ApiProperty({ description: '이메일' })
    email: string;

    @ApiProperty({ description: '로그인 ID (이메일과 동일)' })
    loginId: string;
}

/** Google OAuth 회원가입 - 기존 사용자 */
export class GoogleRegisterExistingUserDto {
    @ApiProperty({ description: '이미 가입된 이메일', example: true })
    alreadyRegistered: true;

    @ApiProperty({ description: '이메일' })
    email: string;

    @ApiProperty({ description: '로그인 ID' })
    loginId: string;
}

export type GoogleRegisterResponseDto = GoogleRegisterNewUserDto | GoogleRegisterExistingUserDto;
