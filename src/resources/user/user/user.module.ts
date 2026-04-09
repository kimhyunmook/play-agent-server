import { Module } from '@nestjs/common';
import { UserAccountModule } from '../user-account/user-account.module';
import { UserMgmtController } from './controllers/user.mgmt.controller';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
    imports: [UserAccountModule],
    controllers: [UserController, UserMgmtController],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
