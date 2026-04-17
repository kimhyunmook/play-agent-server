export function buildResourceServiceTemplate(pascalName: string, kebabName: string) {
    return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ${pascalName}CreateDto } from './dto/${kebabName}.create.dto';
import { ${pascalName}Repository } from './${kebabName}.repository';
import { validator as createValidator } from './validators/${kebabName}.create.validators';

@Injectable()
export class ${pascalName}Service {
    constructor(private readonly repository: ${pascalName}Repository) {}

    create(data: ${pascalName}CreateDto) {
        const validator: Prisma.${pascalName}CreateArgs = createValidator(data);
        return this.repository.create(validator);
    }
}
`;
}
