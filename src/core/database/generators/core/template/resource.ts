import { buildResourceConstantsTemplate } from './resources/constants.template';
import { buildResourceControllerTemplate } from './resources/controllers/controller.template';
import { buildResourceCreateDtoTemplate } from './resources/dto/create-dto.template';
import { buildResourceModelTemplate } from './resources/models/model.template';
import { buildResourceModuleTemplate } from './resources/module.template';
import { buildResourceOperationModelTemplate } from './resources/models/operation-model.template';
import { buildResourceRepositoryTemplate } from './resources/repository.template';
import { buildResourceServiceTemplate } from './resources/service.template';
import { buildResourceCreateValidatorsTemplate } from './resources/validators/create.validators.template';

export class DatabaseGeneratorTemplate {
    // 모델 클래스 템플릿 생성 (user 포맷)
    public model(pascalName: string, prismaImports: string[], propertyValues: string) {
        return buildResourceModelTemplate(pascalName, prismaImports, propertyValues);
    }

    // 리소스 모듈 템플릿 생성 (agent 포맷)
    public module(pascalName: string, kebabName: string) {
        return buildResourceModuleTemplate(pascalName, kebabName);
    }

    // 리소스 상수 템플릿 생성 (agent 포맷)
    public constants(pascalName: string, upperName: string) {
        return buildResourceConstantsTemplate(pascalName, upperName);
    }

    // 리소스 컨트롤러 템플릿 생성 (agent 포맷)
    public controller(pascalName: string, kebabName: string, upperName: string) {
        return buildResourceControllerTemplate(pascalName, kebabName, upperName);
    }

    // 리소스 서비스 템플릿 생성 (agent 포맷)
    public service(pascalName: string, kebabName: string) {
        return buildResourceServiceTemplate(pascalName, kebabName);
    }

    // 리소스 리포지토리 템플릿 생성 (agent 포맷)
    public repository(pascalName: string, kebabName: string, camelName: string) {
        return buildResourceRepositoryTemplate(pascalName, camelName);
    }

    // Create DTO 템플릿 (agent 포맷)
    public createDto(pascalName: string, kebabName: string, pick: string[], optional: string[]) {
        return buildResourceCreateDtoTemplate(pascalName, kebabName, pick, optional);
    }

    // Create validator 템플릿 (agent 포맷)
    public createValidator(
        pascalName: string,
        kebabName: string,
        destructuredFields: string[],
        relationAssignments: string[],
    ) {
        return buildResourceCreateValidatorsTemplate(
            pascalName,
            kebabName,
            destructuredFields,
            relationAssignments,
        );
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
    public getIdResponseDtoAndImport(idType: string) {
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
        return buildResourceOperationModelTemplate(pascalName, kebabName, constantName);
    }
}
