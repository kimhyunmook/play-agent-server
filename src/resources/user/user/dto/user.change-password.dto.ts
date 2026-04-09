import { Property } from 'ts-deco';

export class UserChangePasswordDto {
    @Property({ type: String, nullable: false, isNotEmpty: true })
    currentPassword: string;

    @Property({ type: String, nullable: false, isNotEmpty: true })
    newPassword: string;
}
