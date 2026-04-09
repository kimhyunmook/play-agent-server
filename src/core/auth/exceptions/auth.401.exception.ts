import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exceptions';

/** Auth - 401 Unauthorized */
export class AuthUnauthorizedException extends BaseException {
    constructor(message = '인증이 필요합니다') {
        super(HttpStatus.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }
}

export class AuthUnauthorizedRefreshTokenException extends BaseException {
    constructor() {
        super(HttpStatus.UNAUTHORIZED, '유효하지 않은 리프레시 토큰입니다', HttpStatus.UNAUTHORIZED);
    }
}

export class AuthUnauthorizedUserException extends BaseException {
    constructor() {
        super(HttpStatus.UNAUTHORIZED, '사용할 수 없는 계정입니다', HttpStatus.UNAUTHORIZED);
    }
}

export class AuthUnauthorizedLoginIdException extends BaseException {
    constructor() {
        super(HttpStatus.UNAUTHORIZED, '아이디 또는 비밀번호가 일치하지 않습니다', HttpStatus.UNAUTHORIZED);
    }
}
