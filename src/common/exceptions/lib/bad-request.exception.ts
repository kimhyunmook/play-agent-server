import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BadRequestException extends BaseException {
    constructor(message = '잘못된 요청입니다') {
        super(HttpStatus.BAD_REQUEST, message, HttpStatus.BAD_REQUEST);
    }
}
