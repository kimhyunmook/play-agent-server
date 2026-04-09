import { Module } from '@nestjs/common';
import { UserAccountRepository } from './user-account.repository';

@Module({
    imports: [],
    providers: [UserAccountRepository],
    exports: [UserAccountRepository],
})
export class UserAccountModule {}
