import { DMMF } from '@prisma/generator-helper';

// import 맵 타입 정의 (키: { items: import 항목들, from: import 경로 })
export type DatabaseGeneratorImportMap = Map<string, { items: string[]; from: string }>;

// Prisma 모델 정보 인터페이스
export interface DatabaseGeneratorModel {
    readonly name: string; // 모델명
    readonly dbName: string | null; // DB 테이블명
    readonly schema: string | null; // 스키마명
    readonly fields: ReadonlyArray<DMMF.Field>; // 필드 목록
    readonly uniqueFields: ReadonlyArray<ReadonlyArray<string>>; // 유니크 필드 조합
    readonly uniqueIndexes: ReadonlyArray<DMMF.uniqueIndex>; // 유니크 인덱스
    readonly documentation?: string; // 모델 설명
    readonly primaryKey: DMMF.Model['primaryKey'] | null; // 기본키
    readonly isGenerated?: boolean; // 자동 생성 여부
}

// Prisma enum 정보 인터페이스
export interface DatabaseGeneratorEnum {
    name: string; // enum명
    values: DMMF.EnumValue[]; // enum 값 목록
    dbName?: string | null; // DB enum명
    documentation?: string; // enum 설명
}
