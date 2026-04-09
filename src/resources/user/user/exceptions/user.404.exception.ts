import { NotFoundException } from 'src/common/exceptions';

export class UserNotFoundException extends NotFoundException {
    constructor() {
        super('유저를 찾을 수 없습니다');
    }
}
