import { DATABASE_GENERATOR } from './constant';

// Prisma 타입별 변환 매핑 타입 정의
type PrismaGeneratorPrismaTypes = Record<(typeof DatabaseGeneratorTransform.prismaTypes)[number], string>;
type PrismaToCaseTypes = Record<'property' | 'swagger' | 'transformer' | 'validator', PrismaGeneratorPrismaTypes>;

// Prisma 타입을 NestJS/TypeScript 타입으로 변환하는 클래스
export class DatabaseGeneratorTransform {
    constructor() {}

    // 지원하는 Prisma 타입 목록
    static readonly prismaTypes = [
        'String',
        'Decimal',
        'DateTime',
        'Int',
        'Float',
        'Boolean',
        'Json',
        'BigInt',
    ] as const;

    // Prisma 타입별 변환 매핑
    static readonly prisma: PrismaToCaseTypes = {
        // TypeScript 프로퍼티 타입
        property: {
            String: 'string',
            Decimal: 'Prisma.Decimal',
            DateTime: 'Date',
            Int: 'number',
            Float: 'number',
            Boolean: 'boolean',
            Json: 'Prisma.InputJsonValue',
            BigInt: 'bigint',
        },
        // Swagger ApiProperty 타입
        swagger: {
            String: 'String',
            Decimal: 'String',
            DateTime: 'Date',
            Int: 'Number',
            Float: 'Number',
            Boolean: 'Boolean',
            Json: 'String',
            BigInt: 'String',
        },
        // class-transformer 타입
        transformer: {
            String: 'String',
            Decimal: 'Prisma.Decimal',
            DateTime: 'Date',
            Int: 'Number',
            Float: 'Number',
            Boolean: 'Boolean',
            Json: 'String',
            BigInt: 'bigint',
        },
        // class-validator 데코레이터
        validator: {
            String: DATABASE_GENERATOR.VALIDATOR.IS_STRING,
            Decimal: DATABASE_GENERATOR.VALIDATOR.IS_PRISMA_DECIMAL,
            DateTime: DATABASE_GENERATOR.VALIDATOR.IS_DATE,
            Int: DATABASE_GENERATOR.VALIDATOR.IS_INT,
            Float: DATABASE_GENERATOR.VALIDATOR.IS_NUMBER,
            Boolean: DATABASE_GENERATOR.VALIDATOR.IS_BOOLEAN,
            Json: DATABASE_GENERATOR.VALIDATOR.IS_STRING,
            BigInt: DATABASE_GENERATOR.VALIDATOR.IS_BIGINT,
        },
    };
}
