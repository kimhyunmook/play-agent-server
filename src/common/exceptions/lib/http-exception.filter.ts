import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { BaseException } from './base.exception';
import { ApiErrorResponse } from '../dto/api-error-response.dto';
import { mapPrismaClientKnownRequestToHttpException } from './prisma-known-request.mapper';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const normalized =
            exception instanceof Prisma.PrismaClientKnownRequestError
                ? mapPrismaClientKnownRequestToHttpException(exception)
                : exception;

        const errorResponse = this.toApiErrorResponse(normalized);

        this.logger.warn(`[${request.method}] ${request.url} - ${errorResponse.code}: ${errorResponse.message}`);

        response.status(this.getHttpStatus(normalized)).json(errorResponse);
    }

    private toApiErrorResponse(exception: unknown): ApiErrorResponse {
        if (exception instanceof BaseException) {
            return exception.getResponse();
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();
            const message =
                typeof res === 'object' && res !== null && 'message' in res
                    ? (res as { message?: string | string[] }).message
                    : exception.message;

            return {
                code: status,
                message: Array.isArray(message) ? message.join(', ') : String(message),
                data: null,
            };
        }

        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: '서버 내부 오류가 발생했습니다',
            data: null,
        };
    }

    private getHttpStatus(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
