import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Type, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../dto/pagination.dto';
import { mergeEnums } from './merge-enums.enum';

/**
 * 페이지네이션 DTO를 생성하는 헬퍼 함수
 *
 * @param enums - 정렬 옵션으로 사용할 enum 배열
 * @returns 페이지네이션 DTO 클래스
 *
 * @example
 * ```typescript
 * export class UserFindManyDto extends createPaginationDto([CREATED_AT, UPDATED_AT])
 *   implements IUserFindMany {}
 * ```
 */
export function createPaginationDto(enums: object[]): Type<PaginationDto & { sort?: string }> {
    // 입력 검증
    if (!Array.isArray(enums)) {
        throw new BadRequestException('enums는 배열이어야 합니다.');
    }

    if (enums.length === 0) {
        throw new BadRequestException('최소 하나의 enum이 필요합니다.');
    }

    // enum 병합
    const mergedEnum = mergeEnums(...enums);

    // 병합된 enum이 비어있는 경우
    if (Object.keys(mergedEnum).length === 0) {
        throw new BadRequestException('유효한 enum 값이 없습니다.');
    }

    class ResultDto extends PaginationDto {
        @ApiProperty({
            description: '정렬 옵션',
            enum: mergedEnum,
            required: false,
            example: Object.values(mergedEnum)[0],
        })
        @IsOptional()
        @IsEnum(mergedEnum, {
            message: `정렬 옵션은 다음 중 하나여야 합니다: ${Object.values(mergedEnum).join(', ')}`,
        })
        sort?: keyof typeof mergedEnum;
    }

    return ResultDto;
}
