import 'dotenv/config';

/**
 * 프로덕션 환경에서 DEBUG로 인한 Prisma/SQL 로그 출력 차단
 * (debug 패키지는 PrismaClient log 설정과 별도로 stderr에 직접 출력함)
 */
if (process.env.NODE_ENV?.toLowerCase().includes('prod')) {
    const debug = process.env.DEBUG;
    if (debug) {
        const filtered = debug
            .split(',')
            .map(s => s.trim())
            .filter(s => !s.startsWith('prisma'));
        process.env.DEBUG = filtered.length > 0 ? filtered.join(',') : '';
    }
}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { WinstonLogger } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions';
import { AppConfigService } from './core/config/app-config.service';
import { logServerStart } from './core/config/logger.setup';
import { setupSecurity } from './core/config/security.setup';
import { setupValidation } from './core/config/validation.setup';
import { AppLoggerService } from './core/logger/app-logger.service';
import { winstonConfig } from './core/logger/winston.config';
import { SwaggerService } from './core/swagger/swagger.service';

const bootstrapLogger = new WinstonLogger(winston.createLogger(winstonConfig));

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: bootstrapLogger,
    });

    app.use(cookieParser());

    const env = new AppConfigService(new ConfigService());

    const configService = app.get(ConfigService);

    app.useLogger(app.get(AppLoggerService));

    setupSecurity(app, configService);

    setupValidation(app, configService);

    app.useGlobalFilters(new HttpExceptionFilter());

    const swaggerService = app.get(SwaggerService);
    swaggerService.setup(app);

    const port = env.port;
    const nodeEnv = env.nodeEnv;

    await app.listen(port);

    logServerStart(app, port, nodeEnv);
}

bootstrap().catch(err => {
    bootstrapLogger.error(err?.message ?? String(err), err?.stack, err?.name ?? 'Bootstrap');
    process.exit(1);
});
