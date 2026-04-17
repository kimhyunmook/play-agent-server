export function buildResourceModelTemplate(pascalName: string, prismaImports: string[], propertyValues: string) {
    const uniqueImports = [...new Set(prismaImports)].filter(Boolean);

    return `import { IntersectionType, OmitType } from '@nestjs/swagger';
import { ${uniqueImports.join(', ')} } from '@prisma/client';
import { DateAtDto } from 'src/common/dto/date-at.dto';
import { Property } from 'ts-deco';

export class ${pascalName}Model extends IntersectionType(OmitType(DateAtDto, [])) implements ${pascalName} {
${propertyValues}
}
`;
}
