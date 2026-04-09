/**
 * Auth 모듈 상수
 * - OAuth 엔드포인트 summary, description 등
 */
export class AuthConstant {
    static readonly NAME = 'Auth';

    static readonly ENDPOINT = {
        OAUTH_GOOGLE: {
            summary: 'Google OAuth 회원가입 시작',
            description:
                '브라우저에서 호출 시 Google 로그인 페이지로 리다이렉트됩니다. ' +
                'Google 로그인 완료 후 /auth/oauth/google/callback 으로 이동하며, ' +
                '신규 사용자는 set-password 페이지로, 기존 사용자는 login 페이지로 리다이렉트됩니다.',
        },
        OAUTH_GOOGLE_CALLBACK: {
            summary: 'Google OAuth 회원가입 콜백',
            description:
                'Google 로그인 완료 후 Google이 호출하는 콜백 URL입니다. (직접 호출 불가, Swagger 실행 불가) ' +
                '신규 사용자: {DOMAIN_URL}/set-password?token=xxx&email=xxx 로 리다이렉트. ' +
                '기존 사용자: {DOMAIN_URL}/login?message=already_registered 로 리다이렉트. ' +
                '비밀번호 설정 후 POST /auth/oauth/set-password → POST /auth/login 순으로 로그인합니다.',
        },
        OAUTH_SET_PASSWORD: {
            summary: '비밀번호 설정',
            description:
                'Google OAuth 회원가입(신규) 후 비밀번호를 설정합니다. ' +
                'OAuth 콜백에서 받은 token과 설정할 password를 전달합니다. ' +
                '설정 완료 후 POST /auth/login { loginId: 이메일, password } 로 로그인합니다.',
        },
    };
}
