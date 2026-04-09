function createTokenSelector() {
    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'swagger-multi-token-selector';
    selectorContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 360px;
            max-height: 80vh;
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: none;
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

    const header = document.createElement('div');
    header.style.cssText = `
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 20px;
            color: #1a1a1a;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
    header.innerHTML = '<span style="font-size: 18px;">🔐</span><span>Access Token 선택</span>';
    selectorContainer.appendChild(header);

    const shortcutContainer = document.createElement('div');
    shortcutContainer.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
            background: #ffffff;
        `;

    const shortcutToggle = document.createElement('button');
    shortcutToggle.type = 'button';
    let isShortcutExpanded = false;
    shortcutToggle.style.cssText = `
            width: 100%;
            padding: 10px 12px;
            background: #f8f9fa;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #4b5563;
            transition: background 0.2s ease;
            text-align: left;
        `;

    const toggleText = document.createElement('div');
    toggleText.style.cssText = 'display: flex; align-items: center; gap: 6px;';
    toggleText.innerHTML = `
            <span style="font-size: 14px;">⌨️</span>
            <span style="font-weight: 600;">키보드 단축키</span>
        `;

    const arrowIcon = document.createElement('span');
    arrowIcon.style.cssText = `
            font-size: 10px;
            color: #9ca3af;
            transition: transform 0.2s ease;
            display: inline-block;
        `;
    arrowIcon.textContent = '▼';

    shortcutToggle.appendChild(toggleText);
    shortcutToggle.appendChild(arrowIcon);

    shortcutToggle.onmouseenter = function () {
        shortcutToggle.style.background = '#f1f5f9';
    };
    shortcutToggle.onmouseleave = function () {
        shortcutToggle.style.background = '#f8f9fa';
    };

    const shortcutContent = document.createElement('div');
    shortcutContent.style.cssText = `
            padding: 0 12px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
            background: #ffffff;
        `;
    shortcutContent.innerHTML = `
            <div style="padding: 12px 0; color: #6b7280; line-height: 1.6; font-size: 12px;">
                <div style="margin-left: 20px;">
                    <span style="font-family: 'Monaco', 'Menlo', monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px; border: 1px solid #d1d5db; font-size: 11px;">⌘</span>
                    <span style="margin: 0 4px;">+</span>
                    <span style="font-family: 'Monaco', 'Menlo', monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px; border: 1px solid #d1d5db; font-size: 11px;">PageUp</span>
                    <span style="margin: 0 6px;">/</span>
                    <span style="font-family: 'Monaco', 'Menlo', monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px; border: 1px solid #d1d5db; font-size: 11px;">PageDown</span>
                    <span style="margin-left: 6px;">으로 토큰 타입 변경</span>
                </div>
            </div>
        `;

    shortcutToggle.onclick = function () {
        isShortcutExpanded = !isShortcutExpanded;
        if (isShortcutExpanded) {
            shortcutContent.style.maxHeight = '200px';
            shortcutContent.style.padding = '0 12px';
            arrowIcon.style.transform = 'rotate(180deg)';
        } else {
            shortcutContent.style.maxHeight = '0';
            shortcutContent.style.padding = '0 12px';
            arrowIcon.style.transform = 'rotate(0deg)';
        }
    };

    shortcutContainer.appendChild(shortcutToggle);
    shortcutContainer.appendChild(shortcutContent);
    selectorContainer.appendChild(shortcutContainer);

    const radioContainer = document.createElement('div');
    radioContainer.style.cssText = 'margin-bottom: 16px;';

    const adminTypes = TOKEN_TYPES.filter(function (t) {
        return t.type === 'admin';
    });
    const userTypes = TOKEN_TYPES.filter(function (t) {
        return t.type === 'user';
    });

    if (adminTypes.length > 0) {
        const adminSection = document.createElement('div');
        adminSection.style.cssText = 'margin-bottom: 12px;';

        const adminLabel = document.createElement('div');
        adminLabel.textContent = '👤 관리자';
        adminLabel.style.cssText = `
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            `;
        adminSection.appendChild(adminLabel);

        adminTypes.forEach(function (tokenType) {
            const radio = createRadioOption(tokenType.key, tokenType.label, selectedTokenType === tokenType.key);
            radioElements[tokenType.key] = radio;
            adminSection.appendChild(radio.container);

            radio.input.onchange = function () {
                changeTokenType(tokenType.key);
            };
        });

        radioContainer.appendChild(adminSection);
    }

    if (userTypes.length > 0) {
        const userSection = document.createElement('div');
        userSection.style.cssText = 'margin-bottom: 12px;';

        const userLabel = document.createElement('div');
        userLabel.textContent = '👥 유저';
        userLabel.style.cssText = `
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            `;
        userSection.appendChild(userLabel);

        userTypes.forEach(function (tokenType) {
            const radio = createRadioOption(tokenType.key, tokenType.label, selectedTokenType === tokenType.key);
            radioElements[tokenType.key] = radio;
            userSection.appendChild(radio.container);

            radio.input.onchange = function () {
                changeTokenType(tokenType.key);
            };
        });

        radioContainer.appendChild(userSection);
    }

    selectorContainer.appendChild(radioContainer);

    const inputsTitle = document.createElement('div');
    inputsTitle.textContent = '🔑 토큰 입력';
    inputsTitle.style.cssText = `
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
    selectorContainer.appendChild(inputsTitle);

    TOKEN_TYPES.forEach(function (tokenType) {
        const inputContainer = createTokenInput(tokenType.key, tokenType.label + ' Token', tokens[tokenType.key] || '');
        selectorContainer.appendChild(inputContainer);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '닫기';
    closeBtn.style.cssText = `
            width: 100%;
            padding: 10px;
            background: #f8f9fa;
            border: 1.5px solid #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 8px;
            font-size: 13px;
            font-weight: 500;
            color: #4b5563;
            transition: all 0.2s ease;
        `;
    closeBtn.onmouseenter = function () {
        closeBtn.style.background = '#f1f5f9';
        closeBtn.style.borderColor = '#cbd5e1';
    };
    closeBtn.onmouseleave = function () {
        closeBtn.style.background = '#f8f9fa';
        closeBtn.style.borderColor = '#e5e7eb';
    };
    closeBtn.onclick = function () {
        closeSelector();
    };
    selectorContainer.appendChild(closeBtn);

    function closeSelector() {
        selectorContainer.style.opacity = '0';
        selectorContainer.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(function () {
            selectorContainer.style.display = 'none';
        }, 300);
    }

    function openSelector() {
        selectorContainer.style.display = 'block';
        setTimeout(function () {
            selectorContainer.style.opacity = '1';
            selectorContainer.style.transform = 'translateY(0) scale(1)';
        }, 10);
    }

    function changeTokenType(type) {
        selectedTokenType = type;
        Object.keys(radioElements).forEach(function (key) {
            radioElements[key].input.checked = key === type;
        });
        updateRadioStyles();
        saveTokens();
        updateSwaggerAuth();
        updateSelectedTokenDisplay();
    }

    function changeToNextTokenType() {
        const currentIndex = TOKEN_TYPES.findIndex(function (t) {
            return t.key === selectedTokenType;
        });
        const nextIndex = (currentIndex + 1) % TOKEN_TYPES.length;
        changeTokenType(TOKEN_TYPES[nextIndex].key);
    }

    function changeToPreviousTokenType() {
        const currentIndex = TOKEN_TYPES.findIndex(function (t) {
            return t.key === selectedTokenType;
        });
        const prevIndex = (currentIndex - 1 + TOKEN_TYPES.length) % TOKEN_TYPES.length;
        changeTokenType(TOKEN_TYPES[prevIndex].key);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            const selector = document.getElementById('swagger-multi-token-selector');
            if (selector && selector.style.display !== 'none') {
                closeSelector();
            }
        }

        if (event.ctrlKey || event.metaKey) {
            const selector = document.getElementById('swagger-multi-token-selector');
            const targetElement = event.target instanceof HTMLElement ? event.target : null;
            const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            const isVisible = !!selector && selector.style.display !== 'none';
            const selectorHasTarget = !!selector && !!targetElement && selector.contains(targetElement);
            const selectorHasActive = !!selector && !!activeElement && selector.contains(activeElement);

            function isFormField(element) {
                if (!element) {
                    return false;
                }
                const tag = element.tagName ? element.tagName.toLowerCase() : '';
                return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable;
            }

            const isFormFieldFocused = isFormField(targetElement) || isFormField(activeElement);
            const shouldHandleShortcut =
                TOKEN_TYPES.length > 0 && (isVisible || selectorHasTarget || selectorHasActive || !isFormFieldFocused);

            if (!shouldHandleShortcut) {
                return;
            }

            if (event.key === 'PageUp' || event.keyCode === 33) {
                event.preventDefault();
                changeToPreviousTokenType();
            } else if (event.key === 'PageDown' || event.keyCode === 34) {
                event.preventDefault();
                changeToNextTokenType();
            }
        }
    });

    function updateRadioStyles() {
        Object.keys(radioElements).forEach(function (key) {
            const radio = radioElements[key];
            const isChecked = radio.input.checked;
            radio.container.style.background = isChecked ? '#f0f9ff' : '#fafafa';
            radio.container.style.borderColor = isChecked ? '#3b82f6' : '#e5e5e5';
            radio.labelEl.style.fontWeight = isChecked ? '600' : '500';
            radio.labelEl.style.color = isChecked ? '#1e40af' : '#4b5563';
        });
    }

    return selectorContainer;
}

function createRadioOption(value, label, checked) {
    const container = document.createElement('div');
    container.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            padding: 10px 12px;
            border-radius: 6px;
            background: ${checked ? '#f0f9ff' : '#fafafa'};
            border: 2px solid ${checked ? '#3b82f6' : '#e5e5e5'};
            transition: all 0.2s ease;
            cursor: pointer;
        `;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'token-type';
    input.value = value;
    input.checked = checked;
    input.id = 'token-radio-' + value;
    input.style.cssText = `
            margin-right: 10px;
            cursor: pointer;
            width: 18px;
            height: 18px;
            accent-color: #3b82f6;
        `;

    const labelEl = document.createElement('label');
    labelEl.htmlFor = 'token-radio-' + value;
    labelEl.textContent = label;
    labelEl.style.cssText = `
            cursor: pointer;
            font-size: 14px;
            font-weight: ${checked ? '600' : '500'};
            color: ${checked ? '#1e40af' : '#4b5563'};
            flex: 1;
        `;

    container.onmouseenter = function () {
        if (!checked) {
            container.style.background = '#f5f5f5';
            container.style.borderColor = '#d4d4d4';
        }
    };
    container.onmouseleave = function () {
        if (!checked) {
            container.style.background = '#fafafa';
            container.style.borderColor = '#e5e5e5';
        }
    };

    container.appendChild(input);
    container.appendChild(labelEl);

    return { container: container, input: input, labelEl: labelEl };
}

function createTokenInput(type, placeholder, value) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-bottom: 16px;';

    const label = document.createElement('label');
    label.textContent = placeholder;
    label.style.cssText = `
            display: block;
            font-size: 13px;
            color: #374151;
            margin-bottom: 6px;
            font-weight: 500;
        `;
    container.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
        `;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Bearer 토큰을 입력하세요';
    input.style.cssText = `
            width: 100%;
            padding: 10px 40px 10px 12px;
            border: 1.5px solid #e5e7eb;
            border-radius: 6px;
            font-size: 13px;
            box-sizing: border-box;
            transition: all 0.2s ease;
            background: #ffffff;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        `;
    input.onfocus = function () {
        input.style.borderColor = '#3b82f6';
        input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    };
    input.onblur = function () {
        input.style.borderColor = '#e5e7eb';
        input.style.boxShadow = 'none';
    };
    input.oninput = function () {
        tokens[type] = input.value;
        saveTokens();
        updateSwaggerAuth();
        updateSelectedTokenDisplay();
        resetBtn.style.opacity = input.value ? '1' : '0';
        resetBtn.style.pointerEvents = input.value ? 'auto' : 'none';
    };

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.innerHTML = '✕';
    resetBtn.style.cssText = `
            position: absolute;
            right: 8px;
            width: 24px;
            height: 24px;
            border: none;
            background: transparent;
            color: black;
            border-radius: 50%;
            cursor: pointer;
            font-size: 10px;
            font-weight: bold;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: ${value ? '1' : '0'};
            pointer-events: ${value ? 'auto' : 'none'};
            transition: all 0.2s ease;
            padding: 0;
        `;
    resetBtn.onmouseenter = function () {
        if (input.value) {
            resetBtn.style.background = '#f1f5f9';
            resetBtn.style.transform = 'scale(1.1)';
        }
    };
    resetBtn.onmouseleave = function () {
        resetBtn.style.background = 'transparent';
        resetBtn.style.transform = 'scale(1)';
    };
    resetBtn.onclick = function (e) {
        e.stopPropagation();
        input.value = '';
        tokens[type] = '';
        saveTokens();
        updateSwaggerAuth();
        updateSelectedTokenDisplay();
        resetBtn.style.opacity = '0';
        resetBtn.style.pointerEvents = 'none';
        input.focus();
    };

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(resetBtn);
    container.appendChild(inputWrapper);

    return container;
}
