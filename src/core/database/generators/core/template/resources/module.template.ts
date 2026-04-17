export function buildResourceModuleTemplate(pascalName: string, kebabName: string) {
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
