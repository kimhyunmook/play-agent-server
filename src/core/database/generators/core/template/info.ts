export class DatabaseGeneratorTemplateInfo {
    // Info 모듈 템플릿 생성
    public module(pascalName: string, kebabName: string) {
        return `import { Module } from '@nestjs/common';
    import { DatabaseModule } from '@core/database/database.module';
    import { ${pascalName}Service } from './${kebabName}.service';
    import { ${pascalName}Controller } from './${kebabName}.controller';
    import { ${pascalName}Repository } from './${kebabName}.repository';
    
    @Module({
        imports: [DatabaseModule],
        controllers: [${pascalName}Controller],
        providers: [${pascalName}Service, ${pascalName}Repository],
        exports: [${pascalName}Service],
    })
    export class ${pascalName}Module {}
    `;
    }

    // Info 컨트롤러 템플릿 생성
    public controller(pascalName: string, kebabName: string, upperName: string) {
        const apiPath = kebabName.replace('info-', '');

        return `import { ApiController, ApiInformation } from '@common/decorators/controller.decorator';
import { ${pascalName}Service } from './${kebabName}.service';
import { Get, Query } from '@nestjs/common';
import { CommonController } from '@common/common.controller';
import { UseValidationPipe } from '@common/decorators/validation.pipe.decorator';
import { ${upperName} } from './${kebabName}.constant';
import { ${pascalName}FindManyDto } from './dto/${kebabName}.find-many.dto';
import { ${pascalName}FindManyResponseDto } from './dto/response/${kebabName}.find-many.response.dto';
import { Prisma } from '@prisma/client';

@ApiController('info')
export class ${pascalName}Controller extends CommonController {
    constructor(private service: ${pascalName}Service) {
        super(${upperName}.NAME);
    }

    @Get('${apiPath}')
    @ApiInformation(${upperName}.NAME + '조회', false)
    @UseValidationPipe()
    async findMany(@Query() query: ${pascalName}FindManyDto): Promise<${pascalName}FindManyResponseDto> {
        const options = Prisma.validator<Prisma.${pascalName}FindManyArgs>()({});
        const resources = await this.service.findMany(options);
        return this.getResponse(this.FIND_MESSAGE, resources);
    }
}
`;
    }

    // Info 서비스 템플릿 생성
    public service(pascalName: string, kebabName: string) {
        return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ${pascalName}Repository } from './${kebabName}.repository';
import { BaseInfoService } from '@core/info/base-info.service';
import { INFO_${pascalName.toUpperCase()} } from './${kebabName}.constant';

@Injectable()
export class ${pascalName}Service extends BaseInfoService<Prisma.${pascalName}CreateManyInput> {
    constructor(protected repository: ${pascalName}Repository) {
        super(repository);
    }

    async onModuleInit() {
        await this.initializeDefaultValues(
            INFO_${pascalName}.DEFAULT_VALUES,
            (options: Prisma.${pascalName}FindManyArgs) => this.repository.findMany(options),
            (data: Prisma.${pascalName}CreateManyInput[]) => this.repository.createMany(data),
        );
    }

    async findMany<T extends Prisma.${pascalName}FindManyArgs>(options?: T) {
        return this.repository.findMany(options) as Promise<Prisma.${pascalName}GetPayload<T>[]>;
    }
}
`;
    }

    // Info 리포지토리 템플릿 생성
    public repository(pascalName: string, kebabName: string, camelName: string) {
        return `import { Injectable } from '@nestjs/common';
import { Database } from '@core/database/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class ${pascalName}Repository {
    constructor(private prisma: Database) {}

    async findMany(options?: Prisma.${pascalName}FindManyArgs) {
        return this.prisma.${camelName}.findMany(options);
    }
}
`;
    }

    // Info 상수 템플릿 생성
    public constant(upperName: string, kebabName: string, desc?: string) {
        return `export class ${upperName} {
    static readonly NAME = '${desc}(메타데이터)';

    // INFO의 경우 레벨이 영역과 같기에 MGMT, PUBLIC을 나누지 않습니다
    static readonly VALID = {
        FIND_MANY: '${kebabName}.find-many',
        FIND_ONE: '${kebabName}.find-one',
        CREATE: '${kebabName}.create',
        UPDATE: '${kebabName}.update',
        DELETE: '${kebabName}.delete',
    };

    static readonly DEFAULT_VALUES = []
}
`;
    }

    // Info FindMany 응답 DTO 템플릿 생성
    public findManyResponseDto(pascalName: string, kebabName: string) {
        return `import { ResponseDto } from '@common/dto/response.dto';
import { ${pascalName} } from '../../${kebabName}.model';
import { AutoApiSchema } from '@common/decorators/auto.api-schema.decorator';
import { OmitType } from '@nestjs/swagger';

export class ${pascalName}FindManyResponseDto extends ResponseDto {
    data: Data[];
}

@AutoApiSchema()
class Data extends OmitType(${pascalName}, []) {}
`;
    }

    // Info FindMany 요청 DTO 템플릿 생성
    public findManyRequestDto(pascalName: string, kebabName: string) {
        return `import { ${pascalName} } from '../${kebabName}.model';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';
import { ${pascalName}OperationModel } from '../${kebabName}.operation.model';

export class ${pascalName}FindManyDto extends IntersectionType(
    PaginationDto,
    PickType(PartialType(${pascalName}), [] as const),
    PickType(PartialType(${pascalName}OperationModel), ['sort'] as const),
) {}
`;
    }

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
}
