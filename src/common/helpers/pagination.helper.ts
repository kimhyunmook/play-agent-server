import { getOrderBy, OrderByMap } from './order-by.helper';

/**
 * Prisma findMany 페이지네이션 옵션 생성
 */
export interface PaginationParams {
    page: number;
    take: number;
    sort?: string;
    orderByMap?: OrderByMap;
    defaultOrderBy?: any;
}

export interface PaginationOptions {
    take: number;
    skip: number;
    orderBy: any;
}

/**
 * Prisma findMany용 페이지네이션 옵션 생성
 *
 * @example
 * const { take, skip, orderBy } = createPaginationOptions({
 *   page,
 *   take,
 *   sort,
 * });
 *
 * @example
 * // 커스텀 정렬 추가
 * const options = createPaginationOptions({
 *   page,
 *   take,
 *   sort,
 *   orderByMap: {
 *     popular: { likeCount: "desc" },
 *   },
 * });
 */
export function createPaginationOptions({
    page,
    take,
    sort,
    orderByMap,
    defaultOrderBy,
}: PaginationParams): PaginationOptions {
    return {
        take,
        skip: (page - 1) * take,
        orderBy: getOrderBy(sort, orderByMap, defaultOrderBy),
    };
}
