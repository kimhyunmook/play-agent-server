/** Swagger 문서 스타일용 문서 타입 */
interface SwaggerDocForTags {
    tags?: Array<{ name: string }>;
    paths?: Record<string, Record<string, { tags?: string[] }>>;
}

/** 문서에서 태그 목록 추출 (root tags 또는 paths에서 수집) */
export function getTagNames(document: SwaggerDocForTags): string[] {
    const fromRoot = document.tags ?? [];
    if (fromRoot.length > 0) {
        return fromRoot.map(t => (typeof t === 'string' ? t : t.name));
    }
    const set = new Set<string>();
    const paths = document.paths ?? {};
    for (const ops of Object.values(paths)) {
        if (ops && typeof ops === 'object') {
            for (const op of Object.values(ops)) {
                if (op && typeof op === 'object' && Array.isArray((op as { tags?: string[] }).tags)) {
                    for (const t of (op as { tags: string[] }).tags) set.add(t);
                }
            }
        }
    }
    return Array.from(set);
}

/** 태그를 첫 경로 단위로 그룹화한 그룹 이름 목록 (예: auth/admin → auth) */
export function getTagGroupNames(document: SwaggerDocForTags): string[] {
    const tagNames = getTagNames(document);
    const groupNames = new Set<string>();
    for (const tag of tagNames) {
        const firstSegment = tag.split('/')[0];
        if (firstSegment) groupNames.add(firstSegment);
    }
    return Array.from(groupNames);
}

/** 그룹 이름이면서 동시에 태그 이름인 것 (태그와 그룹 이름이 같은 경우) */
export function getTagNamesSameAsGroup(document: SwaggerDocForTags, groupNames: string[]): string[] {
    const tagNames = new Set(getTagNames(document));
    return groupNames.filter(name => tagNames.has(name));
}

/** 태그와 일치하는 경로 세그먼트용 CSS 생성 (JS로 span 감싼 뒤 적용) */
export function buildTagGroupHighlightCss(_tagNames: string[]): string {
    return `
            .swagger-ui .swagger-path-tag-highlight {
                color: #ea580c;
                font-weight: 700;
                background: rgba(234, 88, 12, 0.12);
                padding: 1px 4px;
                border-radius: 4px;
            }
        `;
}

/** 태그와 동일한 엔드포인트 텍스트를 전부 하이라이트 (auth, admin/users 등 모두) */
export function buildTagPathHighlightScript(tagNames: string[]): string {
    if (tagNames.length === 0) return '';
    const tagNamesJson = JSON.stringify(tagNames);
    return `
(function() {
    var TAG_NAMES = ${tagNamesJson};
    function run() {
        var pathEls = document.querySelectorAll('.swagger-ui .opblock-summary-path');
        Array.prototype.forEach.call(pathEls, function(el) {
            if (el.dataset.tagPathHighlighted) return;
            var section = el.closest('.opblock-tag-section');
            var opblockTag = section && section.querySelector('.opblock-tag');
            var tag = opblockTag ? opblockTag.getAttribute('data-tag') : null;
            if (!tag || TAG_NAMES.indexOf(tag) === -1) return;
            var text = el.textContent || '';
            var segment = '/' + tag;
            if (text.indexOf(segment) === -1) return;
            var nodes = [];
            var remaining = text;
            var idx;
            while ((idx = remaining.indexOf(segment)) >= 0) {
                if (idx > 0) nodes.push(document.createTextNode(remaining.slice(0, idx)));
                var span = document.createElement('span');
                span.className = 'swagger-path-tag-highlight';
                span.textContent = segment;
                nodes.push(span);
                remaining = remaining.slice(idx + segment.length);
            }
            if (remaining) nodes.push(document.createTextNode(remaining));
            el.textContent = '';
            nodes.forEach(function(n) { el.appendChild(n); });
            el.dataset.tagPathHighlighted = '1';
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(run, 500); });
    } else {
        setTimeout(run, 500);
    }
    var observer = new MutationObserver(function() { setTimeout(run, 100); });
    observer.observe(document.body, { childList: true, subtree: true });
})();
`.trim();
}
