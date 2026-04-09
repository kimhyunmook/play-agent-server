import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { $Enums, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { BaseException } from 'src/common/exceptions';
import { AppConfigService } from 'src/core/config/app-config.service';
import { DatabaseService } from 'src/core/database/database.service';
import { UserService } from '../../resources/user/user/user.service';
import { AdminRegisterDto, RegisterDto } from './dto/register.dto';
import { GoogleRegisterExistingUserDto, GoogleRegisterNewUserDto } from './dto/response/google-register-response.dto';
import { AccessTokenJwtPayload } from './auth.jwt.types';
import { AuthRefreshTokenRequiredException } from './exceptions/auth.400.exception';
import {
    AuthUnauthorizedException,
    AuthUnauthorizedLoginIdException,
    AuthUnauthorizedRefreshTokenException,
    AuthUnauthorizedUserException,
} from './exceptions/auth.401.exception';
import { AuthNotFoundException } from './exceptions/auth.404.exception';
import { AppLoggerService } from 'src/core/logger/app-logger.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly prisma: DatabaseService,
        private readonly jwtService: JwtService,
        private readonly env: AppConfigService,
        private readonly logger: AppLoggerService,
    ) {}

    async onModuleInit() {
        this.logger.log('AuthService onModuleInit');
        const initAdmin = this.env.initAdmin;
        const initAdminPassword = this.env.initAdminPassword;

        if (!initAdmin || !initAdminPassword)
            throw new AuthNotFoundException('initAdmin or initAdminPassword 찾을 수 없음');
        const initAdminUser = await this.prisma.user.findUnique({ where: { email: initAdmin } });
        if (initAdminUser) return this.logger.log('onModuleInit - 최고 관리자 계정 이미 존재');

        await this.adminCreate({
            loginId: initAdmin,
            email: initAdmin,
            password: initAdminPassword,
            name: '최고 관리자',
        });

        if (this.env.isProduction === false) {
            this.logger.debug('onModuleInit - 테스트 계정 생성', 'AuthService');
            if ((await this.prisma.user.count({ where: { email: { in: ['gusanr4200@naver.com', 'string'] } } })) === 2)
                return this.logger.log('onModuleInit - 테스트 계정 이미 존재');

            await this.register({
                email: 'gusanr4200@naver.com',
                password: 'string', // 평문 비밀번호 - signUp에서 해시함
                name: '테스트 개발자',
            });

            await this.register({
                email: 'string',
                password: 'stirng',
                name: '테스터',
            });
        }
    }

    async register(data: RegisterDto) {
        const { password, email, ...userData } = data;
        const saltRounds = this.env.saltRounds;
        const hashed = await bcrypt.hash(password, saltRounds);
        const user = await this.userService.create({
            ...userData,
            password: hashed,
            loginId: email,
            email,
            role: Role.USER,
        });
        return user;
    }

    async adminCreate(data: AdminRegisterDto) {
        const { password, loginId, ...userData } = data;
        const saltRounds = this.env.saltRounds;
        const hashed = await bcrypt.hash(password, saltRounds);
        const { user } = await this.userService.create({ ...userData, password: hashed, loginId, role: Role.ADMIN });
        return user;
    }

    async signIn(loginId: string, password: string) {
        const user = await this.userService.findUniqueByLoginId(loginId);
        if (!user || !user.userAccount) throw new AuthUnauthorizedLoginIdException();

        const isMatch = await bcrypt.compare(password, user.userAccount.password);
        if (!isMatch) throw new AuthUnauthorizedLoginIdException();

        return this.generateTokens(user.id, user.role);
    }

    async refresh(refreshToken?: string) {
        if (!refreshToken) throw new AuthRefreshTokenRequiredException();
        try {
            const payload = await this.jwtService.verifyAsync<{ sub: number; role: $Enums.Role }>(refreshToken, {
                secret: this.env.refreshJwtSecret,
            });

            const user = await this.userService.findUniqueWithAccountStatusById(payload.sub);

            if (!user || user.deletedAt) throw new AuthUnauthorizedRefreshTokenException();
            if (user.userAccount?.status !== UserStatus.ACTIVE) throw new AuthUnauthorizedUserException();

            return this.generateTokens(user.id, user.role);
        } catch (err) {
            if (err instanceof BaseException) throw err;
            throw new AuthUnauthorizedRefreshTokenException();
        }
    }

    private async generateTokens(userId: number, role: $Enums.Role) {
        const accessSecret = this.env.accessJwtSecret;
        const accessExpire = this.env.accessTokenExpire;
        const refreshSecret = this.env.refreshJwtSecret;
        const refreshExpire = this.env.refreshTokenExpire;

        const payload = { sub: userId, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessSecret,
                expiresIn: accessExpire,
            }),
            this.jwtService.signAsync(payload, {
                secret: refreshSecret,
                expiresIn: refreshExpire,
            }),
        ]);

        return { accessToken, refreshToken };
    }

    setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
        const accessExpire = this.env.accessTokenExpire * 1000;
        const refreshExpire = this.env.refreshTokenExpire * 1000;
        const cookieOptions = {
            httpOnly: true,
            secure: this.env.isProduction,
            sameSite: 'lax' as const,
        };

        res.cookie('access_token', tokens.accessToken, { ...cookieOptions, maxAge: accessExpire });
        res.cookie('refresh_token', tokens.refreshToken, { ...cookieOptions, maxAge: refreshExpire });
    }

    /**
     * 요청에서 access JWT 문자열 추출 (쿠키 access_token 또는 Authorization Bearer)
     */
    getAccessTokenFromRequest(req: Request): string | undefined {
        if (req.cookies?.access_token) {
            return req.cookies.access_token as string;
        }
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return undefined;
    }

    /**
     * 액세스 토큰 서명 검증 후 페이로드(sub, role, iat, exp 등) 반환
     */
    async verifyAccessTokenPayload(token: string | undefined): Promise<AccessTokenJwtPayload> {
        if (!token) {
            throw new AuthUnauthorizedException('인증 토큰이 없습니다.');
        }
        try {
            return await this.jwtService.verifyAsync<AccessTokenJwtPayload>(token, {
                secret: this.env.accessJwtSecret,
            });
        } catch {
            throw new AuthUnauthorizedException('유효하지 않은 액세스 토큰입니다.');
        }
    }

    /**
     * Google OAuth 프로필로 회원가입만 수행. JWT 발급 없음.
     * 신규 사용자: setPasswordToken 반환 → 비밀번호 설정 후 POST /auth/login 으로 로그인
     * 기존 사용자: alreadyRegistered 반환
     */
    async googleRegister(profile: {
        id: string;
        email: string;
        name?: string | null;
    }): Promise<GoogleRegisterNewUserDto | GoogleRegisterExistingUserDto> {
        const email = profile.email;
        if (!email) throw new AuthUnauthorizedUserException();

        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { userAccount: { select: { loginId: true } } },
        });

        if (user) {
            if (user.deletedAt) throw new AuthUnauthorizedUserException();
            const dto: GoogleRegisterExistingUserDto = {
                alreadyRegistered: true,
                email,
                loginId: user.userAccount?.loginId ?? email,
            };
            return dto;
        }

        const loginId = email;
        const randomPassword = await bcrypt.hash(`${profile.id}-${Date.now()}-${Math.random()}`, this.env.saltRounds);
        const { user: newUser } = await this.userService.create({
            loginId,
            email,
            password: randomPassword,
            name: profile.name ?? email.split('@')[0],
            role: Role.USER,
        });

        const setPasswordToken = await this.jwtService.signAsync(
            { sub: newUser.id, purpose: 'google_set_password' },
            { secret: this.env.accessJwtSecret, expiresIn: '10m' },
        );

        const dto: GoogleRegisterNewUserDto = { setPasswordToken, email, loginId };
        return dto;
    }

    /**
     * Android에서 전달한 Google ID 토큰 검증 후 회원가입 처리.
     */
    async googleRegisterWithIdToken(idToken: string): ReturnType<AuthService['googleRegister']> {
        const audience = this.env.googleAndroidClientId;
        if (!audience) throw new AuthUnauthorizedUserException();

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({ idToken, audience });
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload?.email) throw new AuthUnauthorizedUserException();

        return this.googleRegister({
            id: payload.sub,
            email: payload.email,
            name: payload.name ?? null,
        });
    }

    /**
     * OAuth 회원가입 후 비밀번호 설정.
     * setPasswordToken 검증 후 UserAccount 비밀번호 업데이트.
     */
    async setPassword(token: string, password: string): Promise<void> {
        const payload = await this.jwtService.verifyAsync<{
            sub: number;
            purpose: string;
        }>(token, {
            secret: this.env.accessJwtSecret,
        });

        if (payload.purpose !== 'google_set_password') {
            throw new AuthUnauthorizedUserException();
        }

        const hashed = await bcrypt.hash(password, this.env.saltRounds);
        await this.prisma.userAccount.update({
            where: { userId: payload.sub },
            data: { password: hashed },
        });
    }
}
