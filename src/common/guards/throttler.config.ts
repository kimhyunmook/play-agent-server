import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Rate Limiting 설정
 * Brute Force 공격 방어
 */
export const throttlerConfig: ThrottlerModuleOptions = [
    {
        name: 'default', // 기본 제한
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'), // 기본 1분
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'), // 기본 1분에 100번
    },
    {
        name: 'short', // 짧은 시간 제한 (빠른 요청 방지)
        ttl: 1000, // 1초
        limit: 3, // 1초에 3번
    },
    {
        name: 'medium', // 중간 시간 제한
        ttl: 10000, // 10초
        limit: 20, // 10초에 20번
    },
];

/**
 * 엔드포인트별 커스텀 제한
 * 인증 관련 엔드포인트에 대한 특별한 제한
 */
export const THROTTLE_SKIP_IF = {
    // 로그인 엔드포인트 - 엄격한 제한 (Brute Force 방어)
    login: {
        ttl: parseInt(process.env.LOGIN_THROTTLE_TTL || '60000'), // 기본 1분
        limit: parseInt(process.env.LOGIN_THROTTLE_LIMIT || '5'), // 기본 1분에 5번
    },

    // 회원가입 - 보통 제한 (스팸 방지)
    register: {
        ttl: parseInt(process.env.SIGNUP_THROTTLE_TTL || '3600000'), // 기본 1시간
        limit: parseInt(process.env.SIGNUP_THROTTLE_LIMIT || '3'), // 기본 1시간에 3번
    },
};
