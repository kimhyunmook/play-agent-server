export function buildResourceOperationModelTemplate(pascalName: string, _kebabName: string, _constantName: string) {
    return `import { IntersectionType } from '@nestjs/swagger';
import { CREATED_AT } from 'src/common/enums/created-at.enum';
import { createPaginationDto } from 'src/common/helpers/find-pagination.dto';

export class ${pascalName}OperationModel {}
`;
}
