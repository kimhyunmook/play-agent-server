import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Agent } from '@prisma/client';
import { DateAtDto } from 'src/common/dto/date-at.dto';
import { Property } from 'ts-deco';

export class AgentModel extends IntersectionType(OmitType(DateAtDto, [])) implements Agent {
    @Property({ description: '아이디', type: String, nullable: false })
    id: string;

    @Property({ description: '생성자 아이디', type: Number, nullable: false })
    creatorId: number;

    @Property({ description: '이름', type: String, nullable: false })
    name: string;

    @Property({ description: '설명', type: String, nullable: false })
    description: string;

    @Property({ description: '작업', type: String, nullable: false })
    task: string;
}
