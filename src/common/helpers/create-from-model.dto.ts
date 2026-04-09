import { Type, BadRequestException } from '@nestjs/common';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

/**
 * 모델에서 필수 및 선택적 필드를 조합하여 DTO를 생성하는 헬퍼 함수
 *
 * @param model - 대상 클래스(Model DTO)
 * @param pick - 필수로 가져올 필드 배열
 * @param optional - 선택적으로 만들 필드 배열
 * @returns 조합된 DTO 클래스
 *
 * @example
 * ```typescript
 * export class UserCreateDto extends CreateDtoFromModel({
 *   model: UserModel,
 *   pick: ["email", "name"],
 *   optional: ["role", "phone"],
 * }) {}
 * ```
 */
export function CreateDtoFromModel<T, P extends readonly (keyof T)[] = [], O extends readonly (keyof T)[] = []>({
    model,
    pick,
    optional,
}: {
    model: Type<T>;
    pick: P;
    optional: O;
}): Type<Pick<T, P[number]> & Partial<Pick<T, O[number]>>> {
    // 입력 검증
    if (!model) {
        throw new BadRequestException('모델은 필수 값입니다.');
    }

    if (!Array.isArray(pick)) {
        throw new BadRequestException('pick은 배열이어야 합니다.');
    }

    if (!Array.isArray(optional)) {
        throw new BadRequestException('optional은 배열이어야 합니다.');
    }

    // 필수 필드가 없는 경우 전체 모델 사용
    if (pick.length === 0 && optional.length === 0) {
        return model;
    }

    // 필수 필드만 pick
    const BaseMandatory = pick.length > 0 ? PickType(model, pick as readonly (keyof T)[]) : class {};

    // 선택적 필드 pick
    const BaseOptional =
        optional.length > 0 ? PickType(PartialType(model), optional as readonly (keyof T)[]) : class {};

    // 필수 필드가 있고 선택적 필드도 있는 경우
    if (pick.length > 0 && optional.length > 0) {
        return IntersectionType(BaseMandatory, BaseOptional) as Type<Pick<T, P[number]> & Partial<Pick<T, O[number]>>>;
    }

    // 필수 필드만 있는 경우
    if (pick.length > 0) {
        return BaseMandatory as Type<Pick<T, P[number]>>;
    }

    // 선택적 필드만 있는 경우
    return BaseOptional as Type<Pick<T, P[number]> & Partial<Pick<T, O[number]>>>;
}
