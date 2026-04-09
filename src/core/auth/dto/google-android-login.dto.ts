import { Property } from 'ts-deco';

export class GoogleAndroidLoginDto {
    @Property({
        type: String,
        nullable: false,
        isNotEmpty: true,
        notEmptyMessage: 'idToken은 필수입니다.',
    })
    idToken: string;
}
