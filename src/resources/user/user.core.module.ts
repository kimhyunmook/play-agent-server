import { Module } from '@nestjs/common';
import { UserAccountModule } from './user-account/user-account.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [UserModule, UserAccountModule],
    exports: [UserModule],
})
export class UserCoreModule {}
