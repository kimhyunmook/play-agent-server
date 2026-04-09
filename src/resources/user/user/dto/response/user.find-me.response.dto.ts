import { OmitType } from '@nestjs/swagger';
import { UserModel } from '../../models/user.model';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserAccountModel } from 'src/resources/user/user-account/user-account.model';

class UserAccountData extends OmitType(UserAccountModel, ['userId']) {}

class UserFindMeData extends OmitType(UserModel, ['deletedAt']) {
    userAccount: UserAccountData | null;
}
export class UserFindMeResponseDto extends ResponseDto {
    data: UserFindMeData;
}
