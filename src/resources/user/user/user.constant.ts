export class UserConstant {
    public static NAME = '유저';
    public static ADMIN_NAME = '관리자';

    static readonly FIND_MANY_SORT = {
        CREATED_AT_ASC: 'CREATED_AT:ASC',
        CREATED_AT_DESC: 'CREATED_AT:DESC',
    } as const;
}
