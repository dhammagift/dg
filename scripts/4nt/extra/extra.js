// не работает кнопка fdg - передавать # и ридер в зависимости от выбранных языков.  если если русский то /r/  или /read/ если есть англ. 

// ==========================================
// ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ЯЗЫКА ДЛЯ СЛОВАРЯ
// Выполняется моментально при загрузке страницы
// ==========================================
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
// ==========================================


window.removePaliPunctuation = function(text) {
    return text.replace(/·/g, '')
               .replace(/[-—–]/g, ' ')
               .replace(/[:;“”‘’,"']/g, '')
               .replace(/[.?!]/g, ' | ');
};


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
        applyIndependentHighlight();
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
                
                node.nodeValue = window.removePaliPunctuation(node.originalText);
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

function updateIndexLinks() {
    // Проверяем, что находимся именно в корне, а не в подпапке
    const basePath = location.pathname.startsWith('/4nt') ? '/4nt' : '';
    const isRoot = location.pathname === `${basePath}/` || location.pathname === `${basePath}/index.html`;
    
    if (!isRoot) {
        return;
    }

    // 1. Удаляем класс major у ссылки "Major EBT-relevant texts"
    const oldMajorLink = document.querySelector('a.col[href="major/index.html"]');
    if (oldMajorLink) {
        oldMajorLink.classList.remove('major');
    }

    // 2. Находим ссылки an, mn, sn, dn и добавляем класс major
    const targetHrefs = ['an/index.html', 'mn/index.html', 'sn/index.html', 'dn/index.html'];
    const allCols = document.querySelectorAll('a.col');
    
    allCols.forEach(col => {
        const href = col.getAttribute('href');
        if (href && targetHrefs.includes(href)) {
            col.classList.add('major');
        }
    });


}

function initExtra() {
    try {
        const basePath = location.pathname.startsWith('/4nt') ? '/4nt' : '';
        const cleanPath = location.pathname.replace(/^\/4nt/, '');
        updateIndexLinks();
        if (
            location.pathname === `${basePath}/` ||
            location.pathname === `${basePath}/index.html`
        ) {
            document.title = "4nt DG — Main Pali Editions Line by Line with Translations";
            document.querySelector("img.logo-full")?.remove();
        }

        const urlParams = new URLSearchParams(window.location.search);
        let requestedCols = [];
        
        if (urlParams.get('tabs') === 'root') {
            requestedCols = ['pali_royal_iast', 'pali', 'ru_dhammagift'];
        } else if (urlParams.has('cols')) {
            requestedCols = urlParams.get('cols').split(',').map(c => c.trim());
        } 
        else {
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
            if (a && a.href && a.origin === window.location.origin) {
                try {
                    const url = new URL(a.href);
                    if (url.pathname !== window.location.pathname) {
                        const currentCols = sessionStorage.getItem('sharedCols');
                        if (currentCols) {
                            url.searchParams.set('cols', currentCols);
                            a.href = url.toString();
                        }
                    }
                } catch(err) {}
            }
        });

        if (typeof ALL_TRANSLATIONS !== 'undefined') {
            ALL_TRANSLATIONS.forEach(t => {
                if (t.key === 'pali') {
                    t.label = "Pali Mahasangiti";
                    t.tip = "Root Pāli (Mahāsaṅgīti edition)";
                } else if (t.label && t.label.includes('IAST')) {
                    t.label = t.label.replace(/\s*\(IAST\)/gi, '').trim();
                }
                if (t.key === 'ru_dhammagift') {
                    t.group = "Russian"; 
                }
            });
        }

        if (typeof CAT_LABELS !== 'undefined') {
            CAT_LABELS.rus = 'Rus'; 
        }

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
                if (!warnMsgEl.innerHTML) {
                    warnMsgEl.innerHTML = warnText;
                }
            });
        }

        const shareTitle = "4nt DG";
        const shareDesc = "3 National Pali Canon Editions With Line by Line translations";

        function setMetaTag(attrName, attrValue, content) {
            let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attrName, attrValue);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        }

        setMetaTag('name', 'description', shareDesc);
        setMetaTag('property', 'og:title', shareTitle);
        setMetaTag('property', 'og:description', shareDesc);
        setMetaTag('property', 'og:type', 'website');
        setMetaTag('name', 'twitter:card', 'summary');
        setMetaTag('name', 'twitter:title', shareTitle);
        setMetaTag('name', 'twitter:description', shareDesc);

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

        document.documentElement.style.setProperty('--logo-w', '16px');
        
        const style = document.createElement('style');
        style.textContent = `
            img[src*="headerlogo.png"] {
                background-color: #ede5d4; 
                padding: 4px;
                border-radius: 10px;
                border: 1px solid var(--bar-border);
            }
            .home-logo img, img.home-logo {
                width: 16px;
            }
        `;
        document.head.appendChild(style);

        const topBtn = document.getElementById('topBtn');
        if (topBtn) {
            topBtn.style.display = 'none';
        }

        document.querySelectorAll("style").forEach(style => {
            if (style.textContent.includes("#1a1612")) {
                style.textContent = style.textContent.replaceAll("#1a1612", "#000");
            }
        });

        const jumpInput = document.getElementById('jumpInput');
        if (jumpInput) jumpInput.type = 'search';

        const mainH1 = document.querySelector('h1');
        if (mainH1 && !mainH1.textContent.includes('Dhamma.Gift')) {
            mainH1.textContent = 's.4nt.org Dhamma.Gift edition';
        }
        
        const firstTagline = document.querySelector('h1 + p.tagline');
        if (firstTagline && !firstTagline.textContent.includes('Voice and DPD')) {
            firstTagline.textContent = 'Pali Line by Line with Voice and DPD';
            firstTagline.id = 'dg-edition-text';
        }

        const targetWrap = document.getElementById('settingsWrap') || document.getElementById('siteSettingsWrap');
        
        if (targetWrap && !document.getElementById('voiceLinkBtn')) {
            const slug = getSlug() || '';
            const fragment = document.createDocumentFragment();

            const hasRuLang = (typeof COLS !== 'undefined' && COLS.some(c => c.includes('ru'))) || (window.isRu === true);
            const readerPath = hasRuLang ? '/r/' : '/read/';
            const hashSymbol = hasRuLang ? '#' : '';

            const buttons = [
                { tag: 'a', html: '🔊', title: 'Listen (TTS)', class: 'voice-link icon-btn', id: 'voiceLinkBtn', attr: { 'data-slug': slug }, href: 'javascript:void(0)' },
                { tag: 'a', html: '📜', title: 'View: Columns / Scroll', class: 'icon-btn', id: 'viewModeBtn', onclick: 'window.toggleViewMode()', href: 'javascript:void(0)' },
                { tag: 'a', html: `<img style="width:18px; height:18px; display:block;" src="${basePath}/assets/img/gray-white.png" alt="Search">`, title: 'Search Suttas (Ctrl+1)', 
    href: location.pathname.startsWith('/4nt') ? `${readerPath}?q=` + slug + hashSymbol : `https://f.dhamma.gift${readerPath}?q=` + slug + hashSymbol, id: 'fdg-button', class: 'icon-btn', rel: 'noreferrer' },
                { tag: 'a', html: `<img style="width:18px; height:18px; display:block;" src="${basePath}/assets/svg/comment.svg" alt="Dictionary">`, title: 'Popup Dictionary (Alt+A)', class: 'icon-btn toggle-dict-btn' }
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
        }

        const segBtn = document.getElementById('segBtn');
        if (segBtn) {
            const segRow = segBtn.closest('.set-row');
            if (segRow) {
                if (!document.getElementById('dotsBtn')) {
                    const dotsRow = document.createElement('div');
                    dotsRow.className = 'set-row';
                    dotsRow.innerHTML = `
                        <span class="set-lbl" title="Toggle compound dots (·) and punctuation">Toggle Pāli punctuation</span>
                        <button class="icon-btn" id="dotsBtn" onclick="window.toggleDots()" title="Toggle Pāli punctuation">Off</button>
                    `;
                    segRow.parentNode.insertBefore(dotsRow, segRow);
                }

                if (!document.getElementById('dict-select-4nt')) {
                    const dictRow = document.createElement('div');
                    dictRow.className = 'set-row';
                    
                    const currentDict = (localStorage.getItem('selectedDict') || 'standalone').toLowerCase();
                    
                    if (currentDict.includes('ru')) {
                        window.isRu = true;
                        localStorage.setItem('siteLanguage', 'ru');
                    } else {
                        window.isRu = false;
                        localStorage.setItem('siteLanguage', 'en');
                    }
                    
                    dictRow.innerHTML = `
                        <span class="set-lbl" title="Select dictionary">Dictionary</span>
                        <select id="dict-select-4nt" style="background: var(--bg); color: var(--text); border: 1px solid var(--bar-border); border-radius: 4px; padding: 2px 4px; font-family: sans-serif; font-size: 0.82rem; outline: none; cursor: pointer;">
                            <option value="standalone">DPD Built-in</option>
                            <option value="dpdfull">DPD Online Popup</option>
                            <option value="newwindow">DPD Online New Window</option>
                            <option value="dpdcompact">DPD Online Mini</option>
                            <option value="machinetranslation">DharmaMitra.org</option>
                            <option value="searchonly">Search Only</option>
                            <option value="dicttango">DictTango Android</option>
                            <option value="mdict">Mdict IOS</option>
                            <option value="goldenpc">GoldenDict Desktop</option>
                            <option value="standaloneru">DPD Встроенный (Ru)</option>
                            <option value="dpdfullru">DPD Онлайн Попап (Ru)</option>
                            <option value="newwindowru">DPD Онлайн Новое Окно (Ru)</option>
                            <option value="dpdcompactru">DPD Онлайн Мини (Ru)</option>
                        </select>
                    `;
                    segRow.parentNode.insertBefore(dictRow, segRow);

                    const dictSelect = document.getElementById('dict-select-4nt');
                    
                    const options = Array.from(dictSelect.options);
                    const matchedOpt = options.find(opt => opt.value === currentDict);
                    if (matchedOpt) {
                        dictSelect.value = matchedOpt.value;
                    }

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
            }
        }

        const morePop = document.getElementById('morePop');
        if (morePop && !document.getElementById('orig-site-btn')) {
            const origRow = document.createElement('div');
            origRow.className = 'set-row';
            const cleanPath = location.pathname.replace(/^\/4nt/, '');
            
            origRow.innerHTML = `
                <span class="set-lbl" title="Open this page on the original s.4nt.org site">Original site</span>
                <a id="orig-site-btn" class="icon-btn" href="javascript:void(0)" onclick="this.href='https://s.4nt.org${cleanPath}'+location.search+location.hash" target="_blank" title="Original s.4nt.org site">🌐</a>
            `;
            morePop.appendChild(origRow);
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

        const processLangClasses = (el) => {
            if (!el || !el.classList) return;
            
            let isPali = false;
            if (el.classList.contains('ct')) {
                const td = el.closest('td.c');
                if (td) {
                    isPali = Array.from(td.classList).some(cls => 
                        cls.startsWith('t-pali') || ['t-san', 't-lzh', 't-zh'].includes(cls)
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

            const main = document.getElementById('main');
            if (isPali && main && main.classList.contains('dots-hidden')) {
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
                let node;
                while ((node = walker.nextNode())) {
                    if (node.originalText === undefined) {
                        node.originalText = node.nodeValue;
                    }
                    node.nodeValue = window.removePaliPunctuation(node.originalText);
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
                
                console.log('4nt: Columns migrated to new default:', COLS);

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
        if (typeof toggleQuickModal === 'function') toggleQuickModal();
    }

    // --- Alt + R: Управление TTS плеером (Дубль из settings.js для гарантии) ---
    if (event.altKey && event.code === "KeyR") {
        if (isInput) return;
        event.preventDefault();
        
        // 1. Сценарий: Плеер уже активен (Пауза/Плей)
        if (window.isVoiceScriptLoaded && typeof ttsState !== 'undefined' && (ttsState.speaking || ttsState.paused)) {
            const mainPlayBtn = document.querySelector('.play-main-button');
            if (mainPlayBtn) mainPlayBtn.click();
            return;
        }

        // 2. Если скрипты еще не загружены — грузим и запускаем с учетом активного слова
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

        // Вспомогательная функция для полной остановки события, чтобы другие скрипты его не подхватили
        const consumeEvent = () => {
            event.preventDefault();
            event.stopPropagation();
        };

        // ==========================================
        // ПРИОРИТЕТ 1: ПОДСКАЗКИ (Hints)
        // ==========================================
        
        // --- 1.1. Voice Hint ---
        const voiceHint = document.getElementById('active-voice-hint');
        if (voiceHint && voiceHint.offsetWidth > 0) { // надежная проверка видимости
            const closeHintBtn = document.getElementById('closeVoiceHintBtn');
            if (closeHintBtn) {
                closeHintBtn.click();
                consumeEvent();
                return;
            }
        }

        // --- 1.2. General Hint Popup ---
        const hintElements = document.querySelectorAll('.dg-bottom-toast, .hint, .bubble-notification');
        for (let i = 0; i < hintElements.length; i++) {
            const hintElement = hintElements[i];
            const style = window.getComputedStyle(hintElement);
            
            // Защита от "проглатывания": элемент должен занимать место на экране
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

        // ==========================================
        // ПРИОРИТЕТ 2: СЛОВАРИ (Dictionaries)
        // ==========================================

        // --- 2.1. FDG Popup ---
        const fdgPopupElement = document.querySelector('.fdg-popup');
        // Используем getComputedStyle, чтобы отловить стили из CSS классов
        if (fdgPopupElement && window.getComputedStyle(fdgPopupElement).display !== 'none') {
            const fdgCloseButton = fdgPopupElement.querySelector('.fdg-close-btn');
            if (fdgCloseButton) {
                fdgCloseButton.click();
                consumeEvent();
                return;
            }
        }

        // --- 2.2. Pali Lookup Popup (Главный словарь) ---
        const paliLookupPopupElement = document.querySelector('.popup');
        if (paliLookupPopupElement && window.getComputedStyle(paliLookupPopupElement).display !== 'none') {
            const paliLookupCloseButton = paliLookupPopupElement.querySelector('.close-btn');
            if (paliLookupCloseButton) {
                paliLookupCloseButton.click();
                consumeEvent();
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
                consumeEvent();
                return;
            }
        }

        // --- 3.2. PWA Banner ---
        const pwaBanner = document.getElementById('pwa-banner');
        if (pwaBanner && pwaBanner.offsetWidth > 0) { 
            const closePwaBtn = document.getElementById('closePwaBanner');
            if (closePwaBtn) {
                closePwaBtn.click();
                consumeEvent();
                return;
            }
        }

        // --- 3.3. Основные модальные окна (Settings, Help и т.д.) ---
        const closeBtnElements = document.querySelectorAll('.btn-close');
        if (closeBtnElements.length > 0) {
            let modalClosed = false;
            closeBtnElements.forEach(button => {
                // getBoundingClientRect надежнее, чем offsetParent, для fixed/absolute элементов
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

        // ==========================================
        // ПРИОРИТЕТ 4: TTS И ВЫДЕЛЕНИЯ (Active Word)
        // ==========================================
        
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


// Перехват клика по главной кнопке озвучки для старта с активного слова
window.addEventListener('click', function(event) {
    const voiceLink = event.target.closest('.voice-link');
    
    if (voiceLink) {
        const miniPlayBtn = document.querySelector('.dynamic-tts-btn');
        const isTtsRunning = window.isVoiceScriptLoaded && typeof ttsState !== 'undefined' && (ttsState.speaking || ttsState.paused);
        
        if (miniPlayBtn && !isTtsRunning) {
            // Жестко блокируем клик для всех остальных скриптов, включая voice.js
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
}, true); // true означает фазу перехвата (захвата) - сработает самым первым

function applyIndependentHighlight() {
    const hash = window.location.hash;
    if (!hash) return;

    // Очищаем хеш от параметров
    const hashContent = hash.substring(1);
    const cleanId = hashContent.split('&')[0].split('?')[0];
    
    // Поддержка нескольких ID через запятую[span_2](start_span)[span_2](end_span)
    const ids = cleanId.includes(',') ? cleanId.split(',') : [cleanId];

    ids.forEach(id => {
        let element = document.getElementById(id);
        
        // Фолбэк для поиска соседнего узла, если точный ID не найден[span_3](start_span)[span_3](end_span)
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
            // =====================================
            // ДУБЛИКАТ ЛОГИКИ МИГАНИЯ ИЗ ПРОДА[span_4](start_span)[span_4](end_span)
            // =====================================
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

            // Искусственная задержка для инициализации плеера[span_5](start_span)[span_5](end_span)
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
