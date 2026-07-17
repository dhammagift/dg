// Make variables and functions global to avoid conflicts
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
    }, 100);
};

window.toggleDots = function(forceState) {
    const main = document.getElementById('main');
    if (!main) return;
    
    const isHidden = forceState !== undefined ? forceState : !main.classList.contains('dots-hidden');
    
    if (isHidden) {
        main.classList.add('dots-hidden');
    } else {
        main.classList.remove('dots-hidden');
    }
    
    // Iterate only over Pāli elements for performance
    document.querySelectorAll(".pli-lang").forEach(el => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (isHidden) {
                if (node.originalText === undefined) {
                    node.originalText = node.nodeValue;
                }
                node.nodeValue = node.nodeValue.replace(/·/g, '');
            } else {
                if (node.originalText !== undefined) {
                    node.nodeValue = node.originalText;
                }
            }
        }
    });
    localStorage.setItem('4ntHideDots', isHidden);
    
    // Update button text in the settings menu
    const btn = document.getElementById('dotsBtn');
    if (btn) {
        btn.textContent = isHidden ? 'Off' : 'On';
    }
};

function getSlug(slug = null) {
    if (slug) return slug.trim().toLowerCase();
    
    // 1. Сначала проверяем инпуты и URL-параметры
    const inputVal = document.querySelector('#jumpInput')?.value.trim() ||
                     document.querySelector('input[name="q"]')?.value.trim() ||
                     new URLSearchParams(location.search).get('q')?.trim();
    if (inputVal) return inputVal.toLowerCase();

    // 2. Извлекаем из пути (URL)
    let path = location.pathname;
    // Убираем index.html (в любом регистре) и возможные слеши в конце
    path = path.replace(/\/?index\.html$/i, '').replace(/\/$/, '');
    
    const pathParts = path.split('/');
    return (pathParts[pathParts.length - 1] || null)?.toLowerCase();
}

function initExtra() {
    try {
        // 1. Theme (Sync global 'theme' and site's internal storage)
        const rawTheme = localStorage.getItem('theme');
        if (rawTheme) {
            // If auto or dark -> apply dark, otherwise light
            const effectiveTheme = (rawTheme === 'dark' || rawTheme === 'auto') ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', effectiveTheme);
            const themeBtn = document.getElementById('themeBtn');
            if (themeBtn) {
                themeBtn.textContent = effectiveTheme === 'dark' ? '☾ Dark' : '☀ Light';
            }
            
            // Update site's internal settings object
            try {
                let siteSettings = JSON.parse(localStorage.getItem('debabel.viewer.v1') || '{}');
                siteSettings.theme = effectiveTheme;
                localStorage.setItem('debabel.viewer.v1', JSON.stringify(siteSettings));
            } catch(e) {}
        }

        // Intercept standard theme toggle to write to our 'theme' key
        if (typeof window.toggleTheme === 'function' && !window.toggleTheme.isPatched) {
            const origToggleTheme = window.toggleTheme;
            window.toggleTheme = function() {
                origToggleTheme();
                const newTheme = document.documentElement.getAttribute('data-theme');
                localStorage.setItem('theme', newTheme);
            };
            window.toggleTheme.isPatched = true;
        }

        // 2. View Mode
        document.documentElement.setAttribute('data-view-mode', window.viewMode);

        // 3. Mobile sidebar
        const isMobileDevice = window.matchMedia("(max-width: 900px)").matches;
        if (isMobileDevice && typeof sidebarVisible !== 'undefined' && sidebarVisible) {
            if (typeof toggleSidebar === 'function') toggleSidebar();
        }

        // 4. UI Elements Adjustment
        document.documentElement.style.setProperty('--logo-w', '16px');
        
        document.querySelectorAll("img").forEach(img => {
            if (img.src.includes("debabel-logo-1k.jpg")) {
                img.src = img.src.replace("debabel-logo-1k.jpg", "headerlogo.png");
            }
            if (img.classList.contains("home-logo") || img.closest('.home-logo')) {
                img.style.width = '16px';
            }
        });

        document.querySelectorAll("style").forEach(style => {
            if (style.textContent.includes("#1a1612")) {
                style.textContent = style.textContent.replaceAll("#1a1612", "#000");
            }
        });

        const jumpInput = document.getElementById('jumpInput');
        if (jumpInput) jumpInput.type = 'search';

        // 5. Insert header buttons (main panel)
        const targetWrap = document.getElementById('settingsWrap') || document.getElementById('siteSettingsWrap');
        
        if (targetWrap && !document.getElementById('voiceLinkBtn')) {
            const slug = getSlug() || '';
            const fragment = document.createDocumentFragment();

            const buttons = [
                { tag: 'a', html: '🔊', title: 'Listen (TTS)', class: 'voice-link icon-btn', id: 'voiceLinkBtn', attr: { 'data-slug': slug }, href: 'javascript:void(0)' },
                { tag: 'a', html: '📜', title: 'View: Columns / Scroll', class: 'icon-btn', id: 'viewModeBtn', onclick: 'window.toggleViewMode()', href: 'javascript:void(0)' },
                { tag: 'a', html: '<img src="/assets/img/gray-white.png" alt="Search">', title: 'Search Suttas (Ctrl+1)', href: '/?q=' + slug, id: 'fdg-button', class: 'icon-btn', rel: 'noreferrer' },
                { tag: 'a', html: '<img  style="width:18px; height:18px; display:block;" src="/assets/svg/comment.svg" alt="Dictionary">', title: 'Popup Dictionary (Alt+A)', class: 'icon-btn toggle-dict-btn' }
            ];

            buttons.forEach(b => {
                const el = document.createElement(b.tag || 'button');
                el.className = b.class || 'icon-btn';
                if (b.id) el.id = b.id;
                if (b.href) el.href = b.href;
                if (b.target) el.target = b.target;
                if (b.rel) el.rel = b.rel;
                el.innerHTML = b.html;
                el.title = b.title;
                if (b.onclick) el.setAttribute('onclick', b.onclick);
                if (b.attr) {
                    for (let key in b.attr) el.setAttribute(key, b.attr[key]);
                }
                fragment.appendChild(el);
            });
            
            targetWrap.parentNode.insertBefore(fragment, targetWrap);
            
            
             // ==========================================
         // --- ПРАВЫЙ КЛИК / ДОЛГОЕ НАЖАТИЕ НА КНОПКУ ПОИСКА (fdg-button) ---
         // ==========================================
         const fdgBtn = document.getElementById('fdg-button');
         if (fdgBtn) {
             let longPressTimer;
             
             // 1. Десктоп: Правый клик (вызов контекстного меню)
             fdgBtn.addEventListener('contextmenu', function(e) {
                 e.preventDefault(); // Блокируем стандартное меню браузера
                 if (typeof toggleQuickModal === 'function') toggleQuickModal();
             });
             
             // 2. Мобильные устройства: Долгое нажатие (Long-press)
             fdgBtn.addEventListener('touchstart', function(e) {
                 // Запускаем таймер на 500 мс
                 longPressTimer = setTimeout(function() {
                     if (typeof toggleQuickModal === 'function') toggleQuickModal();
                     // Легкая вибрация для тактильного отклика (если телефон поддерживает)
                     if (navigator.vibrate) navigator.vibrate(30); 
                 }, 500); 
             }, { passive: true });
             
             // Отменяем таймер, если палец отпустили
             fdgBtn.addEventListener('touchend', function() {
                 clearTimeout(longPressTimer);
             });
             
             // Отменяем таймер, если палец сдвинулся (чтобы не срабатывало при скролле)
             fdgBtn.addEventListener('touchmove', function() {
                 clearTimeout(longPressTimer);
             }, { passive: true });
         }
            
        }

        // 6. Insert Pāli dots option into settings menu (before SC segment refs)
        const segBtn = document.getElementById('segBtn');
        if (segBtn && !document.getElementById('dotsBtn')) {
            const segRow = segBtn.closest('.set-row');
            if (segRow) {
                const dotsRow = document.createElement('div');
                dotsRow.className = 'set-row';
                dotsRow.innerHTML = `
                    <span class="set-lbl" title="Toggle middle dots (·) used to break up Pāli compounds for easier reading">Pāli compound dots</span>
                    <button class="icon-btn" id="dotsBtn" onclick="window.toggleDots()" title="Toggle Pāli compound dots">Off</button>
                `;
                segRow.parentNode.insertBefore(dotsRow, segRow);
            }
        }

        // 7. Insert Original Site link into the "More" (⋮) menu
        const morePop = document.getElementById('morePop');
        if (morePop && !document.getElementById('orig-site-btn')) {
            const origRow = document.createElement('div');
            origRow.className = 'set-row';
            origRow.innerHTML = `
                <span class="set-lbl" title="Open this page on the original s.4nt.org site">Original site</span>
                <a id="orig-site-btn" class="icon-btn" href="javascript:void(0)" onclick="this.href='https://s.4nt.org'+location.pathname.replace('/4nt', '')+location.search+location.hash" target="_blank" title="Original s.4nt.org site">🌐</a>
            `;
            morePop.appendChild(origRow);
        }

        // Init dots state by default
        const hideDotsSetting = localStorage.getItem('4ntHideDots');
        // If no setting exists (first visit), dots will be hidden (true)
        const shouldHideDots = hideDotsSetting === null ? true : hideDotsSetting === 'true';
        window.toggleDots(shouldHideDots);

        // 8. Load CSS
        const styles = [
            "/assets/css/paliLookup.css",
            "/assets/css/extrastyles.css",
            "/read/css/voice.css",
            "/4nt/extra/extra.css"
        ];
        styles.forEach(href => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement("link");
                link.rel = "stylesheet"; link.href = href;
                document.head.appendChild(link);
            }
        });

        // 9. Handle language classes and dynamically hide dots
        const processLangClasses = (el) => {
            if (!el || !el.classList) return;
            
            let isPali = false;
            if (el.classList.contains('ct')) {
                const td = el.closest('td.c');
                if (td) {
                    isPali = Array.from(td.classList).some(cls => 
                        ['t-pali', 't-san', 't-lzh', 't-zh', 't-pali_royal_iast'].includes(cls)
                    );
                    
                    if (isPali) {
                        el.classList.add('pli-lang');
                        el.setAttribute('lang', 'pi');
                    } else {
                        el.classList.add('eng-lang');
                    }
                }
            }
            
            if (el.classList.contains('tr-pali')) {
                el.classList.add('pli-lang');
                el.setAttribute('lang', 'pi');
                isPali = true;
            }

            // Dynamically remove dots from new Pāli elements if hiding is active
            const main = document.getElementById('main');
            if (isPali && main && main.classList.contains('dots-hidden')) {
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
                let node;
                while (node = walker.nextNode()) {
                    if (node.originalText === undefined) {
                        node.originalText = node.nodeValue;
                    }
                    node.nodeValue = node.nodeValue.replace(/·/g, '');
                }
            }
        };

        document.querySelectorAll(".ct, .tr-pali").forEach(processLangClasses);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { 
                            processLangClasses(node);
                            const children = node.querySelectorAll('.ct, .tr-pali');
                            children.forEach(processLangClasses);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });


    // 11. SC segment refs: Default to 'Subtle', then remember user's choice
    const segRefBtn = document.getElementById('segBtn');
    if (segRefBtn) {
        // Check if user has a saved preference, otherwise default to 'Subtle'
        const savedSegState = localStorage.getItem('4ntSegRefState');
        const targetState = savedSegState || 'Subtle'; 
        const currentState = segRefBtn.textContent.trim();
        
        // If the current state doesn't match the target, click to cycle it
        if (currentState !== targetState) {
            let current = currentState;
            let clicks = 0;
            // cycleSeg() cycles: Off -> Subtle -> Explicit -> Off
            while (current !== targetState && clicks < 3) {
                segRefBtn.click();
                current = segRefBtn.textContent.trim();
                clicks++;
            }
        }
        
        // Listen for manual clicks to save the user's new preference
        segRefBtn.addEventListener('click', () => {
            // Small delay to ensure the original cycleSeg() has updated the DOM text
            setTimeout(() => {
                localStorage.setItem('4ntSegRefState', segRefBtn.textContent.trim());
            }, 20); 
        });
    }

        // 10. Load external JS
        const scripts = [
            "/assets/js/settings.js",
            "/read/js/voice.js"
        ];
        scripts.forEach(src => {
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement("script");
                script.src = src; 
                script.async = false;
                document.body.appendChild(script);
            }
        });
        
    } catch (error) {
        console.error("4nt Extra script error:", error);
    }
}

// Smart initialization
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExtra);
} else {
    initExtra();
}

// Hotkeys
document.addEventListener("keydown", function(event) {
    // Игнорируем, если фокус в поле ввода (чтобы не мешать печатать)
    const activeTag = document.activeElement.tagName;
    const isInput = ['INPUT', 'TEXTAREA'].includes(activeTag) || document.activeElement.isContentEditable;

    // Alt + C: Переключение вида (Колонки / Скролл)
    if (event.altKey && event.code === "KeyC") {
        event.preventDefault();
        window.toggleViewMode();
    }
    
    // Alt + W: Оглавление / Сайдбар
    if (event.altKey && event.code === "KeyW") {
        event.preventDefault();
        if (typeof toggleSidebar === 'function') toggleSidebar();
    }
    
    // Alt + Z: Точки в Пали
    if (event.altKey && event.code === "KeyZ") {
        event.preventDefault();
        window.toggleDots();
    }
    
    if (event.altKey && (event.code === "KeyP" || event.code === "KeyY")) { 
  event.preventDefault();
    toggleQuickModal();
  }



    // --- Alt + R: Управление TTS плеером (Дубль из settings.js для гарантии) ---
    if (event.altKey && event.code === "KeyR") {
        if (isInput) return;
        event.preventDefault();
        
        // 1. Если скрипты еще не загружены — грузим и запускаем
        if (!window.isVoiceScriptLoaded) {
            if (typeof window.loadVoiceScripts === 'function') {
                window.loadVoiceScripts(() => {
                    const voiceLink = document.querySelector('.voice-link');
                    if (voiceLink) voiceLink.click();
                });
            }
            return;
        }
        
        // 2. Сценарий: Плеер уже активен (Пауза/Плей)
        if (typeof ttsState !== 'undefined' && ttsState.speaking) {
            const mainPlayBtn = document.querySelector('.play-main-button');
            if (mainPlayBtn) mainPlayBtn.click();
            return;
        }
        
        // 3. Сценарий: Выбран конкретный сегмент (мини-кнопка Play)
        const miniPlayBtn = document.querySelector('.dynamic-tts-btn');
        if (miniPlayBtn) {
            miniPlayBtn.click();
            return;
        }
        
        // 4. Сценарий: Запуск по умолчанию (клик по главной кнопке озвучки)
        const voiceLink = document.querySelector('.voice-link');
        if (voiceLink) voiceLink.click();
    }

    // --- Alt + T: Переключение темы (Светлая / Темная) ---
    if (event.altKey && event.code === "KeyT") {
        if (isInput) return;
        event.preventDefault();
        // Вызываем глобальную функцию переключения темы, которую extra.js уже патчит
        if (typeof window.toggleTheme === 'function') {
            window.toggleTheme();
        }
    }
});


window.addEventListener("keydown", (event) => {
    if (event.key === 'Escape' || event.code === 'Escape') {

        // ==========================================
        // ПРИОРИТЕТ 1: ПОДСКАЗКИ (Hints)
        // ==========================================
        
        // --- 1.1. Voice Hint ---
        const voiceHint = document.getElementById('active-voice-hint');
        if (voiceHint) {
            const closeHintBtn = document.getElementById('closeVoiceHintBtn');
            if (closeHintBtn) {
                closeHintBtn.click();
                event.preventDefault();
                return;
            }
        }

        // --- 1.2. General Hint Popup (С логами для Павла) ---
        // Ищем все варианты уведомлений: старые, новые тосты и баблы
        const hintElements = document.querySelectorAll('.dg-bottom-toast, .hint, .bubble-notification');
        
        for (let i = 0; i < hintElements.length; i++) {
            const hintElement = hintElements[i];
            const style = window.getComputedStyle(hintElement);
            
            // Проверяем наличие класса 'show' или фактическую видимость через opacity
            const isVisible = hintElement.classList.contains('show') || 
                              (style.display !== 'none' && style.opacity !== '0');
            
            if (isVisible) {
                
                // Ищем любую кнопку закрытия внутри
                const closeHintButton = hintElement.querySelector('#closeHintBtn, .dg-toast-close, .close-btn, .dg-bottom-toast-close');
                
                if (closeHintButton) {
                    closeHintButton.click();
                } else {
                    hintElement.classList.remove('show');
                }
                
                event.preventDefault();
                return; 
            }
        }

		
        // ==========================================
        // ПРИОРИТЕТ 2: СЛОВАРИ (Dictionaries)
        // ==========================================

        // --- 2.1. FDG Popup ---
        const fdgPopupElement = document.querySelector('.fdg-popup');
        if (fdgPopupElement && fdgPopupElement.style.display === 'block') {
            const fdgCloseButton = fdgPopupElement.querySelector('.fdg-close-btn');
            if (fdgCloseButton) {
                fdgCloseButton.click();
                event.preventDefault();
                return;
            }
        }

        // --- 2.2. Pali Lookup Popup (Главный словарь) ---
        const paliLookupPopupElement = document.querySelector('.popup');
        if (paliLookupPopupElement && paliLookupPopupElement.style.display === 'block') {
            const paliLookupCloseButton = paliLookupPopupElement.querySelector('.close-btn');
            if (paliLookupCloseButton) {
                paliLookupCloseButton.click();
                event.preventDefault();
                return;
            }
        }

        // ==========================================
        // ПРИОРИТЕТ 3: МОДАЛЬНЫЕ ОКНА (Modals & Banners)
        // ==========================================

        // --- 3.1. Quick Modal (Cattāri Ariyasaccāni) ---
        if (window.quickModalIsOpen) {
            if (typeof window.toggleQuickModal === 'function') {
                window.toggleQuickModal(); 
                event.preventDefault();
                return;
            }
        }

        // --- 3.2. PWA Banner ---
        const pwaBanner = document.getElementById('pwa-banner');
        if (pwaBanner && pwaBanner.offsetParent !== null) { 
            const closePwaBtn = document.getElementById('closePwaBanner');
            if (closePwaBtn) {
                closePwaBtn.click();
                event.preventDefault();
                return;
            }
        }

        // --- 3.3. Основные модальные окна (Settings, Help и т.д.) ---
        const closeBtnElements = document.querySelectorAll('.btn-close');
        if (closeBtnElements.length > 0) {
            let modalClosed = false;
            closeBtnElements.forEach(button => {
                if (button.offsetParent !== null) {
                    button.click();
                    modalClosed = true;
                }
            });
            // Возвращаемся, только если действительно закрыли видимое окно
            if (modalClosed) {
                event.preventDefault();
                return; 
            }
        }

        // ==========================================
        // ПРИОРИТЕТ 4: TTS И ВЫДЕЛЕНИЯ (Active Word)
        // ==========================================
        
        const dropdown = document.querySelector('.voice-dropdown');
        const isDropdownActive = dropdown && dropdown.classList.contains('active');
        const isHighlightActive = document.querySelector('.active-word');

        // Безопасная проверка, чтобы не уронить скрипт до загрузки voice.js
        const isTtsActive = typeof ttsState !== 'undefined' && (ttsState.speaking || ttsState.paused);

        // Если что-то играет, открыто меню или выделен текст
        if (isTtsActive || isDropdownActive || isHighlightActive) {
            event.preventDefault();
            
            if (typeof stopPlayback === 'function') {
                stopPlayback();        // Остановить звук, сбросить state
            }
            if (typeof removeAllHighlights === 'function') {
                removeAllHighlights(); // Убрать желтое выделение и мини-кнопку
            }
            
            // Закрываем меню плеера визуально
            if (dropdown) dropdown.classList.remove('active');
            return;
        }
    }
}, true);
