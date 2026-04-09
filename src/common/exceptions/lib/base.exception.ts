import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from '../dto/api-error-response.dto';

/**
 * API 오류 응답 기초 익셉션
 * - code, message만 사용, data는 항상 null
 * - 하위 익셉션은 이 클래스를 상속하여 사용
 */
export class BaseException extends HttpException {
    readonly code: number;
    readonly message: string;

    constructor(statusCode: number, message: string, httpStatus: HttpStatus = HttpStatus.BAD_REQUEST) {
        const response: ApiErrorResponse = {
            code: statusCode,
            message,
            data: null,
        };
        super(response, httpStatus);

        this.code = statusCode;
        this.message = message;
        Object.setPrototypeOf(this, BaseException.prototype);
    }

    getResponse(): ApiErrorResponse {
        return {
            code: this.code,
            message: this.message,
            data: null,
        };
    }
}
