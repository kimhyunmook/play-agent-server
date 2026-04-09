import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
    constructor(message = '리소스를 찾을 수 없습니다') {
        super(HttpStatus.NOT_FOUND, message, HttpStatus.NOT_FOUND);
    }
}
