import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { DateAtDto } from 'src/common/dto/date-at.dto';
import { Property } from 'ts-deco';

export class OrganizationModel extends IntersectionType(OmitType(DateAtDto, [])) implements Organization {
    @Property({ description: '아이디', type: String, nullable: false })
    id: string;

    @Property({ description: '이름', type: String, nullable: false })
    name: string;

    @Property({ description: '설명', type: String, nullable: false })
    description: string;
}
