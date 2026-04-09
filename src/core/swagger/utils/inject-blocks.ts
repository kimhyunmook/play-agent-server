import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/** 파일명에서 플레이스홀더 생성. 예: token-selector.raw.js → __TOKEN_SELECTOR_BLOCK__ */
export function getPlaceholderFromFileName(fileName: string): string {
    const base = fileName.replace(/\.raw\.js$/i, '').trim();
    const constant = base.replace(/[-.]/g, '_').toUpperCase();
    return `__${constant}_BLOCK__`;
}

/** scriptDir 기준으로 raw 파일 경로 반환 (같은 디렉터리 또는 multitoken-client 하위) */
export function resolveRawFilePath(scriptDir: string, fileName: string): string {
    const candidates = [join(scriptDir, fileName), join(scriptDir, 'multitoken-client', fileName)];
    const found = candidates.find(p => existsSync(p));
    if (!found) {
        throw new Error(`[inject-blocks] ${fileName}를 찾을 수 없습니다. 시도한 경로: ${candidates.join(', ')}`);
    }
    return found;
}

/**
 * body에서 플레이스홀더들을 각 raw 파일 내용으로 치환.
 * @param body 원본 문자열
 * @param scriptDir raw 파일을 찾을 기준 디렉터리
 * @param fileNames 파일명 배열. 플레이스홀더는 자동 생성 (token-selector.raw.js → __TOKEN_SELECTOR_BLOCK__)
 */
export function injectRawBlocks(body: string, scriptDir: string, fileNames: string[]): string {
    let result = body;
    for (const fileName of fileNames) {
        const placeholder = getPlaceholderFromFileName(fileName);
        const filePath = resolveRawFilePath(scriptDir, fileName);
        const content = readFileSync(filePath, 'utf-8');
        result = result.split(placeholder).join(content);
    }
    return result;
}
