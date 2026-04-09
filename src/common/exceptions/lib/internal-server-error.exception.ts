import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class InternalServerErrorException extends BaseException {
    constructor(message = '서버 내부 오류가 발생했습니다') {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
