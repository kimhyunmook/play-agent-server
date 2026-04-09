import { OmitType } from '@nestjs/swagger';
import { UserModel } from '../../models/user.model';
import { ListResponseDto } from 'src/common/dto/list-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';

export class UserFindManyResponseDto extends ListResponseDto {
    data: UserFindManyData[];
}
class UserFindManyData extends OmitType(UserModel, []) {}

/** 관리자 목록 조회 - deletedAt 제외 */
export class AdminUserFindManyResponseDto extends ListResponseDto {
    data: AdminUserFindManyData[];
}
class AdminUserFindManyData extends OmitType(UserModel, ['deletedAt']) {}

export class UserFindUniqueResponseDto extends ResponseDto {
    data: UserFindUniqueData;
}

class UserFindUniqueData extends OmitType(UserModel, ['deletedAt']) {}
