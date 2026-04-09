import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DATABASE_GENERATOR } from './core/constant';
import { DatabaseGeneratorTemplateInfo } from './core/template/info';
import { DatabaseGeneratorImportMap } from './core/type';
import { DatabaseGeneratorUtils } from './core/utils';

const { MAP_KEY } = DATABASE_GENERATOR;
const infoTemplate = new DatabaseGeneratorTemplateInfo();

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

generatorHandler({
    onGenerate: async (options: GeneratorOptions) => {
        // 캐시 초기화
        createdDirs.clear();

        const output = options.generator.output?.value;
        if (!output) throw new Error('Info 제너레이터 output이 정의되지 않았습니다.');

        const models = options.dmmf.datamodel.models;
        const enums = options.dmmf.datamodel.enums.map(v => ({
            ...v,
            values: v.values.map(x => ({ ...x })),
        }));
        const infoModels = models.filter(m => m.name.startsWith('Info'));

        console.log(`\n🔧 ${infoModels.length}개 Info 모듈 생성 중...`);

        for (const model of infoModels) {
            const kebabName = DatabaseGeneratorUtils.pascalToKebabCase(model.name);
            const upperName = DatabaseGeneratorUtils.pascalToUpperCase(model.name);
            const camelName = DatabaseGeneratorUtils.pascalToCamelCase(model.name);

            // 스키마 파일 경로 찾기
            const schemaPath = DatabaseGeneratorUtils.findFileRecursive(output, `${kebabName}.prisma`);
            if (!schemaPath) {
                console.warn(`⚠️  ${model.name} 스키마 파일을 찾을 수 없음, 건너뜀...`);
                continue;
            }

            const dir = schemaPath.replace(`/${kebabName}.prisma`, '');
            const moduleFilePath = path.join(dir, `${kebabName}.module.ts`);
            const modelFilePath = path.join(dir, `${kebabName}.model.ts`);

            // 모듈이 이미 존재하는 경우
            if (fileExists(moduleFilePath)) {
                // 모델 파일이 없으면 생성
                if (!fileExists(modelFilePath)) {
                    console.log(`✓ Info 모듈 ${model.name} 존재, 누락된 모델 파일 생성 중...`);
                    generateInfoModelFile(model, enums, dir, kebabName, upperName);
                } else {
                    console.log(`✓ Info 모델 ${model.name} 이미 존재, 건너뜀...`);
                }
                continue;
            }

            console.log(`📦 ${model.name} Info 모듈 생성 중...`);

            // 필요한 디렉토리 생성
            const dirsToCreate = [path.join(dir, 'dto'), path.join(dir, 'dto', 'response')];

            for (const dirPath of dirsToCreate) {
                ensureDir(dirPath);
            }

            // 모델 파일 생성
            generateInfoModelFile(model, enums, dir, kebabName, upperName);

            // 모듈 관련 파일들 생성
            generateInfoModuleFiles(model, dir, kebabName, upperName, camelName);

            console.log(`✅ Info 모듈 ${model.name} 생성 완료`);
        }

        console.log('\n✨ Info 생성 완료!\n');
    },
});

/**
 * Info 모델 파일을 생성합니다
 */
function generateInfoModelFile(model: any, enums: any[], dir: string, kebabName: string, upperName: string): void {
    const modelImportMap: DatabaseGeneratorImportMap = new Map();

    DatabaseGeneratorUtils.registerByImport(modelImportMap, MAP_KEY.PRISMA, '@prisma/client');
    DatabaseGeneratorUtils.registerByImport(modelImportMap, MAP_KEY.CLASS_VALIDATOR, 'class-validator');
    DatabaseGeneratorUtils.registerByImport(modelImportMap, MAP_KEY.CLASS_TRANSFORM, 'class-transformer', ['Type']);
    DatabaseGeneratorUtils.registerByImport(
        modelImportMap,
        MAP_KEY.IS_BOOLEAN_FN,
        '@common/decorators/is-boolean.decorator',
    );
    DatabaseGeneratorUtils.registerByImport(
        modelImportMap,
        MAP_KEY.EXCLUDE_ENUM_VALUE_FN,
        '@common/functions/exclude-enum-value',
    );
    DatabaseGeneratorUtils.registerByImport(
        modelImportMap,
        MAP_KEY.PRISMA_DECIMAL,
        '@core/database/decorators/prisma-decimal',
    );
    DatabaseGeneratorUtils.registerByImport(
        modelImportMap,
        MAP_KEY.PRISMA_BIGINT,
        '@core/database/decorators/prisma-bigint',
    );

    // includeRelations를 false로 설정하여 관계 필드 제외
    const modelProperties = DatabaseGeneratorUtils.getModelProperties(model, enums, modelImportMap, false, false);
    const modelImportValues = DatabaseGeneratorUtils.getImportValues(modelImportMap);

    fs.writeFileSync(
        path.join(dir, `${kebabName}.model.ts`),
        infoTemplate.model(model.name, modelImportValues, modelProperties),
    );
}

/**
 * Info 모듈 관련 파일들을 생성합니다
 */
function generateInfoModuleFiles(
    model: any,
    dir: string,
    kebabName: string,
    upperName: string,
    camelName: string,
): void {
    const files = [
        // 모듈 파일
        {
            path: path.join(dir, `${kebabName}.module.ts`),
            content: infoTemplate.module(model.name, kebabName),
        },
        // 컨트롤러 파일
        {
            path: path.join(dir, `${kebabName}.controller.ts`),
            content: infoTemplate.controller(model.name, kebabName, upperName),
        },
        // 서비스 파일
        {
            path: path.join(dir, `${kebabName}.service.ts`),
            content: infoTemplate.service(model.name, kebabName),
        },
        // 리포지토리 파일
        {
            path: path.join(dir, `${kebabName}.repository.ts`),
            content: infoTemplate.repository(model.name, kebabName, camelName),
        },
        // 상수 파일
        {
            path: path.join(dir, `${kebabName}.constant.ts`),
            content: infoTemplate.constant(upperName, kebabName, model.documentation),
        },
        // DTO 파일
        {
            path: path.join(dir, 'dto', `${kebabName}.find-many.dto.ts`),
            content: infoTemplate.findManyRequestDto(model.name, kebabName),
        },
        // Response DTO 파일
        {
            path: path.join(dir, 'dto', 'response', `${kebabName}.find-many.response.dto.ts`),
            content: infoTemplate.findManyResponseDto(model.name, kebabName),
        },
    ];

    // 파일 생성
    for (const file of files) {
        fs.writeFileSync(file.path, file.content);
    }
}
