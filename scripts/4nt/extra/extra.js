//TODO починить ссылку 4nt чтобы передавала s param которая вверху страниц с суттами.
//TODO for Frank чтобы прокидывал остальные параметры не удалял. кроме q
//TODO сделать чтобы removePunc смотрела на ту же опцию в localStorage что и на дхамма гифт что настройка была общей для /4nt случая


(function() {
    const savedDict = (localStorage.getItem('selectedDict') || '').toLowerCase();
    if (savedDict.includes('ru')) {
        window.isRu = true;
        localStorage.setItem('siteLanguage', 'ru');
    } else {
        window.isRu = false;
        localStorage.setItem('siteLanguage', 'en');
    }
})();

window.removePaliPunctuation = function(text) {
    return text.replace(/·/g, '')
               .replace(/[-—–]/g, ' ')
               .replace(/[:;“”‘’,"']/g, '')
               .replace(/[.?!]/g, ' | ');
};

window.viewMode = localStorage.getItem('4ntReadView') || 'cols';

window.toggleViewMode = function() {
    window.viewMode = window.viewMode === 'cols' ? 'rows' : 'cols';
    localStorage.setItem('4ntReadView', window.viewMode);
    
    document.documentElement.setAttribute('data-view-mode', window.viewMode);
    
    if (typeof renderAll === 'function') {
        renderAll();
    } else if (typeof renderMain === 'function') {
        renderMain();
    }
    
    setTimeout(() => {
        if (typeof initTtsMarkup === 'function') initTtsMarkup();
        applyIndependentHighlight();
    }, 100);
};

window.toggleDots = function(forceState) {
    const isHidden = forceState !== undefined ? forceState : (localStorage.getItem('4ntHideDots') !== 'true');
    localStorage.setItem('4ntHideDots', isHidden);
    
    const btn = document.getElementById('dotsBtn');
    if (btn) {
        btn.textContent = isHidden ? 'Off' : 'On';
    }
    
    // Вместо модификации DOM используем нативный механизм перерисовки сайта с сохранением позиции скролла
    if (typeof withScrollAnchor === 'function' && typeof renderMain === 'function') {
        withScrollAnchor(() => renderMain());
    } else if (typeof renderMain === 'function') {
        renderMain();
    }
};

function getSlug(slug = null) {
    if (slug) return slug.trim().toLowerCase();
    
    const inputVal = document.querySelector('#jumpInput')?.value.trim() ||
                     document.querySelector('input[name="q"]')?.value.trim() ||
                     new URLSearchParams(location.search).get('q')?.trim();
    if (inputVal) return inputVal.toLowerCase();

    let path = location.pathname;
    path = path.replace(/\/?index\.html$/i, '').replace(/\/$/, '');
    
    const pathParts = path.split('/');
    return (pathParts[pathParts.length - 1] || null)?.toLowerCase();
}

function initExtra() {
    try {
        const basePath = location.pathname.startsWith('/4nt') ? '/4nt' : '';
        
        // Fallback для замены ссылки расширения DPD
        const dpdBtn = document.getElementById('dpd-cta-btn');
        if (dpdBtn) {
            dpdBtn.href = "https://chromewebstore.google.com/detail/dhammagift-search-and-wor/dnnogjdcmhbiobpnkhdbfnfjnjlikabd";
        }

        const urlParams = new URLSearchParams(window.location.search);
        let requestedCols = [];
        
        if (urlParams.get('tabs') === 'root') {
            requestedCols = ['pali_royal_iast', 'pali', 'ru_dhammagift'];
        } else if (urlParams.has('cols')) {
            requestedCols = urlParams.get('cols').split(',').map(c => c.trim());
        } else {
            const sessionCols = sessionStorage.getItem('sharedCols');
            if (sessionCols) {
                requestedCols = sessionCols.split(',');
            }
        }

        if (requestedCols.length > 0 && typeof COLS !== 'undefined') {
            const validCols = requestedCols.filter(k => ALL_TRANSLATIONS.some(t => t.key === k));
            if (validCols.length > 0) {
                COLS.length = 0; 
                COLS.push(...validCols.slice(0, 6));
                
                sessionStorage.setItem('sharedCols', COLS.join(','));
                
                if (typeof saveSettings === 'function') saveSettings();
                if (typeof renderColBar === 'function') renderColBar();
                if (typeof renderMain === 'function') {
                    renderMain();
                    setTimeout(applyIndependentHighlight, 100);
                }
            }
        }

        function updateUrlWithCols() {
            if (typeof COLS !== 'undefined' && COLS.length > 0) {
                const currentColsStr = COLS.join(',');
                sessionStorage.setItem('sharedCols', currentColsStr); 
                
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('cols', currentColsStr);
                newUrl.searchParams.delete('tabs');
                window.history.replaceState({}, document.title, newUrl.toString());
            }
        }

        updateUrlWithCols();

        if (typeof window.saveSettings === 'function' && !window.saveSettings.isUrlPatched) {
            const origSaveSettings = window.saveSettings;
            window.saveSettings = function() {
                origSaveSettings();
                updateUrlWithCols();
            };
            window.saveSettings.isUrlPatched = true;
        }

        document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            // Обрабатываем только внутренние ссылки (на тот же домен)
            if (a && a.href && a.origin === window.location.origin) {
                try {
                    const url = new URL(a.href);
                    // Исключаем якорные ссылки в рамках той же страницы
                    if (url.pathname !== window.location.pathname) {
                        let isModified = false;
                        
                        // 1. Прокидываем настройки колонок (cols) из хранилища (приоритет)
                        const currentCols = sessionStorage.getItem('sharedCols');
                        if (currentCols) {
                            url.searchParams.set('cols', currentCols);
                            isModified = true;
                        }
                        
                        // 2. Динамически прокидываем все остальные параметры с текущей страницы
                        const currentParams = new URLSearchParams(window.location.search);
                        currentParams.forEach((value, key) => {
                            // Не перезаписываем параметры, которые уже жестко заданы в ссылке (например, q)
                            // И пропускаем cols, так как мы его уже установили из sessionStorage
                            if (key !== 'cols' && !url.searchParams.has(key)) {
                                url.searchParams.set(key, value);
                                isModified = true;
                            }
                        });

                        // Обновляем href только если добавили параметры
                        if (isModified) {
                            a.href = url.toString();
                        }
                    }
                } catch(err) {
                    console.error("Ошибка при обработке клика по ссылке:", err);
                }
            }
        });

        window.groupRank = function(g) { 
            return g.indexOf('Root') === 0 ? 0 : (g === 'Russian' ? 1 : g === 'English' ? 2 : g === 'International' ? 4 : 3); 
        };

        window.catOf = function(g) { 
            return g.indexOf('Root') === 0 ? 'root' : g === 'Russian' ? 'rus' : g === 'English' ? 'eng' : g === 'International' ? 'int' : 'other'; 
        };

        const warnMsgEl = document.getElementById('fnWarnMsg');
        const warnBtn = document.getElementById('fnWarn');
        if (warnMsgEl && warnBtn) {
            const warnText = warnMsgEl.innerHTML;
            warnMsgEl.innerHTML = ''; 
            warnMsgEl.setAttribute('data-nosnippet', 'true');
            warnBtn.addEventListener('click', () => {
                if (!warnMsgEl.innerHTML) warnMsgEl.innerHTML = warnText;
            });
        }

        const rawTheme = localStorage.getItem('theme');
        if (rawTheme) {
            const effectiveTheme = (rawTheme === 'dark' || rawTheme === 'auto') ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', effectiveTheme);
            const themeBtn = document.getElementById('themeBtn');
            if (themeBtn) {
                themeBtn.textContent = effectiveTheme === 'dark' ? '☾ Dark' : '☀ Light';
            }
            try {
                let siteSettings = JSON.parse(localStorage.getItem('debabel.viewer.v1') || '{}');
                siteSettings.theme = effectiveTheme;
                localStorage.setItem('debabel.viewer.v1', JSON.stringify(siteSettings));
            } catch(e) {}
        }

        if (typeof window.toggleTheme === 'function' && !window.toggleTheme.isPatched) {
            const origToggleTheme = window.toggleTheme;
            window.toggleTheme = function() {
                origToggleTheme();
                const newTheme = document.documentElement.getAttribute('data-theme');
                localStorage.setItem('theme', newTheme);
            };
            window.toggleTheme.isPatched = true;
        }

        document.documentElement.setAttribute('data-view-mode', window.viewMode);

        const isMobileDevice = window.matchMedia("(max-width: 900px)").matches;
        if (isMobileDevice && typeof sidebarVisible !== 'undefined' && sidebarVisible) {
            sidebarVisible = false;
            document.getElementById('sidebar')?.classList.add('hidden');
            document.getElementById('tocBar')?.classList.add('hidden');
            document.getElementById('main')?.classList.add('full');
            document.getElementById('colBar')?.classList.add('sidebar-hidden');
            document.getElementById('tocBtn')?.classList.remove('on');
            document.getElementById('tocSash')?.classList.add('hidden');
            const ft = document.getElementById('siteFooter');
            if(ft) ft.classList.add('full');
            window.addEventListener('load', () => {
                if (typeof updateHeaderHeight === 'function') updateHeaderHeight();
            });
        }

        // Привязываем обработчики к статически сгенерированным кнопкам
        const fdgBtn = document.getElementById('fdg-button');
        if (fdgBtn) {
            let longPressTimer;
            fdgBtn.addEventListener('contextmenu', function(e) {
                e.preventDefault(); 
                if (typeof toggleQuickModal === 'function') toggleQuickModal();
            });
            fdgBtn.addEventListener('touchstart', function(e) {
                longPressTimer = setTimeout(function() {
                    if (typeof toggleQuickModal === 'function') toggleQuickModal();
                    if (navigator.vibrate) navigator.vibrate(30); 
                }, 500); 
            }, { passive: true });
            fdgBtn.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);
            });
            fdgBtn.addEventListener('touchmove', function() {
                clearTimeout(longPressTimer);
            }, { passive: true });
        }

        const dictSelect = document.getElementById('dict-select-4nt');
        if (dictSelect) {
            const currentDict = (localStorage.getItem('selectedDict') || 'standalone').toLowerCase();
            const options = Array.from(dictSelect.options);
            const matchedOpt = options.find(opt => opt.value === currentDict);
            if (matchedOpt) dictSelect.value = matchedOpt.value;

            dictSelect.addEventListener('change', function(e) {
                let newDict = e.target.value; 
                if (newDict.includes('ru')) {
                    window.isRu = true;
                    localStorage.setItem('siteLanguage', 'ru');
                } else {
                    window.isRu = false;
                    localStorage.setItem('siteLanguage', 'en');
                }
                if (typeof applyDictConfig === 'function') {
                    applyDictConfig(newDict);
                } else {
                    localStorage.setItem('selectedDict', newDict);
                }
            });
        }

        const hideDotsSetting = localStorage.getItem('4ntHideDots');
        const shouldHideDots = hideDotsSetting === null ? true : hideDotsSetting === 'true';
        window.toggleDots(shouldHideDots);

        const styles = [
            `${basePath}/assets/css/paliLookup.css`,
            `${basePath}/assets/css/extrastyles.css`,
            `${basePath}/read/css/voice.css`,
            `${basePath}/extra/extra.css`
        ];
        styles.forEach(href => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement("link");
                link.rel = "stylesheet"; link.href = href;
                document.head.appendChild(link);
            }
        });

        const scripts = [
            `${basePath}/assets/js/smoothScroll.js`,
            `${basePath}/assets/js/settings.js`,
            `${basePath}/read/js/voice.js`
        ];
        scripts.forEach(src => {
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement("script");
                script.src = src; 
                script.async = false;
                document.body.appendChild(script);
            }
        });

        const segRefBtn = document.getElementById('segBtn');
        if (segRefBtn) {
            const savedSegState = localStorage.getItem('4ntSegRefState');
            const targetState = savedSegState || 'Subtle'; 
            const currentState = segRefBtn.textContent.trim();
            if (currentState !== targetState) {
                let current = currentState;
                let clicks = 0;
                while (current !== targetState && clicks < 3) {
                    segRefBtn.click();
                    current = segRefBtn.textContent.trim();
                    clicks++;
                }
            }
            segRefBtn.addEventListener('click', () => {
                setTimeout(() => {
                    localStorage.setItem('4ntSegRefState', segRefBtn.textContent.trim());
                }, 20); 
            });
        }

        const getLangWeight = (key) => {
            const k = key.toLowerCase();
            if (k === 'pali') return 1;
            if (k.includes('iast')) return 2;
            if (k.includes('pali')) return 3;
            if (k.includes('ru_')) return 4;
            return 5;
        };

        if (typeof ALL_TRANSLATIONS !== 'undefined' && Array.isArray(ALL_TRANSLATIONS)) {
            ALL_TRANSLATIONS.sort((a, b) => {
                const wA = getLangWeight(a.key);
                const wB = getLangWeight(b.key);
                if (wA !== wB) return wA - wB;
                return (a.label && b.label) ? a.label.localeCompare(b.label) : 0;
            });
        }

        if (typeof COLS !== 'undefined' && Array.isArray(COLS)) {
            const migrationFlag = '4nt_col_order_migrated_v2';
            const isMigrated = localStorage.getItem(migrationFlag);

            if (!isMigrated) {
                const origCols = [...COLS];
                COLS.sort((a, b) => {
                    const wA = getLangWeight(a);
                    const wB = getLangWeight(b);
                    if (wA !== wB) return wA - wB;
                    return 0; 
                });
                
                if (JSON.stringify(origCols) !== JSON.stringify(COLS)) {
                    if (typeof saveSettings === 'function') saveSettings();
                    if (typeof renderColBar === 'function') renderColBar();
                    if (typeof renderMain === 'function') {
                        renderMain();
                        setTimeout(applyIndependentHighlight, 100);
                    }
                }
                localStorage.setItem(migrationFlag, 'true');
            } else {
                if (typeof renderColBar === 'function') renderColBar();
            }
        }
        
    } catch (error) {
        console.error("4nt Extra script error:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExtra);
} else {
    initExtra();
}

document.addEventListener("keydown", function(event) {
    const activeTag = document.activeElement.tagName;
    const isInput = ['INPUT', 'TEXTAREA'].includes(activeTag) || document.activeElement.isContentEditable;

    if (event.altKey && event.code === "KeyC") {
        event.preventDefault();
        window.toggleViewMode();
    }
    
    if (event.altKey && event.code === "KeyW") {
        event.preventDefault();
        if (typeof toggleSidebar === 'function') toggleSidebar();
    }
    
    if (event.altKey && event.code === "KeyZ") {
        event.preventDefault();
        window.toggleDots();
    }
    
    if (event.altKey && (event.code === "KeyP" || event.code === "KeyY")) { 
        event.preventDefault();
        if (typeof toggleQuickModal === 'function') toggleQuickModal();
    }

    if (event.altKey && event.code === "KeyR") {
        if (isInput) return;
        event.preventDefault();
        
        if (window.isVoiceScriptLoaded && typeof ttsState !== 'undefined' && (ttsState.speaking || ttsState.paused)) {
            const mainPlayBtn = document.querySelector('.play-main-button');
            if (mainPlayBtn) mainPlayBtn.click();
            return;
        }

        if (!window.isVoiceScriptLoaded) {
            if (typeof window.loadVoiceScripts === 'function') {
                window.loadVoiceScripts(() => {
                    const miniPlayBtn = document.querySelector('.dynamic-tts-btn');
                    if (miniPlayBtn) {
                        miniPlayBtn.click();
                    } else {
                        const voiceLink = document.querySelector('.voice-link');
                        if (voiceLink) voiceLink.click();
                    }
                });
            }
            return;
        }
        
        const miniPlayBtn = document.querySelector('.dynamic-tts-btn');
        if (miniPlayBtn) {
            miniPlayBtn.click();
            return;
        }
        
        const voiceLink = document.querySelector('.voice-link');
        if (voiceLink) voiceLink.click();
    }

    if (event.altKey && event.code === "KeyT") {
        if (isInput) return;
        event.preventDefault();
        if (typeof window.toggleTheme === 'function') {
            window.toggleTheme();
        }
    }
});

window.addEventListener("keydown", (event) => {
    if (event.key === 'Escape' || event.code === 'Escape') {
        const consumeEvent = () => {
            event.preventDefault();
            event.stopPropagation();
        };
        
        const voiceHint = document.getElementById('active-voice-hint');
        if (voiceHint && voiceHint.offsetWidth > 0) { 
            const closeHintBtn = document.getElementById('closeVoiceHintBtn');
            if (closeHintBtn) {
                closeHintBtn.click();
                consumeEvent();
                return;
            }
        }

        const hintElements = document.querySelectorAll('.dg-bottom-toast, .hint, .bubble-notification');
        for (let i = 0; i < hintElements.length; i++) {
            const hintElement = hintElements[i];
            const style = window.getComputedStyle(hintElement);
            const isVisible = hintElement.classList.contains('show') || 
                              (hintElement.offsetWidth > 0 && style.display !== 'none' && style.opacity !== '0' && style.visibility !== 'hidden');
            
            if (isVisible) {
                const closeHintButton = hintElement.querySelector('#closeHintBtn, .dg-toast-close, .close-btn, .dg-bottom-toast-close');
                if (closeHintButton) {
                    closeHintButton.click();
                } else {
                    hintElement.classList.remove('show');
                }
                consumeEvent();
                return; 
            }
        }

        const fdgPopupElement = document.querySelector('.fdg-popup');
        if (fdgPopupElement && window.getComputedStyle(fdgPopupElement).display !== 'none') {
            const fdgCloseButton = fdgPopupElement.querySelector('.fdg-close-btn');
            if (fdgCloseButton) {
                fdgCloseButton.click();
                consumeEvent();
                return;
            }
        }

        const paliLookupPopupElement = document.querySelector('.popup');
        if (paliLookupPopupElement && window.getComputedStyle(paliLookupPopupElement).display !== 'none') {
            const paliLookupCloseButton = paliLookupPopupElement.querySelector('.close-btn');
            if (paliLookupCloseButton) {
                paliLookupCloseButton.click();
                consumeEvent();
                return;
            }
        }

        if (window.quickModalIsOpen) {
            if (typeof window.toggleQuickModal === 'function') {
                window.toggleQuickModal(); 
                consumeEvent();
                return;
            }
        }

        const pwaBanner = document.getElementById('pwa-banner');
        if (pwaBanner && pwaBanner.offsetWidth > 0) { 
            const closePwaBtn = document.getElementById('closePwaBanner');
            if (closePwaBtn) {
                closePwaBtn.click();
                consumeEvent();
                return;
            }
        }

        const closeBtnElements = document.querySelectorAll('.btn-close');
        if (closeBtnElements.length > 0) {
            let modalClosed = false;
            closeBtnElements.forEach(button => {
                if (button.getBoundingClientRect().width > 0) {
                    button.click();
                    modalClosed = true;
                }
            });
            if (modalClosed) {
                consumeEvent();
                return; 
            }
        }
        
        const dropdown = document.querySelector('.voice-dropdown');
        const isDropdownActive = dropdown && dropdown.classList.contains('active');
        const isHighlightActive = document.querySelector('.active-word');
        const isTtsActive = typeof ttsState !== 'undefined' && (ttsState.speaking || ttsState.paused);

        if (isTtsActive || isDropdownActive || isHighlightActive) {
            if (typeof stopPlayback === 'function') stopPlayback();
            if (typeof removeAllHighlights === 'function') removeAllHighlights();
            if (dropdown) dropdown.classList.remove('active');
            
            consumeEvent();
            return;
        }
    }
}, true);

window.addEventListener('click', function(event) {
    const voiceLink = event.target.closest('.voice-link');
    
    if (voiceLink) {
        const miniPlayBtn = document.querySelector('.dynamic-tts-btn');
        const isTtsRunning = window.isVoiceScriptLoaded && typeof ttsState !== 'undefined' && (ttsState.speaking || ttsState.paused);
        
        if (miniPlayBtn && !isTtsRunning) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            if (!window.isVoiceScriptLoaded && typeof window.loadVoiceScripts === 'function') {
                window.loadVoiceScripts(() => {
                    setTimeout(() => {
                        const dynamicBtn = document.querySelector('.dynamic-tts-btn');
                        if (dynamicBtn) dynamicBtn.click();
                    }, 50);
                });
            } else {
                miniPlayBtn.click();
            }
        }
    }
}, true); 

function applyIndependentHighlight() {
    const hash = window.location.hash;
    if (!hash) return;

    const hashContent = hash.substring(1);
    const cleanId = hashContent.split('&')[0].split('?')[0];
    const ids = cleanId.includes(',') ? cleanId.split(',') : [cleanId];

    ids.forEach(id => {
        let element = document.getElementById(id);
        
        if (!element) {
            const match = id.match(/(.*?)(\d+)$/);
            if (match) {
                const prefix = match[1];
                const num = parseInt(match[2], 10);
                if (num - 1 >= 0) {
                    element = document.getElementById(prefix + (num - 1));
                }
            }
        }

        if (element) {
            const originalPosition = element.style.position;
            if (window.getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }

            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0'; 
            overlay.style.left = '0';
            overlay.style.width = '100%'; 
            overlay.style.height = '100%';
            overlay.style.pointerEvents = 'none'; 
            overlay.style.zIndex = '10';
            overlay.style.borderRadius = window.getComputedStyle(element).borderRadius;
            overlay.style.transition = 'background-color 0.45s ease-in-out';
            overlay.style.backgroundColor = 'transparent';
            element.appendChild(overlay);

            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                overlay.style.backgroundColor = blinkCount % 2 === 0 ? 'rgba(26, 188, 156, 0.25)' : 'transparent';
                blinkCount++;
                if (blinkCount >= 6) { 
                    clearInterval(blinkInterval);
                    setTimeout(() => {
                        if (overlay.parentNode === element) element.removeChild(overlay);
                        if (!originalPosition) element.style.removeProperty('position');
                        else element.style.position = originalPosition;
                    }, 450);
                }
            }, 450);

            setTimeout(() => {
                if (typeof window.activateSegmentForTTS === 'function') {
                    if (element.matches('.pli-lang, .rus-lang, .eng-lang, .tha-lang')) {
                         window.activateSegmentForTTS(element);
                    } else {
                        const childLang = element.querySelector('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
                        if (childLang) {
                            window.activateSegmentForTTS(childLang);
                        } else {
                            window.activateSegmentForTTS(element);
                        }
                    }
                } else {
                    element.classList.add('active-word');
                }
            }, 400);
        }
    });
}

// Полный блок для подсветки слов из URL параметра `s`
window.applyWordHighlight = function() {
    const params = new URLSearchParams(window.location.search);
    let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
    
    if (!finder || finder.trim() === "") return;
    
    // Экранирование спецсимволов для безопасности регулярного выражения
    finder = finder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(finder, 'gi');
    
    // Класс .ct содержит текстовые сегменты (корни и переводы)
    document.querySelectorAll('.ct').forEach(el => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        const nodesToReplace = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.nodeValue.match(regex)) {
                nodesToReplace.push(node);
            }
        }
        
        nodesToReplace.forEach(n => {
            const fragment = document.createDocumentFragment();
            const parts = n.nodeValue.split(regex);
            const matches = n.nodeValue.match(regex);
            
            parts.forEach((part, index) => {
                if (part) {
                    fragment.appendChild(document.createTextNode(part));
                }
                if (index < parts.length - 1) {
                    const b = document.createElement('b');
                    b.className = 'match finder';
                    b.textContent = matches[index];
                    fragment.appendChild(b);
                }
            });
            n.parentNode.replaceChild(fragment, n);
        });
    });
};


// Применение подсветки при начальной загрузке страницы
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(window.applyWordHighlight, 300);
    });
} else {
    setTimeout(window.applyWordHighlight, 300);
}

document.addEventListener("DOMContentLoaded", function() {
    // Патч нативного рендерера текста. Очищает пунктуацию ДО того, как она попадет в DOM ячейки
    if (typeof window.granText === 'function' && !window.granText.isDotsPatched) {
        const origGranText = window.granText;
        window.granText = function(t) {
            let text = origGranText(t);
            if (text && localStorage.getItem('4ntHideDots') === 'true') {
                text = window.removePaliPunctuation(text);
            }
            return text;
        };
        window.granText.isDotsPatched = true;
        
        // Поскольку первый рендер страницы происходит до этого момента, 
        // принудительно обновляем текст, если скрытие пунктуации активно
        if (localStorage.getItem('4ntHideDots') === 'true' && typeof window.renderMain === 'function') {
            window.renderMain();
        }
    }
});

/*
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    
    if (qParam && typeof jumpToRef === 'function') {
        jumpToRef(qParam);
    }
});
*/