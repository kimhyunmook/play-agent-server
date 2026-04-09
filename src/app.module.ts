import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/app-config.module';
import { LoggerModule } from './core/logger/logger.module';
import { SwaggerModule } from './core/swagger/swagger.module';

@Module({
    imports: [AppConfigModule, LoggerModule, SwaggerModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
