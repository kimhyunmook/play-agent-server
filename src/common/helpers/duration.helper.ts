/**
 * 기간을 일(day) 수로 변환합니다.
 * 숫자·숫자 문자열은 그대로 일수로 쓰고, 한글 단위(박/일/달/년)는 파싱합니다.
 */
export const toDurationDays = (duration?: string | number): number | undefined => {
    if (duration === undefined || duration === null) return undefined;

    if (typeof duration === 'number') {
        return Number.isFinite(duration) && duration > 0 ? Math.trunc(duration) : undefined;
    }

    const trimmed = duration.trim();
    if (trimmed === '') return undefined;

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
        const n = Number(trimmed);
        return Number.isFinite(n) && n > 0 ? Math.trunc(n) : undefined;
    }

    const normalized = trimmed.replace(/\s+/g, '');

    const nightDay = normalized.match(/^(\d+)박(\d+)일$/);
    if (nightDay) {
        const days = Number(nightDay[2]);
        return Number.isFinite(days) && days > 0 ? days : undefined;
    }

    const monthMatch = normalized.match(/^(\d+)달$/);
    if (monthMatch) {
        const m = Number(monthMatch[1]);
        return Number.isFinite(m) && m > 0 ? m * 30 : undefined;
    }

    const yearMatch = normalized.match(/^(\d+)년$/);
    if (yearMatch) {
        const y = Number(yearMatch[1]);
        return Number.isFinite(y) && y > 0 ? y * 365 : undefined;
    }

    const dayOnly = normalized.match(/^(\d+)일$/);
    if (dayOnly) {
        const d = Number(dayOnly[1]);
        return Number.isFinite(d) && d > 0 ? d : undefined;
    }

    return undefined;
};
