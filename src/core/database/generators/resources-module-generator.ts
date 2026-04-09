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

generatorHandler({
    onGenerate: async (options: GeneratorOptions) => {
        // 캐시 초기화
        createdDirs.clear();

        const output = options.generator.output?.value;
        if (!output) throw new Error('리소스 모듈 제너레이터 output이 정의되지 않았습니다.');

        // prisma generate는 프로젝트 루트에서 실행되므로 cwd 기준으로 검색
        const projectRoot = process.cwd();
        const searchRoot = path.join(projectRoot, 'src', '_resources');

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

            // Info 모델과 일반 모델의 경로 구분
            const isInfoModel = model.name.startsWith('Info');
            const modelFilePath = isInfoModel
                ? path.join(dir, `${kebabName}.model.ts`)
                : path.join(dir, 'models', `${kebabName}.model.ts`);
            const operationModelFilePath = path.join(dir, 'models', `${kebabName}.operation.model.ts`);

            // 모듈이 이미 존재하는 경우
            if (fileExists(moduleFilePath)) {
                console.log(`🔍 모델 파일 확인 중: ${modelFilePath}`);
                console.log(`🔍 모델 파일 존재 여부: ${fileExists(modelFilePath)}`);

                // 모델 파일이 없으면 생성
                if (!fileExists(modelFilePath)) {
                    console.log(`✓ 모듈 ${model.name} 존재, 누락된 모델 파일 생성 중...`);
                    console.log(`📁 필요한 디렉터리 생성 중...`);

                    // 필요한 디렉토리 생성
                    if (!isInfoModel) {
                        const modelsDir = path.join(dir, 'models');
                        console.log(`📁 models 디렉터리 생성 중: ${modelsDir}`);
                        ensureDir(modelsDir);
                    }

                    console.log(`🛠️  generateModelFiles 호출 중...`);
                    generateModelFiles(model, enums, dir, kebabName, upperName);
                    console.log(`✅ 모델 파일 생성 완료`);
                } else {
                    console.log(`✓ 모듈 ${model.name} 이미 존재, 건너뜀...`);
                }
                continue;
            }

            console.log(`📦 ${model.name} 모듈 생성 중...`);

            // 필요한 디렉토리들을 한 번에 생성
            const dirsToCreate = [
                path.join(dir, 'dto', 'response'),
                path.join(dir, 'controllers'),
                path.join(dir, 'adapters'),
            ];

            // Info 모델이 아닌 경우만 models 폴더 추가
            if (!model.name.startsWith('Info')) {
                dirsToCreate.push(path.join(dir, 'models'));
                dirsToCreate.push(path.join(dir, 'relations'));
            }

            // 디렉토리 생성
            for (const dirPath of dirsToCreate) {
                ensureDir(dirPath);
            }

            // relations 폴더에 rel.prisma 파일 생성 (Info 모델이 아닌 경우)
            if (!model.name.startsWith('Info')) {
                const relPrismaPath = path.join(dir, 'relations', 'rel.prisma');
                if (!fileExists(relPrismaPath)) {
                    fs.writeFileSync(relPrismaPath, `// ${model.name} 관계\n`);
                }
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
    // Import map 설정
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

    // 관계 필드는 모델에 포함하지 않으므로 import도 필요 없음

    // Info 모델과 일반 모델의 경로 구분
    const isInfoModel = model.name.startsWith('Info');
    const modelFilePath = isInfoModel
        ? path.join(dir, `${kebabName}.model.ts`)
        : path.join(dir, 'models', `${kebabName}.model.ts`);

    // Model 파일 생성
    console.log(`📝 모델 파일 생성 중: ${modelFilePath}`);
    fs.writeFileSync(modelFilePath, template.model(model.name, modelImportValues, modelProperties));
    console.log(`✅ 모델 파일 생성 완료`);

    // OperationModel 파일은 Info 모델이 아닌 경우에만 생성
    if (!isInfoModel) {
        const operationModelPath = path.join(dir, 'models', `${kebabName}.operation.model.ts`);
        console.log(`📝 operation 모델 파일 생성 중: ${operationModelPath}`);
        fs.writeFileSync(operationModelPath, template.operationModel(model.name, kebabName, upperName));
        console.log(`✅ operation 모델 파일 생성 완료`);
    }
}

/**
 * relations 폴더에서 하위 모듈을 찾습니다
 */
function findRelationModules(dir: string): { name: string; folder: string }[] {
    const relationsDir = path.join(dir, 'relations');
    const relationModules: { name: string; folder: string }[] = [];

    if (fs.existsSync(relationsDir)) {
        const entries = fs.readdirSync(relationsDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const relationPath = path.join(relationsDir, entry.name);
                // 폴더 내에 .prisma 파일이 있는지 확인
                const prismaFiles = fs.readdirSync(relationPath).filter(f => f.endsWith('.prisma'));
                if (prismaFiles.length > 0) {
                    // prisma 파일명에서 모델명 추출 (예: test-comment.prisma -> TestComment)
                    const modelName = prismaFiles[0].replace('.prisma', '');
                    const pascalName = DatabaseGeneratorUtils.camelToPascalCase(
                        modelName
                            .split('-')
                            .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
                            .join(''),
                    );
                    relationModules.push({
                        name: pascalName,
                        folder: entry.name,
                    });
                }
            }
        }
    }

    return relationModules;
}

/**
 * 모듈 관련 파일들을 생성합니다
 */
function generateModuleFiles(model: any, dir: string, kebabName: string, upperName: string, camelName: string): void {
    // relations 폴더에서 하위 모듈 찾기
    const relationModules = findRelationModules(dir);

    // 생성할 파일 목록
    const files = [
        // 모듈 파일
        {
            path: path.join(dir, `${kebabName}.module.ts`),
            content: template.module(model.name, kebabName, relationModules),
        },
        // 컨트롤러 파일들
        {
            path: path.join(dir, 'controllers', `${kebabName}.mgmt.controller.ts`),
            content: template.controller(model.name, kebabName, upperName, 'Mgmt', 'mgmt', model),
        },
        {
            path: path.join(dir, 'controllers', `${kebabName}.public.controller.ts`),
            content: template.controller(model.name, kebabName, upperName, 'Public', 'public', model),
        },
        // 어댑터 파일들
        {
            path: path.join(dir, 'adapters', `${kebabName}.mgmt.adapter.ts`),
            content: template.adapter(model.name, kebabName, upperName, 'Mgmt', 'mgmt', model),
        },
        {
            path: path.join(dir, 'adapters', `${kebabName}.public.adapter.ts`),
            content: template.adapter(model.name, kebabName, upperName, 'Public', 'public', model),
        },
        // 서비스 파일
        {
            path: path.join(dir, `${kebabName}.service.ts`),
            content: template.service(model.name, kebabName, upperName),
        },
        // 리포지토리 파일
        {
            path: path.join(dir, `${kebabName}.repository.ts`),
            content: template.repository(model.name, kebabName, camelName),
        },
        // 상수 파일
        {
            path: path.join(dir, `${kebabName}.constant.ts`),
            content: template.constant(upperName, kebabName, model.documentation),
        },
        // DTO 파일들
        {
            path: path.join(dir, 'dto', `${kebabName}.mgmt.create.dto.ts`),
            content: template.reqDto(model.name, kebabName, 'Mgmt', 'Create', false, true, model),
        },
        {
            path: path.join(dir, 'dto', `${kebabName}.mgmt.update.dto.ts`),
            content: template.reqDto(model.name, kebabName, 'Mgmt', 'Update', false, true, model),
        },
        {
            path: path.join(dir, 'dto', `${kebabName}.mgmt.find-list.dto.ts`),
            content: template.reqDto(model.name, kebabName, 'Mgmt', 'FindList', true, true, model),
        },
        {
            path: path.join(dir, 'dto', `${kebabName}.public.create.dto.ts`),
            content: template.reqDto(model.name, kebabName, 'Public', 'Create', false, true, model),
        },
        {
            path: path.join(dir, 'dto', `${kebabName}.public.update.dto.ts`),
            content: template.reqDto(model.name, kebabName, 'Public', 'Update', false, true, model),
        },
        {
            path: path.join(dir, 'dto', `${kebabName}.public.find-list.dto.ts`),
            content: template.reqDto(model.name, kebabName, 'Public', 'FindList', true, true, model),
        },
        // Response DTO 파일들
        {
            path: path.join(dir, 'dto', 'response', `${kebabName}.mgmt.find-unique.response.dto.ts`),
            content: template.resDto(model.name, kebabName, 'Mgmt', 'FindUnique', false, false, model),
        },
        {
            path: path.join(dir, 'dto', 'response', `${kebabName}.mgmt.find-list.response.dto.ts`),
            content: template.resDto(model.name, kebabName, 'Mgmt', 'FindList', true, true, model),
        },
        {
            path: path.join(dir, 'dto', 'response', `${kebabName}.public.find-unique.response.dto.ts`),
            content: template.resDto(model.name, kebabName, 'Public', 'FindUnique', false, false, model),
        },
        {
            path: path.join(dir, 'dto', 'response', `${kebabName}.public.find-list.response.dto.ts`),
            content: template.resDto(model.name, kebabName, 'Public', 'FindList', true, true, model),
        },
    ];

    // 파일 생성
    for (const file of files) {
        fs.writeFileSync(file.path, file.content);
    }
}
