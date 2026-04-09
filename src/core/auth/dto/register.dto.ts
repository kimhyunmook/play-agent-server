import { IntersectionType, OmitType } from '@nestjs/swagger';
import { UserCreateDto } from 'src/resources/user/user/dto/user.create.dto';

export class RegisterDto extends IntersectionType(OmitType(UserCreateDto, ['role', 'loginId'])) {}

export class AdminRegisterDto extends IntersectionType(OmitType(UserCreateDto, ['role'])) {}
