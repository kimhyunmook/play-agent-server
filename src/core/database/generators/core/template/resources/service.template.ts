export function buildResourceServiceTemplate(pascalName: string, kebabName: string) {
    return `import { Injectable } from '@nestjs/common';
import { ${pascalName}Repository } from './${kebabName}.repository';

@Injectable()
export class ${pascalName}Service {
    constructor(private readonly repository: ${pascalName}Repository) {}
}
`;
}
