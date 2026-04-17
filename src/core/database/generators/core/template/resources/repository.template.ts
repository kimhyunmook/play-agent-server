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

    create<T extends Prisma.${pascalName}CreateArgs>(
        args: Prisma.SelectSubset<T, Prisma.${pascalName}CreateArgs>,
    ): Promise<Prisma.${pascalName}GetPayload<T>> {
        return this.repository.create(args);
    }
}
`;
}
