/**
 * Prisma orderBy 헬퍼
 * sort 문자열을 Prisma orderBy 객체로 변환
 */

export interface OrderByMap {
    [key: string]: any;
}

/**
 * Enum 형식의 sort 값을 파싱 (예: "CREATED_AT:DESC" → { createdAt: "desc" })
 */
function parseEnumSort(sort: string): any {
    const [field, direction] = sort.split(':');

    if (!field || !direction) {
        return null;
    }

    // CREATED_AT → createdAt (카멜케이스 변환)
    const camelField = field.toLowerCase().replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

    return { [camelField]: direction.toLowerCase() };
}

/**
 * sort 문자열을 Prisma orderBy 객체로 변환
 *
 * @example
 * // Enum 자동 파싱 (FIELD:DIRECTION 형식)
 * getOrderBy("CREATED_AT:DESC") // → { createdAt: "desc" }
 * getOrderBy("NAME:ASC")        // → { name: "asc" }
 *
 * // 커스텀 매핑 사용
 * getOrderBy(sort, {
 *   latest: { createdAt: "desc" },
 *   oldest: { createdAt: "asc" },
 *   popular: { likeCount: "desc" },
 * })
 */
export function getOrderBy(
    sort: string | undefined,
    orderByMap?: OrderByMap,
    defaultOrderBy: any = { createdAt: 'desc' },
): any {
    if (!sort) return defaultOrderBy;

    // 1. orderByMap에 정의된 매핑이 있으면 우선 사용
    if (orderByMap && orderByMap[sort]) {
        return orderByMap[sort];
    }

    // 2. Enum 형식(FIELD:DIRECTION)이면 자동 파싱
    if (sort.includes(':')) {
        const parsed = parseEnumSort(sort);
        if (parsed) return parsed;
    }

    // 3. 매칭되지 않으면 기본값
    return defaultOrderBy;
}
