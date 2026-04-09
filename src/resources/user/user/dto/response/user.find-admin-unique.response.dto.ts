import { OmitType, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserModel } from '../../models/user.model';
import { UserAccountModel } from '../../../user-account/user-account.model';

class AdminUserAccountData extends PickType(UserAccountModel, ['loginId', 'status']) {}

class AdminUserFindUniqueData extends OmitType(UserModel, ['deletedAt']) {
    userAccount: AdminUserAccountData | null;
}

export class UserFindAdminUniqueResponseDto extends ResponseDto {
    data: AdminUserFindUniqueData;
}
