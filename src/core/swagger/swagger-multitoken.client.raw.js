(function () {
    const APP_NAME = __APP_NAME__;
    const ENUMS = __ENUMS_JSON__;

    const STORAGE_KEY = 'swagger-multi-token-' + APP_NAME;
    const SELECTED_TOKEN_KEY = 'swagger-selected-token-' + APP_NAME;

    // Enum 값을 읽기 쉬운 라벨로 변환
    function generateLabel(role) {
        // 언더스코어를 공백으로 변환하고, 각 단어의 첫 글자를 대문자로
        return role
            .split('_')
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    // $Enums에서 TOKEN_TYPES 생성
    function generateTokenTypes() {
        const tokenTypes = [];

        // AdminRole 추가
        if (ENUMS.ADMIN_ROLE) {
            Object.values(ENUMS.ADMIN_ROLE).forEach(function (role) {
                const key = role.toLowerCase().replace(/_/g, '');
                const label = generateLabel(role);
                tokenTypes.push({ key: key, label: label, role: role, type: 'admin' });
            });
        }

        // UserRole 추가
        if (ENUMS.USER_ROLE) {
            Object.values(ENUMS.USER_ROLE).forEach(function (role) {
                const key = role.toLowerCase().replace(/_/g, '');
                const label = generateLabel(role);
                tokenTypes.push({ key: key, label: label, role: role, type: 'user' });
            });
        }

        return tokenTypes;
    }

    const TOKEN_TYPES = generateTokenTypes();

    let tokens = {};
    let selectedTokenType = TOKEN_TYPES[0]?.key || '';
    let radioElements = {};

    function loadTokens() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                tokens = JSON.parse(stored);
            } else {
                tokens = {};
                TOKEN_TYPES.forEach(function (type) {
                    tokens[type.key] = '';
                });
            }
            const selected = localStorage.getItem(SELECTED_TOKEN_KEY);
            if (
                selected &&
                TOKEN_TYPES.find(function (t) {
                    return t.key === selected;
                })
            ) {
                selectedTokenType = selected;
            }
        } catch (e) {
            console.error('Failed to load tokens:', e);
            tokens = {};
            TOKEN_TYPES.forEach(function (type) {
                tokens[type.key] = '';
            });
        }
    }

    function saveTokens() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
            localStorage.setItem(SELECTED_TOKEN_KEY, selectedTokenType);
        } catch (e) {
            console.error('Failed to save tokens:', e);
        }
    }

    function getSelectedToken() {
        return tokens[selectedTokenType] || '';
    }

    __TOKEN_SELECTOR_BLOCK__;

    function updateSwaggerAuth() {
        const token = getSelectedToken();
        if (!token) return;

        try {
            const authStorageKey = Object.keys(localStorage).find(function (key) {
                return key.includes('swagger-ui') && key.includes('authorize');
            });

            if (authStorageKey) {
                const authData = JSON.parse(localStorage.getItem(authStorageKey) || '{}');
                const tokenValue = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
                authData.accessToken = { value: tokenValue };
                localStorage.setItem(authStorageKey, JSON.stringify(authData));
            }
        } catch (e) {
            console.error('Failed to update Swagger auth:', e);
        }
    }

    function interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
            const token = getSelectedToken();
            if (token && args[1]) {
                if (!args[1].headers) {
                    args[1].headers = {};
                }
                if (args[1].headers instanceof Headers) {
                    args[1].headers.set('Authorization', token.startsWith('Bearer ') ? token : 'Bearer ' + token);
                } else {
                    args[1].headers['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
                }
            }
            return originalFetch.apply(this, args);
        };
    }

    function updateSelectedTokenDisplay() {
        const display = document.getElementById('selected-token-display');
        if (display) {
            const token = getSelectedToken();
            const currentType = TOKEN_TYPES.find(function (t) {
                return t.key === selectedTokenType;
            });
            const type = currentType ? currentType.label : '';
            const status = token ? '✓ 설정됨' : '✗ 미설정';
            display.innerHTML = `
                <span style="font-weight: 500; color: #4b5563;">${type}</span>
                <span style="color: ${token ? '#10b981' : '#ef4444'}; font-size: 11px; margin-left: 6px;">${status}</span>
            `;
        }
    }

    function addToggleButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'swagger-token-button-container';
        buttonContainer.style.cssText = `
            position: fixed;
            right: 6%;
            top: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            z-index: 9998;
        `;

        const selectedDisplay = document.createElement('div');
        selectedDisplay.id = 'selected-token-display';
        selectedDisplay.style.cssText = `
            font-size: 12px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            display: flex;
            align-items: center;
            gap: 4px;
        `;
        updateSelectedTokenDisplay();
        buttonContainer.appendChild(selectedDisplay);

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Multi Token ';
        toggleBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg,rgb(137, 182, 255) 0%,rgb(96, 146, 255) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(59, 130, 246, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 6px;
        `;
        toggleBtn.onmouseenter = function () {
            toggleBtn.style.transform = 'translateY(-2px)';
            toggleBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            toggleBtn.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(59, 130, 246, 0.3)';
        };
        toggleBtn.onmouseleave = function () {
            toggleBtn.style.transform = 'translateY(0)';
            toggleBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            toggleBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(59, 130, 246, 0.2)';
        };
        toggleBtn.onclick = function () {
            const selector = document.getElementById('swagger-multi-token-selector');
            if (selector) {
                const isVisible = selector.style.display !== 'none';
                if (isVisible) {
                    selector.style.opacity = '0';
                    selector.style.transform = 'translateY(-10px) scale(0.95)';
                    setTimeout(function () {
                        selector.style.display = 'none';
                    }, 300);
                } else {
                    selector.style.display = 'block';
                    setTimeout(function () {
                        selector.style.opacity = '1';
                        selector.style.transform = 'translateY(0) scale(1)';
                    }, 10);
                }
            }
        };
        buttonContainer.appendChild(toggleBtn);
        document.body.appendChild(buttonContainer);
    }

    function init() {
        loadTokens();
        const selector = createTokenSelector();
        document.body.appendChild(selector);
        interceptFetch();
        updateSwaggerAuth();

        function setupUI() {
            addToggleButton();
            updateSelectedTokenDisplay();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                setTimeout(setupUI, 1000);
            });
        } else {
            setTimeout(setupUI, 1000);
        }
    }

    init();
})();
