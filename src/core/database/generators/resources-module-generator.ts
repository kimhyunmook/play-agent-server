import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DATABASE_GENERATOR } from './core/constant';
import { DatabaseGeneratorTemplate } from './core/template/resource';
import { DatabaseGeneratorImportMap } from './core/type';
import { DatabaseGeneratorUtils } from './core/utils';

const { MAP_KEY } = DATABASE_GENERATOR;
const template = new DatabaseGeneratorTemplate();

// 이미 생성된 디렉토리를 추적하여 중복 생성 방지
const createdDirs = new Set<string>();

/**
 * 디렉토리를 한 번만 생성합니다
 */
function ensureDir(dirPath: string): void {
    if (createdDirs.has(dirPath)) return;

    fs.mkdirSync(dirPath, { recursive: true });
    createdDirs.add(dirPath);
}

/**
 * 파일이 존재하는지 확인합니다
 */
function fileExists(filePath: string): boolean {
    try {
        fs.accessSync(filePath);
        return true;
    } catch {
        return false;
    }
}

function readFileSafe(filePath: string): string {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

function isLegacySwaggerModelFile(filePath: string): boolean {
    const content = readFileSafe(filePath);
    return content.includes(`from '@nestjs/swagger';`) && content.includes('ApiProperty');
}

generatorHandler({
    onGenerate: async (options: GeneratorOptions): Promise<void> => {
        // 캐시 초기화
        createdDirs.clear();

        // prisma generate는 프로젝트 루트에서 실행되므로 cwd 기준으로 검색
        const projectRoot = process.cwd();
        // schema.prisma의 generator 설정(config)으로 검색 루트를 오버라이드 가능
        // 기본값은 실제 리소스가 위치한 src/resources
        const searchRoot =
            (options.generator.config?.searchRoot as string | undefined) ??
            path.join(projectRoot, 'src', 'resources');

        const models = options.dmmf.datamodel.models;
        const enums = options.dmmf.datamodel.enums.map(v => ({
            ...v,
            values: v.values.map(x => ({ ...x })),
        }));
        const resourceModels = models.filter(m => !m.name.startsWith('Resource'));
        console.log(`\n🔧 ${resourceModels.length}개 모델에 대한 모듈 생성 중... (검색 루트: ${searchRoot})`);

        for (const model of resourceModels) {
            const kebabName = DatabaseGeneratorUtils.pascalToKebabCase(model.name);
            const upperName = DatabaseGeneratorUtils.pascalToUpperCase(model.name);
            const camelName = DatabaseGeneratorUtils.pascalToCamelCase(model.name);

            // src/_resources 하위에서 해당 모델의 .prisma 파일 경로 찾기
            const schemaPath = DatabaseGeneratorUtils.findFileRecursive(searchRoot, `${kebabName}.prisma`);
            if (!schemaPath) {
                continue;
            }

            const dir = path.dirname(schemaPath);
            const moduleFilePath = path.join(dir, `${kebabName}.module.ts`);

            const modelFilePath = path.join(dir, 'models', `${kebabName}.model.ts`);

            // 모듈이 이미 존재하는 경우
            if (fileExists(moduleFilePath)) {
                console.log(`🔍 모델 파일 확인 중: ${modelFilePath}`);
                console.log(`🔍 모델 파일 존재 여부: ${fileExists(modelFilePath)}`);

                const shouldRegenModels =
                    !fileExists(modelFilePath) || isLegacySwaggerModelFile(modelFilePath);

                if (shouldRegenModels) {
                    console.log(`✓ 모듈 ${model.name} 존재, 모델 포맷 정합성 맞추는 중...`);
                    const modelsDir = path.join(dir, 'models');
                    ensureDir(modelsDir);
                    generateModelFiles(model, enums, dir, kebabName, upperName);
                } else {
                    console.log(`✓ 모듈 ${model.name} 이미 존재, 건너뜀...`);
                }
                continue;
            }

            console.log(`📦 ${model.name} 모듈 생성 중...`);

            // agent 포맷: dto, controllers, models 만 생성
            const dirsToCreate = [path.join(dir, 'dto'), path.join(dir, 'controllers'), path.join(dir, 'models')];

            // 디렉토리 생성
            for (const dirPath of dirsToCreate) {
                ensureDir(dirPath);
            }

            // 모델 파일 생성
            generateModelFiles(model, enums, dir, kebabName, upperName);

            // 모듈 관련 파일들 생성
            generateModuleFiles(model, dir, kebabName, upperName, camelName);

            console.log(`✅ 모듈 ${model.name} 생성 완료`);
        }

        console.log('\n✨ 생성 완료!\n');
    },
});

/**
 * 모델 관련 파일들을 생성합니다
 */
function generateModelFiles(model: any, enums: any[], dir: string, kebabName: string, upperName: string): void {
    const modelFilePath = path.join(dir, 'models', `${kebabName}.model.ts`);

    const { prismaImports, propertyValues } = buildUserStyleModel(model, enums);

    // Model 파일 생성
    console.log(`📝 모델 파일 생성 중: ${modelFilePath}`);
    fs.writeFileSync(modelFilePath, template.model(model.name, prismaImports, propertyValues));
    console.log(`✅ 모델 파일 생성 완료`);

    const operationModelPath = path.join(dir, 'models', `${kebabName}.operation.model.ts`);
    console.log(`📝 operation 모델 파일 생성 중: ${operationModelPath}`);
    fs.writeFileSync(operationModelPath, template.operationModel(model.name, kebabName, upperName));
    console.log(`✅ operation 모델 파일 생성 완료`);
}

function buildUserStyleModel(model: any, enums: any[]): { prismaImports: string[]; propertyValues: string } {
    const excluded = new Set(['createdAt', 'updatedAt', 'deletedAt']);

    const prismaImports = new Set<string>([model.name]);
    const lines: string[] = [];

    const scalarOrEnumFields = (model.fields ?? [])
        .filter((f: any) => ['scalar', 'enum'].includes(f.kind))
        .filter((f: any) => !excluded.has(f.name));

    for (const field of scalarOrEnumFields) {
        const isNullable = !field.isRequired;
        const desc = (field.documentation ?? field.name).toString().replace(/'/g, "\\'");

        // ts type + Property 옵션
        let tsType = 'unknown';
        let propertyDecorator = `@Property({ description: '${desc}', type: String, nullable: ${isNullable} })`;

        if (field.kind === 'enum') {
            prismaImports.add(field.type);
            tsType = field.type;
            propertyDecorator = `@Property({ description: '${desc}', enum: ${field.type}, nullable: ${isNullable} })`;
        } else {
            switch (field.type) {
                case 'String':
                    tsType = 'string';
                    propertyDecorator = `@Property({ description: '${desc}', type: String, nullable: ${isNullable} })`;
                    break;
                case 'Int':
                case 'Float':
                    tsType = 'number';
                    propertyDecorator = `@Property({ description: '${desc}', type: Number, nullable: ${isNullable} })`;
                    break;
                case 'Boolean':
                    tsType = 'boolean';
                    propertyDecorator = `@Property({ description: '${desc}', type: Boolean, nullable: ${isNullable} })`;
                    break;
                case 'DateTime':
                    tsType = 'Date';
                    propertyDecorator = `@Property({ description: '${desc}', type: Date, nullable: ${isNullable} })`;
                    break;
                case 'BigInt':
                    tsType = 'bigint';
                    propertyDecorator = `@Property({ description: '${desc}', type: String, nullable: ${isNullable} })`;
                    break;
                case 'Decimal':
                    // 프로젝트 내에서 Decimal을 모델에 노출하는 방식이 애매하므로 string으로 표현(필요시 조정 가능)
                    tsType = 'string';
                    propertyDecorator = `@Property({ description: '${desc}', type: String, nullable: ${isNullable} })`;
                    break;
                default:
                    tsType = 'unknown';
                    propertyDecorator = `@Property({ description: '${desc}', type: String, nullable: ${isNullable} })`;
                    break;
            }
        }

        const typeSuffix = isNullable ? ' | null' : '';
        lines.push(`    ${propertyDecorator}`);
        lines.push(`    ${field.name}: ${tsType}${typeSuffix};`);
        lines.push('');
    }

    // 마지막 공백 라인 제거
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    return {
        prismaImports: [...prismaImports],
        propertyValues: lines.join('\n'),
    };
}

function buildCreateDtoFields(model: any): { pick: string[]; optional: string[] } {
    const excluded = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt']);
    const scalarOrEnumFields = (model.fields ?? [])
        .filter((f: any) => ['scalar', 'enum'].includes(f.kind))
        .filter((f: any) => !excluded.has(f.name));

    const pick: string[] = [];
    const optional: string[] = [];

    for (const field of scalarOrEnumFields) {
        const lit = `'${field.name}'`;
        if (field.isRequired) pick.push(lit);
        else optional.push(lit);
    }

    return { pick, optional };
}

/**
 * 모듈 관련 파일들을 생성합니다
 */
function generateModuleFiles(model: any, dir: string, kebabName: string, upperName: string, camelName: string): void {
    const { pick, optional } = buildCreateDtoFields(model);

    // 생성할 파일 목록
    const files = [
        {
            path: path.join(dir, `${kebabName}.module.ts`),
            content: template.module(model.name, kebabName),
        },
        {
            path: path.join(dir, 'controllers', `${kebabName}.controller.ts`),
            content: template.controller(model.name, kebabName, upperName),
        },
        {
            path: path.join(dir, `${kebabName}.service.ts`),
            content: template.service(model.name, kebabName),
        },
        {
            path: path.join(dir, `${kebabName}.repository.ts`),
            content: template.repository(model.name, kebabName, camelName),
        },
        {
            path: path.join(dir, `${kebabName}.constants.ts`),
            content: template.constants(model.name, upperName),
        },
        {
            path: path.join(dir, 'dto', `${kebabName}.create.dto.ts`),
            content: template.createDto(model.name, kebabName, pick, optional),
        },
    ];

    // 파일 생성
    for (const file of files) {
        fs.writeFileSync(file.path, file.content);
    }
}
