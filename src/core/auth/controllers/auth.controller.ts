import { Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthRoles } from 'src/common/decorators/auth-roles.decorator';
import { NumberIdResponseDto } from 'src/common/dto/response.dto';
import { THROTTLE_SKIP_IF } from 'src/common/guards/throttler.config';
import { CommonController } from 'src/common/utils/common.controller';
import { AppConfigService } from 'src/core/config/app-config.service';
import { Endpoint, Resource } from 'ts-deco';
import { AuthConstant } from '../auth.constant';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResponseDto } from '../dto/response/login-response.dto';
import { SetPasswordDto } from '../dto/set-password.dto';
import { GoogleProfile } from '../strategies/google.strategy';

@Resource('auth')
export class AuthController extends CommonController {
    constructor(
        private readonly authService: AuthService,
        private readonly env: AppConfigService,
    ) {
        super(AuthConstant.NAME);
    }

    @UseGuards(AuthGuard('google'))
    @Endpoint({
        method: 'GET',
        endpoint: 'oauth/google',
        summary: AuthConstant.ENDPOINT.OAUTH_GOOGLE.summary,
        description: AuthConstant.ENDPOINT.OAUTH_GOOGLE.description,
    })
    async oauthGoogle(): Promise<void> {
        // Guard가 Google 로그인 페이지로 리다이렉
    }

    @UseGuards(AuthGuard('google'))
    @Endpoint({
        method: 'GET',
        endpoint: 'oauth/google/callback',
        summary: AuthConstant.ENDPOINT.OAUTH_GOOGLE_CALLBACK.summary,
        description: AuthConstant.ENDPOINT.OAUTH_GOOGLE_CALLBACK.description,
    })
    async oauthGoogleCallback(@Req() req: Request & { user: GoogleProfile }, @Res() res: Response) {
        const result = await this.authService.googleRegister(req.user);

        if ('alreadyRegistered' in result) {
            res.redirect(`${this.env.domainUrl}/login?message=already_registered`);
            return;
        }

        res.redirect(
            `${this.env.domainUrl}/set-password?token=${encodeURIComponent(result.setPasswordToken)}&email=${encodeURIComponent(result.email)}`,
        );
        return this.responseData('Google OAuth 회원가입 콜백', result);
    }

    @Throttle({ default: THROTTLE_SKIP_IF.register })
    @Endpoint({
        method: 'POST',
        endpoint: 'register',
        summary: '회원가입',
        description: '회원가입',
    })
    async register(@Body() body: RegisterDto): Promise<NumberIdResponseDto> {
        const result = await this.authService.register(body);
        return this.responseData('회원가입', { id: result.user.id });
    }

    @Throttle({ default: THROTTLE_SKIP_IF.login })
    @Endpoint({
        method: 'POST',
        endpoint: 'oauth/set-password',
        summary: AuthConstant.ENDPOINT.OAUTH_SET_PASSWORD.summary,
        description: AuthConstant.ENDPOINT.OAUTH_SET_PASSWORD.description,
    })
    async setPassword(@Body() body: SetPasswordDto) {
        await this.authService.setPassword(body.token, body.password);
        return this.responseData('비밀번호가 설정되었습니다.');
    }

    @Throttle({ default: THROTTLE_SKIP_IF.login })
    @Endpoint({ method: 'POST', endpoint: 'login', summary: '로그인' })
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
        const tokens = await this.authService.signIn(body.loginId, body.password);
        this.authService.setAuthCookies(res, tokens);
        return this.responseData('로그인 됐습니다.', {
            accessToken: tokens.accessToken,
        });
    }

    @Endpoint({
        method: 'GET',
        endpoint: 'jwt/payload',
        summary: 'JWT 페이로드 조회',
        description:
            'Bearer 또는 access_token 쿠키의 액세스 JWT를 검증한 뒤 sub, role, iat, exp 등 클레임을 반환합니다.',
        isAuth: true,
    })
    @AuthRoles(Role.USER, Role.ADMIN)
    async getJwtPayload(@Req() req: Request) {
        const token = this.authService.getAccessTokenFromRequest(req);
        const payload = await this.authService.verifyAccessTokenPayload(token);
        return this.responseData('JWT 페이로드 조회', payload);
    }

    @Throttle({ default: THROTTLE_SKIP_IF.login })
    @Endpoint({
        method: 'POST',
        endpoint: 'refresh',
        summary: '토큰 갱신',
        description:
            '리프레시 토큰으로 access/refresh 토큰을 재발급합니다.\n' +
            '- 리프레시 토큰은 오직 쿠키(refresh_token)로만 인증합니다. (HttpOnly 권장)\n' +
            '- 클라이언트는 쿠키가 포함되도록 요청해야 합니다. (예: fetch/axios에서 credentials 포함)\n' +
            '- 성공 시 새 토큰이 쿠키로 재설정됩니다.',
        isAuth: true,
    })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
        const refreshToken = req.cookies?.refresh_token as string;
        const tokens = await this.authService.refresh(refreshToken);
        this.authService.setAuthCookies(res, tokens);
        return this.responseData('토큰이 갱신되었습니다.', {
            accessToken: tokens.accessToken,
        });
    }
}
