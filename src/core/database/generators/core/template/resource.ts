import { DatabaseGeneratorUtils } from '../utils';

export class DatabaseGeneratorTemplate {
    constructor() {}

    // 모델 클래스 템플릿 생성
    public model(pascalName: string, dynamicImportValues: string, propertyValues: string) {
        return `import { ApiProperty } from '@nestjs/swagger';
        import {${pascalName} as Prisma${pascalName}} from '@prisma/client';
${dynamicImportValues}

export class ${pascalName} implements Prisma${pascalName} {
${propertyValues}
}
`;
    }

    // 리소스 모듈 템플릿 생성
    public module(pascalName: string, kebabName: string, relationModules: { name: string; folder: string }[] = []) {
        // relation 모듈 imports 생성
        const relationImports = relationModules
            .map(({ name, folder }) => {
                const moduleKebab = DatabaseGeneratorUtils.pascalToKebabCase(name);
                return `import { ${name}Module } from './relations/${folder}/${moduleKebab}.module';`;
            })
            .join('\n');

        // imports 배열에 relation 모듈 추가
        const importsArray = ['DatabaseModule', ...relationModules.map(m => `${m.name}Module`)].join(', ');

        return `import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { ${pascalName}Service } from './${kebabName}.service';
import { ${pascalName}Repository } from './${kebabName}.repository';
import { ${pascalName}PublicController } from './controllers/${kebabName}.public.controller';
import { ${pascalName}MgmtController } from './controllers/${kebabName}.mgmt.controller';
import { ${pascalName}MgmtServiceAdapter } from './adapters/${kebabName}.mgmt.adapter';
import { ${pascalName}PublicServiceAdapter } from './adapters/${kebabName}.public.adapter';
${relationImports ? `\n${relationImports}` : ''}

@Module({
    imports: [${importsArray}],
    controllers: [${pascalName}PublicController, ${pascalName}MgmtController],
    providers: [
        ${pascalName}Service,
        ${pascalName}Repository,
        ${pascalName}MgmtServiceAdapter,
        ${pascalName}PublicServiceAdapter,
    ],
    exports: [${pascalName}Service],
})
export class ${pascalName}Module {}
`;
    }

    // 리소스 상수 템플릿 생성
    public constant(upperName: string, kebabName: string, desc?: string) {
        return `export class ${upperName} {
    static readonly NAME = '${desc ?? kebabName}';
    static readonly FIND_LIST_SORT = {
        CREATED_AT_DESC: 'CREATED_AT:DESC',
        CREATED_AT_ASC: 'CREATED_AT:ASC',
    } as const;
    static readonly VALID = {
        MGMT: {
            CREATE: '${kebabName}.mgmt.create',
            UPDATE: '${kebabName}.mgmt.update',
            DELETE: '${kebabName}.mgmt.delete',
            FIND_UNIQUE: '${kebabName}.mgmt.find-unique',
            FIND_LIST: '${kebabName}.mgmt.find-list',
        },
        PUBLIC: {
            CREATE: '${kebabName}.public.create',
            UPDATE: '${kebabName}.public.update',
            DELETE: '${kebabName}.public.delete',
            FIND_UNIQUE: '${kebabName}.public.find-unique',
            FIND_LIST: '${kebabName}.public.find-list',
        },
    } as const;
}
`;
    }

    // 리소스 요청 DTO 템플릿 생성
    public reqDto(
        pascalName: string,
        kebabName: string,
        level: string,
        action: string,
        isFindList: boolean,
        isForDto = false,
        model?: any,
    ) {
        if (action === 'Create') {
            // 모델에서 필수/선택 필드 구분 (id, createdAt, updatedAt 제외)
            const requiredFields: string[] = [];
            const optionalFields: string[] = [];

            if (model && model.fields) {
                model.fields
                    .filter(field => ['scalar', 'enum'].includes(field.kind))
                    .filter(field => !['id', 'createdAt', 'updatedAt'].includes(field.name))
                    .forEach(field => {
                        const fieldName = `'${field.name}'`;
                        // 필수 필드: isRequired가 true (타입 뒤에 ?가 없는 경우)
                        // 선택 필드: isRequired가 false (타입 뒤에 ?가 있는 경우)
                        if (field.isRequired) {
                            requiredFields.push(fieldName);
                        } else {
                            optionalFields.push(fieldName);
                        }
                    });
            }

            const requiredFieldsString = requiredFields.length > 0 ? requiredFields.join(', ') : '';
            const optionalFieldsString = optionalFields.length > 0 ? optionalFields.join(', ') : '';
            // 항상 IntersectionType 구조 유지
            return `import { ${pascalName} } from '../models/${kebabName}.model';
import { IntersectionType, PickType, PartialType } from '@nestjs/swagger';

export class ${pascalName}${level}${action}Dto extends IntersectionType(
    // 필수 필드들
    PickType(${pascalName}, [${requiredFieldsString}] as const),
    // 선택 필드들
    PartialType(PickType(${pascalName}, [${optionalFieldsString}] as const)),
) {}`;
        } else if (action === 'Update') {
            return `import { ${pascalName} } from '../models/${kebabName}.model';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { ${pascalName}${level}CreateDto } from './${kebabName}.${level.toLowerCase()}.create.dto';

export class ${pascalName}${level}${action}Dto extends IntersectionType(
    PickType(${pascalName}, [] as const),
    PartialType(${pascalName}${level}CreateDto),
) {}`;
        } else if (isFindList) {
            // FindList: 페이지네이션 + 정렬 + 필터링
            return `import { ${pascalName} } from '../models/${kebabName}.model';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { PaginationDto } from '@utils/.boilerplate/dto/pagination.dto';
import { ${pascalName}OperationModel } from '../models/${kebabName}.operation.model';

export class ${pascalName}${level}${action}Dto extends IntersectionType(
    PaginationDto,
    PickType(${pascalName}, [] as const),
    PickType(PartialType(${pascalName}), [] as const),
    PickType(PartialType(${pascalName}OperationModel), ['sort'] as const),
) {}`;
        } else {
            // 기본: 필터링만
            return `import { ${pascalName} } from '../models/${kebabName}.model';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

export class ${pascalName}${level}${action}Dto extends IntersectionType(
    PickType(${pascalName}, [] as const),
    PickType(PartialType(${pascalName}), [] as const),
) {}
`;
        }
    }

    // 리소스 응답 DTO 템플릿 생성
    public resDto(
        pascalName: string,
        kebabName: string,
        level: string,
        action: string,
        isDataArray: boolean,
        isFindList: boolean,
        model?: any,
    ) {
        // 모델에서 관계 필드를 제외했으므로 Response DTO에서도 제외할 필요 없음
        return `import { AutoApiSchema } from '@common/decorators/auto.api-schema.decorator';
import { OmitType } from '@nestjs/swagger';
import { ${pascalName} } from '../../models/${kebabName}.model';
${isFindList ? "import { ResponseWithMetadataDto } from '@utils/.boilerplate/dto/response.with-metadata.dto';" : "import { ResponseDto } from '@utils/.boilerplate/dto/response.dto';"}

export class ${pascalName}${level}${action}ResponseDto extends ${isFindList ? 'ResponseWithMetadataDto' : 'ResponseDto'} {
    data: Data${isDataArray ? '[]' : ''};
}

@AutoApiSchema()
class Data extends OmitType(${pascalName}, [] as const) {}
`;
    }

    // 모델의 ID 타입 추출
    public getIdType(model) {
        const idField = model.fields.find(f => f.isId);
        if (!idField) return 'string';
        switch (idField.type) {
            case 'Int':
            case 'Float':
                return 'number';
            case 'String':
                return 'string';
            case 'BigInt':
                return 'bigint';
            default:
                return 'string';
        }
    }

    // ID 타입별 응답 DTO와 import 결정
    public getIdResponseDtoAndImport(idType) {
        if (idType === 'number') {
            return {
                dto: 'NumberIdResponseDto',
                import: "import { NumberIdResponseDto } from '@common/dto/number-id.response.dto';",
            };
        } else if (idType === 'string') {
            return {
                dto: 'StringIdResponseDto',
                import: "import { StringIdResponseDto } from '@common/dto/string-id.response.dto';",
            };
        } else if (idType === 'bigint') {
            // BigInt는 NumberIdResponseDto로 처리
            return {
                dto: 'NumberIdResponseDto',
                import: "import { NumberIdResponseDto } from '@common/dto/number-id.response.dto';",
            };
        }
        return {
            dto: 'NumberIdResponseDto',
            import: "import { NumberIdResponseDto } from '@common/dto/number-id.response.dto';",
        };
    }

    // 리소스 컨트롤러 템플릿 생성
    public controller(
        pascalName: string,
        kebabName: string,
        upperName: string,
        level: string,
        levelLower: string,
        model,
    ) {
        // ID 타입과 응답 DTO 결정
        const idType = this.getIdType(model);
        const idPipe = idType === 'number' ? ', ParseIntPipe' : '';
        const { dto: idResponseDto, import: idResponseImport } = this.getIdResponseDtoAndImport(idType);
        // 항상 NoDataResponseDto import
        const noDataImport = "import { NoDataResponseDto } from '@common/dto/no-data.response.dto';";

        // import문 구성
        // relations 폴더 안에 있는지 확인 (test-comment, test-category 등)
        const roleImportPath = 'src/role';
        const imports = [
            "import { ApiController, ApiInformation } from '@utils/.boilerplate/decorators/controller.decorator';",
            `import { ${pascalName}Service } from '../${kebabName}.service';`,
            `import { ${pascalName}${level}ServiceAdapter } from '../adapters/${kebabName}.${levelLower}.adapter';`,
            "import { CommonController } from '@utils/.boilerplate/controller/common.controller';",
            `import { ${upperName} } from '../${kebabName}.constant';`,
            `import { Body, Delete, Get, Param, Post, Put, Query${idPipe} } from '@nestjs/common';`,
            "import { UseValidationPipe } from '@common/decorators/validation.pipe.decorator';",
            `import { ${pascalName}${level}FindListDto } from '../dto/${kebabName}.${levelLower}.find-list.dto';`,
            `import { ${pascalName}${level}FindListResponseDto } from '../dto/response/${kebabName}.${levelLower}.find-list.response.dto';`,
            `import { ${pascalName}${level}CreateDto } from '../dto/${kebabName}.${levelLower}.create.dto';`,
            `import { ${pascalName}${level}UpdateDto } from '../dto/${kebabName}.${levelLower}.update.dto';`,
            `import { ${pascalName}${level}FindUniqueResponseDto } from '../dto/response/${kebabName}.${levelLower}.find-unique.response.dto';`,
            idResponseImport,
            noDataImport,
            // Mgmt 컨트롤러에만 ROLE, UseRoleGuard import 추가
            ...(levelLower === 'mgmt'
                ? [
                      "import { UseRoleGuard } from '@utils/.boilerplate/decorators/guard.decorator';",
                      `import { ROLE } from '${roleImportPath}';`,
                  ]
                : []),
        ]
            .filter(Boolean)
            .join('\n');

        // 데코레이터 조합 함수 (Mgmt만 적용)
        function mgmtDecorators(apiInfo: string, validation: string) {
            return [apiInfo.replace(', false', ', true'), validation, '@UseRoleGuard(...ROLE.MANAGEMENT.ALL)'].join(
                '\n',
            );
        }
        function publicDecorators(apiInfo: string, validation: string) {
            return [apiInfo, validation].join('\n');
        }
        // 메서드 템플릿 생성 함수
        function methodTemplate({ method, apiInfo, validation, params, returnType, body, extra = '' }: any) {
            const decorators =
                levelLower === 'mgmt' ? mgmtDecorators(apiInfo, validation) : publicDecorators(apiInfo, validation);
            // 파라미터 줄바꿈 및 들여쓰기 스타일 맞춤 (4-space)
            const paramIndent = params.includes(',') ? '\n        ' : '';
            const formattedParams = params
                .replace(/,\s*/g, ',\n        ')
                .replace(/\(\n {8}/, '(')
                .replace(/\n {8}\)/, ')');
            return `    @${method}\n${decorators.replace(/^/gm, '    ')}\n    async ${body}${paramIndent}${formattedParams}: Promise<${returnType}> {\n        ${extra.replace(/\n/g, '\n        ')}\n    }`;
        }
        // 컨트롤러 클래스 생성 (4-space 들여쓰기)
        return `${imports}

@ApiController('${levelLower === 'mgmt' ? 'management/' : ''}${kebabName}s')
export class ${pascalName}${level}Controller extends CommonController {
    constructor(
        private service: ${pascalName}Service,
        private ${levelLower}Adapter: ${pascalName}${level}ServiceAdapter,
    ) {
        super(${upperName}.NAME);
    }

${methodTemplate({
    method: 'Post()',
    apiInfo: `@ApiInformation(${upperName}.NAME + ' 생성', false)`,
    validation: `@UseValidationPipe(${upperName}.VALID.${level.toUpperCase()}.CREATE)`,
    params: `(@Body() dto: ${pascalName}${level}CreateDto)`,
    returnType: levelLower === 'mgmt' ? idResponseDto : `${pascalName + level}FindUniqueResponseDto`,
    body: 'create',
    extra: `const serviceInput = this.${levelLower}Adapter.create(dto);\nconst result = await this.service.create(serviceInput);\n${
        levelLower === 'mgmt'
            ? 'return this.getResponse(this.CREATE_MESSAGE, { id: result.id });'
            : 'return this.getResponse(this.CREATE_MESSAGE, result);'
    }`,
})}

${methodTemplate({
    method: "Put(':id')",
    apiInfo: `@ApiInformation(${upperName}.NAME + ' 수정', false)`,
    validation: `@UseValidationPipe(${upperName}.VALID.${level.toUpperCase()}.UPDATE)`,
    params: `(@Param('id'${idPipe}) id: ${idType},\n        @Body() dto: ${pascalName}${level}UpdateDto)`,
    returnType: 'NoDataResponseDto',
    body: 'update',
    extra: `const serviceInput = this.${levelLower}Adapter.update(id, dto);\nawait this.service.update(serviceInput);\nreturn this.getResponse(this.UPDATE_MESSAGE);`,
})}

${methodTemplate({
    method: "Delete(':id')",
    apiInfo: `@ApiInformation(${upperName}.NAME + ' 삭제', false)`,
    validation: `@UseValidationPipe(${upperName}.VALID.${level.toUpperCase()}.DELETE)`,
    params: `(@Param('id'${idPipe}) id: ${idType})`,
    returnType: 'NoDataResponseDto',
    body: 'delete',
    extra: `const serviceInput = this.${levelLower}Adapter.delete(id);\nawait this.service.delete(serviceInput);\nreturn this.getResponse(this.DELETE_MESSAGE);`,
})}

${methodTemplate({
    method: "Get(':id')",
    apiInfo: `@ApiInformation(${upperName}.NAME + ' 단일 조회', false)`,
    validation: `@UseValidationPipe(${upperName}.VALID.${level.toUpperCase()}.FIND_UNIQUE)`,
    params: `(@Param('id') id: ${idType})`,
    returnType: `${pascalName}${level}FindUniqueResponseDto`,
    body: 'findUnique',
    extra: `const serviceInput = this.${levelLower}Adapter.findUnique(id);\nconst data = await this.service.findUnique(serviceInput);\nreturn this.getResponse(this.FIND_MESSAGE, data);`,
})}

${methodTemplate({
    method: 'Get()',
    apiInfo: `@ApiInformation(${upperName}.NAME + ' 목록 조회', false)`,
    validation: `@UseValidationPipe(${upperName}.VALID.${level.toUpperCase()}.FIND_LIST)`,
    params: `(@Query() query: ${pascalName}${level}FindListDto)`,
    returnType: `${pascalName}${level}FindListResponseDto`,
    body: 'findList',
    extra: `const serviceInput = this.${levelLower}Adapter.findManyAndCount(query);\nconst [resources, totalCount] = await this.service.findManyAndCount(serviceInput);\nreturn this.getResponse(this.FIND_MESSAGE, resources, this.getMetaForFindList(query, totalCount));`,
})}
}
`;
    }

    // 리소스 어댑터 템플릿 생성
    public adapter(pascalName: string, kebabName: string, upperName: string, level: string, levelLower: string, model) {
        const idType = this.getIdType(model);
        return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ${pascalName}${level}CreateDto } from '../dto/${kebabName}.${levelLower}.create.dto';
import { ${pascalName}${level}UpdateDto } from '../dto/${kebabName}.${levelLower}.update.dto';
import { ${pascalName}${level}FindListDto } from '../dto/${kebabName}.${levelLower}.find-list.dto';

@Injectable()
export class ${pascalName}${level}ServiceAdapter {
    private validator = Prisma.validator;

    create(dto: ${pascalName}${level}CreateDto) {
        return this.validator<Prisma.${pascalName}CreateArgs>()({
            data: { ...dto },
        });
    }

    update(id: ${idType}, dto: ${pascalName}${level}UpdateDto) {
        return this.validator<Prisma.${pascalName}UpdateArgs>()({
            where: { id },
            data: { ...dto },
        });
    }

    delete(id: ${idType}) {
        return this.validator<Prisma.${pascalName}DeleteArgs>()({
            where: { id },
        });
    }

    findUnique(id: ${idType}) {
        return this.validator<Prisma.${pascalName}FindUniqueArgs>()({
            where: { id },
        });
    }

    findList({ take, page }: ${pascalName}${level}FindListDto) {
        return this.validator<Prisma.${pascalName}FindManyArgs>()({
            where: {
                // Add filter fields here if needed
            },
            take,
            skip: (page - 1) * take,
            // orderBy: (sort logic can be added here if needed)
        });
    }

    findManyAndCount({ take, page }: ${pascalName}${level}FindListDto) {
        return this.validator<Prisma.${pascalName}FindManyArgs>()({
            where: {
                // Add filter fields here if needed
            },
            take,
            skip: (page - 1) * take,
            // orderBy: (sort logic can be added here if needed)
        });
    }
}
`;
    }

    // 리소스 서비스 템플릿 생성
    public service(pascalName: string, kebabName: string, upperName: string) {
        return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ${pascalName}Repository } from './${kebabName}.repository';
import { ResourceNotFoundException } from '@utils/exceptions/not-found.exception';
${upperName ? `import { ${upperName} } from './${kebabName}.constant';` : ''}

@Injectable()
export class ${pascalName}Service {
    constructor(
        private repository: ${pascalName}Repository,
    ) {}

    async create<T extends Prisma.${pascalName}CreateArgs>(
        data: Prisma.SelectSubset<T, Prisma.${pascalName}CreateArgs>
    ): Promise<Prisma.${pascalName}GetPayload<T>> {
        return this.repository.create(data);
    }

    async update(data: Prisma.${pascalName}UpdateArgs) {
        return this.repository.update(data);
    }

    async updateMany(data: Prisma.${pascalName}UpdateManyArgs) {
        return this.repository.updateMany(data);
    }

    async delete(data: Prisma.${pascalName}DeleteArgs) {
        return this.repository.delete(data);
    }

    async findUnique<T extends Prisma.${pascalName}FindUniqueArgs>(
        data: Prisma.SelectSubset<T, Prisma.${pascalName}FindUniqueArgs>
    ): Promise<Prisma.${pascalName}GetPayload<T> | null> {
        return this.repository.findUnique(data);
    }

    async findUniqueOrThrow<T extends Prisma.${pascalName}FindUniqueArgs>(
        data: Prisma.SelectSubset<T, Prisma.${pascalName}FindUniqueArgs>,
    ): Promise<Prisma.${pascalName}GetPayload<T>> {
        const result = await this.repository.findUnique(data);
        if (!result) throw new ResourceNotFoundException(${upperName}.NAME);
        return result;
    }


    async findFirst<T extends Prisma.${pascalName}FindFirstArgs>(
        data: Prisma.SelectSubset<T, Prisma.${pascalName}FindFirstArgs>
    ): Promise<Prisma.${pascalName}GetPayload<T> | null> {
        return this.repository.findFirst(data);
    }

    async findList<T extends Prisma.${pascalName}FindManyArgs>(
        data: Prisma.SelectSubset<T, Prisma.${pascalName}FindManyArgs>
    ): Promise<Prisma.${pascalName}GetPayload<T>[]> {
        return this.repository.findMany(data);
    }

    async findManyAndCount<T extends Prisma.${pascalName}FindManyArgs>(
        data: Prisma.SelectSubset<T, Prisma.${pascalName}FindManyArgs>
    ) {
        return this.repository.findManyAndCount(data) as Promise<[Prisma.${pascalName}GetPayload<T>[], number]>;
    }
}
`;
    }

    // 리소스 리포지토리 템플릿 생성
    repository(pascalName: string, kebabName: string, camelName: string) {
        return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@core/database/database';
import { CommonRepository } from '@utils/.boilerplate/repository/common.repository';

@Injectable()
export class ${pascalName}Repository extends CommonRepository {
    public readonly create: typeof this.prisma.${camelName}.create;
    public readonly update: typeof this.prisma.${camelName}.update;
    public readonly updateMany: typeof this.prisma.${camelName}.updateMany;
    public readonly delete: typeof this.prisma.${camelName}.delete;
    public readonly findUnique: typeof this.prisma.${camelName}.findUnique;
    public readonly findFirst: typeof this.prisma.${camelName}.findFirst;
    public readonly findMany: typeof this.prisma.${camelName}.findMany;
    public readonly count: typeof this.prisma.${camelName}.count;
    public readonly aggregate: typeof this.prisma.${camelName}.aggregate;
    public readonly fields: typeof this.prisma.${camelName}.fields;

    constructor(private prisma: Database) {
        super();
        this.create = args => this.prisma.${camelName}.create(args);
        this.update = args => this.prisma.${camelName}.update(args);
        this.updateMany = args => this.prisma.${camelName}.updateMany(args);
        this.delete = args => this.prisma.${camelName}.delete(args);
        this.findUnique = args => this.prisma.${camelName}.findUnique(args);
        this.findFirst = args => this.prisma.${camelName}.findFirst(args);
        this.findMany = args => this.prisma.${camelName}.findMany(args);
        this.count = args => this.prisma.${camelName}.count(args);
        this.aggregate = args => this.prisma.${camelName}.aggregate(args);
        this.fields = this.prisma.${camelName}.fields;
    }

    async findManyAndCount<T extends Prisma.${pascalName}FindManyArgs>(args?: T) {
        return this.prisma.$transaction([
            this.prisma.${camelName}.findMany(args),
            this.prisma.${camelName}.count({ where: args?.where ?? {} })
        ]) as Promise<[
            Prisma.${pascalName}GetPayload<T>[],
            number
        ]>;
    }

    async transaction<R>(callback: (prisma: Database) => Promise<R>): Promise<R> {
        return this.prisma.$transaction(callback);
    }
}
`;
    }

    // Operation 모델 템플릿 생성
    operationModel(pascalName: string, kebabName: string, constantName: string) {
        return `import { ApiProperty } from '@nestjs/swagger';
import { ${constantName} } from '../${kebabName}.constant';
import { UnionType } from '@common/common.type';
import { IsIn } from 'class-validator';
import { excludeEnumValue } from '@utils/functions/exclude-enum-value';

export class ${pascalName}OperationModel {
    @ApiProperty({ description: '정렬', enum: ${constantName}.FIND_LIST_SORT })
    @IsIn(excludeEnumValue(${constantName}.FIND_LIST_SORT, []))
    sort: UnionType<typeof ${constantName}.FIND_LIST_SORT>;
}
`;
    }
}
