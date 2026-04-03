const isMobileLike = (
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ||
                        (window.innerWidth <= 768)
        );
const isLocalhost = window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1');

const isRussian = window.location.pathname.includes('/ru/') ||
                         window.location.pathname.includes('/r/') ||
                         window.location.pathname.includes('/ml/') ||
                         localStorage.getItem('siteLanguage') === 'ru';


const newWindowWidth = 500;
const newWindowHeight = 500;

// Получаем ширину экрана
const screenWidth = window.screen.availWidth;
const screenHeight = window.screen.availHeight;

const newWindowleft = screenWidth - newWindowWidth - 30; // 20 пикселей от правого края (отступ)
const newWindowTop = screenHeight - newWindowHeight - 50; // 50 пикселей от нижнего края

const popupFeatures = `width=${newWindowWidth},height=${newWindowHeight},left=${newWindowleft},top=${newWindowTop},scrollbars=yes,resizable=yes`;

// Переменная для хранения ссылки на открытое окно
let dictionaryWindow = null;

/**
 * Открывает окно словаря, закрывая предыдущее, если оно существует.
 * @param {string} url - URL для загрузки в окне.
 */
function openDictionaryWindow(url) {
if (isLocalhost && externalDict === true) {
    // Переход только если это localhost/127.0.0.1 И externalDict = true
    window.location.href = url;
    return;
}
  // Открываем новое окно и сохраняем ссылку на него
  // Имя 'dictionaryPopup' помогает браузеру переиспользовать то же окно
  dictionaryWindow = window.open(url, 'dictionaryPopup', popupFeatures);

  // (Опционально) Устанавливаем фокус на это окно
  if (dictionaryWindow) {
    dictionaryWindow.focus();
  }
}

if (typeof initCopyNotification === 'undefined') {
    // Функция НЕ объявлена — можно добавлять её
    function initCopyNotification() {
        if (!document.getElementById('bubbleNotification')) {
            const bubble = document.createElement('div');
            bubble.id = 'bubbleNotification';
            bubble.className = 'bubble-notification';
            document.body.appendChild(bubble);
        }
    }
        initCopyNotification();
}

if (typeof showBubbleNotification === 'undefined') {
    // Функция НЕ объявлена — можно добавлять её
     function showBubbleNotification(text) {
        const bubble = document.getElementById('bubbleNotification');
        if (!bubble) return;

        bubble.textContent = text;
        bubble.classList.add('show');
        bubble.style.opacity = '1';

        setTimeout(() => {
            bubble.style.opacity = '0';
        }, 2000);
    }
}

// Проверяем язык в localStorage
const siteLanguage = localStorage.getItem('siteLanguage');

let savedDict = localStorage.getItem('selectedDict');


function getSelectedText() {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
}

function isSelectionWithinElement(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    return element.contains(range.commonAncestorContainer);
}


function savePopupState() {
    localStorage.setItem('popupWidth', popup.style.width);
    localStorage.setItem('popupHeight', popup.style.height);
    localStorage.setItem('popupTop', popup.style.top);
    localStorage.setItem('popupLeft', popup.style.left);
}

if (savedDict) {
    savedDict = savedDict.toLowerCase();
} else if (window.location.pathname.includes('/r/') ||
           window.location.pathname.includes('/ml/') ||
           window.location.pathname.includes('/ru/')) {
    savedDict = "standaloneru";
} else {
    savedDict = "standalone";
}

// ── Универсальная переустановка на dpdfull ──
// NOTE: This logic seems specific and was kept. It overrides the saved dictionary.
if (
    window.location.pathname.includes('/d/') &&
    (savedDict === "standalone" || savedDict === "standaloneru")
    || window.location.search.includes('script=devanagari')
) {
    // This logic seems to be forcing a dictionary change based on URL.
    // Let's ensure it maps to a key in our new config.
    // Assuming "dpdfull" should be used.
    savedDict = isRussian ? "dpd_ru_full" : "dpd_full";
}

// --- ЦЕНТРАЛИЗОВАННАЯ КОНФИГУРАЦИЯ СЛОВАРЕЙ ---
const dictionaryConfig = {
    "dpd_ru_full": {
        baseUrl: "https://dict.dhamma.gift/ru",
        searchPath: "/?silent&q=",
    },
    "dpd_full": {
        baseUrl: "https://dict.dhamma.gift",
        searchPath: "/?silent&q=",
    },
    "dpd_ru_compact": {
        baseUrl: "https://dict.dhamma.gift/ru",
        searchPath: "/gd?search=",
    },
    "dpd_compact": {
        baseUrl: "https://dict.dhamma.gift",
        searchPath: "/gd?search=",
    },
    "dicttango": {
        baseUrl: "dttp://app.dicttango/WordLookup?word=",
        searchPath: "",
        external: true,
    },
    "goldenpc": {
        baseUrl: "goldendict://",
        searchPath: "",
        external: true,
    },
    "mdict": {
        baseUrl: "mdict://mdict.cn/search?text=",
        searchPath: "",
        external: true,
    },
    "newwindow": {
        baseUrl: "https://dict.dhamma.gift",
        searchPath: "/?silent&q=",
        newWindow: true,
    },
    "newwindowru": {
        baseUrl: "https://dict.dhamma.gift/ru",
        searchPath: "/?silent&q=",
        newWindow: true,
    },
    "standaloneru": {
        standalone: true,
    },
    "standalone": {
        standalone: true,
    },
    "machinetranslation": {
        baseUrl: "https://dharmamitra.org/?target_lang=english-explained&input_sentence=",
        searchPath: "",
        newWindow: true,
    },
    "dpdictnetru": {
        baseUrl: "https://ru.dpdict.net",
        searchPath: "/search?q=", // Assuming this is the correct search path
        newWindow: true,
    },
    "dpdictnet": {
        baseUrl: "https://dpdict.net",
        searchPath: "/search?q=", // Assuming this is the correct search path
        newWindow: true,
    },
    "searchonly": {
        searchOnly: true
    }
};

// --- УСТАНОВКА ПАРАМЕТРОВ НА ОСНОВЕ КОНФИГУРАЦИИ ---
let dhammaGift = isLocalhost ? '' : 'https://dhamma.gift';
if (!isLocalhost && isRussian) {
   dhammaGift += '/ru';
}
dhammaGift += '/?q=';
let dgParams = '&p=-kn';

// Получаем конфигурацию для выбранного словаря, или searchonly по умолчанию
const currentConfig = dictionaryConfig[savedDict] || dictionaryConfig['searchonly'];

// Устанавливаем переменные на основе конфигурации
let dictUrl = (currentConfig.baseUrl || "") + (currentConfig.searchPath || "");
if (currentConfig.standalone) {
    dictUrl = savedDict; // Для внутренней логики сохраняем "standalone" или "standaloneru"
}

const externalDict = currentConfig.external || false;
const inNewWindow = currentConfig.newWindow || false;
const isStandalone = currentConfig.standalone || false;
const isSearchOnly = currentConfig.searchOnly || false;


/**
 * Creates the search URL for a given word based on the central configuration.
 * @param {string} word - The word to create URL for
 * @returns {string} - The search URL
 */
function createDictSearchUrl(word) {
    if (isLocalhost) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        return isAndroid
            ? `dttp://app.dicttango/WordLookup?word=${encodeURIComponent(word)}`
            : `goldendict://${encodeURIComponent(word)}`;
    }

    // Используем текущую конфигурацию для создания URL
    const config = currentConfig;
    if (config.baseUrl) {
        return `${config.baseUrl}${config.searchPath || ''}${encodeURIComponent(word)}`;
    }
    
    // Запасной вариант для кнопки "искать онлайн" в standalone режиме
    return `https://dict.dhamma.gift/${isRussian ? "ru/" : ""}?silent&q=${encodeURIComponent(word)}`;
}


// Функция для отложенной загрузки скриптов standalone-словаря
// Cache for tracking loaded scripts
const scriptCache = new Map();

// Polyfill for requestIdleCallback
const requestIdleCallback = window.requestIdleCallback ||
    function(cb) { return setTimeout(() => { cb({ didTimeout: false }); }, 0); };

function handleWordLookup(word, event) {

     if (!dictionaryVisible) return;

    let cleanedWord = cleanWord(word);
    let translation = "";

    // Для standalone-режима обрабатываем ВСЕ слова
    if (isStandalone) {
        // Пытаемся найти перевод для всего словосочетания
        const phraseTranslation = lookupWordInStandaloneDict(cleanedWord);

        // Если перевод для словосочетания есть — выводим его
        if (phraseTranslation.trim() !== "") {
            translation += phraseTranslation;
        }
        // Если перевода нет — разбиваем на слова и ищем их по отдельности
        else {
            const words = cleanedWord.split(/\s+/)
                                    .map(w => cleanWord(w))
                                    .filter(w => w.length > 0);

            for (const singleWord of words) {
                translation += lookupWordInStandaloneDict(singleWord);
            }
        }
    }
    // Для внешних словарей (goldenpc, dicttango, mdict)
    else if (externalDict) {
        const tempLink = document.createElement('a');
        tempLink.href = 'javascript:void(0)';
        tempLink.onclick = function() {
            window.location.href = `${dictUrl}${encodeURIComponent(cleanedWord)}`;
            return false;
        };
        tempLink.click();
        translation = "";
        popup.style.display = 'none';
        overlay.style.display = 'none';
    } 
    // Для режимов, открывающихся в новом окне
    else if (inNewWindow) {
        const url = createDictSearchUrl(cleanedWord);
        openDictionaryWindow(url);
        return; // Важно завершить выполнение здесь
    }
    // Для iframe (режим по умолчанию)
    else {
        const url = createDictSearchUrl(cleanedWord);
        iframe.src = url;
    }

    const wordForSearch = cleanedWord.replace(/'ti/, '');
    const dictSearchUrl = createDictSearchUrl(wordForSearch);

    if (isStandalone && !translation) {
        // Создаем ссылку на слово с помощью глобальной функции и оборачиваем в strong
        const wordLink = `<strong>${createClickableLink(word)}</strong>`;

        // Подставляем готовую ссылку в сообщение
        translation = isRussian ?
            `<div style="padding: 10px;">
                ${wordLink} не найдено во встроенном словаре.
                <br><br><a href="/cse.php?q=${word}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: inherit;">Искать онлайн</a>
            </div>` :
            `<div style="padding: 10px;">
                ${wordLink} is not found in the built-in dictionary.
                <br><br><a href="/cse.php?q=${word}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: inherit;">Search online</a>
            </div>`;
    }


    if (translation) {
        const isDarkMode = document.body.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
        const themeClass = isDarkMode ? 'dark' : '';

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.width = 'calc(100% - 20px)';
        tempDiv.innerHTML = translation;
        document.body.appendChild(tempDiv);

        const contentHeight = tempDiv.offsetHeight;
        document.body.removeChild(tempDiv);

        let minHeight = 100;
        const maxHeight = window.innerHeight * 0.95;

        if (isStandalone) {
            minHeight = 100;
        } else {
            const screenHeight = window.innerHeight;
            minHeight = (screenHeight * 0.8 < 600) ? screenHeight * 0.8 : 600;
        }

        let finalHeight = Math.min(Math.max(contentHeight + 20, minHeight), maxHeight);

        iframe.srcdoc = `
            <!DOCTYPE html>
            <html lang="en" class="${themeClass}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 10px;
                        margin: 0;
                        overflow: auto;
                    }
                    body.dark {
                        background: #07021D !important;
                        color: #E1EAED !important;
                    }
                    strong {
                        font-size: 1.2em;
                    }
                    ul {
                        list-style-type: none;
                        padding-left: 0;
                    }
                    li {
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body class="${themeClass}">
                ${translation}
            </body>
            </html>
        `;

        popup.style.height = `${finalHeight}px`;
        popup.style.display = 'block';
        overlay.style.display = 'block';

        iframe.onload = function() {
            try {
                const iframeBody = iframe.contentDocument.body;
                const scrollHeight = iframeBody.scrollHeight;
                const adjustedHeight = Math.min(Math.max(scrollHeight + 20, minHeight), maxHeight);
                popup.style.height = `${adjustedHeight}px`;
            } catch(e) {
                console.error('Error adjusting iframe height:', e);
            }
        };
    }

    const openBtn = document.querySelector('.open-btn');
    openBtn.href = `${dhammaGift}${encodeURIComponent(wordForSearch)}${dgParams}`;

    const dictBtn = document.querySelector('.dict-btn');
    dictBtn.href = dictSearchUrl;

    if (isStandalone) {
      dictBtn.onclick = (e) => {
        e.preventDefault();
        parent.openDictionaryWindow(dictSearchUrl);
        return false;
      };
    }

    function showSearchButton() {
        const wordForSearch = cleanedWord.replace(/'ti/, '');
        const searchBtn = document.createElement('a');
        searchBtn.href = `${dhammaGift}${encodeURIComponent(wordForSearch)}${dgParams}`;
        searchBtn.classList.add('open-btn');
        searchBtn.style.position = 'fixed';
        searchBtn.style.border = 'none';
        searchBtn.style.background = '#2D3E50';
        searchBtn.style.color = 'white';
        searchBtn.style.cursor = 'pointer';
        searchBtn.style.width = '30px';
        searchBtn.style.height = '30px';
        searchBtn.style.borderRadius = '50%';
        searchBtn.style.display = 'flex';
        searchBtn.style.alignItems = 'center';
        searchBtn.style.justifyContent = 'center';
        searchBtn.style.textDecoration = 'none';
        searchBtn.target = '_blank';
        searchBtn.style.top = `${event.clientY - 10}px`;
        searchBtn.style.left = `${event.clientX - 10}px`;
        searchBtn.style.zIndex = '10000';
        searchBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="white" style="transform: scaleX(-1);">
                <path d="M505 442.7l-99.7-99.7c28.4-35.3 45.7-79.8 45.7-128C451 98.8 352.2 0 224 0S-3 98.8-3 224s98.8 224 224 224c48.2 0 92.7-17.3 128-45.7l99.7 99.7c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4c12.5-12.5 12.5-32.8 0-45.3zM224 384c-88.4 0-160-71.6-160-160S135.6 64 224 64s160 71.6 160 160-71.6 160-160 160z"/>
            </svg>
        `;
        document.body.appendChild(searchBtn);
        searchBtn.addEventListener('click', () => {
            searchBtn.remove();
        });
        setTimeout(() => {
            searchBtn.remove();
        }, 1500);
    }

    if (externalDict || isSearchOnly) {
        popup.style.display = 'none';
        overlay.style.display = 'none';
        showSearchButton();
    } else {
        popup.style.display = 'block';
        overlay.style.display = 'block';
    }
}


function lazyLoadStandaloneScripts(lang = 'en') {
    return new Promise((resolve, reject) => {
        const loadScripts = () => {
            const commonScripts = [
                '/assets/js/standalone-dpd/dpd_i2h.js',
                '/assets/js/standalone-dpd/dpd_deconstructor.js'
            ];

            const langSpecific = lang === 'ru'
                ? '/assets/js/standalone-dpd/ru/dpd_ebts.js'
                : '/assets/js/standalone-dpd/dpd_ebts.js';

            const scripts = [...commonScripts, langSpecific];
            const scriptsToLoad = scripts.filter(src => {
                return !document.querySelector(`script[src="${src}"]`) && !scriptCache.has(src);
            });

            if (scriptsToLoad.length === 0) {
                resolve();
                return;
            }

            // Show loading indicator - more robust version
            const loadingId = 'dict-loading-' + Date.now();
            const loadingEl = document.createElement('div');
            loadingEl.id = loadingId;
            Object.assign(loadingEl.style, {
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                padding: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'grey',
                borderRadius: '12px',
                zIndex: '10000',
                fontSize: '14px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
            });
            loadingEl.textContent = 'Loading dictionary...';

            // Ensure loading message is visible in Safari
            document.body.appendChild(loadingEl);
            setTimeout(() => loadingEl.style.opacity = '1', 10);

            // Load all scripts with better Safari support
            const loadPromises = scriptsToLoad.map(src => {
                return new Promise((scriptResolve) => {
                    if (scriptCache.has(src)) {
                        return scriptResolve();
                    }

                    const script = document.createElement('script');
                    script.src = src;
                    script.defer = true;

                    // More reliable loading for Safari
                    script.onload = script.onreadystatechange = function() {
                        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                            scriptCache.set(src, true);
                            scriptResolve();
                        }
                    };

                    script.onerror = () => {
                        console.warn(`Failed to load script: ${src}`);
                        scriptResolve(); // Resolve even if failed to prevent blocking
                    };

                    // Safari sometimes needs this
                    script.crossOrigin = 'anonymous';
                    document.head.appendChild(script);
                });
            });

            // Set timeout for all loads
            const timeoutPromise = new Promise((_, timeoutReject) => {
                setTimeout(() => timeoutReject(new Error('Script loading timeout')), 10000); // Longer timeout for Safari
            });

            Promise.race([
                Promise.all(loadPromises),
                timeoutPromise
            ])
            .then(() => {
                const el = document.getElementById(loadingId);
                if (el) {
                    el.style.opacity = '0';
                    setTimeout(() => el.remove(), 300);
                }
                resolve();
            })
            .catch(err => {
                console.warn('Dictionary loading warning:', err);
                const el = document.getElementById(loadingId);
                if (el) {
                    el.textContent = 'Dictionary load failed';
                    el.style.background = 'rgba(255,0,0,0.7)';
                    setTimeout(() => el.remove(), 2000);
                }
                resolve(); // Still resolve to allow fallback behavior
            });
        };

        // Use requestIdleCallback with fallback
        requestIdleCallback(loadScripts, { timeout: 1000 });
    });
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Минимальная задержка перед началом загрузки
    setTimeout(() => {
    if (savedDict === "standalone") {
        requestIdleCallback(() => {
            lazyLoadStandaloneScripts()
                .then(() => { /* console.log('Standalone eng scripts lazy-loaded'); */ })
                .catch(err => console.warn('Lazy loading eng scripts warning:', err));
        }, { timeout: 2000 });
    }
    else if (savedDict === "standaloneru") {
        requestIdleCallback(() => {
            lazyLoadStandaloneScripts("ru")
                .then(() => { /* console.log('Standalone rus scripts lazy-loaded'); */ })
                .catch(err => console.warn('Lazy loading rus scripts warning:', err));
        }, { timeout: 2000 });
    }
    }, 1000); // Небольшая задержка для гарантированного рендеринга
});

/**
 * Создает кликабельную ссылку с правильным поведением для любой среды.
 * @param {string} wordToLink - Слово для ссылки.
 * @returns {string} - Готовый HTML тег <a>.
 */
function createClickableLink(wordToLink) {
    const wordSearchUrl = createDictSearchUrl(wordToLink);
    let clickAction;

    if (isLocalhost) {
        // Для localhost просто переходим по ссылке
        clickAction = `window.location.href=this.href; return false;`;
    } else {
        // Для live-сайта открываем в новом окне
        clickAction = `event.preventDefault(); event.stopPropagation(); parent.openDictionaryWindow(this.href); return false;`;
    }

    return `<a href="${wordSearchUrl}" onclick="${clickAction}" style="text-decoration: none; color: inherit;">${wordToLink}</a>`;
}


function lookupWordInStandaloneDict(word) {
    let out = "";
    word = word.replace(/[’”'"]/g, "").replace(/ṁ/g, "ṃ");
  
    /**
     * Находит все слова в строке и делает их кликабельными.
     */
    function linkifyPaliWords(text) {
        const wordRegex = /(?![^<]*>)([a-zA-ZāīūṅñṭḍṇḷṃĀĪŪṄÑṬḌṆḶṂёЁа-яА-Я']+)/g;
        return text.replace(wordRegex, (foundWord) => createClickableLink(foundWord));
    }

    // --- Основная логика ---

    // 1. Проверяем, есть ли слово как ключ в словаре
    if (word in dpd_i2h) {
        out += `<strong>${createClickableLink(word)}</strong><br><ul style="line-height: 1em; padding-left: 15px;">`;
        for (const headword of dpd_i2h[word]) {
            if (headword in dpd_ebts) {
                const clickableHeadword = createClickableLink(headword);
                const linkedDefinition = linkifyPaliWords(dpd_ebts[headword]);
                out += `<li><span class="pli-lang" lang="pi">${clickableHeadword}. ${linkedDefinition}</span></li>`;
            }
        }
        out += "</ul>";
    }
    // 2. Если не ключ, ищем как значение в словаре
    else {
        for (const key in dpd_i2h) {
            if (dpd_i2h[key].includes(word) && word in dpd_ebts) {
                if (!out.includes(`<strong>`)) { // Проверяем, был ли уже заголовок
                     out += `<strong>${createClickableLink(word)}</strong><br><ul style="line-height: 1em; padding-left: 15px;">`;
                }
                const clickableWord = createClickableLink(word);
                const linkedDefinition = linkifyPaliWords(dpd_ebts[word]);
                out += `<li><span class="pli-lang" lang="pi">${clickableWord}. ${linkedDefinition}</span></li></ul>`;
                break;
            }
        }
    }

    // 3. Проверяем слово в деконструкторе
    if (word in dpd_deconstructor) {
        if (!out.includes(`<strong>`)) { // Проверяем, был ли уже заголовок
            out += `<strong>${createClickableLink(word)}</strong><br>`;
        }
        
        const linkedDeconstruction = linkifyPaliWords(dpd_deconstructor[word]);
        out += `<ul style='line-height: 1em; padding-left: 15px;'><li><span class='pli-lang' lang='pi'>${linkedDeconstruction}</span></li></ul>`;
    }

    return out.replace(/ṃ/g, "ṁ");
}

function clearParams() {
    const keys = ['popupWidth', 'popupHeight', 'popupTop', 'popupLeft', 'windowWidth', 'windowHeight', 'isFirstDrag'];
    keys.forEach(key => localStorage.removeItem(key));
}

// Создание элементов для Popup с возможностью изменения размера и перемещения
function createPopup() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.style.position = 'fixed';
    popup.style.maxWidth = '100%';
    popup.style.maxHeight = '1200px';
    popup.style.borderRadius = '8px';
    popup.style.overflow = 'hidden';

    // Проверка параметров окна браузера
    const currentWindowWidth = window.innerWidth;
    const currentWindowHeight = window.innerHeight;

    const savedWindowWidth = localStorage.getItem('windowWidth');
    const savedWindowHeight = localStorage.getItem('windowHeight');

    if (
        savedWindowWidth &&
        savedWindowHeight &&
        (parseInt(savedWindowWidth, 10) !== currentWindowWidth ||
            parseInt(savedWindowHeight, 10) !== currentWindowHeight)
    ) {
        clearParams();
    }

    localStorage.setItem('windowWidth', currentWindowWidth);
    localStorage.setItem('windowHeight', currentWindowHeight);

    // Установка сохранённых размеров и позиции
    const savedWidth = localStorage.getItem('popupWidth');
    const savedHeight = localStorage.getItem('popupHeight');
    const savedTop = localStorage.getItem('popupTop');
    const savedLeft = localStorage.getItem('popupLeft');

    if (savedWidth) popup.style.width = savedWidth;
    if (savedHeight) popup.style.height = savedHeight;
    if (savedTop) popup.style.top = savedTop;
    if (savedLeft) popup.style.left = savedLeft;

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.title = '(Esc)';
    closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="17" height="17" fill="currentColor">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
        </svg>
    `;

    const openBtn = document.createElement('a');
    openBtn.classList.add('open-btn');
    openBtn.style.position = 'absolute';
    openBtn.style.top = '10px';
    openBtn.style.right = '45px';
    openBtn.style.background = 'rgba(45, 62, 80, 0.6)';
    openBtn.style.color = 'rgba(255, 255, 255, 0.8)';
    openBtn.style.cursor = 'pointer';
    openBtn.style.width = '30px';
    openBtn.style.height = '30px';
    openBtn.style.borderRadius = '50%';
    openBtn.style.display = 'flex';
    openBtn.style.alignItems = 'center';
    openBtn.style.justifyContent = 'center';
    openBtn.style.textDecoration = 'none';
    openBtn.target = '_blank';
    openBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="white" style="transform: scaleX(-1);">
            <path d="M505 442.7l-99.7-99.7c28.4-35.3 45.7-79.8 45.7-128C451 98.8 352.2 0 224 0S-3 98.8-3 224s98.8 224 224 224c48.2 0 92.7-17.3 128-45.7l99.7 99.7c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4c12.5-12.5 12.5-32.8 0-45.3zM224 384c-88.4 0-160-71.6-160-160S135.6 64 224 64s160 71.6 160 160-71.6 160-160 160z"/>
        </svg>
    `;

    const dictBtn = document.createElement('a');
    dictBtn.classList.add('dict-btn');
    dictBtn.style.position = 'absolute';
    dictBtn.style.top = '10px';
    dictBtn.style.right = '80px';
    dictBtn.style.background = 'rgba(45, 62, 80, 0.6)';
    dictBtn.style.color = 'rgba(255, 255, 255, 0.8)';
    dictBtn.style.cursor = 'pointer';
    dictBtn.style.width = '30px';
    dictBtn.style.height = '30px';
    dictBtn.style.borderRadius = '50%';
    dictBtn.style.display = 'flex';
    dictBtn.style.alignItems = 'center';
    dictBtn.style.justifyContent = 'center';
    dictBtn.style.textDecoration = 'none';
    dictBtn.target = '_blank';
    dictBtn.title = 'Open in dict.dhamma.gift';
    dictBtn.innerHTML = `<img src="/assets/svg/dpd-logo-dark.svg" width="18" height="18">`;

    const iframe = document.createElement('iframe');
    iframe.src = '';
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 16px)';
    iframe.style.overflow = 'hidden';

    const header = document.createElement('div');
    header.classList.add('popup-header');
    header.style.cursor = 'move';
    header.style.height = '10px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.padding = '0 10px';
    header.textContent = '';

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.zIndex = '10';
    resizeHandle.innerHTML = `
        <style>
            .resize-handle::after {
                content: "";
                position: absolute;
                right: 3px;
                bottom: 3px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 0 12px 12px;
                border-color: transparent transparent #666 transparent;
            }
        </style>
    `;
    
    const resizeHandleRight = document.createElement('div');
    resizeHandleRight.style.cssText = 'position: absolute; right: 0; top: 0; width: 5px; height: 100%; cursor: ew-resize; z-index: 9;';

    const resizeHandleBottom = document.createElement('div');
    resizeHandleBottom.style.cssText = 'position: absolute; left: 0; bottom: 0; width: 100%; height: 5px; cursor: ns-resize; z-index: 9;';


    popup.appendChild(header);
    popup.appendChild(dictBtn);
    popup.appendChild(openBtn);
    popup.appendChild(closeBtn);
    popup.appendChild(iframe);
    popup.appendChild(resizeHandle);
    popup.appendChild(resizeHandleRight);
    popup.appendChild(resizeHandleBottom);

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    let isDragging = false;
    let isResizing = false;
    let currentResizeType = 'corner';

    let startX, startY, initialLeft, initialTop;
    let isFirstDrag = localStorage.getItem('isFirstDrag') === 'false' ? false : true;

    if (isFirstDrag) {
        if (isStandalone) {
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.width = '749px';
            popup.style.height = '600px';
            popup.style.transform = 'translate(-50%, -50%)';
        } else {
            popup.style.width = '500px';
            popup.style.height = '500px';
            const rightMargin = isMobileLike ? 0 : 15;
            popup.style.right = `${rightMargin}px`;
            popup.style.top = `${window.innerHeight - 510}px`;
            popup.style.transform = 'none';
        }
    }

    function startDrag(e) {
        isDragging = true;
        iframe.style.pointerEvents = 'none';
        popup.classList.add('dragging');

        if (isFirstDrag) {
            const rect = popup.getBoundingClientRect();
            popup.style.transform = 'none';
            popup.style.top = rect.top + 'px';
            popup.style.left = rect.left + 'px';
            isFirstDrag = false;
            localStorage.setItem('isFirstDrag', isFirstDrag);
        }

        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        initialLeft = parseInt(popup.style.left || 0, 10);
        initialTop = parseInt(popup.style.top || 0, 10);
        e.preventDefault();
    }

    function moveDrag(e) {
        if (isDragging) {
            const deltaX = (e.clientX || e.touches[0].clientX) - startX;
            const deltaY = (e.clientY || e.touches[0].clientY) - startY;
            popup.style.left = `${initialLeft + deltaX}px`;
            popup.style.top = `${initialTop + deltaY}px`;
        }
    }

    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            iframe.style.pointerEvents = 'auto';
            popup.classList.remove('dragging');
            savePopupState();
        }
    }

    let startWidth, startHeight, startResizeX, startResizeY;
    
    function startResize(e, resizeType = 'corner') {
        isResizing = true;
        currentResizeType = resizeType;
        iframe.style.pointerEvents = 'none';
        popup.classList.add('resizing');

        startWidth = parseInt(document.defaultView.getComputedStyle(popup).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(popup).height, 10);
        startResizeX = e.clientX || e.touches[0].clientX;
        startResizeY = e.clientY || e.touches[0].clientY;

        e.preventDefault();
        e.stopPropagation();
    }

    function doResize(e) {
        if (!isResizing) return;

        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (currentResizeType === 'corner' || currentResizeType === 'right') {
            newWidth = startWidth + (currentX - startResizeX);
        }
        if (currentResizeType === 'corner' || currentResizeType === 'bottom') {
            newHeight = startHeight + (currentY - startResizeY);
        }
        
        const minWidth = 200;
        const minHeight = 150;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        popup.style.width = Math.max(minWidth, Math.min(newWidth, maxWidth)) + 'px';
        popup.style.height = Math.max(minHeight, Math.min(newHeight, maxHeight)) + 'px';

        e.preventDefault();
        e.stopPropagation();
    }

    function stopResize() {
        if (isResizing) {
            isResizing = false;
            iframe.style.pointerEvents = 'auto';
            popup.classList.remove('resizing');
           savePopupState();
        }
    }
    
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', stopDrag);
    header.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', moveDrag);
    document.addEventListener('touchend', stopDrag);

    resizeHandle.addEventListener('mousedown', (e) => startResize(e, 'corner'));
    resizeHandle.addEventListener('touchstart', (e) => startResize(e, 'corner'));

    resizeHandleRight.addEventListener('mousedown', (e) => startResize(e, 'right'));
    resizeHandleRight.addEventListener('touchstart', (e) => startResize(e, 'right'));

    resizeHandleBottom.addEventListener('mousedown', (e) => startResize(e, 'bottom'));
    resizeHandleBottom.addEventListener('touchstart', (e) => startResize(e, 'bottom'));

    document.addEventListener('mousemove', doResize);
    document.addEventListener('touchmove', doResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchend', stopResize);

    document.addEventListener('mouseleave', () => {
        if (isDragging) stopDrag();
        if (isResizing) stopResize();
    });

    return { overlay, popup, closeBtn, iframe };
}

const { overlay, popup, closeBtn, iframe } = createPopup();

iframe.addEventListener('mouseover', () => {
    window.focus();
})

closeBtn.addEventListener('click', () => {
      event.stopPropagation();
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = '';
});

overlay.addEventListener('click', () => {
      event.stopPropagation();
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = '';
});

let dictionaryVisible = localStorage.getItem('dictionaryVisible') === null ? true : localStorage.getItem('dictionaryVisible') === 'true';

const toggleBtn = document.querySelector('.toggle-dict-btn img');
if (dictionaryVisible) {
  toggleBtn.src = "/assets/svg/comment.svg";
} else {
  toggleBtn.src = "/assets/svg/comment-slash.svg";
  clearParams();
}

toggleBtn.addEventListener('click', () => {
  dictionaryVisible = !dictionaryVisible;
  localStorage.setItem('dictionaryVisible', dictionaryVisible);
  if (dictionaryVisible) {
  toggleBtn.src = "/assets/svg/comment.svg";
        showBubbleNotification("Dictionary On");
} else {
  toggleBtn.src = "/assets/svg/comment-slash.svg";
        showBubbleNotification("Dictionary Off");
}
});

document.addEventListener("keydown", (event) => {
    if (event.altKey && event.code === "KeyA") {
      toggleBtn.click();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.altKey && event.code === "KeyB") {
        const modes = {
            standalone: isRussian ? "standaloneru" : "standalone",
            full: isRussian ? "dpd_ru_full" : "dpd_full",
            newWindow: isRussian ? "newwindowru" : "newwindow"
        };

        const currentDict = localStorage.getItem('selectedDict');
        let newDict, notificationText;
        localStorage.setItem('dictionaryVisible', 'true');

        if (isMobileLike) {
            newDict = currentDict === modes.full ? modes.standalone : modes.full;
            notificationText = isRussian ?
                `Словарь: ${newDict === modes.full ? "Полный" : "Встроенный"}` :
                `Dictionary: ${newDict === modes.full ? "Full" : "Standalone"}`;
        } else {
            newDict = currentDict === modes.newWindow ? modes.standalone : modes.newWindow;
            notificationText = isRussian ?
                `Словарь: ${newDict === modes.newWindow ? "В новом окне" : "Встроенный"}` :
                `Dictionary: ${newDict === modes.newWindow ? "New Window" : "Standalone"}`;
        }

        localStorage.setItem('selectedDict', newDict);
        showBubbleNotification(notificationText);

        setTimeout(() => {
            window.location.reload();
        }, 300);
    }
});

document.addEventListener('click', function(event) {
    const pliElement = event.target.closest('.pli-lang, [lang="pi"]');
    const selectedText = getSelectedText();

    if (pliElement && selectedText && isSelectionWithinElement(pliElement)) {
        if (event.target.closest('a, button, input, textarea, select')) return;
        handleWordLookup(selectedText, event);
    }
    else if (pliElement) {
        if (event.target.closest('a, button, input, textarea, select')) return;
        const clickedWord = getClickedWordWithHTML(event.target, event.clientX, event.clientY);
        if (clickedWord) handleWordLookup(clickedWord, event);
    }
});


function getClickedWordWithHTML(element, x, y) {
    let range;

    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
        const position = document.caretPositionFromPoint(x, y);
        if (position && position.offsetNode) {
            range = document.createRange();
            range.setStart(position.offsetNode, position.offset);
            range.setEnd(position.offsetNode, position.offset);
        }
    }

    if (!range) return null;

    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
        return null;
    }

    const textNodeRange = document.createRange();
    textNodeRange.selectNode(range.startContainer);
    const rect = textNodeRange.getBoundingClientRect();

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        return null;
    }

    const parentElement = element.closest('.pli-lang, .rus-lang, .eng-lang, [lang="pi"], [lang="en"], [lang="ru"]');
    if (!parentElement) {
        return null;
    }

    const fullText = parentElement.textContent;
    const globalOffset = calculateOffsetWithHTML(parentElement, range.startContainer, range.startOffset);
    if (globalOffset === -1) {
        return null;
    }

    const regex = /[^\s,;.–—!?()]+/g;
    let match;
    while ((match = regex.exec(fullText)) !== null) {
        if (match.index <= globalOffset && regex.lastIndex >= globalOffset) {
            return match[0];
        }
    }

    return null;
}

function calculateOffsetWithHTML(element, targetNode, targetOffset) {
    let offset = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = walker.nextNode())) {
        if (node === targetNode) {
            return offset + targetOffset;
        }
        offset += node.textContent.length;
    }
    return -1;
}

function getFullTextFromElement(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node.textContent);
    }

    return textNodes.join(' ').replace(/\s+/g, ' ').trim();
}

function cleanWord(word) {
    return word
        .replace(/^[\s'‘—.–।|…"“”]+/, ' ')
        .replace(/^[0-9]+/, ' ')
        .replace(/[\s'‘,—.—–।|"“…:;”]+$/, ' ')
        .replace(/[‘'’‘"“””]+/g, "'")
        .trim()
        .toLowerCase();
}

