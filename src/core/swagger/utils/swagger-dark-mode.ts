const STORAGE_KEY = 'swagger-dark-mode';

/** Swagger 다크모드 CSS */
export function buildSwaggerDarkModeCssV2(): string {
    return `
        .swagger-dark-mode .swagger-ui { background: #1a1a1a; color: #e5e7eb; }
        .swagger-dark-mode .swagger-ui .information-container { background: #262626; border-color: #404040; }
        .swagger-dark-mode .swagger-ui .info .title { color: #f3f4f6; }
        .swagger-dark-mode .swagger-ui .info p, .swagger-dark-mode .swagger-ui .info span { color: #d1d5db; }
        .swagger-dark-mode .swagger-ui .opblock-tag { background: #262626; border-color: #404040; color: #e5e7eb; }
        .swagger-dark-mode .swagger-ui .opblock-tag:hover { background: #333; }
        .swagger-dark-mode .swagger-ui .opblock { background: #262626; border-color: #404040; }
        .swagger-dark-mode .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
        .swagger-dark-mode .swagger-ui .opblock.opblock-post { border-color: #22c55e; background: rgba(34,197,94,0.08); }
        .swagger-dark-mode .swagger-ui .opblock.opblock-put { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
        .swagger-dark-mode .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239,68,68,0.08); }
        .swagger-dark-mode .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; background: rgba(139,92,246,0.08); }
        .swagger-dark-mode .swagger-ui .opblock-summary { border-color: #404040; }
        .swagger-dark-mode .swagger-ui .opblock-summary-path { color: #e5e7eb; }
        .swagger-dark-mode .swagger-ui .opblock-summary-description { color: #9ca3af; }
        .swagger-dark-mode .swagger-ui .opblock-body { background: #1f1f1f; border-color: #404040; color: #d1d5db; }
        .swagger-dark-mode .swagger-ui .opblock-body pre { background: #0d0d0d; color: #e5e7eb; }
        .swagger-dark-mode .swagger-ui .opblock-body label { color: #d1d5db; }
        .swagger-dark-mode .swagger-ui .opblock-body input, .swagger-dark-mode .swagger-ui .opblock-body textarea, .swagger-dark-mode .swagger-ui .opblock-body select {
            background: #262626; border-color: #525252; color: #e5e7eb;
        }
        .swagger-dark-mode .swagger-ui table thead tr td { border-color: #404040; color: #f3f4f6; background: #262626; }
        .swagger-dark-mode .swagger-ui table tbody tr td { border-color: #404040; color: #d1d5db; }
        .swagger-dark-mode .swagger-ui .model { color: #d1d5db; }
        .swagger-dark-mode .swagger-ui .model-box { background: #1f1f1f; border-color: #404040; }
        .swagger-dark-mode .swagger-ui .model-box-control { color: #9ca3af; }
        .swagger-dark-mode .swagger-ui .swagger-path-tag-highlight {
            color: #fbbf24 !important;
            background: rgba(251,191,36,0.28) !important;
        }
        .swagger-dark-mode .swagger-ui .btn { background: #404040; color: #e5e7eb; border-color: #525252; }
        .swagger-dark-mode .swagger-ui .btn.authorize { border-color: #22c55e; color: #22c55e; }
        .swagger-dark-mode .swagger-ui .btn.authorize svg { fill: #22c55e; }
        .swagger-dark-mode .swagger-ui .topbar { background: #0d0d0d; border-color: #404040; }
        .swagger-dark-mode .swagger-ui .topbar .download-url-wrapper input { border-color: #525252; background: #262626; color: #e5e7eb; }
        .swagger-dark-mode .swagger-ui .info a { color: #60a5fa; }
        .swagger-dark-mode .swagger-ui a { color: #60a5fa; }
        .swagger-dark-mode .swagger-ui .opblock .opblock-summary-method { color: #fff; }
    `;
}

/** 다크모드 토글 버튼 및 상태 복원 JS */
export function buildSwaggerDarkModeScript(): string {
    return `
(function() {
    var KEY = '${STORAGE_KEY}';
    function isDark() { return localStorage.getItem(KEY) === '1'; }
    function setDark(v) {
        localStorage.setItem(KEY, v ? '1' : '0');
        document.documentElement.classList.toggle('swagger-dark-mode', v);
        if (window.swaggerDarkModeBtn) {
            window.swaggerDarkModeBtn.textContent = v ? '☀ Light' : '🌙 Dark';
        }
    }
    function toggle() { setDark(!isDark()); }
    function init() {
        setDark(isDark());
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = isDark() ? '☀ Light' : '🌙 Dark';
        btn.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;padding:8px 14px;border-radius:8px;border:1px solid #404040;background:#262626;color:#e5e7eb;cursor:pointer;font-size:13px;font-weight:500;';
        btn.onclick = toggle;
        document.body.appendChild(btn);
        window.swaggerDarkModeBtn = btn;
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 800);
})();
`.trim();
}
