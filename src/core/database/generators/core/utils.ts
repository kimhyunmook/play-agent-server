import { DatabaseGeneratorEnum, DatabaseGeneratorImportMap, DatabaseGeneratorModel } from './type';
import * as fs from 'node:fs';
import * as path from 'path';
import { DATABASE_GENERATOR } from './constant';
import { DatabaseGeneratorTransform } from './transform';
import { DMMF } from '@prisma/generator-helper';

/**
 * 데이터베이스 코드 생성을 위한 유틸리티 클래스
 *
 * Prisma 스키마를 기반으로 NestJS용 코드를 자동 생성하는 도구들을 제공합니다.
 * 주요 기능:
 * - Import 문 관리 및 생성
 * - 모델 프로퍼티 및 데코레이터 생성
 * - 파일 시스템 유틸리티
 * - 문자열 변환 함수들
 */

export class DatabaseGeneratorUtils {
    // =================================================================
    // Import 관리 메서드들
    // =================================================================

    /**
     * import 맵에 import 정보를 등록합니다
     */
    static registerByImport(map: DatabaseGeneratorImportMap, key: string, from: string, items: string[] = []) {
        return map.set(key, { items, from });
    }

    /**
     * import 맵에 항목 추가
     */
    static setItemByImport(map: DatabaseGeneratorImportMap, key: string, item: string): void {
        const resource = map.get(key);
        if (resource) {
            resource.items.push(item);
        } else {
            throw new Error(`Import map key '${key}' is not registered`);
        }
    }

    /**
     * import문 문자열 생성 (중복/빈 값 제거)
     */
    static getImportValues(map: DatabaseGeneratorImportMap): string {
        const imports: string[] = [];

        for (const [, value] of map) {
            // 중복 제거 및 빈 값 필터링
            const uniqueItems = [...new Set(value.items)].filter(Boolean);

            if (uniqueItems.length > 0) {
                imports.push(`import { ${uniqueItems.join(', ')} } from '${value.from}';`);
            }
        }

        return imports.join('\n');
    }

    // =================================================================
    // 코드 생성 메서드들
    // =================================================================

    /**
     * Prisma 모델 필드 기반으로 프로퍼티/데코레이터 코드를 생성합니다
     */
    static getModelProperties(
        model: DatabaseGeneratorModel,
        enums: DatabaseGeneratorEnum[],
        modelImportMap: DatabaseGeneratorImportMap,
        isForDto = false,
        includeRelations = false,
    ): string {
        const { MAP_KEY, ENUM_PREFIX, TRANSFORM, VALIDATOR, PRISMA, EXCLUDE_ENUM_VALUE, CUSTOM_TRANSFORM } =
            DATABASE_GENERATOR;
        const { prisma } = DatabaseGeneratorTransform;

        // 기본 필드 처리
        const scalarFields = model.fields
            .filter(field => ['scalar', 'enum'].includes(field.kind))
            .filter(field => field.type !== 'Json')
            .filter(field => field.name !== 'sort')
            .map(field => {
                // enum/nullable/array 등 특성별 import 등록
                const isEnum = field.kind === 'enum';
                const isNullable = !field.isRequired;
                if (isEnum) {
                    this.setItemByImport(modelImportMap, MAP_KEY.EXCLUDE_ENUM_VALUE_FN, EXCLUDE_ENUM_VALUE);
                    this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_IN);
                    this.setItemByImport(modelImportMap, MAP_KEY.PRISMA, ENUM_PREFIX);
                }
                if (field.isList) {
                    this.setItemByImport(modelImportMap, MAP_KEY.CLASS_TRANSFORM, TRANSFORM);
                    this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_ARRAY);
                }
                const isNotEmptyAndString = field.type === 'String' && field.isRequired && !field.isList;
                // 타입별 import 등록
                switch (field.type) {
                    case 'String':
                        this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_STRING);
                        if (isNotEmptyAndString)
                            this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_NOT_EMPTY);
                        break;
                    case 'Decimal':
                        this.setItemByImport(modelImportMap, MAP_KEY.PRISMA, PRISMA);
                        this.setItemByImport(modelImportMap, MAP_KEY.PRISMA_DECIMAL, VALIDATOR.IS_PRISMA_DECIMAL);
                        this.setItemByImport(modelImportMap, MAP_KEY.PRISMA_DECIMAL, CUSTOM_TRANSFORM.PRISMA_DECIMAL);
                        break;
                    case 'DateTime':
                        this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_DATE);
                        break;
                    case 'Int':
                        this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_INT);
                        break;
                    case 'Float':
                        this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_NUMBER);
                        break;
                    case 'Boolean':
                        this.setItemByImport(modelImportMap, MAP_KEY.IS_BOOLEAN_FN, VALIDATOR.IS_BOOLEAN);
                        break;
                    case 'BigInt':
                        this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_BIGINT);
                        this.setItemByImport(modelImportMap, MAP_KEY.PRISMA_BIGINT, VALIDATOR.IS_BIGINT);
                        this.setItemByImport(modelImportMap, MAP_KEY.PRISMA_BIGINT, CUSTOM_TRANSFORM.PRISMA_BIGINT);
                        this.setItemByImport(modelImportMap, MAP_KEY.PRISMA_BIGINT, 'PrismaBigInt');
                        break;
                }

                // 타입/nullable/enum 등 타입 결정
                let propertyType = isEnum ? `${ENUM_PREFIX}.${field.type}` : (prisma.property[field.type] as string);
                if (field.type === 'Json') {
                    if (field.name === 'activityStatus') {
                        propertyType = 'ActivityStatusDto[]';
                    } else {
                        propertyType = isForDto ? 'Prisma.InputJsonValue' : 'Prisma.JsonValue';
                    }
                } else if (isNullable) {
                    propertyType += ' | null';
                }

                // Swagger/ApiProperty용 설명
                const propertyDesc = isEnum
                    ? this.getEnumDescription(enums, field.type, field.documentation)
                    : field.documentation;
                // 프로퍼티 선언부
                const propertyLine = isNullable
                    ? // ? `    ${field.name}?: ${propertyType}${field.isList ? '[]' : ''};`
                      `    ${field.name}: ${propertyType}${field.isList ? '[]' : ''};`
                    : `    ${field.name}: ${propertyType}${field.isList ? '[]' : ''};`;

                // Swagger default 값 결정
                type ExampleDefault =
                    | { enumType: string; enumDefault: string | undefined }
                    | string
                    | number
                    | boolean
                    | null
                    | object
                    | unknown[];
                // function getExampleDefault(
                //     field: DMMF.Field,
                //     isEnum: boolean,
                //     enums: DatabaseGeneratorEnum[],
                // ): ExampleDefault {
                //     if (field.name === 'id') return 1;
                //     if (isEnum) {
                //         const enumObj = enums.find(e => e.name === field.type);
                //         if (enumObj && enumObj.values.length > 0) {
                //             return {
                //                 enumType: `$Enums.${field.type}`,
                //                 enumDefault: `$Enums.${field.type}.${enumObj.values[0].name}`,
                //             };
                //         }
                //         return { enumType: `$Enums.${field.type}`, enumDefault: undefined };
                //     }
                //     switch (field.type) {
                //         case 'String':
                //             return field.isList ? ['string'] : 'string';
                //         case 'Int':
                //         case 'Float':
                //         case 'Decimal':
                //             return field.isList ? [0] : 0;
                //         case 'BigInt':
                //             return field.isList ? ['0'] : '0';
                //         case 'Boolean':
                //             return field.isList ? [false] : false;
                //         case 'DateTime':
                //             return field.isList ? ['2024-01-01T00:00:00.000Z'] : '2024-01-01T00:00:00.000Z';
                //         case 'Json':
                //             return field.isList ? [{}] : {};
                //         default:
                //             return field.isList ? [null] : null;
                //     }
                // }

                const swaggerDefault: ExampleDefault | undefined = undefined;
                const enumType: string | undefined = undefined;
                const enumDefault: string | undefined = undefined;
                // Prisma uuid()/now() 등 특수 default 처리
                // function isPrismaUuidDefault(field: DMMF.Field): boolean {
                //     return (
                //         typeof field.default === 'object' &&
                //         field.default !== null &&
                //         !Array.isArray(field.default) &&
                //         'name' in field.default &&
                //         (field.default as { name?: string }).name === 'uuid'
                //     );
                // }
                // function isPrismaNowDefault(field: DMMF.Field): boolean {
                //     return (
                //         typeof field.default === 'object' &&
                //         field.default !== null &&
                //         !Array.isArray(field.default) &&
                //         'name' in field.default &&
                //         (field.default as { name?: string }).name === 'now'
                //     );
                // }
                // if (field.default !== undefined) {
                //     if ((field.name === 'createdAt' || field.name === 'updatedAt') && isPrismaNowDefault(field)) {
                //         swaggerDefault = '2024-06-30T12:00:00.000Z';
                //     } else if (field.name === 'id' && field.type === 'String' && isPrismaUuidDefault(field)) {
                //         swaggerDefault = 'b3e1c2d4-5678-4f9a-8b2c-123456789abc';
                //     } else if (field.name === 'id') {
                //         swaggerDefault = 1;
                //     } else if (isEnum) {
                //         const enumObj = enums.find(e => e.name === field.type);
                //         if (enumObj && enumObj.values.length > 0) {
                //             enumType = `$Enums.${field.type}`;
                //             enumDefault = `$Enums.${field.type}.${enumObj.values[0].name}`;
                //         }
                //     } else {
                //         swaggerDefault = field.default;
                //     }
                // } else {
                //     const example = getExampleDefault(field, isEnum, enums);
                //     if (field.name === 'id' && field.type === 'String') {
                //         swaggerDefault = 'b3e1c2d4-5678-4f9a-8b2c-123456789abc';
                //     } else if (
                //         (field.name === 'createdAt' || field.name === 'updatedAt') &&
                //         field.type === 'DateTime'
                //     ) {
                //         swaggerDefault = '2024-06-30T12:00:00.000Z';
                //     } else if (field.name === 'id') {
                //         swaggerDefault = 1;
                //     } else if (isEnum && typeof example === 'object' && example !== null && 'enumType' in example) {
                //         enumType = example.enumType;
                //         enumDefault = example.enumDefault;
                //     } else {
                //         swaggerDefault = example;
                //     }
                // }

                // enum 사용시 import 보장
                if (isEnum) {
                    this.setItemByImport(modelImportMap, MAP_KEY.PRISMA, '$Enums');
                    this.setItemByImport(modelImportMap, MAP_KEY.EXCLUDE_ENUM_VALUE_FN, EXCLUDE_ENUM_VALUE);
                    this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_IN);
                }

                // ApiProperty 데코레이터 라인 생성
                const apiPropertyLines = [
                    `    @ApiProperty({`,
                    `        description: '${propertyDesc}',`,
                    isEnum
                        ? `        enum: ${enumType || `$Enums.${field.type}`},`
                        : `        type: ${isEnum ? 'String' : prisma.swagger[field.type]},`,
                    `        nullable: ${isNullable},`,
                    `        isArray: ${field.isList},`,
                    // field.name === 'id'
                    //     ? `        default: 1,`
                    //     : isEnum && enumDefault
                    //       ? `        default: ${enumDefault},`
                    //       : swaggerDefault !== undefined && swaggerDefault !== null
                    //         ? `        default: ${DatabaseGeneratorUtils.stringifyDefault(swaggerDefault)},`
                    //         : null,
                    `    })`,
                ];

                // 데코레이터/타입/프로퍼티 그룹핑
                const propertyGroup = [
                    apiPropertyLines.filter(Boolean).join('\n'),
                    field.type === 'Decimal'
                        ? `    @${CUSTOM_TRANSFORM.PRISMA_DECIMAL}()`
                        : field.type === 'BigInt'
                          ? `    @PrismaBigInt()`
                          : `    @Type(() => ${isEnum ? 'String' : prisma.transformer[field.type]})`,
                    field.isList
                        ? '    @Transform(({ value }): unknown => (value instanceof Array ? value : [value]))'
                        : null,
                    isEnum
                        ? `    @IsIn(excludeEnumValue(${enumType || `$Enums.${field.type}`}, []))`
                        : `    @${prisma.validator[field.type]}${this.getMainValidatorParameter({ isArray: field.isList, isEnum, prismaType: field.type })}`,
                    isNotEmptyAndString ? `    @${VALIDATOR.IS_NOT_EMPTY}()` : null,
                    field.isList ? `    @${VALIDATOR.IS_ARRAY}()` : null,
                    propertyLine,
                ];
                return propertyGroup.filter(Boolean).join('\n');
            });

        // 관계 필드 처리 (includeRelations가 true일 때만)
        const relationFields = includeRelations
            ? model.fields
                  .filter(field => field.kind === 'object')
                  .map(field => {
                      const isArray = field.isList;
                      const typeName = field.type;

                      // 필드명 처리 - 배열인 경우 복수화
                      let fieldName = field.name;
                      if (isArray && !field.name.endsWith('s')) {
                          // 단수형 필드명인 경우에만 복수화
                          fieldName = this.pluralize(field.name);
                      }

                      // Import 등록
                      this.setItemByImport(modelImportMap, MAP_KEY.CLASS_TRANSFORM, TRANSFORM);
                      if (isArray) {
                          this.setItemByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, VALIDATOR.IS_ARRAY);
                      }

                      // 관계 타입 import 추가
                      // 관계 타입에 대한 import를 동적으로 추가
                      // 예: Test, TestComment, TestCategory 등
                      // 이 import는 나중에 별도로 처리해야 함

                      // ApiProperty 설정
                      const apiPropertyLines = [
                          `    @ApiProperty({`,
                          `        description: '${field.documentation || typeName + (isArray ? ' 목록' : '')}',`,
                          `        type: () => ${typeName},`,
                          `        isArray: ${isArray},`,
                          `    })`,
                      ];

                      // 프로퍼티 선언
                      const propertyLine = field.isRequired
                          ? `    ${fieldName}: ${typeName}${isArray ? '[]' : ''};`
                          : //   : `    ${fieldName}?: ${typeName}${isArray ? '[]' : ''};`;
                            `    ${fieldName}: ${typeName}${isArray ? '[]' : ''};`;

                      const propertyGroup = [
                          apiPropertyLines.join('\n'),
                          `    @Type(() => ${typeName})`,
                          isArray ? `    @${VALIDATOR.IS_ARRAY}()` : null,
                          propertyLine,
                      ];

                      return propertyGroup.filter(Boolean).join('\n');
                  })
            : [];

        // 스칼라 필드와 관계 필드를 합쳐서 반환
        const allFields = [...scalarFields, ...relationFields];
        return allFields.join('\n\n');
    }

    /**
     * 하위 디렉토리까지 재귀적으로 파일 탐색
     */
    static findFileRecursive(startPath: string, targetFile: string): string | null {
        if (!startPath || !targetFile) return null;

        const resolvedStart = path.resolve(startPath);
        try {
            if (!fs.existsSync(resolvedStart)) {
                return null;
            }

            const stat = fs.statSync(resolvedStart);
            if (!stat.isDirectory()) {
                return stat.isFile() && path.basename(resolvedStart) === targetFile ? resolvedStart : null;
            }

            const entries = fs.readdirSync(resolvedStart, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(resolvedStart, entry.name);

                if (entry.isFile() && entry.name === targetFile) {
                    return fullPath;
                }

                if (entry.isDirectory()) {
                    const result = this.findFileRecursive(fullPath, targetFile);
                    if (result) return result;
                }
            }
        } catch (error) {
            const code = (error as NodeJS.ErrnoException).code;
            if (code !== 'EACCES' && code !== 'EPERM') {
                console.warn(`경고: 디렉터리를 읽을 수 없음 ${resolvedStart}:`, error);
            }
        }
        return null;
    }

    // =================================================================
    // 헬퍼 메서드들
    // =================================================================

    /**
     * enum 설명 문자열을 생성합니다
     */
    static getEnumDescription(enums: DatabaseGeneratorEnum[], enumName: string, description?: string) {
        const item = enums.find(e => e.name === enumName);
        if (!item) return description?.toString();
        const valueDesc = item.values.map(({ name, dbName }) => `${name}: ${dbName}`).join(', ');
        return `${description?.toString()} ${valueDesc}`;
    }

    // =================================================================
    // 문자열 변환 메서드들
    // =================================================================

    /**
     * 파스칼 케이스를 케밥 케이스로 변환합니다
     */
    static pascalToKebabCase(input: string): string {
        return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * 파스칼 케이스를 대문자 스네이크 케이스로 변환합니다
     */
    static pascalToUpperCase(input: string): string {
        return input
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .replace(/ /g, '_')
            .toUpperCase();
    }

    /**
     * 파스칼 케이스를 카멜 케이스로 변환합니다
     */
    static pascalToCamelCase(input: string): string {
        return input.charAt(0).toLowerCase() + input.slice(1);
    }

    /**
     * 카멜 케이스를 파스칼 케이스로 변환합니다
     */
    static camelToPascalCase(input: string): string {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }

    /**
     * 단수형 단어를 복수형으로 변환합니다
     * 영어 복수화 규칙을 적용합니다
     */
    static pluralize(singular: string): string {
        // 특수 케이스들 먼저 처리
        const irregulars: Record<string, string> = {
            person: 'people',
            man: 'men',
            woman: 'women',
            child: 'children',
            tooth: 'teeth',
            foot: 'feet',
            mouse: 'mice',
            goose: 'geese',
        };

        const lowerSingular = singular.toLowerCase();
        if (irregulars[lowerSingular]) {
            // 원래 대소문자 패턴 유지
            if (singular[0] === singular[0].toUpperCase()) {
                return irregulars[lowerSingular].charAt(0).toUpperCase() + irregulars[lowerSingular].slice(1);
            }
            return irregulars[lowerSingular];
        }

        // 일반적인 복수화 규칙
        if (singular.match(/(?:s|ss|sh|ch|x|z)$/i)) {
            return `${singular}es`;
        }
        if (singular.match(/[^aeiou]y$/i)) {
            return `${singular.slice(0, -1)}ies`;
        }
        if (singular.match(/(?:f|fe)$/i)) {
            return singular.replace(/(?:f|fe)$/i, 'ves');
        }
        if (singular.match(/o$/i)) {
            // potato -> potatoes, hero -> heroes 등
            return `${singular}es`;
        }

        // 기본: s 추가
        return `${singular}s`;
    }

    // =================================================================
    // 검증 및 포매팅 메서드들
    // =================================================================

    /**
     * 주요 validator 파라미터를 생성합니다
     */
    static getMainValidatorParameter(options: { isArray: boolean; isEnum: boolean; prismaType: string }) {
        const paramPackage = new Map<'param' | 'validationOptions', string | null>();
        paramPackage.set('param', null);
        paramPackage.set('validationOptions', options.isArray ? '{ each: true }' : null);
        if (options.isEnum) {
            paramPackage.set(
                'param',
                `${DATABASE_GENERATOR.EXCLUDE_ENUM_VALUE}(${DATABASE_GENERATOR.ENUM_PREFIX}.${options.prismaType}, [])`,
            );
        }
        // Decimal 배열 등 특수 케이스
        switch (options.prismaType) {
            case 'String':
            case 'DateTime':
            case 'Int':
            case 'Float':
            case 'Boolean':
                break;
            case 'Decimal':
                if (options.isArray) paramPackage.set('validationOptions', '{}');
                break;
        }
        return `(${[paramPackage.get('param'), paramPackage.get('validationOptions')].filter(Boolean).join(', ')})`;
    }

    /**
     * Swagger default 값을 문자열로 변환 (쌍따옴표 대신 따옴표 사용)
     */
    static stringifyDefault(value: unknown): string {
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "\\'")}'`;
        }

        if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
            return `[${value.map(v => `'${v.replace(/'/g, "\\'")}'`).join(', ')}]`;
        }

        return JSON.stringify(value);
    }
}
