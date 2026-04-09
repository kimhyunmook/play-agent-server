import { ConfigService } from '@nestjs/config';
import * as c from 'ansi-colors';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import S3Transport from 'winston-s3-transport';
import { AppConfigService } from '../config/app-config.service';

/**
 * S3 버킷 미설정 시 발생하는 예외
 */
export class S3NotConfiguredException extends Error {
    constructor() {
        super(
            'S3 버킷 URL이 설정되지 않았습니다. 로그 저장을 위해 S3_BUCKET_URL 또는 AWS_S3_BUCKET_NAME 환경변수를 설정해주세요.',
        );
        this.name = 'S3NotConfiguredException';
    }
}

/**
 * Winston 로거 설정
 * - S3 버킷 URL/이름이 env에 있을 때만 로그 저장(S3) 실행
 * - 없을 때는 S3 transport를 건너뜀 (콘솔만 사용)
 */
const env = new AppConfigService(new ConfigService());

/** 로그 저장용 transport 생성 (S3 버킷 URL 존재 시에만, 없으면 빈 배열) */
const createStorageTransports = (): winston.transport[] => {
    const s3BucketUrl = env.s3BucketUrl;
    const s3BucketName = env.s3BucketName;

    if (s3BucketUrl || s3BucketName) {
        const bucket = s3BucketName ?? (s3BucketUrl ? parseBucketNameFromUrl(s3BucketUrl) : null);
        if (!bucket) return [];
        const s3Transport = new S3Transport({
            s3ClientConfig: { region: env.awsRegion },
            s3TransportConfig: {
                bucket,
                bucketPath: (groupId: string) => {
                    const now = new Date();
                    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    return `/logs/${dateStr}/${groupId}/app.log`;
                },
                group: 'default',
            },
        });
        return [s3Transport];
    }

    return [];
};

/** S3 URL에서 버킷 이름 파싱 (https://bucket-name.s3.region.amazonaws.com 형식) */
function parseBucketNameFromUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname;
        const match = host.match(/^([^.]+)\.s3/);
        return match ? match[1] : host.split('.')[0] || null;
    } catch {
        return url || null;
    }
}

// 숨길 로그 패턴 (NestJS 시스템 로그)
const HIDDEN_PATTERNS = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory',
    'Mapped {',
    'Database connected',
    'Database disconnected',
];

// 프로덕션에서만 숨길 로그 패턴 (Prisma/SQL 관련)
const PRODUCTION_HIDDEN_PATTERNS = [
    'prisma:query',
    'prisma:engine',
    'prisma:client',
    'prisma:',
    'Database Query',
    ' FROM "public"."', // Prisma SQL 포맷
];

// 로그 필터 (특정 패턴 제외)
const filterFormat = winston.format(info => {
    const message = typeof info.message === 'string' ? info.message : '';
    const context = typeof info.context === 'string' ? info.context : '';
    const fullText = `${context} ${message}`;

    // 숨길 패턴이 있으면 null 반환 (로그 제외)
    if (HIDDEN_PATTERNS.some(pattern => fullText.includes(pattern))) {
        return false;
    }

    // 프로덕션 환경에서 prisma:query 등 추가 패턴 숨김
    if (env.isProduction && PRODUCTION_HIDDEN_PATTERNS.some(pattern => fullText.includes(pattern))) {
        return false;
    }

    return info;
})();

// 로그 포맷 정의
const logFormat = winston.format.combine(
    filterFormat, // 필터 먼저 적용
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

// [NestApplication] 컨텍스트 로그에 시안(cyan) 색상 적용
const nestAppColorFormat = winston.format(info => {
    if (
        info.context === 'NestApplication' ||
        String(typeof info.message === 'string' ? info.message : '').includes('[NestApplication]')
    ) {
        info.message = c.cyan(typeof info.message === 'string' ? info.message : String(info.message));
    }
    return info;
})();

// 콘솔 출력 포맷 (개발 환경용)
const consoleFormat = winston.format.combine(
    filterFormat, // 필터 적용
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike(env.appName, {
        colors: true,
        prettyPrint: true,
    }),
    nestAppColorFormat, // NestApplication 로그 시안 색상
);

// Winston storage transports (S3 버킷 URL 존재 시에만, 없으면 빈 배열)
const storageTransports = createStorageTransports();

// Winston 인스턴스 생성
export const winstonConfig = {
    transports: [
        // 콘솔 출력
        new winston.transports.Console({
            level: env.isProduction ? 'info' : 'debug',
            format: consoleFormat, // dev/prod 동일 포맷, prod에서만 Prisma 쿼리 필터링
        }),
        // S3 저장
        ...storageTransports,
    ],
    // 처리되지 않은 예외/rejection도 S3 로그에 포함
    exceptionHandlers: storageTransports,
    rejectionHandlers: storageTransports,
};

// Winston 인스턴스 생성 함수
export const createWinstonLogger = () => {
    return winston.createLogger(winstonConfig);
};
