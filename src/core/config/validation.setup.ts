import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

/**
 * Validation 설정
 * - Global Validation Pipe
 * - Body Parser
 */
export function setupValidation(app: NestExpressApplication, configService: ConfigService) {
    // Body Parser 설정
    app.useBodyParser('json', { limit: '5mb' });

    // Global Validation Pipe
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // DTO에 없는 속성 제거
            forbidNonWhitelisted: true, // DTO에 없는 속성 있으면 에러
            stopAtFirstError: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            disableErrorMessages: configService.get<string>('NODE_ENV') === 'production',
        }),
    );
}
