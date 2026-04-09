import { registerDecorator, ValidationOptions, ValidationArguments, isEmail } from 'class-validator';

/**
 * 이메일 또는 특정 사용자명을 허용하는 커스텀 validator
 * @param allowedUsernames - 허용할 사용자명 목록 (기본값: ['admin'])
 * @param validationOptions - ValidationOptions
 */
export function IsEmailOrUsername(allowedUsernames: string[] = ['admin'], validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isEmailOrUsername',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [allowedUsernames],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const [usernames] = args.constraints as [string[]];

                    // 허용된 사용자명 목록에 있으면 통과
                    if (Array.isArray(usernames) && usernames.includes(value)) {
                        return true;
                    }

                    // 아니면 이메일 형식 검증
                    return isEmail(value);
                },
                defaultMessage(args: ValidationArguments) {
                    const [usernames] = args.constraints as [string[]];
                    return `${args.property}은(는) 유효한 이메일 형식이거나 다음 중 하나여야 합니다: ${Array.isArray(usernames) ? usernames.join(', ') : ''}`;
                },
            },
        });
    };
}
