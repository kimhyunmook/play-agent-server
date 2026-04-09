import { ConflictException } from 'src/common/exceptions';

/** User - 409 Conflict */
export class UserConflictException extends ConflictException {
    constructor(message = '데이터 충돌이 발생했습니다') {
        super(message);
    }
}

/** 이미 사용 중인 로그인 ID */
export class UserLoginIdConflictException extends UserConflictException {
    constructor() {
        super('이미 사용 중인 로그인 ID입니다.');
    }
}
