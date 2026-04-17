import { DatabaseGeneratorUtils } from '../../../utils';

export function buildResourceControllerTemplate(pascalName: string, kebabName: string, upperName: string) {
    return `import { Body } from '@nestjs/common';
import { NullDataResponseDto } from 'src/common/dto/response.dto';
import { CommonController } from 'src/common/utils/common.controller';
import { Endpoint, Resource } from 'ts-deco';
import { ${upperName}_CONSTANTS } from '../${kebabName}.constants';
import { ${pascalName}CreateDto } from '../dto/${kebabName}.create.dto';
import { ${pascalName}Service } from '../${kebabName}.service';

@Resource('${DatabaseGeneratorUtils.pluralize(kebabName)}')
export class ${pascalName}Controller extends CommonController {
    constructor(private readonly service: ${pascalName}Service) {
        super(${upperName}_CONSTANTS.NAME);
    }

    @Endpoint({
        method: 'POST',
        summary: \`${'${'}${upperName}_CONSTANTS.NAME} 생성\`,
        description: \`${'${'}${upperName}_CONSTANTS.NAME} 생성\`,
        body: { type: ${pascalName}CreateDto, required: true },
    })
    async create(@Body() body: ${pascalName}CreateDto): Promise<NullDataResponseDto> {
        await this.service.create(body);
        return this.responseData(\`${'${'}${upperName}_CONSTANTS.NAME} 생성\`, null);
    }
}
`;
}
