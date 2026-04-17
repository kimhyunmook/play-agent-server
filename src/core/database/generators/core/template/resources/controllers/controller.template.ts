import { DatabaseGeneratorUtils } from '../../../utils';

export function buildResourceControllerTemplate(pascalName: string, kebabName: string, upperName: string) {
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
