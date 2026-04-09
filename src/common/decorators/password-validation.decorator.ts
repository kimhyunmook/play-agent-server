import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * 강력한 비밀번호 정책 검증
 * - 최소 8자 이상
 * - 대문자 1개 이상
 * - 소문자 1개 이상
 * - 숫자 1개 이상
 * - 특수문자 1개 이상
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    // 최소 8자
                    if (value.length < 8) {
                        return false;
                    }

                    // 대문자 포함
                    if (!/[A-Z]/.test(value)) {
                        return false;
                    }

                    // 소문자 포함
                    if (!/[a-z]/.test(value)) {
                        return false;
                    }

                    // 숫자 포함
                    if (!/[0-9]/.test(value)) {
                        return false;
                    }

                    // 특수문자 포함
                    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
                        return false;
                    }

                    return true;
                },
                defaultMessage() {
                    return '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.';
                },
            },
        });
    };
}
