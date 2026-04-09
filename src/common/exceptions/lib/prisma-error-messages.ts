/**
 * Prisma 에러 코드 → 메시지 매핑
 * HttpExceptionFilter와 함께 exceptions 모듈에서 관리
 */
export type PrismaErrorType = 'Conflict' | 'NotFound' | 'BadRequest' | 'InternalServerError';

export const PRISMA_ERROR_MAP: Partial<Record<string, { message: string; type: PrismaErrorType }>> = {
    P2002: { message: '중복된 데이터가 존재합니다', type: 'Conflict' },
    P2003: { message: '외래 키 제약 조건 위반', type: 'Conflict' },
    P2004: { message: '값 범위 초과', type: 'BadRequest' },
    P2005: { message: '잘못된 값', type: 'BadRequest' },
    P2006: { message: '유효성 검사 오류', type: 'BadRequest' },
    P2011: { message: '필수 값이 누락되었습니다', type: 'BadRequest' },
    P2012: { message: '필수 제약 조건 누락', type: 'BadRequest' },
    P2014: { message: '트랜잭션 실패', type: 'InternalServerError' },
    P2015: { message: '관련 레코드를 찾을 수 없습니다', type: 'NotFound' },
    P2016: { message: '쿼리 해석 오류', type: 'BadRequest' },
    P2017: { message: '관계 제약 조건 위반', type: 'Conflict' },
    P2018: { message: '필요한 연결 레코드를 찾을 수 없습니다', type: 'NotFound' },
    P2019: { message: '입력 오류', type: 'BadRequest' },
    P2020: { message: '값이 범위를 벗어났습니다', type: 'BadRequest' },
    P2021: { message: '테이블이 존재하지 않습니다', type: 'InternalServerError' },
    P2022: { message: '컬럼이 존재하지 않습니다', type: 'InternalServerError' },
    P2023: { message: '일관성 없는 컬럼 데이터', type: 'BadRequest' },
    P2024: {
        message: '연결 풀 시간 초과. 데이터베이스 연결을 확인하세요',
        type: 'InternalServerError',
    },
    P2025: { message: '데이터를 찾을 수 없습니다', type: 'NotFound' },
    P2034: { message: '트랜잭션 충돌', type: 'Conflict' },
};

export const PRISMA_ERROR_DEFAULTS = {
    known: { message: '데이터베이스 오류', type: 'BadRequest' as PrismaErrorType },
    unknown: { message: '서버 내부 오류', type: 'InternalServerError' as PrismaErrorType },
    validation: { message: '잘못된 요청 데이터', type: 'BadRequest' as PrismaErrorType },
};
