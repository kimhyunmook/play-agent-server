import { HttpStatus } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions';

/** Auth - 400 Bad Request */
export class AuthBadRequestException extends BadRequestException {
    constructor(message = '잘못된 요청입니다') {
        super(message);
    }
}

export class AuthRefreshTokenRequiredException extends AuthBadRequestException {
    constructor() {
        super('리프레시 토큰이 필요합니다');
    }
}
