import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClsModule } from 'nestjs-cls';
import { CommonModule } from './common/utils/common.module';
import { AppConfigModule } from './core/config/app-config.module';
import { DatabaseModule } from './core/database/database.module';
import { DatabaseService } from './core/database/database.service';
import { LoggerModule } from './core/logger/logger.module';
import { SwaggerModule } from './core/swagger/swagger.module';
import { AgentModule } from './resources/agent/agent.module';
import { UserCoreModule } from './resources/user/user.core.module';

@Module({
    imports: [
        AppConfigModule,
        LoggerModule,
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true },
            plugins: [
                new ClsPluginTransactional({
                    imports: [DatabaseModule],
                    adapter: new TransactionalAdapterPrisma({
                        prismaInjectionToken: DatabaseService,
                        sqlFlavor: 'postgresql',
                    }),
                }),
            ],
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const expireSeconds = configService.get<number>('ACCESS_TOKEN_EXPIRE');
                return {
                    secret: configService.get<string>('ACCESS_JWT_SECRET'),
                    signOptions: {
                        expiresIn: expireSeconds,
                    },
                };
            },
            global: true,
        }),
        SwaggerModule,
        CommonModule,

        // resources
        UserCoreModule,
        AgentModule,
    ],
})
export class AppModule {}
