import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppConfigService } from './app-config.service';

/**
 * 기간 문자열을 초 단위 숫자로 변환
 * 예: "7d" → 604800, "24h" → 86400, "30m" → 1800, "3600" → 3600
 */
function parseDuration(value: string | number): number {
    if (typeof value === 'number') return value;
    const str = String(value).trim();
    const match = str.match(/^(\d+)(d|h|m|s)?$/i);
    if (!match) throw new Error(`기간 형식이 올바르지 않습니다: ${str} (예: 7d, 24h, 30m, 3600s)`);
    const num = parseInt(match[1], 10);
    const unit = (match[2] ?? 's').toLowerCase();
    const multipliers: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };
    return num * multipliers[unit];
}

const durationSchema = Joi.custom((value, helpers) => {
    try {
        return parseDuration(value);
    } catch {
        return helpers.error('any.invalid', {
            message: '숫자 또는 기간 형식(7d, 24h, 30m, 3600s)이어야 합니다',
        });
    }
});

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('local', 'development', 'production').required(),
                APP_NAME: Joi.string().required(),
                APP_DESCRIPTION: Joi.string(),
                APP_VERSION: Joi.string().default('1.0'),
                LOG_DIR: Joi.string().required(),
                DATABASE_URL: Joi.string().required(),
                PORT: Joi.number().default(80),
                SALT_ROUNDS: Joi.number().required(),
                ACCESS_JWT_SECRET: Joi.string().required(),
                ACCESS_TOKEN_EXPIRE: durationSchema.required(),
                REFRESH_JWT_SECRET: Joi.string().required(),
                REFRESH_TOKEN_EXPIRE: durationSchema.required(),
                INIT_ADMIN: Joi.string().required(),
                INIT_ADMIN_PASSWORD: Joi.string().required(),
                // Google OAuth
                GOOGLE_CLIENT_ID: Joi.string().optional(),
                GOOGLE_CLIENT_SECRET: Joi.string().optional(),
                GOOGLE_ANDROID_CLIENT_ID: Joi.string().optional(),
                // xAI (Grok, X Search)
                XAI_API_KEY: Joi.string().optional(),
                XAI_MODEL: Joi.string().default('grok-4-1-fast-reasoning'),
                // Pixabay (이미지/비디오)
                PIXABAY_API_KEY: Joi.string().optional(),
            }),
            validationOptions: {
                abortEarly: true, // 첫 번째 오류 발생 시 멈춤
            },
        }),
    ],
    providers: [AppConfigService],
    exports: [AppConfigService],
})
export class AppConfigModule {}
