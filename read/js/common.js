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
// ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ДЛЯ ССЫЛКИ MEMO (УМНЫЙ ЗАХВАТ ПО ВИДИМОСТИ)
// ==========================================
document.addEventListener('click', function(e) {
    const memoLink = e.target.closest('.memo-button');
    if (!memoLink) return;

    e.preventDefault();

    const suttaContainer = document.getElementById('sutta') || document;
    const activeWord = document.querySelector('.active-word');
    const highlighted = Array.from(document.querySelectorAll('.memorize-highlight'));
    const ttsActive = document.querySelector('.tts-active');

    const isWordInsideAB = activeWord && activeWord.closest('.memorize-highlight') !== null;
    let textToPass = '';
    const MAX_CHARS = 1200; 

    // =======================================================
    // ПРИОРИТЕТ 1: ЦИКЛ А-Б (Только его диапазон)
    // =======================================================
    if (highlighted.length > 0 && (!activeWord || isWordInsideAB)) {
        // Проверяем, скрыт ли Пали визуально
        let isPaliHidden = suttaContainer.classList ? suttaContainer.classList.contains('hide-pali') : false;
        
        // Отдаем приоритет Пали, если он видим и есть в выделении
        let targetClass = !isPaliHidden && highlighted.some(el => el.classList.contains('pli-lang')) 
                          ? 'pli-lang' 
                          : (highlighted.some(el => el.classList.contains('rus-lang')) ? 'rus-lang' : 'eng-lang');

        // Оставляем только нужный язык (или общие блоки без языковых классов)
        let abElements = highlighted.filter(el => el.classList.contains(targetClass) || !el.className.includes('-lang'));
        
        let currentLength = 0;
        let textArr = [];
        for (let el of abElements) {
            let text = (el.innerText || el.textContent).trim();
            if (text) {
                if (currentLength + text.length > MAX_CHARS) {
                    textArr.push(text.substring(0, Math.max(0, MAX_CHARS - currentLength - 3)) + '...');
                    break;
                }
                textArr.push(text);
                currentLength += text.length + 1;
            }
        }
        textToPass = textArr.join('\n');
    } 
    // =======================================================
    // ПРИОРИТЕТ 2: ОТ ТОЧКИ ФОКУСА (Active / TTS) ИЛИ ЭКРАНА -> ВНИЗ до 1900 симв
    // =======================================================
    else {
        let startNode = activeWord && !isWordInsideAB ? activeWord : ttsActive;
        let targetSelector = '';

        // 2.1. Определяем язык по стартовой ноде (если кликнули в слово / плеер читает строку)
        if (startNode) {
            if (startNode.classList.contains('pli-lang')) targetSelector = '.pli-lang';
            else if (startNode.classList.contains('rus-lang')) targetSelector = '.rus-lang';
            else if (startNode.classList.contains('eng-lang')) targetSelector = '.eng-lang';
            else if (startNode.classList.contains('tha-lang')) targetSelector = '.tha-lang';
        }
        
        // 2.2. Если ничего не активно, определяем по ВИДИМОСТИ на экране (Пали по умолчанию)
        if (!targetSelector) {
            const isSutta = suttaContainer.id === 'sutta';
            if (!isSutta || !suttaContainer.classList.contains('hide-pali')) targetSelector = '.pli-lang';
            else if (!suttaContainer.classList.contains('hide-russian')) targetSelector = '.rus-lang';
            else if (!suttaContainer.classList.contains('hide-english')) targetSelector = '.eng-lang';
            else targetSelector = '.tha-lang';
        }

        // Собираем элементы только ОДНОГО выбранного языка
        let allValidElements = Array.from(suttaContainer.querySelectorAll(targetSelector));
        
        // Фолбэк для обычных статей без -lang классов
        if (allValidElements.length === 0) {
            allValidElements = Array.from(suttaContainer.querySelectorAll('p, h1, h2, h3, h4, li, blockquote'));
        }

        // Отсекаем невидимое и элементы интерфейса
        allValidElements = allValidElements.filter(el => 
            el.offsetParent !== null && !el.closest('.tts-ignore, nav, footer, .input-group')
        );

        let startIndex = -1;

        // Если есть активная нода — находим ее индекс в массиве
        if (startNode) {
            const segmentId = startNode.id || startNode.closest('[id]')?.id;
            if (segmentId) {
                startIndex = allValidElements.findIndex(el => el.id === segmentId || el.closest(`[id="${segmentId}"]`));
            }
            if (startIndex === -1) {
                startIndex = allValidElements.findIndex(el => el === startNode || el.contains(startNode));
            }
        }

        // Если ничего не активно — ищем первый абзац, который виден прямо сейчас от верха экрана (0px)
        if (startIndex === -1) {
            startIndex = allValidElements.findIndex(el => {
                const rect = el.getBoundingClientRect();
                return rect.bottom > 0; // Строго от верхнего края экрана, без отступов
            });
        }

        // Если нашли точку старта — пылесосим текст вниз до лимита
        if (startIndex !== -1) {
            let currentLength = 0;
            let textArr = [];
            for (let i = startIndex; i < allValidElements.length; i++) {
                let text = (allValidElements[i].innerText || allValidElements[i].textContent).trim();
                if (text) {
                    if (currentLength + text.length > MAX_CHARS) {
                        let remainingSpace = Math.max(0, MAX_CHARS - currentLength - 3);
                        if (remainingSpace > 0) textArr.push(text.substring(0, remainingSpace) + '...');
                        break;
                    }
                    textArr.push(text);
                    currentLength += text.length + 1;
                }
            }
            textToPass = textArr.join('\n');
        }
    }
    
    textToPass = textToPass ? textToPass.trim() : '';

    const isRuPath = window.location.pathname.includes('/r/') || 
                     window.location.pathname.includes('/ml/') || 
                     window.location.pathname.includes('/ru/');
                     
    const baseUrl = isRuPath ? '/ru/memo/' : '/memo/';
    
    if (textToPass) {
        window.open(`${baseUrl}?text=${encodeURIComponent(textToPass)}`, '_blank');
    } else {
        window.open(baseUrl, '_blank');
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

// ==========================================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ВАРИАНТАМИ ЧТЕНИЯ (VARIANTS)
// ==========================================================================

// 1. Асинхронная загрузка данных вариантов
window.fetchVariantData = async function(varpathLocal, varpath) {
  const paths = [varpathLocal, varpath];
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) return await response.json();
    } catch (error) {
      // Игнорируем ошибку и пробуем следующий путь
    }
  }
  return {};
};

// 2. Настройка UI: переключение видимости, смена иконок, уведомления и хоткеи
window.setupVariantVisibility = function() {
  const toggleButton = document.getElementById("toggle-variants");
  if (!toggleButton) return; // Если кнопки нет на странице, прерываем

  let storedState = localStorage.getItem("variantVisibility") || "hidden";
  const eyeIcon = "/assets/svg/eye.svg";
  const eyeSlashIcon = "/assets/svg/eye-slash.svg";

  // Функция для жесткого применения состояния к тексту и кнопке
  function applyState(state) {
    const variantElements = document.querySelectorAll(".variant");
    
    // Ищем кнопку ЗАНОВО каждый раз, чтобы точно поймать актуальный элемент на странице
    const currentBtn = document.getElementById("toggle-variants");
    const iconImage = currentBtn ? currentBtn.querySelector("img") : null;

    variantElements.forEach((el) => {
      if (state === "hidden") {
        el.classList.add("hidden-variant");
      } else {
        el.classList.remove("hidden-variant");
      }
    });

    if (iconImage) {
      if (state === "hidden") {
        iconImage.setAttribute("src", eyeSlashIcon);
        iconImage.classList.remove("fa-eye");
        iconImage.classList.add("fa-eye-slash");
      } else {
        iconImage.setAttribute("src", eyeIcon);
        iconImage.classList.remove("fa-eye-slash");
        iconImage.classList.add("fa-eye");
      }
    }
  }

  // Применяем состояние к свежеотрисованному тексту
  applyState(storedState);

  // Вешаем обработчик через .onclick, чтобы он не дублировался при перерисовках
  toggleButton.onclick = function(e) {
    if (e) e.preventDefault();
    
    storedState = storedState === "hidden" ? "visible" : "hidden";
    localStorage.setItem("variantVisibility", storedState);
    applyState(storedState);

    // Вызываем уведомление, если функция существует на странице
    if (typeof showBubbleNotification === "function") {
       showBubbleNotification(storedState === "hidden" ? "Variants Off" : "Variants On");
    }
  };

  // Настраиваем хоткей Alt+V (только один раз для всего окна)
  if (!window._variantHotkeySetup) {
    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.code === "KeyV") {
        const currentBtn = document.getElementById("toggle-variants");
        if (currentBtn) currentBtn.click();
      }
    });
    window._variantHotkeySetup = true;
  }
};

// ==========================================================================
// ГЛОБАЛЬНАЯ ЛОГИКА ОБЪЕДИНЕНИЯ ГАТХ (СТИХОВ)
// ==========================================================================
window.mergeGathas = function(htmlData, paliData, transData, varData, engTransData = null) {
    const originalSegments = Object.keys(htmlData);
    
    // Проверка настройки (по умолчанию включено)
    // В будущем чекбокс будет менять этот параметр на "false"
    if (localStorage.getItem("mergeGathas") === "false") {
        return originalSegments; 
    }

    const processedSegments = [];

    for (let i = 0; i < originalSegments.length; i++) {
        let segment = originalSegments[i];

        // Базовая защита от undefined для текущего сегмента
        if (transData && transData[segment] === undefined) transData[segment] = "";
        if (engTransData && engTransData[segment] === undefined) engTransData[segment] = "";
        if (paliData && paliData[segment] === undefined) paliData[segment] = "";

        let nextSegment = originalSegments[i + 1];

        if (htmlData[segment] && htmlData[segment].includes('verse-line') &&
            nextSegment && htmlData[nextSegment] && htmlData[nextSegment].includes('verse-line')) {

            let [nextOpen, nextClose] = htmlData[nextSegment].split(/{}/);

            // Убеждаемся, что следующий сегмент не начинает новый абзац
            if (!nextOpen.includes('<p>')) {
                // Универсальная функция понижения регистра
                const toLower = (str) => {
                    if (!str) return "";
                    // Исключения: английские I, I', O и русское О в начале строки
                    if (str.match(/^["“'‘]?(I\b|I'|O\b|О\b)/)) return str;
                    return str.charAt(0).toLowerCase() + str.slice(1);
                };

                // 1. Объединяем Пали
                if (paliData && paliData[nextSegment]) {
                    paliData[segment] = (paliData[segment] || "").trim() + " " + toLower(paliData[nextSegment].trim());
                }
                // 2. Объединяем основной перевод (Русский/Английский)
                if (transData && transData[nextSegment]) {
                    transData[segment] = (transData[segment] || "").trim() + " " + toLower(transData[nextSegment].trim());
                }
                // 3. Объединяем дополнительный перевод (если передан, например, в multilang)
                if (engTransData && engTransData[nextSegment]) {
                    engTransData[segment] = (engTransData[segment] || "").trim() + " " + toLower(engTransData[nextSegment].trim());
                }
                // 4. Объединяем варианты
                if (varData && varData[nextSegment]) {
                    varData[segment] = (varData[segment] || "").trim() + " " + toLower(varData[nextSegment].trim());
                }

                // 5. Склеиваем HTML (начало от текущего, конец от следующего)
                let [currOpen, currClose] = htmlData[segment].split(/{}/);
                htmlData[segment] = (currOpen || '') + "{}" + (nextClose || '');

                processedSegments.push(segment);
                i++; // Пропускаем следующий сегмент, так как он уже приклеен
                continue;
            }
        }
        processedSegments.push(segment);
    }

    return processedSegments;
};

// ==========================================
// УНИВЕРСАЛЬНАЯ ЗАГЛУШКА-ИНСТРУКЦИЯ (СТАРТОВЫЙ ЭКРАН)
// ==========================================
window.getInstructionHTML = function(lang) {
    const isRu = (lang === 'ru');
    
    // Определяем базовые пути в зависимости от языка
    const readPath = isRu ? '/r/' : '/read/';
    const assetsPath = isRu ? '/ru/assets/texts/' : '/assets/texts/';
    const mainReadPath = isRu ? '/ru/read.php' : '/read.php';

    // Локализация текстов
    const t = {
        instructions: isRu
            ? `Для перехода тексты должны быть указаны с номерами. Пример: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> или <span class="abbr">bi-pj1</span>.<br>Доступны dn, mn, sn, an, некоторые книги kn, обе патимоккхи и виная вибханги.`
            : `Use text indexes for navigation.<br>E.g.: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> or <span class="abbr">bi-ss1</span>.<br>Dn, mn, sn, an, some kn books, both patimokkhas and vinaya vibhanga are available.`,
        mainSuttas: isRu ? "Основные Сутты" : "Main Suttas",
        otherTexts: isRu ? "Часть KN" : "Other Texts",
        bhikkhuVinaya: isRu ? "Бхиккху Виная" : "Bhikkhu Vinaya",
        bhikkhuniVinaya: isRu ? "Бхиккхуни Виная" : "Bhikkhunī Vinaya",
    };

    // Возвращаем собранный HTML
    return `<div class="instructions">
  <p>${t.instructions}</p>
  <div class="lists">

  <div class="suttas">
  <a href="${mainReadPath}"> <h2>${t.mainSuttas}</h2></a> <br>
  <ul>
     <li><span class="abbr">dn</span> <a href="${assetsPath}dn.php"> Dīgha-nikāya</a></li>
     <li><span class="abbr">mn</span> <a href="${assetsPath}mn.php"> Majjhima-nikāya</a></li>
     <li><span class="abbr">sn</span> <a href="${assetsPath}sn.php"> Saṁyutta-nikāya</a></li>
     <li><span class="abbr">an</span> <a href="${assetsPath}an.php"> Aṅguttara-nikāya</a></li>
  </ul>
  </div>

  <div>
  <h2>${t.otherTexts}</h2><br>
  <ul>
      <li><span class="abbr">snp</span> Sutta-nipāta</li> 
      <li><span class="abbr">ud</span> Udāna</li>
      <li><span class="abbr">iti</span> Itivuttaka (1–112)</li>
      <li><span class="abbr">dhp</span> Dhammapada</li>
      <li><span class="abbr">thag</span> Theragāthā</li>
      <li><span class="abbr">thig</span> Therīgāthā</li>
      <li><span class="abbr">kp</span> Khuddakapāṭha</li>
  </ul>
  </div>  
  
  <div>
 <div class="vinaya">
  <div>
  <h3>${t.bhikkhuVinaya}</h3><br>
<ul>
<li><span class="abbr">bu-pm</span> <a href="${assetsPath}pm.php"> Bhikkhupātimokkha</a></li>
<li><span class="abbr">bu-pj</span> <a href="${readPath}?q=bu-pm#8.0"> Pārājikā</a></li>
<li><span class="abbr">bu-ss</span> <a href="${readPath}?q=bu-pm#14.0"> Saṅghādisesā</a></li>
<li><span class="abbr">bu-ay</span> <a href="${readPath}?q=bu-pm#29.0"> Aniyatā</a></li>
<li><span class="abbr">bu-np</span> <a href="${readPath}?q=bu-pm#33.0"> Nissaggiyā-pācittiyā</a></li>
<li><span class="abbr">bu-pc</span> <a href="${readPath}?q=bu-pm#65.0"> Pācittiyā</a></li>
<li><span class="abbr">bu-pd</span> <a href="${readPath}?q=bu-pm#159.0"> Pāṭidesanīyā</a></li>
<li><span class="abbr">bu-sk</span> <a href="${readPath}?q=bu-pm#165.0"> Sekhiyā</a></li>
<li><span class="abbr">bu-as</span> <a href="${readPath}?q=bu-pm#245.0"> Adhikarana-samatha</a></li>
</ul>
</div><div>
<h3>${t.bhikkhuniVinaya}</h3><br>
<ul>
<li><span class="abbr">bi-pm</span> <a href="${assetsPath}bipm.php"> Bhikkhunīpātimokkha</a></li>
<li><span class="abbr">bi-pj</span> Pārājikā</li>
<li><span class="abbr">bi-ss</span> Saṅghādisesā</li>
<li><span class="abbr">bi-np</span> Nissaggiyā-pācittiyā</li>
<li><span class="abbr">bi-pc</span> Pācittiyā</li>
<li><span class="abbr">bi-pd</span> Pāṭidesanīyā</li>
<li><span class="abbr">bi-sk</span> Sekhiyā</li>
<li><span class="abbr">bi-as</span> Adhikarana-samatha</li>
</ul>
</div>
<div>
<h3>Khandhaka</h3>
<h3>Mahāvagga</h3><br>
<ul>
<li><span class=abbr>kd1</span> <a href="${readPath}?q=pli-tv-kd1">Mahākhandhaka</a></li>
<li><span class=abbr>kd2</span> <a href="${readPath}?q=pli-tv-kd2">Uposathakkhandhaka</a></li>                                 
<li><span class=abbr>kd3</span> <a href="${readPath}?q=pli-tv-kd3>Vassūpanāyikakkhandhaka</a></li>
<li><span class=abbr>kd4</span> <a href="${readPath}?q=pli-tv-kd4>Pavāraṇākkhandhaka</a></li>
<li><span class=abbr>kd5</span> <a href="${readPath}?q=pli-tv-kd5>Cammakkhandhaka</a></li>
<li><span class=abbr>kd6</span> <a href="${readPath}?q=pli-tv-kd6>Bhesajjakkhandhaka</a></li>
<li><span class=abbr>kd7</span> <a href="${readPath}?q=pli-tv-kd7>Kathinakkhandhaka</a></li>
<li><span class=abbr>kd8</span> <a href="${readPath}?q=pli-tv-kd8>Cīvarakkhandhaka</a></li>                                    
<li><span class=abbr>kd9</span> <a href="${readPath}?q=pli-tv-kd9>Campeyyakkhandhaka</a></li>
<li><span class=abbr>kd10</span> <a href="${readPath}?q=pli-tv-kd10>Kosambakakkhandhaka</a></li>
</ul>
<h3>Cūḷavagga</h3><br>
<ul>
<li><span class=abbr>kd11</span> <a href="${readPath}?q=pli-tv-kd11">Kammakkhandhaka</a></li>
<li><span class=abbr>kd12</span> <a href="${readPath}?q=pli-tv-kd12">Pārivāsikakkhandhaka</a></li>
<li><span class=abbr>kd13</span> <a href="${readPath}?q=pli-tv-kd13>Samuccayakkhandhaka</a></li>
<li><span class=abbr>kd14</span> <a href="${readPath}?q=pli-tv-kd14>Samathakkhandhaka</a></li>
<li><span class=abbr>kd15</span> <a href="${readPath}?q=pli-tv-kd15>Khuddakavatthukkhandhaka</a></li>
<li><span class=abbr>kd16</span> <a href="${readPath}?q=pli-tv-kd16>Senāsanakkhandhaka</a></li>
<li><span class=abbr>kd17</span> <a href="${readPath}?q=pli-tv-kd17>Saṅghabhedakakkhandhaka</a></li>
<li><span class=abbr>kd18</span> <a href="${readPath}?q=pli-tv-kd18>Vattakkhandhaka</a></li>
<li><span class=abbr>kd19</span> <a href="${readPath}?q=pli-tv-kd19>Pātimokkhaṭṭhapanakkhandhaka</a></li>
<li><span class=abbr>kd20</span> <a href="${readPath}?q=pli-tv-kd20>Bhikkhunikkhandhaka</a></li>
<li><span class=abbr>kd21</span> <a href="${readPath}?q=pli-tv-kd21>Pañcasatikakkhandhaka</a></li>
<li><span class=abbr>kd22</span> <a href="${readPath}?q=pli-tv-kd22>Sattasatikakkhandhaka</a></li>
</ul>
</div>
<div>
<ul>
<li><span class="abbr">pvr</span> Parivāra</li>
</ul>
</div>
  </div></div>`;
};
