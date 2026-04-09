import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { injectRawBlocks } from './utils/inject-blocks';

/** Swagger Multi Token 스크립트에 주입할 Enum 구조 (Prisma $Enums 호환) */
export interface MultiTokenEnums {
    ADMIN_ROLE?: Record<string, string>;
    USER_ROLE?: Record<string, string>;
}

const PLACEHOLDER_APP_NAME = '__APP_NAME__';
const PLACEHOLDER_ENUMS_JSON = '__ENUMS_JSON__';

/** 분리된 raw 파일명 목록. 새 파일 분리 시 여기에만 추가 (플레이스홀더는 자동: token-selector.raw.js → __TOKEN_SELECTOR_BLOCK__) */
const RAW_BLOCK_FILE_NAMES: string[] = ['token-selector.raw.js'];

/** BigInt, undefined 등 JSON.stringify에서 깨질 수 있는 값 처리 */
function safeStringify(enums: MultiTokenEnums): string {
    return JSON.stringify(enums, (_key, value) => {
        if (typeof value === 'bigint') return value.toString();
        if (value === undefined) return null;
        return value as unknown;
    });
}

let cachedScriptBody: string | null = null;

/** dist 또는 src 기준으로 raw 스크립트 파일 경로 반환 */
function getRawScriptPath(): string {
    const dir = __dirname;
    const candidates = [
        join(dir, 'swagger-multitoken.client.raw.js'),
        join(process.cwd(), 'src', 'core', 'swagger', 'swagger-multitoken.client.raw.js'),
    ];
    for (const p of candidates) {
        try {
            if (existsSync(p)) return p;
        } catch {
            /* ignore */
        }
    }
    return candidates[0];
}

/**
 * Swagger UI용 Multi Token 스크립트 문자열 생성.
 */
export function createMultiTokenScript(appName: string, enums: MultiTokenEnums): string {
    if (cachedScriptBody === null) {
        const scriptPath = getRawScriptPath();
        const scriptDir = join(scriptPath, '..');
        let body = readFileSync(scriptPath, 'utf-8');
        body = injectRawBlocks(body, scriptDir, RAW_BLOCK_FILE_NAMES);
        cachedScriptBody = body;
    }
    const appNameEscaped = JSON.stringify(appName);
    const enumsJson = safeStringify(enums);
    return cachedScriptBody
        .split(PLACEHOLDER_APP_NAME)
        .join(appNameEscaped)
        .split(PLACEHOLDER_ENUMS_JSON)
        .join(enumsJson);
}

export default createMultiTokenScript;
