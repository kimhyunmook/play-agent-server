import { IntersectionType, OmitType } from '@nestjs/swagger';
import { UserModel } from '../models/user.model';

export class UserUpdateDto extends IntersectionType(
    OmitType(UserModel, ['id', 'createdAt', 'updatedAt', 'deletedAt', 'role']),
) {}
