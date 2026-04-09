import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ConflictException extends BaseException {
    constructor(message = '데이터 충돌이 발생했습니다') {
        super(HttpStatus.CONFLICT, message, HttpStatus.CONFLICT);
    }
}
