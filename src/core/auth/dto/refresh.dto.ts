import { Property } from 'ts-deco';

export class RefreshDto {
    @Property({ type: String, isOptional: true, nullable: true })
    refreshToken?: string;
}
