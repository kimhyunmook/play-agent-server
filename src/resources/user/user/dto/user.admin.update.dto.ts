import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { UserModel } from '../models/user.model';
import { UserUpdateDto } from './user.update.dto';

/** 관리자용 유저 수정 DTO - role 수정 가능 */
export class UserAdminUpdateDto extends IntersectionType(UserUpdateDto, PartialType(PickType(UserModel, ['role']))) {}
