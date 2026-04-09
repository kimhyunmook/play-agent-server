import { NestExpressApplication } from '@nestjs/platform-express';
import { AppLoggerService } from '../logger/app-logger.service';

export function logServerStart(app: NestExpressApplication, port: number, nodeEnv: string) {
    const logger = app.get(AppLoggerService);

    const envKo = nodeEnv === 'production' ? '운영' : nodeEnv === 'development' ? '개발' : '스테이징';
    logger.log(`서버 시작됨 | 포트: ${port} | 환경: ${envKo} | URL: http://localhost:${port}`);
    if (nodeEnv !== 'production') {
        logger.log(`API 문서: http://localhost:${port}/api-docs`);
    }
    logger.log(`보안: Helmet, CORS 활성화됨`);
}
