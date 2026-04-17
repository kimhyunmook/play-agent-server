export function buildResourceConstantsTemplate(pascalName: string, upperName: string) {
    return `export class ${upperName}_CONSTANTS {
    static readonly NAME = '${pascalName}';
}
`;
}
