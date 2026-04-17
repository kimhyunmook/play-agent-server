export function buildResourceRepositoryTemplate(pascalName: string, camelName: string) {
    return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from 'src/common/utils/common.repository';

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
