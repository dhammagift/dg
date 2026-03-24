function parseSlug(slug) {
if (
    slug === 'bu-pm' ||
    slug === 'bi-pm' ||
    slug === 'pli-tv-bu-pm' ||
    slug === 'pli-tv-bi-pm' ||
    slug === 'bupm' ||
    slug === 'bipm'
  ) {
    // Проверяем, есть ли 'bi' в строке, чтобы понять пол (Bhikkhuni/Bhikkhu)
    const gender = slug.includes('bi') ? 'bi' : 'bu';
    return `pli-tv-${gender}-pm`;
  }

if (
  slug === 'bu-as' ||
  slug === 'bu-vb-as1-7' ||
  slug === 'pli-tv-bu-vb-as1-7' ||
  slug === 'bi-as' ||
  slug === 'bi-vb-as1-7' ||
  slug === 'pli-tv-bi-vb-as1-7'
) {
  const slugParts = slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/);
  const fixforbivb = slug.replace(/(\d+)-(\d+)/g, '');
  const bookWithoutNumber = fixforbivb.replace(/(\d+)/g, '');
  const fixforbivb2 = slug.replace(/-([a-z]+)\d+/g, '');
  const bookWithoutNumberAndRule = fixforbivb2.replace(/-\d+$/g, '');
  const firstNum = slugParts[6];
  
  return `${bookWithoutNumberAndRule}/${bookWithoutNumber}1-7`;
} else if ( slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/)) {
    const slugParts = slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/);
  const fixforbivb = slug.replace(/(\d+)-(\d+)/g, '');
  const bookWithoutNumber = fixforbivb.replace(/(\d+)/g, '');
  const fixforbivb2 = slug.replace(/-([a-z]+)\d+/g, '');
  const bookWithoutNumberAndRule = fixforbivb2.replace(/-\d+$/g, '');
  const firstNum = slugParts[6];
  return `${bookWithoutNumberAndRule}/${bookWithoutNumber}/${slug}`;
}
else if  (slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/)){
  const bookWithoutNumber = slug.replace(/(\d+|\.)/g, '');
  return `${bookWithoutNumber}/${slug}`;
}

const slugParts = slug.match(/^([a-z]+)(\d*)\.*(\d*)/);
const book = slugParts ? slugParts[1] : slug;
const firstNum = slugParts ? slugParts[2] : '';

  if (book === "dn" || book === "mn") {
    return `${book}/${slug}`;
  } else if (book === "sn" || book === "an") {
    return `${book}/${book}${firstNum}/${slug}`;
  } else if (book === "kp") {
    return `kn/kp/${slug}`;
  } else if (book === "dhp") {
    return `kn/dhp/${slug}`;
  } else if (book === "ud") {
    return `kn/ud/vagga${firstNum}/${slug}`;
  } else if (book === "iti") {
    return `kn/iti/vagga${findItiVagga(firstNum)}/${slug}`;
  } else if (book === "snp") {
    return `kn/snp/vagga${firstNum}/${slug}`;
  } else if (book === "thag" || book === "thig") {
    return `kn/${book}/${slug}`;
  } else if (book === "ja") {
    return `kn/ja/${slug}`;
  }
}

function findItiVagga(suttaNumber) {
  if (suttaNumber >= 1 && suttaNumber <= 10) {
    return "1";
  } else if (suttaNumber >= 11 && suttaNumber <= 20) {
    return "2";
  } else if (suttaNumber >= 21 && suttaNumber <= 27) {
    return "3";
  } else if (suttaNumber >= 28 && suttaNumber <= 37) {
    return "4";
  } else if (suttaNumber >= 38 && suttaNumber <= 49) {
    return "5";
  } else if (suttaNumber >= 50 && suttaNumber <= 59) {
    return "6";
  } else if (suttaNumber >= 60 && suttaNumber <= 69) {
    return "7";
  } else if (suttaNumber >= 70 && suttaNumber <= 79) {
    return "8";
  } else if (suttaNumber >= 80 && suttaNumber <= 89) {
    return "9";
  } else if (suttaNumber >= 90 && suttaNumber <= 99) {
    return "10";
  } else if (suttaNumber >= 100 && suttaNumber <= 112) {
    return "11";
  }
}

function getTopVisibleSegment() {
  const segments = document.querySelectorAll("#sutta span[id]"); 
  const targetLine = window.innerHeight * 0.3; 

  if (segments.length === 0) return null;

  for (let segment of segments) {
    const rect = segment.getBoundingClientRect();
    if (rect.bottom > targetLine) {
      return { element: segment, topOffset: rect.top };
    }
  }
  return null;
}

function runWithTransition(stateChangeCallback) {
  const suttaContainer = document.getElementById("sutta");
  
  const anchorData = getTopVisibleSegment();

  if (suttaContainer) suttaContainer.classList.add("text-hidden");

  setTimeout(() => {
      stateChangeCallback();

      if (anchorData && anchorData.element) {
           const currentRect = anchorData.element.getBoundingClientRect();
           const currentAbsoluteTop = window.scrollY + currentRect.top;
           const targetPos = currentAbsoluteTop - anchorData.topOffset;

           const html = document.documentElement;
           const savedBehavior = html.style.scrollBehavior;
           html.style.cssText += "scroll-behavior: auto !important;";
           
           window.scrollTo(0, targetPos);

           setTimeout(() => {
              html.style.scrollBehavior = savedBehavior;
              html.style.removeProperty('scroll-behavior');
           }, 50);
      }

      requestAnimationFrame(() => {
          if (suttaContainer) suttaContainer.classList.remove("text-hidden");
      });

  }, 150);
}

// Делаем функцию доступной глобально, чтобы словарь мог её вызывать!
window.syncSmartIcons = function() {
    const smartButtons = document.querySelectorAll('.smart-btn');
    smartButtons.forEach(btn => {
        const targetSelector = btn.getAttribute('data-target');
        if (!targetSelector) return;
        
        const originalEl = document.querySelector(targetSelector);
        const smartImg = btn.querySelector('img');

        if (originalEl && smartImg) {
            let sourceImg = originalEl.tagName === 'IMG' ? originalEl : originalEl.querySelector('img');
            if (sourceImg && sourceImg.src) {
                // Копируем только путь картинки. Никаких классов и жестких размеров!
                smartImg.src = sourceImg.src;
            }
        }
    });
};

document.addEventListener("DOMContentLoaded", function() {
    
    let lastScrollTop = 0;
    let gearTimer;
    let ignoreScroll = false; 
    
    const gearBtn = document.getElementById('smart-gear-btn');
    const smartPanel = document.getElementById('smart-panel');
    const headerHeight = 90; 

    function keepGearAlive() {
        gearBtn.classList.add('visible');
        clearTimeout(gearTimer);
        gearTimer = setTimeout(() => {
            if (!smartPanel.classList.contains('active')) {
                gearBtn.classList.remove('visible');
            }
        }, 2000);
    }

    window.addEventListener('scroll', function() {
        if (ignoreScroll) return; 

        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st < 0) return; 

        if (st < headerHeight) {
            gearBtn.classList.remove('visible');
            smartPanel.classList.remove('active');
            return;
        }

        if (st < lastScrollTop) {
            keepGearAlive(); 
        } else if (st > lastScrollTop) {
            if (!smartPanel.classList.contains('active')) {
                gearBtn.classList.remove('visible');
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    gearBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!smartPanel.classList.contains('active')) window.syncSmartIcons();
        
        smartPanel.classList.toggle('active');
        
        if (smartPanel.classList.contains('active')) {
            clearTimeout(gearTimer);
        } else {
            keepGearAlive();
        }
    });

    const proxyButtons = document.querySelectorAll('.smart-btn');
    
    proxyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSelector = this.getAttribute('data-target');
            const originalElement = document.querySelector(targetSelector);
            
            if (originalElement) {
                ignoreScroll = true;
                setTimeout(() => { ignoreScroll = false; }, 1000);

                if (originalElement.getAttribute('data-bs-toggle') === 'modal') {
                    
                    const modalId = originalElement.getAttribute('data-bs-target') || originalElement.getAttribute('href');
                    const modalEl = document.querySelector(modalId);
                    
                    if (modalEl && typeof bootstrap !== 'undefined') {
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.show(this);
                        
                        const onHidden = () => {
                            if (gearBtn) {
                                gearBtn.focus({ preventScroll: true });
                            }
                            modalEl.removeEventListener('hidden.bs.modal', onHidden);
                        };
                        modalEl.addEventListener('hidden.bs.modal', onHidden);

                    } else {
                        originalElement.click(); 
                    }
                } else {
                    // ПРОГРАММНЫЙ КЛИК ПО ГЛАВНОЙ КНОПКЕ
                    originalElement.click();
                }
                
                smartPanel.classList.remove('active');
                keepGearAlive();
                setTimeout(window.syncSmartIcons, 50); 
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!smartPanel.contains(e.target) && !gearBtn.contains(e.target)) {
            smartPanel.classList.remove('active');
            gearBtn.classList.remove('visible');
        }
    });
});



document.addEventListener('click', function(event) {
    // Ищем, был ли клик по элементу с нужным классом (или внутри него)
    const button = event.target.closest('.btn-language');

    // Если кликнули не по кнопке языка — просто игнорируем и выходим
    if (!button) return;

    event.preventDefault(); // Отменяем стандартный переход href="#"

    // Получаем язык из атрибута data-lang
    const targetLang = button.getAttribute('data-lang');
    if (!targetLang) return;

    const url = new URL(window.location.href);
    let newPath = '';

    // Определяем нужный путь
    if (targetLang === 'en') {
        newPath = '/read/';
    } else if (targetLang === 'ru') {
        newPath = '/r/';
    } else if (targetLang === 'th') {
        newPath = '/th/read/';
    } else {
        return;
    }

    // Собираем и применяем новый URL
    window.location.href = url.origin + newPath + url.search + url.hash;
});

// ==========================================
// UI ИЗБРАННОГО ДЛЯ ЧИТАЛКИ И СИНХРОНИЗАЦИЯ (SPA)
// ==========================================

// 1. Собираем данные о текущем месте в тексте
async function getCurrentReadingPosition() {
    const path = window.location.pathname;
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const q = urlParams.get('q');
    
    if (!q) return null;

    let exactId = null;
    const activeWord = document.querySelector('.active-word');
    if (activeWord) {
        exactId = activeWord.id || activeWord.closest('[id]')?.id;
    }

    if (!exactId) {
        const suttaContainer = document.getElementById('sutta');
        if (suttaContainer) {
            const elements = suttaContainer.querySelectorAll('[id]');
            const eyeLevel = 120;
            let minDistance = Infinity;
            for (const el of elements) {
                const distance = Math.abs(el.getBoundingClientRect().top - eyeLevel);
                if (distance < minDistance) {
                    minDistance = distance;
                    exactId = el.id;
                }
            }
        }
    }

    let title = q;
    try {
        if (typeof textinfoCache !== 'undefined' && textinfoCache) {
            const suttaName = textinfoCache[q.split(/\s+/)[0]]?.pi; 
            if (suttaName) title = `${q} ${suttaName}`;
        } else if (typeof loadTextData === 'function') {
            const textinfo = await loadTextData();
            const suttaName = textinfo[q.split(/\s+/)[0]]?.pi; 
            if (suttaName) title = `${q} ${suttaName}`;
        }
    } catch(e) {}

    return {
        slug: q,
        id: exactId || q,
        title: title,
        path: path,
        search: search,
        timestamp: Date.now()
    };
}

// 2. Обновляем визуальное состояние звездочек
function updateFavoriteIconState() {
    const favBtnImg = document.querySelector('.fav-icon-img');
    const smartPanelFavImg = document.querySelector('.smart-btn[data-target="#toggle-favorite"] img');
    
    if (!favBtnImg || typeof isFavorite !== 'function') return;

    const urlParams = new URLSearchParams(window.location.search);
    const currentQ = urlParams.get('q');
    
    const saved = isFavorite(currentQ); 
    const iconPath = saved ? '/assets/svg/star-solid.svg' : '/assets/svg/star.svg';
    
    favBtnImg.src = iconPath;
    if (smartPanelFavImg) smartPanelFavImg.src = iconPath;
}

// 3. Инициализация клика по звездочке
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(updateFavoriteIconState, 100);

    const favButton = document.getElementById('toggle-favorite');
    if (favButton) {
        favButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const positionData = await getCurrentReadingPosition(); 
            if (positionData && typeof toggleFavoriteGlobal === 'function') {
                toggleFavoriteGlobal(positionData); 
                updateFavoriteIconState(); 
                
                if (typeof window.syncSmartIcons === 'function') {
                    setTimeout(window.syncSmartIcons, 50);
                }
            }
        });
    }
});

// 4. Синхронизация при переходах Вперед/Назад или по стрелочкам внутри читалки
const originalPushState = history.pushState;
history.pushState = function() {
    originalPushState.apply(this, arguments);
    if (typeof updateFavoriteIconState === 'function') {
        setTimeout(updateFavoriteIconState, 50);
    }
};

window.addEventListener('popstate', () => {
    if (typeof updateFavoriteIconState === 'function') {
        setTimeout(updateFavoriteIconState, 50);
    }
});

// 5. Синхронизация при открытии смарт-панели (шестеренки)
document.addEventListener('click', (e) => {
    const isGearClick = e.target.closest('#smart-gear-btn') || e.target.closest('.smart-btn');
    if (isGearClick && typeof updateFavoriteIconState === 'function') {
        updateFavoriteIconState();
    }
});


// ==========================================
// ЛОКАЛЬНЫЙ ПЕРЕХВАТЧИК ДЛЯ ССЫЛКИ MEMO (ДЕЛЕГИРОВАНИЕ + УМНЫЙ ВЫБОР ЯЗЫКА)
// ==========================================
document.addEventListener('click', function(e) {
    const memoLink = e.target.closest('a[href="/memo/"], a[href="/ru/memo/"]');
    
    if (!memoLink) return;
    if (memoLink.id === 'memo-app-btn') return; 

    e.preventDefault();

    let textToPass = '';
    
    const activeWord = document.querySelector('.active-word');
    const highlighted = Array.from(document.querySelectorAll('.memorize-highlight'));
    const ttsActive = document.querySelector('.tts-active');

    let isWordInsideAB = false;
    if (activeWord && highlighted.length > 0) {
        isWordInsideAB = activeWord.closest('.memorize-highlight') !== null;
    }

    // 1. ПРИОРИТЕТ: Активное слово ВНЕ диапазона А-Б
    if (activeWord && !isWordInsideAB) {
        textToPass = activeWord.innerText || activeWord.textContent;
    } 
    // 2. ПРИОРИТЕТ: Весь диапазон А-Б
    else if (highlighted.length > 0) {
        const ttsMode = localStorage.getItem('tts_preferred_mode') || 'pi';
        let filtered = highlighted;

        if (ttsMode === 'pi') {
            filtered = highlighted.filter(el => el.classList.contains('pli-lang'));
        } else if (ttsMode === 'trn') {
            filtered = highlighted.filter(el => !el.classList.contains('pli-lang'));
        }
        
        if (filtered.length === 0) filtered = highlighted;
        textToPass = filtered.map(el => el.innerText || el.textContent).join('\n');
    } 
    // 3. ПРИОРИТЕТ: Текущая читаемая строка (TTS)
    else if (ttsActive) {
        textToPass = ttsActive.innerText || ttsActive.textContent;
    }
    // 4. ПРИОРИТЕТ: Ничего не выбрано — берем текст сутты с учетом видимости
    else {
        const suttaContainer = document.getElementById('sutta');
        if (suttaContainer) {
            // Проверяем, скрыт ли язык Пали через класс
            const isPaliHidden = suttaContainer.classList.contains('hide-pali');

            if (isPaliHidden) {
                // ПАЛИ СКРЫТ: Ищем спаны с переводом (русский или английский)
                const transElements = suttaContainer.querySelectorAll('.rus-lang, .eng-lang');
                if (transElements.length > 0) {
                    textToPass = Array.from(transElements).map(el => el.innerText || el.textContent).join('\n');
                } else {
                    textToPass = suttaContainer.innerText || suttaContainer.textContent;
                }
            } else {
                // ПАЛИ ВИДИМ (один или вместе с переводом): Отдаем приоритет Пали
                const paliElements = suttaContainer.querySelectorAll('.pli-lang');
                if (paliElements.length > 0) {
                    textToPass = Array.from(paliElements).map(el => el.innerText || el.textContent).join('\n');
                } else {
                    textToPass = suttaContainer.innerText || suttaContainer.textContent;
                }
            }
        }
    }
    
    textToPass = textToPass ? textToPass.trim() : '';

    const isRuPath = window.location.pathname.includes('/r/') || 
                     window.location.pathname.includes('/ml/') || 
                     window.location.pathname.includes('/ru/');
                     
    const baseUrl = isRuPath ? '/ru/memo/' : '/memo/';
    
    // Формируем URL с безопасной обрезкой (лимит ~1900 символов)
    if (textToPass) {
        const MAX_URL_LENGTH = 1900;
        let encodedText = encodeURIComponent(textToPass);
        
        if (encodedText.length > MAX_URL_LENGTH) {
            let safeRatio = MAX_URL_LENGTH / encodedText.length;
            let safeLength = Math.floor(textToPass.length * safeRatio) - 3;
            
            textToPass = textToPass.substring(0, safeLength) + '...';
            encodedText = encodeURIComponent(textToPass);
            
            while (encodedText.length > MAX_URL_LENGTH && textToPass.length > 0) {
                safeLength -= 10;
                textToPass = textToPass.substring(0, safeLength) + '...';
                encodedText = encodeURIComponent(textToPass);
            }
        }
        
        window.location.href = `${baseUrl}?text=${encodedText}`;
    } else {
        window.location.href = baseUrl;
    }
});

// ==========================================================================
// ГЕНЕРАЦИЯ ДОПОЛНИТЕЛЬНЫХ ССЫЛОК (DPR, BJT, Voice, SC, BB, TBW, Th.ru, Th.su)
// ==========================================================================

function getDprUrl(slug) {
    if (typeof dprLinksData === 'undefined') return null;
    let cleanSlug = slug.split('&')[0].toLowerCase();
    let dprItem = dprLinksData.find(item => item[0] === cleanSlug);
    if (dprItem && dprItem[1]) {
        return "https://www.digitalpalireader.online/_dprhtml/index.html?loc=" + dprItem[1];
    }
    return null;
}

function getBjtUrl(slug) {
    if (typeof bjtLinksData === 'undefined') return null;
    let cleanSlug = slug.split('&')[0].toLowerCase();
    let bjtItem = bjtLinksData.find(item => item[0] === cleanSlug);
    if (bjtItem && bjtItem[1]) {
        return "https://open.tipitaka.lk/latn/" + bjtItem[1];
    }
    return null;
}

function generateThirdPartyLinks(slug, slugReady, texttype, translator) {
    let scLink = "";

    // DPR
    let dprUrl = getDprUrl(slug);
    if (dprUrl) scLink += `<a target="_blank" title="Myanmar and Thai Editions at DPR" href="${dprUrl}">DPR</a>&nbsp;`;

    // BJT
    let bjtUrl = getBjtUrl(slug);
    if (bjtUrl) scLink += `<a target="_blank" title="Buddha Jayanthi (Sri Lanka Edition at Tipitaka.lk)" href="${bjtUrl}">BJT</a>&nbsp;`;

    // Voice
    scLink += `<a data-slug="${texttype}/${slugReady}" href="javascript:void(0)" title="Text-to-Speech (Alt+R)" class="voice-link">Voice</a>`;

    // SC

       scLink += `&nbsp;<a target="_blank" title='SuttaCentral.net' href="https://suttacentral.net/${slug}">SC</a>`;
        
  /*   if ((translator === 'sujato') || (translator === 'brahmali')) {
        scLink += `&nbsp;<a target="_blank" title='SuttaCentral.net' href="https://suttacentral.net/${slug}/en/${translator}">SC</a>`;  
    } else {   }
    */
    

    // BB, TBW, Th.ru, Th.su
    const isLocal = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1');

    if (typeof tbwLinksData !== 'undefined') {
        const hasTbw = tbwLinksData.find(item => Array.isArray(item) ? item[0] === slug : item === slug);
        if (hasTbw) {
            // Проверяем, не находимся ли мы уже в директории /b/
            const isBbPath = window.location.pathname.startsWith('/b/');
            
            // Выводим ссылку BB только если мы НЕ на странице BB
            if (!isBbPath) {
                scLink += `&nbsp;<a target="" title="BB and Other translations" href="/b/?q=${slug}">BB</a>`;
            }
            
            const bookMatch = slug.match(/^[a-z]+/); 
            const book = bookMatch ? bookMatch[0] : "";
            scLink += `&nbsp;<a target="_blank" title="TheBuddhasWords.net (Offline Copy)" href="/bw/${book}/${slug}.html">TBW</a>`;
        }
    }


    if (typeof thruLinksData !== 'undefined') {
        const ruItem = thruLinksData.find(item => item[0] === slug);
        if (ruItem) {
            scLink += `&nbsp;<a title="Theravada.ru (Offline Copy)" target="_blank" href="/theravada.ru/Teaching/Canon/Suttanta/Texts/${ruItem[1]}">Th.ru</a>`;
        }
    }

    if (isLocal) {
        if (typeof thsuLinksDataoffl !== 'undefined') {
            const suItem = thsuLinksDataoffl.find(item => item[0] === slug);
            if (suItem) scLink += `&nbsp;<a title="Theravada.su" target="_blank" href="/tipitaka.theravada.su/dn/${suItem[1]}">Th.su</a>`;
        }
    } else {
        if (typeof thsuLinksData !== 'undefined') {
            const suItem = thsuLinksData.find(item => item[0] === slug);
            if (suItem) scLink += `&nbsp;<a title="Theravada.su" target="_blank" href="https://tipitaka.theravada.su/${suItem[1]}">Th.su</a>`;
        }
    }

    return scLink;
}


// ==========================================================================
// ПОИСК И ОТРИСОВКА ПРЕДЫДУЩЕЙ И СЛЕДУЮЩЕЙ СУТТЫ
// ==========================================================================

function renderNavigation(slug, slugReady) {
    let params = new URLSearchParams(document.location.search);
    let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
    let sQuery = params.has("s") ? `&s=${finder}` : "";

    fetch("/assets/js/textinfo.js")
        .then(response => {
            if (!response.ok) throw new Error("Файл textinfo.js не найден!");
            return response.text();
        })
        .then(text => {
            let textInfo;
            try {
                textInfo = JSON.parse(text);
            } catch(e) {
                textInfo = new Function("return " + text.replace(/^(export default |const \\w+ = |let \\w+ = |var \\w+ = )/, '').replace(/;$/, ''))();
            }
            
            const keys = Object.keys(textInfo);
            let currentIndex = keys.indexOf(slug);
            if (currentIndex === -1) currentIndex = keys.indexOf(slugReady);
            if (currentIndex === -1) return;

            const next = document.getElementById("next");
            const next2 = document.getElementById("next2");
            const previous = document.getElementById("previous");
            const previous2 = document.getElementById("previous2");

            // --- Отрисовка СЛЕДУЮЩЕЙ ---
            if (currentIndex < keys.length - 1) {
                let nextSlug = keys[currentIndex + 1];
                let nextInfo = textInfo[nextSlug] || {};
                let nextName = (nextInfo.pi || nextInfo.ru || nextInfo.en || "").replace(/[0-9.-]/g, '').trim();
                let nextPrint = nextName === "" ? nextSlug.replace(/pli-tv-|b[ui]-vb-/g, "") : `${nextSlug.replace(/pli-tv-|b[ui]-vb-/g, "")} <span class="sutta-name"> ${nextName}</span>`;
                
                let htmlNext = `<a href="?q=${nextSlug}${sQuery}">${nextPrint.trim()}
                    <svg xmlns="http://www.w3.org/2000/svg" id="body_1" width="15" height="11">
                        <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)"><g><path d="M202.1 450C 196.03278 449.9987 190.56381 446.34256 188.24348 440.73654C 185.92316 435.13055 187.20845 428.67883 191.5 424.39L191.5 424.39L365.79 250.1L191.5 75.81C 185.81535 69.92433 185.89662 60.568687 191.68266 54.782654C 197.46869 48.996624 206.82434 48.91536 212.71 54.6L212.71 54.6L397.61 239.5C 403.4657 245.3575 403.4657 254.8525 397.61 260.71L397.61 260.71L212.70999 445.61C 209.89557 448.4226 206.07895 450.0018 202.1 450z" fill="#8f8f8f"/></g></g>
                    </svg></a>`;
                if (next) next.innerHTML = htmlNext;
                if (next2) next2.innerHTML = htmlNext.replace(/class="sutta-name"/g, '');
            } else {
                if (next) next.innerHTML = "";
                if (next2) next2.innerHTML = "";
            }

            // --- Отрисовка ПРЕДЫДУЩЕЙ ---
            if (currentIndex > 0) {
                let prevSlug = keys[currentIndex - 1];
                let prevInfo = textInfo[prevSlug] || {};
                let prevName = (prevInfo.pi || prevInfo.ru || prevInfo.en || "").replace(/[0-9.-]/g, '').trim();
                let prevPrint = prevName === "" ? prevSlug.replace(/pli-tv-|b[ui]-vb-/g, "") : `${prevSlug.replace(/pli-tv-|b[ui]-vb-/g, "")} <span class="sutta-name"> ${prevName}</span>`;
                
                let htmlPrev = `<a href="?q=${prevSlug}${sQuery}">
                    <svg xmlns="http://www.w3.org/2000/svg" id="body_1" width="15" height="11">
                        <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)"><g><path d="M353 450C 349.02106 450.0018 345.20444 448.4226 342.39 445.61L342.39 445.61L157.5 260.71C 151.64429 254.8525 151.64429 245.3575 157.5 239.5L157.5 239.5L342.39 54.6C 346.1788 50.809414 351.70206 49.328068 356.8792 50.713974C 362.05634 52.099876 366.10086 56.14248 367.4892 61.318974C 368.87753 66.49547 367.3988 72.01941 363.61002 75.81L363.61002 75.81L189.32 250.1L363.61 424.39C 367.90283 428.6801 369.18747 435.13425 366.8646 440.74118C 364.5417 446.34808 359.06903 450.00275 353 450z" fill="#8f8f8f"/></g></g>
                    </svg>${prevPrint.trim()}</a>`;
                if (previous) previous.innerHTML = htmlPrev;
                if (previous2) previous2.innerHTML = htmlPrev.replace(/class="sutta-name"/g, '');
            } else {
                if (previous) previous.innerHTML = "";
                if (previous2) previous2.innerHTML = "";
            }
        })
        .catch(err => console.error("Ошибка Пред/След:", err));
}

// ==========================================================================
// АСИНХРОННЫЙ ПОИСК ДОСТУПНОГО ПЕРЕВОДЧИКА (С ПОДДЕРЖКОЙ ИМЕН)
// ==========================================================================

window.siteTranslators = null; // Создаем глобальную переменную для имен

async function getTranslator(texttype, slugReady, lang = "ru") {
    let translatorsData = {}; 
    
    try {
        const trResp = await fetch("/assets/js/translators.json");
        if (trResp.ok) {
            translatorsData = await trResp.json();
            window.siteTranslators = translatorsData; // Сохраняем весь JSON для красивых имен
        }
    } catch (e) {
        console.log("Файл translators.json не найден.");
    }
    
    // Получаем список для нужного языка (или пустой объект)
    const currentListObj = translatorsData[lang] || {};
    
    // Object.keys берет ключи (ID) в том самом порядке, в котором они записаны в JSON!
    const translatorIds = Object.keys(currentListObj); 
    
    if (translatorIds.length === 0) return lang === "en" ? "sujato" : "o";
    
    // Формируем запросы
    const fetchPromises = translatorIds.map(tr => {
        let testPath = `/assets/texts/${lang}/${texttype}/${slugReady}_translation-${lang}-${tr}.json`;
        return fetch(testPath, { method: 'HEAD' }).then(response => {
            if (response.ok) return tr;
            throw new Error('Not found');
        });
    });

    try {
        let foundTranslator = await Promise.any(fetchPromises);
        return foundTranslator.trim();
    } catch (e) {
        return lang === "en" ? "sujato" : "o"; 
    }
}
