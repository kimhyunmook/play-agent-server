import 'dotenv/config';
import type { PrismaConfig } from 'prisma';
import { env } from 'prisma/config';

export default {
    schema: 'src/resources',
    migrations: {
        path: 'migrations',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
} satisfies PrismaConfig;
