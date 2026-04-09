import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    constructor(private readonly configService: ConfigService) {}

    // 앱
    get appName(): string {
        return this.configService.get<string>('APP_NAME')!;
    }

    get appDescription(): string {
        return this.configService.get<string>('APP_DESCRIPTION')!;
    }

    get appVersion(): string {
        return this.configService.get<string>('APP_VERSION', { infer: true }) ?? '1.0';
    }

    get nodeEnv(): string {
        return this.configService.get<string>('NODE_ENV')!;
    }

    get domainUrl(): string {
        return this.configService.get<string>('DOMAIN_URL', 'http://localhost');
    }

    get port(): number {
        return this.configService.get<number>('PORT', 80);
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    // JWT
    get accessJwtSecret(): string {
        return this.configService.get<string>('ACCESS_JWT_SECRET')!;
    }

    get accessTokenExpire(): number {
        return this.configService.get<number>('ACCESS_TOKEN_EXPIRE', { infer: true })!;
    }

    get refreshJwtSecret(): string {
        return this.configService.get<string>('REFRESH_JWT_SECRET')!;
    }

    get refreshTokenExpire(): number {
        return this.configService.get<number>('REFRESH_TOKEN_EXPIRE', { infer: true })!;
    }

    // bcrypt
    get saltRounds(): number {
        return this.configService.get<number>('SALT_ROUNDS', { infer: true })!;
    }

    // 초기 어드민
    get initAdmin(): string {
        return this.configService.get<string>('INIT_ADMIN')!;
    }

    get initAdminPassword(): string {
        return this.configService.get<string>('INIT_ADMIN_PASSWORD')!;
    }

    get logDir(): string {
        return this.configService.get<string>('LOG_DIR', 'logs');
    }

    /** S3 버킷 URL (로그 저장용, 없으면 미설정) */
    get s3BucketUrl(): string | undefined {
        return this.configService.get<string>('S3_BUCKET_URL') || this.configService.get<string>('AWS_S3_BUCKET_URL');
    }

    /** S3 버킷 이름 (winston-s3-transport용) */
    get s3BucketName(): string | undefined {
        return this.configService.get<string>('AWS_S3_BUCKET_NAME');
    }

    /** AWS 리전 (S3용) */
    get awsRegion(): string {
        return this.configService.get<string>('AWS_REGION', 'ap-northeast-2');
    }

    // Google OAuth
    get googleClientId(): string | undefined {
        return this.configService.get<string>('GOOGLE_CLIENT_ID');
    }

    get googleClientSecret(): string | undefined {
        return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    }

    /** Android 앱용 클라이언트 ID (ID 토큰 검증 시 audience로 사용) */
    get googleAndroidClientId(): string | undefined {
        return this.configService.get<string>('GOOGLE_ANDROID_CLIENT_ID');
    }

    /** xAI API Key (Grok, X Search 등) */
    get xaiApiKey(): string | undefined {
        return this.configService.get<string>('XAI_API_KEY');
    }

    /** xAI 모델명 (responses API용) */
    get xaiModel(): string {
        return this.configService.get<string>('XAI_MODEL', 'grok-4-1-fast-reasoning');
    }

    /** Google Gemini API Key */
    get geminiApiKey(): string | undefined {
        return (
            this.configService.get<string>('GOOGLE_GENERATIVE_AI_API_KEY') ||
            this.configService.get<string>('GEMINI_API_KEY')
        );
    }

    /** Gemini 모델명 (기본: gemini-2.0-flash) */
    get geminiModel(): string {
        return this.configService.get<string>('GEMINI_MODEL', 'gemini-2.0-flash');
    }

    /** Pixabay API Key (이미지/비디오 검색) */
    get pixabayApiKey(): string | undefined {
        return this.configService.get<string>('PIXABAY_API_KEY');
    }
}
