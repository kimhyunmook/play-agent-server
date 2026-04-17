export function buildResourceCreateDtoTemplate(
    pascalName: string,
    kebabName: string,
    pick: string[],
    optional: string[],
) {
    return `import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { ${pascalName} } from '../models/${kebabName}.model';

export class ${pascalName}CreateDto extends CreateDtoFromModel({
    model: ${pascalName},
    pick: [${pick.join(', ')}],
    optional: [${optional.join(', ')}],
}) {}
`;
}
