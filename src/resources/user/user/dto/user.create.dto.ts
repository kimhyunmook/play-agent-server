import { IntersectionType, PickType } from '@nestjs/swagger';
import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { UserModel } from '../models/user.model';
import { UserAccountModel } from '../../user-account/user-account.model';

export class UserCreateDto extends IntersectionType(
    CreateDtoFromModel({
        model: UserModel,
        pick: ['email', 'name'],
        optional: ['role'],
    }),
    PickType(UserAccountModel, ['loginId', 'password']),
) {}
