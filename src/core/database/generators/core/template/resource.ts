import { DatabaseGeneratorUtils } from '../utils';

export class DatabaseGeneratorTemplate {
    constructor() {}

    // 모델 클래스 템플릿 생성 (user 포맷)
    public model(pascalName: string, prismaImports: string[], propertyValues: string) {
        const uniqueImports = [...new Set(prismaImports)].filter(Boolean);
        return `import { IntersectionType, OmitType } from '@nestjs/swagger';
import { ${uniqueImports.join(', ')} } from '@prisma/client';
import { DateAtDto } from 'src/common/dto/date-at.dto';
import { Property } from 'ts-deco';

export class ${pascalName}Model extends IntersectionType(OmitType(DateAtDto, [])) implements ${pascalName} {
${propertyValues}
}
`;
    }

    // 리소스 모듈 템플릿 생성 (agent 포맷)
    public module(pascalName: string, kebabName: string) {
        return `import { Module } from '@nestjs/common';
import { ${pascalName}Repository } from './${kebabName}.repository';
import { ${pascalName}Service } from './${kebabName}.service';
import { ${pascalName}Controller } from './controllers/${kebabName}.controller';

@Module({
    imports: [],
    controllers: [${pascalName}Controller],
    providers: [${pascalName}Service, ${pascalName}Repository],
    exports: [${pascalName}Service],
})
export class ${pascalName}Module {}
`;
    }

    // 리소스 상수 템플릿 생성 (agent 포맷)
    public constants(pascalName: string, upperName: string) {
        return `export class ${upperName}_CONSTANTS {
    static readonly NAME = '${pascalName}';
}
`;
    }

    // 리소스 컨트롤러 템플릿 생성 (agent 포맷)
    public controller(pascalName: string, kebabName: string, upperName: string) {
        return `import { CommonController } from 'src/common/utils/common.controller';
import { Resource } from 'ts-deco';
import { ${upperName}_CONSTANTS } from '../${kebabName}.constants';
import { ${pascalName}Service } from '../${kebabName}.service';

@Resource('${DatabaseGeneratorUtils.pluralize(kebabName)}')
export class ${pascalName}Controller extends CommonController {
    constructor(private readonly service: ${pascalName}Service) {
        super(${upperName}_CONSTANTS.NAME);
    }
}
`;
    }

    // 리소스 서비스 템플릿 생성 (agent 포맷)
    public service(pascalName: string, kebabName: string) {
        return `import { Injectable } from '@nestjs/common';
import { ${pascalName}Repository } from './${kebabName}.repository';

@Injectable()
export class ${pascalName}Service {
    constructor(private readonly repository: ${pascalName}Repository) {}
}
`;
    }

    // 리소스 리포지토리 템플릿 생성 (agent 포맷)
    public repository(pascalName: string, kebabName: string, camelName: string) {
        return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from '../../common/utils/common.repository';

@Injectable()
export class ${pascalName}Repository extends CommonRepository<'${camelName}'> {
    protected readonly modelKey = '${camelName}';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create(data: Prisma.${pascalName}CreateInput) {
        return this.repository.create({ data });
    }
}
`;
    }

    // Create DTO 템플릿 (agent 포맷)
    public createDto(pascalName: string, kebabName: string, pick: string[], optional: string[]) {
        return `import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { ${pascalName} } from '../models/${kebabName}.model';

export class ${pascalName}CreateDto extends CreateDtoFromModel({
    model: ${pascalName},
    pick: [${pick.join(', ')}],
    optional: [${optional.join(', ')}],
}) {}
`;
    }

    // (기존 Mgmt/Public + DTO/Response 템플릿들은 agent 포맷에서는 사용하지 않음)

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

    // Operation 모델 템플릿 생성
    operationModel(pascalName: string, kebabName: string, constantName: string) {
        return `import { IntersectionType } from '@nestjs/swagger';
import { CREATED_AT } from 'src/common/enums/created-at.enum';
import { createPaginationDto } from 'src/common/helpers/find-pagination.dto';

export class ${pascalName}OperationModel extends IntersectionType(createPaginationDto([CREATED_AT])) {}
`;
    }
}
