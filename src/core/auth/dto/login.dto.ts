import { PickType } from '@nestjs/swagger';
import { UserAccountModel } from 'src/resources/user/user-account/user-account.model';

export class LoginDto extends PickType(UserAccountModel, ['loginId', 'password']) {}
