import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exceptions';

/** User - 401 Unauthorized */
export class UserUnauthorizedPasswordException extends BaseException {
    constructor() {
        super(HttpStatus.UNAUTHORIZED, '현재 비밀번호가 일치하지 않습니다', HttpStatus.UNAUTHORIZED);
    }
}
