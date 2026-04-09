import { Property } from 'ts-deco';

export class DateAtDto {
    @Property({ description: '생성일', type: Date, nullable: false })
    createdAt: Date;

    @Property({ description: '수정일', type: Date, nullable: true })
    updatedAt: Date | null;

    @Property({ description: '삭제일', type: Date, nullable: true })
    deletedAt: Date | null;
}
