import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { DateAtDto } from 'src/common/dto/date-at.dto';
import { Property } from 'ts-deco';

export class UserModel extends IntersectionType(OmitType(DateAtDto, [])) implements User {
    @Property({ description: '아이디', type: Number, nullable: false })
    id: number;

    @Property({ description: '이름', type: String, nullable: true })
    name: string | null;

    @Property({ description: '이메일', type: String, nullable: false })
    email: string;

    @Property({ description: '프로필', type: String, nullable: true })
    profile: string | null;

    @Property({ description: '권한', enum: Role, nullable: false })
    role: Role;
}
