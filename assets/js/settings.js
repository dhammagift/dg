

// === ЗАГРУЗКА СЛОВАРЯ СТРОГО ПО КЛИКУ (ДЛЯ ВСЕХ) ===
(function() {
    window.isDictScriptLoaded = false;
    let isDictInitializing = false;

    const clickHandler = function(e) {
        // Если словарь выключен кнопкой, не вмешиваемся
        if (typeof dictionaryVisible !== 'undefined' && !dictionaryVisible) return;

        const isPaliWord = e.target.closest('.pli-lang, [lang="pi"]');
        const isDictBtn = e.target.closest('.toggle-dict-btn');
        const isMultiSelectBtn = e.target.closest('#toggle-multiselect');

        if (isPaliWord || isDictBtn || isMultiSelectBtn) {
            // Если скрипт уже загружен, пусть работает сам
            if (window.isDictScriptLoaded) return;

            e.preventDefault();
            e.stopPropagation();

            if (isDictInitializing) return;
            isDictInitializing = true;

            // 1. Создаем НАСТОЯЩИЙ визуальный лоадер
            let loadingEl = document.getElementById('main-dict-loader');
            if (!loadingEl) {
                loadingEl = document.createElement('div');
                loadingEl.id = 'main-dict-loader';
                loadingEl.className = 'dict-loading-indicator';
                const isRu = window.location.pathname.includes('/ru/') || window.location.pathname.includes('/r/');
                loadingEl.textContent = isRu ? 'Инициализация словаря...' : 'Initializing dictionary...';
                document.body.appendChild(loadingEl);
                setTimeout(() => loadingEl.classList.add('show'), 10);
            }

            // 2. Сохраняем точные координаты клика
            const clickX = e.clientX;
            const clickY = e.clientY;
            const target = e.target;

            // 3. Скачиваем ядро словаря
            const script = document.createElement('script');
            script.src = "/assets/js/paliLookup.js";
            
            script.onload = () => {
                window.isDictScriptLoaded = true;
                
                // Убираем стартовый лоадер
                if (loadingEl) {
                    loadingEl.classList.remove('show');
                    setTimeout(() => loadingEl.remove(), 300);
                }

                // Имитируем клик с правильными координатами, чтобы словарь открылся
                const clickEvent = new MouseEvent('click', {
                    view: window, bubbles: true, cancelable: true, clientX: clickX, clientY: clickY
                });
                target.dispatchEvent(clickEvent);
                isDictInitializing = false;
            };
            
            document.head.appendChild(script);
        }
    };

    document.addEventListener('click', clickHandler, true);
})();


function checkStorage(key) {
    if (localStorage.getItem(key) !== null) {
        alert(`Запись "${key}" есть в localStorage! Значение: ${localStorage.getItem(key)}`);
    } else {
      
     alert(`Записи "${key}" нет.`); 
    }
}

// Вызов проверки для ttsEnabled
//localStorage.setItem('ttsMode', 'true');
//checkStorage('ttsMode');
//checkStorage('removePunct');

// 1. Обработка URL-параметров при загрузке
(function () {
  try {
    const url = new URL(window.location.href);

    // --- TTS как читалка ---
    if (url.searchParams.has('tts')) {
      const raw = url.searchParams.get('tts');
      const val = raw ? raw.toLowerCase() : '';

      const allowedModes = ['pi', 'trn', 'pi-trn', 'trn-pi'];

      // tts=true | 1 | yes | on
      if (['', '1', 'true', 'yes', 'on'].includes(val)) {
        localStorage.setItem('ttsMode', 'true');
      }

      // tts=pi | trn | pi-trn | trn-pi
      if (allowedModes.includes(val)) {
        localStorage.setItem('ttsMode', 'true');
        localStorage.setItem('tts_preferred_mode', val);
      }

      // tts=false | 0 | off
      if (['false', '0', 'off'].includes(val)) {
        localStorage.removeItem('ttsMode');
      }
    }

    // --- Скорость ---
    if (url.searchParams.has('ttsRate')) {
      const rate = parseFloat(url.searchParams.get('ttsRate'));
      if (!isNaN(rate) && rate > 0) {
        localStorage.setItem('tts_preferred_rate', rate.toString());
      }
    }

  } catch (e) {
    console.error('Ошибка обработки URL:', e);
  }
})();

const MAX_HISTORY = 8400;
let textinfoCache = null; // Кеш для данных сутт

async function addToSearchHistory() {
    try {
        const url = new URL(window.location.href);
        const qParam = url.searchParams.get("q");
        if (!qParam) return;

        let key = processSearchQuery(qParam);

        // Основное сохранение (оригинальный ключ)
        await saveToHistory(key, url);

        // Попытка улучшить ключ (асинхронно)
        if (/\d/.test(key) && !key.includes(' ')) {
            try {
                const enhancedKey = await tryEnhanceKey(key);
                if (enhancedKey !== key) {
                    await saveToHistory(enhancedKey, url);
                }
            } catch (e) {
                console.debug("Не удалось добавить название:", e);
            }
        }
    } catch (e) {
        console.error("Ошибка сохранения истории:", e);
    }
}

function processSearchQuery(query) {
    return query.toLowerCase()
        .replace(/\s*https?:\/\/\S+/gi, '')
        .replace(/\s*www\.\S+/gi, '')
        .replace(/^"|"$/g, '')
        .trim();
}

async function tryEnhanceKey(key) {
    const textinfo = await loadTextData();
    const baseKey = key.split(/\s+/)[0];
    const suttaName = textinfo[baseKey]?.pi;
    return suttaName ? `${baseKey} ${suttaName}` : key;
}

async function loadTextData() {
    if (textinfoCache) return textinfoCache;
    
    // 1. Проверяем глобальную переменную
    if (typeof textinfo !== 'undefined') {
        textinfoCache = textinfo;
        return textinfo;
    }

    // 2. Пробуем загрузить как модуль
    try {
        const module = await import('/assets/js/textinfo.js?update=' + Date.now());
        if (module.textinfo) {
            textinfoCache = module.textinfo;
            return module.textinfo;
        }
    } catch {}

    // 3. Пробуем загрузить как сырой текст
    try {
        const response = await fetch('/assets/js/textinfo.js?update=' + Date.now());
        const text = await response.text();
        
        // Пытаемся разобрать разными способами
        const data = parseTextInfo(text);
        if (data) {
            textinfoCache = data;
            return data;
        }
    } catch (e) {
        console.error("Ошибка загрузки textinfo:", e);
    }

    return {};
}

function parseTextInfo(text) {
    try {
        // Вариант 1: Чистый JSON
        return JSON.parse(text);
    } catch {
        try {
            // Вариант 2: JS-объект с присваиванием
            const match = text.match(/var\s+\w+\s*=\s*({[\s\S]+?});/);
            if (match) return JSON.parse(match[1]);

            // Вариант 3: Самовыполняющаяся функция
            return (new Function(text + '; return textinfo || window.textinfo;'))();
        } catch {
            return null;
        }
    }
}

async function saveToHistory(key, url) {
    const value = url.pathname + url.search + url.hash;
    const timestamp = new Date().toISOString();
    
    let history = JSON.parse(localStorage.getItem("localSearchHistory")) || [];
    
    // Определяем базовый ключ для сравнения
    const baseKey = /\d/.test(key) ? key.split(/\s+/)[0] : key;
    
    // Удаляем все старые записи с таким же базовым ключом
    history = history.filter(([k]) => {
        if (k === key) return false; // Точное совпадение
        if (!/\d/.test(key)) return true; // Для не-сутт оставляем другие
        
        const kBase = k.split(/\s+/)[0];
        return kBase !== baseKey;
    });
    
    // Добавляем новую запись в начало
    history.unshift([key, value, timestamp]);
    
    // Ограничиваем историю
    localStorage.setItem("localSearchHistory", 
        JSON.stringify(history.slice(0, MAX_HISTORY)));
}
//установка фокуса в инпуте по нажатию / 
document.addEventListener('keydown', function(event) {
    // Проверяем именно символ / (код 191 или Slash)
    if (event.key === '/' || event.code === 'Slash') {
        // Проверяем, активно ли модальное окно через глобальный window (защита от ReferenceError)
        const isModalActive = window.quickModalIsOpen && document.getElementById('quickSearchInput');

        
        // Если модальное окно активно, устанавливаем фокус в его поле ввода
        if (isModalActive) {
            const modalInput = document.getElementById('quickSearchInput');
            event.preventDefault();
            modalInput.focus();
            modalInput.setSelectionRange(modalInput.value.length, modalInput.value.length);
            return; // Прерываем выполнение, так как модальное окно активно
        }
        
        // Ищем все возможные инпуты (оригинальная логика)
        const inputs = document.querySelectorAll(
            '#paliauto[type="search"], #paliauto[type="text"], .dtsb-value.dtsb-input'
        );
        
        // Если нет ни одного подходящего инпута - выходим
        if (inputs.length === 0) return;
        
        // Берем первый подходящий инпут
        const input = inputs[0];
        
        // Предотвращаем действие по умолчанию только если нашли инпут
        event.preventDefault();
        
        // Фокусируемся и перемещаем курсор в конец
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
}); 

// Отключаем перехват / когда фокус уже в инпуте
const handleInputKeydown = (event) => {
    if (event.key === '/' || event.code === 'Slash') {
        event.stopPropagation();
    }
};

// Вешаем обработчики на все существующие и будущие инпуты
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', handleInputKeydown);
});

// Наблюдатель для динамически добавляемых инпутов
new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'INPUT') {
                node.addEventListener('keydown', handleInputKeydown);
            } else if (node.querySelectorAll) {
                node.querySelectorAll('input').forEach(input => {
                    input.addEventListener('keydown', handleInputKeydown);
                });
            }
        });
    });
}).observe(document.body, { childList: true, subtree: true });

//конец фокуса в инпуте по нажатию / 


function loadModal(modalId, modalFile) {
    fetch(modalFile)
        .then(response => response.text())
        .then(html => {
            document.getElementById("modalContainer").innerHTML = html;
            let modal = new bootstrap.Modal(document.getElementById(modalId));
           //modal.show();
        })
        .catch(error => console.error("Ошибка загрузки модального окна:", error));
}

//loadModal("paliLookupInfo", "/assets/common/modalsSC.html");




// Функция для обновления ссылок
// --- DYNAMIC LINKS UPDATE SYSTEM (Merged) ---

function updateDemoLinks() {
  // 1. Определяем приоритетный источник запроса (q)
  let q = '';
  
  // А. Инпут (наивысший приоритет)
  const input = document.getElementById('paliauto');
  if (input && input.value && input.value.trim() !== "") {
    q = input.value.trim();
  } 
  // Б. Активное слово (если инпут пуст)
  else {
    const activeWord = document.querySelector('.active-word');
    if (activeWord) {
       // Берем ID самого элемента или его родителя
       q = activeWord.id || activeWord.closest('[id]')?.id || '';
    }
  }
  
  // В. URL параметр (если всё остальное пусто)
  if (!q) {
     q = new URLSearchParams(window.location.search).get('q') || '';
  }

  // 2. Определяем базовый URL для "Standard" режима (логика языков из старой функции)
  let standardBaseUrl;
  const currentPath = window.location.href;
  const storedLang = localStorage.siteLanguage;

  if (currentPath.includes('/ru/') || currentPath.includes('/r/') || storedLang === 'ru') {
    standardBaseUrl = window.location.origin + "/r/";
  } else if (currentPath.includes('/th') || storedLang === 'th') {
    standardBaseUrl = window.location.origin + "/th/read/";
  } else {
    standardBaseUrl = window.location.origin + "/read/";
  }

  // 3. Карта ссылок
  const linksMap = {
    stDemo: standardBaseUrl, 
    mlDemo: window.location.origin + "/ml/",
    memDemo: window.location.origin + "/memorize/",
    dDemo: window.location.origin + "/d/",
    thDemo: window.location.origin + "/th/read/",
    rvDemo: window.location.origin + "/rev/",
    frDemo: window.location.origin + "/frev/",
    mlthDemo: window.location.origin + "/mlth/"
  };

  // 4. Обновляем href элементов
  const hash = window.location.hash || ''; // Сохраняем якорь, если есть

  Object.keys(linksMap).forEach(id => {
    const linkEl = document.getElementById(id);
    if (!linkEl) return;

    // Формируем новый URL
    // Логика: Базовый путь + ?q=ЗАПРОС + #hash
    let newUrl = linksMap[id];
    
    // Если есть запрос, добавляем его. Если нет — ссылка ведет в корень раздела.
    if (q) {
        newUrl += `?q=${q}`;
    }
    
    // Добавляем хэш в конец
    linkEl.href = newUrl + hash;
  });
}

// --- Триггеры (Events) ---

// 1. При загрузке страницы
document.addEventListener("DOMContentLoaded", updateDemoLinks);

// 2. При вводе в поиск
const searchInput = document.getElementById('paliauto');
if (searchInput) {
    searchInput.addEventListener('input', updateDemoLinks);
    searchInput.addEventListener('focus', updateDemoLinks);
}

// 3. При наведении мыши (Hover) на кнопки меню
document.body.addEventListener('mouseenter', (e) => {
    // Реагируем, если навели на ссылку с ID, содержащим "Demo"
    if (e.target.closest && e.target.closest('[id*="Demo"]')) {
        updateDemoLinks();
    }
}, true);

// 4. Перед правым кликом (чтобы скопировать актуальную ссылку)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('a')) {
        updateDemoLinks();
    }
}, true);

  //end 




//sett8ngs management

document.addEventListener("DOMContentLoaded", function() {

  const scriptSelect = document.getElementById('script-select');
  const dictSelect = document.getElementById('dict-select');

  const applyButton = document.getElementById('apply-button');
  const resetButton = document.getElementById('reset-button');
  const settingsButton = document.getElementById('settingsButton');
  const helpButton = document.getElementById('helpMessage');
  const goButton = document.querySelector('.go-button'); // Кнопка "Go"



function shouldIgnoreKeyEvent() {
  const activeElement = document.activeElement;
  return activeElement && activeElement.id === "paliauto" && activeElement.tagName === "INPUT";
}



window.addEventListener("keydown", (event) => {
    if (event.key === 'Escape' || event.code === 'Escape') {

// --- B. Подсказка о голосах (Voice Hint) ---
      const voiceHint = document.getElementById('active-voice-hint');
      if (voiceHint) {
        const closeHintBtn = document.getElementById('closeVoiceHintBtn');
        if (closeHintBtn) closeHintBtn.click();
        event.preventDefault();
        return;
      }

      // --- C. TTS Плеер и Выделения ---
      const dropdown = document.querySelector('.voice-dropdown');
      const isDropdownActive = dropdown && dropdown.classList.contains('active');
      const isHighlightActive = document.querySelector('.active-word');

      // Если что-то играет, открыто меню или выделен текст
      if (ttsState.speaking || ttsState.paused || isDropdownActive || isHighlightActive) {
        event.preventDefault();
        
        stopPlayback();        // Остановить звук, сбросить state
        removeAllHighlights(); // Убрать желтое выделение и мини-кнопку
        
        // Закрываем само меню плеера визуально
        if (dropdown) dropdown.classList.remove('active');
        return;
      }
	  
    // --- 0. Close PWA banner ---
    const pwaBanner = document.getElementById('pwa-banner');
    if (pwaBanner && pwaBanner.offsetParent !== null) { // проверка, что видим
        const closePwaBtn = document.getElementById('closePwaBanner');
        if (closePwaBtn) {
            closePwaBtn.click();
            event.preventDefault();
            return;
        }
    }

      // --- 1. Close the hint popup ---
        const hintElement = document.querySelector('.hint');
        if (hintElement && hintElement.offsetParent !== null) { // проверка, что видимо
            const closeHintButton = document.getElementById('closeHintBtn');
            if (closeHintButton) {
                closeHintButton.click();
                event.preventDefault();
                return;
            }
        }
        
        // --- 1. Close the fdgPopup from openFdg.js ---
        // We look for the fdg-popup element and check if it's visible.
        const fdgPopupElement = document.querySelector('.fdg-popup');
        if (fdgPopupElement && fdgPopupElement.style.display === 'block') {
            // If the popup is open, we simulate a click on its close button.
            const fdgCloseButton = fdgPopupElement.querySelector('.fdg-close-btn');
            if (fdgCloseButton) {
                fdgCloseButton.click();
                event.preventDefault(); // Prevent any other action.
                return; // Stop further execution.
            }
        }

        // --- 2. Close the main dictionary popup from paliLookup.js ---
        // We look for the main lookup popup element and check its visibility.
        const paliLookupPopupElement = document.querySelector('.popup');
        if (paliLookupPopupElement && paliLookupPopupElement.style.display === 'block') {
            // If the popup is open, we simulate a click on its close button.
            const paliLookupCloseButton = paliLookupPopupElement.querySelector('.close-btn');
            if (paliLookupCloseButton) {
                paliLookupCloseButton.click();
                event.preventDefault();
                return;
            }
        }

// --- 3. Close the Quick Modal (Cattāri Ariyasaccāni) ---
if (window.quickModalIsOpen) {
    if (typeof window.toggleQuickModal === 'function') {
        window.toggleQuickModal(); 
        event.preventDefault();
        return;
    }
}

        const closeBtnElements = document.querySelectorAll('.btn-close');
        if (closeBtnElements.length > 0) {
            closeBtnElements.forEach(button => {
                if (button.offsetParent !== null) {
                    button.click();
                }
            });
            event.preventDefault();
            return; 
        }
    }
 }, true);

    // Добавляем обработчик сочетания клавиш Alt + Space (физическая клавиша)
document.addEventListener("keydown", (event) => {
    if ((event.altKey && event.code === "Space") || (event.altKey && event.code === "KeyZ")) {
        const languageButton = document.getElementById("language-button");
      if (languageButton) {
       event.preventDefault();
       // Имитируем клик по кнопке
      languageButton.click();
      }
    }
 
    // Обработчик для Alt+P в любой раскладке
  // Проверяем Alt и физическое расположение клавиши P (код KeyP)
  if (event.altKey && event.code === "KeyP") {
    event.preventDefault();
    toggleQuickModal();
  }

//Ctrl + ArrowRight navigate to next sutta
  if (shouldIgnoreKeyEvent()) return;

  if (event.ctrlKey && event.code === "ArrowRight") {
    const nextDiv = document.getElementById("next");
    if (nextDiv) {
      const link = nextDiv.querySelector("a");
      if (link) {
        history.pushState(null, "", link.href);
        location.href = link.href;
      }
    }
  } else if (event.ctrlKey && event.code === "ArrowLeft") {
    const prevDiv = document.getElementById("previous");
    if (prevDiv) {
      const link = prevDiv.querySelector("a");
      if (link) {
        history.pushState(null, "", link.href);
        location.href = link.href;
      }
    }
  }

    // === УНИВЕРСАЛЬНОЕ ДОБАВЛЕНИЕ В ИЗБРАННОЕ (Alt+Shift+P или Alt+F) ===
    if ((event.altKey && event.code === "KeyF" && !event.shiftKey)) { // Alt+F без шифта
        
        // Игнорируем, если фокус в поле ввода (чтобы не мешать печатать)
        const activeTag = document.activeElement.tagName;
        if (['INPUT', 'TEXTAREA'].includes(activeTag) || document.activeElement.isContentEditable) {
            return;
        }

        event.preventDefault();

        // 1. Попытка для Memo (эмулируем клик по кнопке в memo)
        const memoFavBtn = document.getElementById('toggle-memo-favorite');
        if (memoFavBtn) {
            memoFavBtn.click();
            return;
        }

        // 2. Попытка для Читалки (эмулируем клик по скрытой/видимой кнопке в read.php)
        const readerFavBtn = document.getElementById('toggle-favorite');
        if (readerFavBtn) {
            readerFavBtn.click(); 
            return;
        }

        // 3. Фолбэк: Страница поиска (если кнопок нет, сохраняем поисковый запрос)
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');

        if (q && typeof toggleFavoriteGlobal === 'function') {
            const searchData = {
                slug: q,
                id: q,
                title: "" + q, // Лупа покажет, что это поисковый запрос 🔎
                path: window.location.pathname,
                search: window.location.search,
                timestamp: Date.now()
            };
            
            toggleFavoriteGlobal(searchData);
        }
    }



//open Dict.Dhamma.Gift New Window
  if (event.altKey && event.code === "KeyN") {
    const inputEl = document.getElementById('paliauto');
    const inputVal = inputEl?.value.trim() || '';

    const urlParams = new URLSearchParams(window.location.search);
    const paramQ = urlParams.get('q')?.trim() || '';
    const paramS = urlParams.get('s')?.trim() || '';

    let q = '';

    if (inputVal === paramQ) {
      q = paramS || paramQ;
    } else if (inputVal) {
      q = inputVal;
    } else if (paramS) {
      q = paramS;
    } else {
      q = paramQ;
    }

    const path = window.location.pathname.toLowerCase();
    let langPrefix = '';

    if (path.includes('/ru/') || path.includes('/r/')) {
      langPrefix = '/ru';
    } else if (path.includes('/ml/')) {
      langPrefix = '/ml';
    }

    const baseUrl = 'https://dict.dhamma.gift' + langPrefix;

    const url = q
      ? baseUrl + '/?silent&source=pwa&q=' + encodeURIComponent(q)
      : baseUrl + '/';

    openDictionaryWindow(url);
  }

//Help + Settings + History
  if (event.altKey && event.code === "KeyH") {
    // Имитируем клик по кнопке
    helpButton.click();
  }

// Alt + R — Voice / TTS (если доступно)
// --- Обработчик горячих клавиш (Alt + R) ---
    // Проверяем комбинацию Alt + R
    if (event.altKey && event.code === "KeyR") {
      
      // 1. Пропускаем, если фокус в поле ввода
      const activeTag = document.activeElement.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag) || document.activeElement.isContentEditable) {
        return;
      }

      event.preventDefault();

      // 2. Сценарий: Плеер уже активен (играет или на паузе)
      // Мы просто нажимаем программно на кнопку Play/Pause основного плеера.
      // Это сработает как Play -> Pause или Pause -> Resume.
      if (ttsState.speaking) {
         const mainPlayBtn = document.querySelector('.play-main-button');
         if (mainPlayBtn) {
             mainPlayBtn.click();
         }
         return;
      }

      // 3. Сценарий: Плеер выключен, но выбран конкретный сегмент
      // Ищем миникнопку и запускаем её
      const miniPlayBtn = document.querySelector('.dynamic-tts-btn');
      if (miniPlayBtn) {
        miniPlayBtn.click();
        return;
      }

      // 4. Сценарий: Плеер выключен, ничего не выбрано
      // Запускаем через главную ссылку (откроет плеер и начнет сначала)
      const voiceLink = document.querySelector('.voice-link');
      if (voiceLink) {
        voiceLink.click();
      }
    }


    if (event.altKey && event.code === "KeyS") {
      // Имитируем клик по кнопке
      settingsButton.click();
    }
  
//alt + G history toggle
 function handleHistoryToggle() {
  const currentUrl = window.location.pathname;
  let historyPhpPath, historyHtmlPath;

  // Если URL содержит языковой префикс (/ru/, /r/, /ml/)
  if (currentUrl.match(/\/(ru|r|ml)\//)) {
    const langPrefix = currentUrl.split('/')[1] + '/';
    historyPhpPath = `/${langPrefix}history.php`;
    historyHtmlPath = `/${langPrefix}assets/common/history.html`;
  } 
  // Если URL содержит /assets/common/ (но без языкового префикса)
  else if (currentUrl.includes('/assets/common/')) {
    historyPhpPath = '/history.php';  // Переход в корень
    historyHtmlPath = '/assets/common/history.html';
  }
  // Все остальные случаи (корень сайта или другие пути)
  else {
    historyPhpPath = '/history.php';
    historyHtmlPath = '/assets/common/history.html';
  }

  // Переключение между history.php и history.html
  if (currentUrl.endsWith('history.php')) {
    window.location.href = historyHtmlPath;
  } 
  else if (currentUrl.endsWith('history.html')) {
    window.location.href = historyPhpPath;
  }
  // Если не на странице истории, идём на history.php
  else {
    window.location.href = historyPhpPath;
  }
}

  if (event.altKey && event.code === "KeyG") {
    event.preventDefault(); // отключаем стандартное действие
    handleHistoryToggle();
  }
 
 //Language Alt + L
  if (event.altKey && event.code === "KeyL") {
    event.preventDefault(); // Предотвращаем стандартное поведение

    const scriptOptions = ['ISOPali', 'devanagari', 'thai']; // Доступные скрипты
    const url = new URL(window.location.href);
    let currentScript = url.searchParams.get('script') || 'ISOPali';

    // Получаем следующий скрипт в списке
    let nextIndex = (scriptOptions.indexOf(currentScript) + 1) % scriptOptions.length;
    let nextScript = scriptOptions[nextIndex];
 
    localStorage.removeItem('selectedScript');

    // Обновляем URL
    if (nextScript === 'ISOPali') {
      url.searchParams.delete('script'); // Удаляем параметр для ISOPali
    } else {
      url.searchParams.set('script', nextScript);
    }

    window.location.href = url.toString(); // Перезагружаем страницу
  }
 
  // Для отладки: смотри, что нажимается
//  console.log('Pressed:', event.code);
 if (
    event.altKey && // любой Alt
    (event.code === 'Period' || 
     event.code === 'Comma' || 
     event.code === 'KeyM')
  ) {
    event.preventDefault();

    const currentValue = localStorage.getItem("removePunct") === "true";
    localStorage.setItem("removePunct", currentValue ? "false" : "true");

    location.reload();
  }


  if (event.altKey && (event.code === 'KeyQ')) {
    event.preventDefault();

openDictionaries(event);
  }

    // Если нажат Alt
    if (event.altKey) {
        
        // Alt + Minus (на основной клавиатуре или на NumPad)
        if (event.code === "Minus" || event.code === "NumpadSubtract") {
            event.preventDefault(); // Отменяем стандартное действие браузера
            const btnDec = document.getElementById('fontDec');
            if (btnDec) btnDec.click(); // Имитируем клик по кнопке "-"
        }

        // Alt + Plus (Клавиша "равно" считается плюсом, или NumPad Plus)
        // Мы используем "Equal", чтобы не требовать нажатия Shift
        if (event.code === "Equal" || event.code === "NumpadAdd") {
            event.preventDefault();
            const btnInc = document.getElementById('fontInc');
            if (btnInc) btnInc.click(); // Имитируем клик по кнопке "+"
        }
    }
});
 
  
  
  
  //setup dictionary 
  
// Загрузка сохраненного значения из localStorage
const savedDict = localStorage.getItem('selectedDict');

if (savedDict && [...dictSelect.options].some(opt => opt.value === savedDict)) {
  dictSelect.value = savedDict; // Устанавливаем только если значение есть в списке
} else {
  
if (window.location.href.includes('/r/') || window.location.href.includes('/ml/') || window.location.href.includes('/ru/')) {
dictSelect.value = 'standaloneru'; // Значение по умолчанию standaloneru
//  localStorage.setItem('selectedDict', 'dpdCompactRu');
} else if (window.location.href.includes('/d/')) {
dictSelect.value = 'dpdFull'; // Значение по умолчанию standaloneru
//  localStorage.setItem('selectedDict', 'dpdCompactRu');
} else {
  dictSelect.value = 'standalone'; // Значение по умолчанию
//  localStorage.setItem('selectedDict', 'standalone');
}
}

  
    // Загрузка сохраненного значения из localStorage
  const savedScript = localStorage.getItem('selectedScript');

    // Установка сохраненного значения в select при загрузке страницы
if (savedScript) {
  scriptSelect.value = savedScript;
} else {
  scriptSelect.value = 'ISOPali'; // Значение по умолчанию, если ничего не сохранено
localStorage.setItem('selectedScript', 'ISOPali');
}



if (applyButton) {
  applyButton.addEventListener('click', function() {
    // Сохраняем все выбранные настройки
    localStorage.setItem('selectedScript', scriptSelect.value);
    localStorage.setItem('selectedDict', dictSelect.value);
    
    // Сохраняем состояние чекбокса removePunct (если он есть на странице)
    const removePunctCheckbox = document.querySelector('.setting-checkbox[data-key="removePunct"]');
    if (removePunctCheckbox) {
      localStorage.setItem('removePunct', removePunctCheckbox.checked);
    }
    
    localStorage.setItem("firstVisitShowSettingsClosed", "true");
    
saveExactScrollPosition(); 
  
    // Перезагружаем страницу для применения всех изменений
    location.reload();
  });
}

  // Функция для применения сохраненного значения
function applySavedDict(dict) {
  localStorage.setItem('selectedDict', dict);
    localStorage.setItem('dictionaryVisible', 'true');
      location.reload();  // Перезагрузка, если изменился словарь
}

  // Функция для применения сохраненного значения
  function applySavedScript(script) {
    const url = new URL(window.location.href);

    if (script === 'ISOPali') {
      localStorage.setItem('selectedScript', 'ISOPali');
      url.searchParams.delete('script');
    } else {
      url.searchParams.set('script', script.toLowerCase());
    }

    // Перезагрузка страницы с новым URL
    if (window.location.href !== url.toString()) {
      window.location.href = url.toString();
    }
  }

if (resetButton) {
  resetButton.addEventListener('click', function () {
    // Определяем язык только для того, чтобы показать диалог на нужном языке
    const path = window.location.pathname;
    const language =
      localStorage.getItem('siteLanguage') ||
      (/^\/(ru|r|ml)\//.test(path) ? 'ru' : 'en');

    const messages = {
      ru: {
        confirm: 'Вы уверены, что хотите сбросить ВСЕ настройки?',
        success: 'Настройки сброшены'
      },
      en: {
        confirm: 'Are you sure you want to reset ALL settings?',
        success: 'Reset successful'
      }
    };

    // Показываем подтверждение
    if (!confirm(messages[language].confirm)) return;

    const notificationText = messages[language].success;

    // Проверяем, существует ли внешняя функция очистки
    if (typeof clearFdgPopupParams === 'function') {
      clearFdgPopupParams();
    }

    // Тотальная очистка ВСЕГО хранилища
    localStorage.clear();
    sessionStorage.clear();

    // Минимально необходимые параметры для работы интерфейса после перезагрузки
    localStorage.setItem('variantVisibility', 'hidden');

    // Удаляем параметр 'script' из URL
    const url = new URL(window.location.href);
    url.searchParams.delete('script');

    // Показ уведомления
    if (typeof showBubbleNotification === 'function') {
      showBubbleNotification(notificationText);
    } else {
      alert(notificationText); // fallback
    }

    // Перезагрузка страницы
    setTimeout(() => {
      if (url.toString() !== window.location.href) {
        window.location.href = url.toString();
      } else {
        window.location.reload();
      }
    }, 1000);
  });
}

// Получаем все радиокнопки
var readerRadios = document.querySelectorAll('input[name="reader"]');

// Устанавливаем обработчики событий при изменении состояния радиокнопок
readerRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
        if (this.checked) {
            // Устанавливаем значение в localStorage
            localStorage.setItem("defaultReader", this.value);
        }
    });
});

// Проверяем значение в localStorage при загрузке страницы и устанавливаем состояние радиокнопок
var savedReader = localStorage.getItem("defaultReader");
if (savedReader) {
    document.querySelector('input[name="reader"][value="' + savedReader + '"]').checked = true;
}

// Сохраняем текущие значения параметров
const initialBaseUrl = getBaseUrl();
const initialDefaultReader = localStorage.defaultReader;

// Функция для получения текущего baseUrl
function getBaseUrl() {
    let baseUrl;
    if (window.location.href.includes('/ru') || (localStorage.siteLanguage && localStorage.siteLanguage === 'ru')) {
        baseUrl = window.location.origin + "/r/";
    } else {
        baseUrl = window.location.origin + "/read/";
    }

    if (localStorage.defaultReader === 'ml') {
        baseUrl = window.location.origin + "/ml/";
    } else if (localStorage.defaultReader === 'rv') {
        baseUrl = window.location.origin + "/rev/";
    } else if (localStorage.defaultReader === 'd') {
        baseUrl = window.location.origin + "/d/";
    } else if (localStorage.defaultReader === 'mem') {
        baseUrl = window.location.origin + "/memorize/";
    } else if (localStorage.defaultReader === 'fr') {
        baseUrl = window.location.origin + "/frev/";
    }

    return baseUrl;
}

// Функция для обновления URL
function updateUrl() {
    const currentBaseUrl = getBaseUrl();
    const url = new URL(window.location.href);

    // Извлекаем путь из currentBaseUrl
    const newPath = new URL(currentBaseUrl).pathname;

    // Обновляем путь в текущем URL
    url.pathname = newPath;

    // Сохраняем новый URL
    window.location.href = url.toString();
}
const initialRemovePunct = localStorage.getItem("removePunct");
// Функция для проверки изменений и обновления URL
function checkAndUpdateUrl() {
    const currentBaseUrl = getBaseUrl();
    const currentDefaultReader = localStorage.defaultReader;
    const currentRemovePunct = localStorage.getItem("removePunct"); // Новая проверка

    // Если параметры изменились, обновляем URL
    if (currentBaseUrl !== initialBaseUrl || 
        currentDefaultReader !== initialDefaultReader || 
        currentRemovePunct !== initialRemovePunct) { // Добавлено
        updateUrl();
    }
}

// end of default reader part

// open current url in demo mode

// Функция для извлечения параметров из URL
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = value;
    }
  });
  return params;
}




//remove punctuation checkbox
    document.querySelectorAll(".setting-checkbox").forEach(checkbox => {
        const key = checkbox.dataset.key; // Берём ключ из data-key
        checkbox.checked = localStorage.getItem(key) === "true";

        checkbox.addEventListener("change", () => {
            localStorage.setItem(key, checkbox.checked);
        });
    });



//end of DOMContentLoaded

});


//Горячие кнопки от 1 до Х

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.code === "Digit1") { // Проверяем, что нажаты Alt и 7
    event.preventDefault();

    let currentUrl = window.location.href; // Получаем текущий URL
    let urlWithoutParams = currentUrl.split('?')[0]; // Удаляем всё после ?

    let newUrl;
    let defaultLanguage = localStorage.getItem('siteLanguage') || "en"; // Получаем язык из localStorage или используем "en" по умолчанию

    let defaultLanguageLinkPart;
        if (defaultLanguage === "ru") {
          defaultLanguageLinkPart = "/r/";
        } else if (defaultLanguage === "th") {
          defaultLanguageLinkPart = "/th/read/";
        } else {
          defaultLanguageLinkPart = "/read/";
        }


    // Проверяем, содержит ли URL /r/
    if (urlWithoutParams.endsWith("/r/")) {
      newUrl = urlWithoutParams.replace("/r/", "/read/"); // Меняем на /read/
    } else if (urlWithoutParams.endsWith("/th/read/")) {
      newUrl = urlWithoutParams.replace("/th/read/", defaultLanguageLinkPart); // Меняем на /read/
    } else if (urlWithoutParams.endsWith("/read/")) {
      newUrl = urlWithoutParams.replace("/read/", "/r/"); // Меняем на /r/
    } 
    else {
      // Если URL не содержит ни /r/, ни /read/, выбираем начальный вариант
      if (localStorage.siteLanguage && localStorage.siteLanguage === 'ru') {
        newUrl = window.location.origin + "/r/";
      } else {
        newUrl = window.location.origin + "/read/";
      }
    }


    // Добавляем параметры обратно, если они были
let params = currentUrl.split('?')[1] || '';
newUrl = params ? `${newUrl}?${params}` : `${newUrl}?q=sn56.11`;

    if (newUrl !== currentUrl) { // Проверяем, изменился ли URL
      history.pushState(null, "", newUrl); // Добавляем запись в историю
      location.href = newUrl; // Принудительно переходим по новому URL
      location.reload();
    }
  }
  
});


// Объект, связывающий цифры от 1 до 6 с id ссылок
const demoLinks = {
 // 1: "stDemo", // Alt + 1
  2: "mlDemo", // Alt + 2
  3: "memDemo",  // Alt + 3
  4: "dDemo", // Alt + 4
  5: "thDemo", // Alt + 5
  6: "rvDemo",  // Alt + 6
  7: "frDemo",  // Alt + 7
  8: "mlthDemo"  // Alt + 8
};

// Обработчик события нажатия клавиш
document.addEventListener("keydown", (event) => {
  // Проверяем, что нажата клавиша Alt и одна из цифр от 1 до 6
  if (event.altKey && event.code.startsWith("Digit")) {
              event.preventDefault();

// Извлекаем цифру из event.code (например, "Digit1" -> 1)
const digit = parseInt(event.code.replace("Digit", ""), 10);

// Проверяем, существует ли такая цифра в нашем объекте demoLinks
if (demoLinks.hasOwnProperty(digit)) {
    event.preventDefault(); // Предотвращаем системное действие только если ключ совпал
    
	updateDemoLinks(); // <--- Вызываем обновленную функцию перед кликом
	
    const linkId = demoLinks[digit];
    const linkElement = document.getElementById(linkId);

    if (linkElement) {
        linkElement.click();
    } else {
        console.error(`Ссылка с id "${linkId}" не найдена!`);
    }
}
			  
/*			  
    // Проверяем, что цифра находится в диапазоне от 1 до 7
    if (digit >= 2 && digit <= 7) {
      // Получаем id ссылки из объекта demoLinks
      const linkId = demoLinks[digit];

      // Находим ссылку по id
      const linkElement = document.getElementById(linkId);

      // Если ссылка найдена, имитируем клик
      if (linkElement) {
        linkElement.click(); // Программный клик по ссылке
      } else {
        console.error(`Ссылка с id "${linkId}" не найдена!`);
      }
    }
	
	*/
  }
});


document.addEventListener("keydown", (event) => {
  if (event.altKey && event.code === "Digit8") { // Проверяем, что нажаты Alt и 7
            event.preventDefault();
    let currentUrl = window.location.href; // Получаем текущий URL

    // Шаг 1: Удаляем всё после первого / (оставляем базовую часть)
    let base = currentUrl.split('/')[0] + '//' + currentUrl.split('/')[2];

    // Шаг 2: Удаляем всё перед ? (оставляем параметры, если они есть)
    let params = currentUrl.split('?')[1] || '';

    // Шаг 3: Собираем новый URL
    let newUrl = `${base}/mlth/${params ? `?${params}` : ''}`;

    if (newUrl !== currentUrl) { // Проверяем, изменился ли URL
      history.pushState(null, "", newUrl); // Добавляем запись в историю
      location.href = newUrl; // Принудительно переходим по новому URL
    }
  }
});


document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.code === 'Digit3') {
    event.preventDefault();

    const currentUrl = window.location.href;
    const currentParams = window.location.search; // включает всё после '?', включая '?'

    let targetUrl;

    if (currentUrl.includes('/ru/') || currentUrl.includes('/r/') || currentUrl.includes('/ml/')) {
      targetUrl = 'https://dict.dhamma.gift/ru/';
    } else {
      targetUrl = 'https://dict.dhamma.gift/';
    }

    // Добавляем параметры, если есть
    if (currentParams) {
      targetUrl += currentParams;
    }

    window.location.href = targetUrl;
  }
});

document.addEventListener("keydown", function (event) {
  const isCtrlPressed = event.ctrlKey || event.metaKey;
  const currentPath = window.location.pathname;
  const baseUrl = window.location.origin;

  const key = "preferredLanguage";
  const savedLang = localStorage.getItem(key);
  const isRuCurrent = currentPath.includes("/ru/") || currentPath.includes("/r/");

  // Функция: получить URL для заданного языка и страницы
  function makeUrl(lang, isHomepage) {
    if (isHomepage) {
      return lang === "ru" ? `${baseUrl}/ru/` : `${baseUrl}/`;
    } else {
      return lang === "ru" ? `${baseUrl}/ru/read.php` : `${baseUrl}/read.php`;
    }
  }

  // Функция: определить, нужно ли переключать язык или использовать сохранённый
  function determineTargetUrl(isHomepage) {
    const isCurrentTarget =
      (isHomepage && (currentPath === "/" || currentPath === "/ru/")) ||
      (!isHomepage && (currentPath === "/read.php" || currentPath === "/ru/read.php"));

    let nextLang;

    if (isCurrentTarget) {
      // Уже на целевой странице — делаем toggle
      nextLang = isRuCurrent ? "en" : "ru";
      localStorage.setItem(key, nextLang);
    } else {
      // С других страниц — просто используем сохранённое предпочтение
      nextLang = savedLang || (isRuCurrent ? "ru" : "en");
      if (!savedLang) localStorage.setItem(key, nextLang); // сохранить при первом запуске
    }

    return makeUrl(nextLang, isHomepage);
  }

  // === Ctrl + 1: Переход на домашнюю страницу ===
  if (isCtrlPressed && event.key === "1") {
    event.preventDefault();
    const targetUrl = determineTargetUrl(true);
    window.location.href = targetUrl;
  }

  // === Ctrl + 2: Переход на read.php ===
  if (isCtrlPressed && event.key === "2") {
    event.preventDefault();
    const targetUrl = determineTargetUrl(false);
    window.location.href = targetUrl;
  }
  
  // === Ctrl + 3: клик по "Читать Главами" ===
if (isCtrlPressed && event.key === "3") {
    event.preventDefault();

    const input = document.getElementById('paliauto');
    const q = input?.value.trim().toLowerCase().replace(/ṁ/g, 'ṃ') || '';

    // Если q пустое, ничего не делаем
    if (!q) return;

    // Корень для ?q=
    const match = q.match(/^([a-z]+[0-9]+)/i);
    const base = match ? match[1] : q;

    // Находим кнопку (она может быть /ru/r.php или /r.php)
    const chapterBtn = document.querySelector('#chapter-button a');
    if (!chapterBtn) return;

    const href = chapterBtn.getAttribute("href");

    // Формируем итоговый URL
    const finalUrl =
        `${href}?q=${encodeURIComponent(base)}#${encodeURIComponent(q)}`;

    window.location.href = finalUrl;
}

  
  
});

document.addEventListener("keydown", function (event) {
//  console.log("event.key:", event.key);
//  console.log("event.code:", event.code);
//  console.log("Ctrl:", event.ctrlKey, "Shift:", event.shiftKey);

  if (event.ctrlKey && event.shiftKey && event.code === "Digit1") {
    event.preventDefault();
 //   console.log("Сочетание Ctrl+Shift+1 поймано!");

    const url = new URL(window.location.href);
    let path = url.pathname;

   // console.log("Текущий путь:", path);

    let newUrlStr;

    if (path.startsWith("/ru/")) {
      // Убираем /ru/
      path = path.replace("/ru/", "/");
      newUrlStr = url.origin + path + url.search + url.hash;
      console.log("Убираем /ru/, новый путь:", newUrlStr);
    } else {
      // Добавляем /ru/
      path = "/ru" + path;
      newUrlStr = url.origin + path + url.search + url.hash;
      console.log("Добавляем /ru/, новый путь:", newUrlStr);
    }

    console.log("Переходим по:", newUrlStr);
    window.location.href = newUrlStr;
  }
});



/*
const openQuickModalBtn = document.createElement("button");
openQuickModalBtn.innerText = "≡"; // или иконку по желанию
openQuickModalBtn.setAttribute("aria-label", "Открыть окно Cattāri Ariyasaccāni");
openQuickModalBtn.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10001;
  background-color: #859900;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
`;

openQuickModalBtn.addEventListener("click", toggleQuickModal);
document.body.appendChild(openQuickModalBtn);

if (!document.getElementById("openQuickModalBtn")) {
  const openQuickModalBtn = document.createElement("button");
  openQuickModalBtn.addEventListener("click", toggleQuickModal);
}

<button onclick="toggleQuickModal()" aria-label="Открыть Cattāri Ariyasaccāni" style="
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10001;
  background-color: #859900;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
">
  ≡
</button>
*/


// === ФУНКЦИЯ "УМНОГО" СОХРАНЕНИЯ ПОЗИЦИИ ===
function saveExactScrollPosition() {
    const suttaContainer = document.getElementById('sutta');
    if (!suttaContainer) return;

    // Ищем все сегменты с ID (абзацы, строфы)
    const elements = suttaContainer.querySelectorAll('[id]');
    if (elements.length === 0) return;

    // "Линия глаз" - точка, куда обычно смотрит пользователь (например, 120px от верха)
    // Это позволяет игнорировать шапку сайта
    const eyeLevel = 120;
    
    let bestElement = null;
    let minDistance = Infinity;

    for (const el of elements) {
        const rect = el.getBoundingClientRect();
        
        // Нам нужен элемент, который либо прямо на линии глаз, либо чуть выше/ниже
        const distance = Math.abs(rect.top - eyeLevel);

        if (distance < minDistance) {
            minDistance = distance;
            bestElement = el;
        }
    }

    if (bestElement) {
        // ЗАПОМИНАЕМ:
        // 1. ID элемента
        // 2. offset: Где именно он находился относительно верха окна (например, "на 125-м пикселе")
        const data = {
            id: bestElement.id,
            offset: bestElement.getBoundingClientRect().top
        };
        localStorage.setItem('exactScrollAnchor', JSON.stringify(data));
    }
}

    // === ЛОГИКА МАСШТАБИРОВАНИЯ (С ЛОКАЛИЗАЦИЕЙ) ===
    
    const btnDec = document.getElementById('fontDec');
    const btnInc = document.getElementById('fontInc');
    const valDisplay = document.getElementById('fontVal');

    // Текущий масштаб из памяти (или 100%)
    let currentScale = parseInt(localStorage.getItem('uiScale')) || 100;
    
    // Обновляем цифру в меню настроек при открытии
    if (valDisplay) valDisplay.textContent = currentScale + '%';

    // Функция изменения масштаба
    function changeScale(delta) {
        const newScale = currentScale + delta;

        // Ограничение от 70% до 150%
        if (newScale >= 70 && newScale <= 150) {
            currentScale = newScale;

            // 1. Применяем размер
            document.documentElement.style.fontSize = currentScale + '%';
            localStorage.setItem('uiScale', currentScale);
            
            // 2. Обновляем цифру в модальном окне
            if (valDisplay) valDisplay.textContent = currentScale + '%';

            // 3. Определяем язык для уведомления
            const path = window.location.pathname;
            // Если путь содержит /ru/, /r/ или /ml/ — показываем по-русски
            const isRu = path.includes('/ru/') || 
                         path.includes('/r/') || 
                         path.includes('/ml/');
            
            // Выбираем текст
            const label = isRu ? 'Размер' : 'Font size';

            // 4. Показываем Bubble-уведомление
            if (typeof showBubbleNotification === 'function') {
                showBubbleNotification(`${label}: ${currentScale}%`);
            }
        }
    }

    // Обработчики кликов (для меню настроек)
    // Если вы вызываете .click() из своего блока горячих клавиш, это тоже сработает
    if (btnDec && btnInc) {
        btnDec.addEventListener('click', () => changeScale(-5)); // Уменьшить
        btnInc.addEventListener('click', () => changeScale(5));  // Увеличить
    }



// ==========================================
// УМНЫЙ РОУТИНГ И ПАРСИНГ ЗАПРОСОВ (Dhamma.gift)
// ==========================================

let textInfoData = null;

// 1. Асинхронная подгрузка карты диапазонов
fetch('/assets/js/textinfo.js')
    .then(res => res.ok ? res.json() : null)
    .then(data => textInfoData = data)
    .catch(err => console.error("Ошибка загрузки textinfo.js", err));

// 2. Транслитерация
function cyrillicToLatin(str) {
    const ru = {
        "А":"a", "Б":"b", "В":"v", "Г":"g", "Д":"d", "Е":"e", "Ё":"yo", "Ж":"zh", "З":"z", "И":"i",
        "Й":"j", "К":"k", "Л":"l", "М":"m", "Н":"n", "О":"o", "П":"p", "Р":"r", "С":"s", "Т":"t",
        "У":"u", "Ф":"f", "Х":"kh", "Ц":"ts", "Ч":"ch", "Ш":"sh", "Щ":"sch", "Ъ":"", "Ы":"y", "Ь":"",
        "Э":"e", "Ю":"yu", "Я":"ya", "а":"a", "б":"b", "в":"v", "г":"g", "д":"d", "е":"e", "ё":"yo",
        "ж":"zh", "з":"z", "и":"i", "й":"j", "к":"k", "л":"l", "м":"m", "н":"n", "о":"o", "п":"p",
        "р":"r", "с":"s", "т":"t", "у":"u", "ф":"f", "х":"kh", "ц":"ts", "ч":"ch", "ш":"sh", "щ":"sch",
        "ъ":"", "ы":"y", "ь":"", "э":"e", "ю":"yu", "я":"ya", " ": " ", ".":".", ",":".", "/":"-",
        ":":"", ";":"", "—":"", "–":"-"
    };
    return str.split('').map(char => ru[char] || char).join('');
}

// 3. Универсальная Нормализация (опечатки, пробелы, префиксы)
function normalizeQuery(rawQuery) {
    let q = rawQuery.trim();
    if (!q) return "";

    q = cyrillicToLatin(q).toLowerCase();
    q = q.replace(/,/g, '.').replace(/\s*\.\s*/g, '.');

    if (/^(bu|bi)\s+[a-z]/.test(q)) {
         q = q.replace(/^(bu|bi)\s+([a-z]+)/, '$1-$2'); 
    }

    q = q.replace(/([a-z])\s+(\d)/g, '$1$2');

    const match = q.match(/^([a-z]+)(\d.*)$/);
    if (match) {
        let letters = match[1];
        let rest = match[2];

        const keepAsIs = ['iti', 'snp', 'ud', 'thig', 'thag', 'dhp', 'pj', 'ss', 'ay', 'np', 'pc', 'pd', 'sk', 'as', 'bu', 'bi'];

        if (keepAsIs.includes(letters) || letters.startsWith('bu-') || letters.startsWith('bi-')) {
             q = letters + rest;
        } else {
            const first = letters[0];
            if (first === 'm') q = 'mn' + rest;
            else if (first === 'd') q = 'dn' + rest;
            else if (first === 'a') q = 'an' + rest;
            else if (first === 's') q = 'sn' + rest;
        }
    }

    q = q.replace(/(\d+)\s+(\d+)/g, '$1.$2');
    return q;
}

// 4. Поиск диапазона
function findRangeForKey(normalizedQ) {
    if (!textInfoData) return null;
    if (textInfoData[normalizedQ]) return { type: 'exact', key: normalizedQ }; 

    const match = normalizedQ.match(/^([a-z]+)(\d+)\.(\d+)$/);
    if (match) {
        const prefix = match[1];
        const major = match[2];
        const minor = parseInt(match[3], 10);
        const searchPrefix = `${prefix}${major}.`; 
        
        for (const key in textInfoData) {
            if (key.startsWith(searchPrefix)) {
                const r = key.match(/(\d+)-(\d+)$/);
                if (r && minor >= parseInt(r[1]) && minor <= parseInt(r[2])) {
                    return { type: 'range', key: key };
                }
            }
        }
    }
    return null;
}

// 5. Единый слушатель кликов (MenuRead и home-button)
document.addEventListener('click', function(e) {
    // Ищем клик по любой из целевых кнопок
    const targetLink = e.target.closest('#MenuRead, #home-button a');
    
    if (targetLink) {
        e.preventDefault();
        
        const searchInput = document.getElementById('paliauto');
        let rawQuery = searchInput ? searchInput.value : '';
        
        // Фоллбэк на URL-параметр q
        if (!rawQuery.trim()) {
            const urlParams = new URLSearchParams(window.location.search);
            rawQuery = urlParams.get('q') || '';
        }
        
        const q = normalizeQuery(rawQuery);
        let baseUrl = targetLink.getAttribute('href').split(/[?#]/)[0];
        
        if (!q) {
            window.location.href = baseUrl;
            return;
        }

        // Роутинг специфичных страниц (Виная)
        if (/^(bu|pm|bpm|bupm)$/.test(q)) { window.location.href = '/pm.php?expand=true'; return; }
        if (/^(bi|bipm)$/.test(q)) { window.location.href = '/bipm.php?expand=true'; return; }
        if (/^(pj|ss|ay|np|pc|pd|sk|as)/.test(q)) {
             let clean = q.replace('bu-', '').replace('bi-', '');
             let suffix = q.startsWith('bi-') ? 'CollapseBi' : 'CollapseBu';
             window.location.href = baseUrl + '#' + clean + suffix;
             return;
        }

        // Роутинг сутт с проверкой на диапазоны
        if (/\d/.test(q) && !q.includes('-')) {
            const result = findRangeForKey(q);
            const anchor = (result && result.type === 'range') ? result.key : q;
            window.location.href = baseUrl + '#' + anchor;
        } else {
             window.location.href = baseUrl + '#' + q;
        }
    }
});

// 6. Слушатель отправки формы поиска (для корректной подстановки диапазонов в URL)
document.addEventListener('submit', function(e) {
    if (e.target.id === 'searchForm') {
        const searchInput = document.getElementById('paliauto');
        if (!searchInput) return;

        const q = normalizeQuery(searchInput.value);
        if (!q) return;

        if (/\d/.test(q) && !q.includes('-')) {
            const result = findRangeForKey(q);
            if (result && result.type === 'range') {
                e.preventDefault();
                // Делаем редирект с правильным параметром q и якорем
                window.location.href = '?q=' + result.key + '#' + q;
            }
        }
    }
});



// ==========================================
// ГЛОБАЛЬНОЕ ИЗБРАННОЕ (FAVORITES API)
// ==========================================
const FAV_STORAGE_KEY = 'dg_favorites';

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY)) || []; } 
    catch (e) { return []; }
}

function isFavorite(slug) {
    const favs = getFavorites();
    return favs.some(fav => fav.slug === slug);
}

function toggleFavoriteGlobal(itemData) {
    if (!itemData || !itemData.slug) return false;

    // --- ОПРЕДЕЛЯЕМ ЯЗЫК ДЛЯ УВЕДОМЛЕНИЙ ---
    const currentPath = window.location.pathname;
    const isRu = currentPath.includes('/ru/') || currentPath.includes('/r/') || currentPath.includes('/ml/');
    
    const textRemoved = isRu ? "Удалено из избранного" : "Removed from favorites";
    const textSaved = isRu ? "Сохранено в избранное" : "Saved to favorites";

    let favs = getFavorites();
    const existingIndex = favs.findIndex(fav => fav.slug === itemData.slug);
    let isAdded = false;

    if (existingIndex !== -1) {
        favs.splice(existingIndex, 1); // Удаляем
        if (typeof showBubbleNotification === 'function') showBubbleNotification(textRemoved);
    } else {
    //    if (favs.length >= 84) favs.pop(); // Лимит 84
        itemData.timestamp = Date.now();
        favs.unshift(itemData); // Добавляем
        isAdded = true;
        if (typeof showBubbleNotification === 'function') showBubbleNotification(textSaved);
    }

    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
    return isAdded;
}

// АВТО-СОХРАНЕНИЕ В ИСТОРИЮ ПРИ ОТКРЫТИИ ССЫЛКИ
document.addEventListener("DOMContentLoaded", () => {
    if (typeof addToSearchHistory === 'function') addToSearchHistory();
});


// === ЛЕНИВАЯ ЗАГРУЗКА QUICK MODAL (СТРОГО ПО КЛИКУ / ХОТКЕЮ) ===
(function() {
    window.isQuickModalScriptLoaded = false;
    let isQuickModalInitializing = false;

    // Создаем функцию-прокси (заглушку)
    window.toggleQuickModal = function() {
        // Если скрипт уже загружен, выходим (хотя заглушка перезапишется)
        if (window.isQuickModalScriptLoaded) return;

        if (isQuickModalInitializing) return;
        isQuickModalInitializing = true;

        // 1. Показываем визуальный лоадер (берем стили от словаря)
        let loadingEl = document.getElementById('main-dict-loader');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'main-dict-loader';
            loadingEl.className = 'dict-loading-indicator';
            const isRu = window.location.pathname.includes('/ru/') || window.location.pathname.includes('/r/');
            loadingEl.textContent = isRu ? 'Загрузка меню...' : 'Loading menu...';
            document.body.appendChild(loadingEl);
            setTimeout(() => loadingEl.classList.add('show'), 10);
        }

        // 2. Скачиваем скрипт модального окна
        const script = document.createElement('script');
        script.src = "/assets/js/quickModal.js"; // Проверьте правильность пути!
        
        script.onload = () => {
            window.isQuickModalScriptLoaded = true;
            isQuickModalInitializing = false;
            
            // Убираем лоадер
            if (loadingEl) {
                loadingEl.classList.remove('show');
                setTimeout(() => loadingEl.remove(), 300);
            }

            // Вызываем РЕАЛЬНУЮ функцию, которая только что перезаписала эту заглушку
            if (typeof window.toggleQuickModal === 'function') {
                window.toggleQuickModal();
            }
        };
        
        script.onerror = () => {
            isQuickModalInitializing = false;
            console.error("Ошибка загрузки quickModal.js");
            if (loadingEl) loadingEl.remove();
        };
        
        document.head.appendChild(script);
    };

    // Авто-открытие через URL параметры (вызовет заглушку и загрузит скрипт)
    document.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('sacca') === 'true' || urlParams.get('action') === 'true') {
            setTimeout(() => {
                if (typeof window.toggleQuickModal === 'function') {
                    window.toggleQuickModal();
                }
            }, 300);
        }
    });
})();
