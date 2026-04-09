import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { DatabaseService } from './database.service';

@Global()
@Module({
    imports: [ConfigModule, LoggerModule],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {}
