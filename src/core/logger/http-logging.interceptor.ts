import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from './app-logger.service';

/**
 * HTTP 요청/응답 로깅 인터셉터
 * 모든 HTTP 요청을 자동으로 로그에 기록
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, originalUrl, ip, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const startTime = Date.now();

        // 요청 시작 로그
        this.logger.debug(`${method} ${originalUrl} - ${ip} - ${userAgent}`, 'HTTP');

        return next.handle().pipe(
            tap({
                next: () => {
                    const { statusCode } = response;
                    const duration = Date.now() - startTime;

                    // 응답 로그
                    this.logger.logRequest(method, originalUrl, statusCode, ip || 'unknown');

                    // 성능 로그 (500ms 이상 걸린 요청)
                    if (duration > 500) {
                        this.logger.warn(`Slow request: ${method} ${originalUrl} - ${duration}ms`, 'Performance');
                    }
                },
                error: error => {
                    const duration = Date.now() - startTime;
                    this.logger.error(
                        `${method} ${originalUrl} - ${error.message} - ${duration}ms`,
                        error.stack,
                        'HTTP Error',
                    );
                },
            }),
        );
    }
}
