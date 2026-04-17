export function buildResourceCreateValidatorsTemplate(
    pascalName: string,
    kebabName: string,
    destructuredFields: string[],
    relationAssignments: string[],
) {
    const destructuringBlock =
        destructuredFields.length > 0 ? `    const { ${destructuredFields.join(', ')}, ...rest } = data;\n` : '';

    const createDataBlock =
        relationAssignments.length > 0
            ? `        data: {\n            ...rest,\n${relationAssignments.join('\n')}\n        },`
            : `        data,`;

    return `import { Prisma } from '@prisma/client';
import { ${pascalName}CreateDto } from '../dto/${kebabName}.create.dto';

export function validator(data: ${pascalName}CreateDto): Prisma.${pascalName}CreateArgs {
${destructuringBlock}    return Prisma.validator<Prisma.${pascalName}CreateArgs>()({
${createDataBlock}
    });
}
`;
}
