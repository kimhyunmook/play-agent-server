import { Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { AppLoggerService } from '../logger/app-logger.service';
import { createErrorMappingExtension } from './database.core';

const PRISMA_LOG_LEVELS = {
    production: ['error'] as const,
    prodcution: ['error'] as const, // NODE_ENV 오타 대응
    prod: ['error'] as const,
    local: ['query', 'info', 'warn', 'error'] as const,
    develop: ['query', 'info', 'warn', 'error'] as const,
    development: ['query', 'info', 'warn', 'error'] as const,
} as const;
const PRODUCTION_LOG_LEVELS = ['error'] as const;
const DEFAULT_LOG_LEVELS = ['warn', 'error'] as const;
/** 쿼리 로그 포함 (prisma:query 로그 출력) */
const LOG_LEVELS_WITH_QUERY = ['query', 'info', 'warn', 'error'] as const;

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private extendedClient: any;

    constructor(
        private readonly customLogger: AppLoggerService,
        private readonly configService: ConfigService,
    ) {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
            throw new InternalServerErrorException('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
        }
        const env = configService.get<string>('NODE_ENV', 'development').toLowerCase();
        const baseLog =
            PRISMA_LOG_LEVELS[env as keyof typeof PRISMA_LOG_LEVELS] ??
            (env.includes('prod') ? PRODUCTION_LOG_LEVELS : DEFAULT_LOG_LEVELS);
        // PRISMA_LOG_QUERY: "true"|"1" = 쿼리 로그 켜기, "false"|"0" = 끄기, 미설정 = NODE_ENV 기준
        const logQueryEnv = configService.get<string>('PRISMA_LOG_QUERY');
        const enableQueryLog = logQueryEnv === 'true' || logQueryEnv === '1';
        const disableQueryLog = logQueryEnv === 'false' || logQueryEnv === '0';
        const logLevels =
            logQueryEnv === undefined
                ? baseLog
                : enableQueryLog
                  ? LOG_LEVELS_WITH_QUERY
                  : disableQueryLog
                    ? (baseLog.filter((level: (typeof baseLog)[number]) => level !== 'query') as ReadonlyArray<
                          Exclude<(typeof baseLog)[number], 'query'>
                      >)
                    : baseLog;
        super({
            adapter: new PrismaPg(new Pool({ connectionString })),
            log: [...logLevels],
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.extendedClient = this.createExtendedClient();
    }

    get client() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.extendedClient ?? (this.extendedClient = this.createExtendedClient());
    }

    private createExtendedClient() {
        return this.$extends(createErrorMappingExtension(this.customLogger));
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
