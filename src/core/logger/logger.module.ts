import { Global, Logger, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppLoggerService } from './app-logger.service';
import { winstonConfig } from './winston.config';

/**
 * 로거 모듈
 * Winston 기반 날짜별 로그 파일 저장
 */
@Global()
@Module({
    imports: [WinstonModule.forRoot(winstonConfig)],
    providers: [Logger, AppLoggerService],
    exports: [Logger, AppLoggerService, WinstonModule],
})
export class LoggerModule {}
