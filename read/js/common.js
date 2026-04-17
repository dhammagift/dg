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
    let smartTimer; 
    let ignoreScroll = false; 
    
    const gearBtn = document.getElementById('smart-gear-btn');
    const smartPanel = document.getElementById('smart-panel');
    const tocBtn = document.getElementById('smart-toc-btn');
    const tocPanel = document.getElementById('smart-toc-panel');
    const headerHeight = 90; // Граница заголовка для абсолютного скрытия

    function keepSmartUIAlive() {
        if (gearBtn) gearBtn.classList.add('visible');
        if (tocBtn) tocBtn.classList.add('visible'); 

        clearTimeout(smartTimer);
        smartTimer = setTimeout(() => {
            const isGearActive = smartPanel && smartPanel.classList.contains('active');
            const isTocActive = tocPanel && tocPanel.classList.contains('active');

            if (!isGearActive && !isTocActive) {
                if (gearBtn) gearBtn.classList.remove('visible');
                if (tocBtn) tocBtn.classList.remove('visible');
            }
        }, 2000);
    }

    // ========================================================
    // ЛОГИКА ТРИГГЕРА (Учитываем мышь и тапы раздельно)
    // ========================================================
    function checkTriggerZone(clientX, clientY, isTap) {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        
        // Для мыши: работает ТОЛЬКО если мы в самом верху (до 100px)
        // Для тапа: работает ВЕЗДЕ
        if (!isTap && st > 100) return; 

        const triggerWidth = 100;  // Компактная зона 100x100 в углу
        const triggerHeight = 100; 
        
        if (clientX > window.innerWidth - triggerWidth && clientY < triggerHeight) {
            keepSmartUIAlive();
        }
    }

    // Движение мыши (передаем false)
    document.addEventListener('mousemove', function(e) {
        checkTriggerZone(e.clientX, e.clientY, false);
    });

    // Тап/касание (передаем true)
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 0) {
            checkTriggerZone(e.touches[0].clientX, e.touches[0].clientY, true);
        }
    }, { passive: true });
    // ========================================================

    // ========================================================
    // ЛОГИКА СКРОЛЛА
    // ========================================================
    window.addEventListener('scroll', function() {
        if (ignoreScroll) return; 

        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st < 0) return; 

        const isGearActive = smartPanel && smartPanel.classList.contains('active');
        const isTocActive = tocPanel && tocPanel.classList.contains('active');

        if (st <= headerHeight) {
            // ПРАВИЛО 1: В зоне шапки ВСЕГДА прячем (скролл вверх или вниз - не важно)
            // Это обеспечивает чистоту при возврате наверх (Scroll to Top)
            if (!isGearActive && !isTocActive) {
                if (gearBtn) gearBtn.classList.remove('visible');
                if (tocBtn) tocBtn.classList.remove('visible');
            }
        } else if (st < lastScrollTop) {
            // ПРАВИЛО 2: Скролл вверх ниже шапки -> показываем
            keepSmartUIAlive(); 
        } else if (st > lastScrollTop) {
            // ПРАВИЛО 3: Скролл вниз ниже шапки -> прячем
            if (!isGearActive && !isTocActive) {
                if (gearBtn) gearBtn.classList.remove('visible');
                if (tocBtn) tocBtn.classList.remove('visible');
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // ========================================================
    // ОБРАБОТЧИКИ КЛИКОВ И МОДАЛЬНЫХ ОКОН
    // ========================================================
    if (gearBtn) {
        gearBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!smartPanel.classList.contains('active') && typeof window.syncSmartIcons === 'function') {
                window.syncSmartIcons();
            }
            
            smartPanel.classList.toggle('active');
            
            if (tocPanel && tocPanel.classList.contains('active')) {
                tocPanel.classList.remove('active');
            }

            if (smartPanel.classList.contains('active')) {
                clearTimeout(smartTimer);
            } else {
                keepSmartUIAlive();
            }
        });
    }

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
                            if (gearBtn) gearBtn.focus({ preventScroll: true });
                            modalEl.removeEventListener('hidden.bs.modal', onHidden);
                        };
                        modalEl.addEventListener('hidden.bs.modal', onHidden);
                    } else {
                        originalElement.click(); 
                    }
                } else {
                    originalElement.click();
                }
                
                if (smartPanel) smartPanel.classList.remove('active');
                keepSmartUIAlive();
                if (typeof window.syncSmartIcons === 'function') setTimeout(window.syncSmartIcons, 50); 
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (smartPanel && gearBtn && !smartPanel.contains(e.target) && !gearBtn.contains(e.target)) {
            smartPanel.classList.remove('active');
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


// ==========================================================================
// ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ДЛЯ ССЫЛКИ MEMO (УМНЫЙ ЗАХВАТ ПО ФОКУСУ)
// ==========================================================================
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
    const MAX_CHARS = 1200; // Лимит для захвата экрана вниз
    const URL_MAX_LENGTH = 1500; // Порог переключения между URL и localStorage

    // =======================================================
    // ПРИОРИТЕТ 1: ЦИКЛ А-Б (Только его диапазон) - БЕЗ ЛИМИТА
    // =======================================================
    if (highlighted.length > 0 && (!activeWord || isWordInsideAB)) {
        let isPaliHidden = suttaContainer.classList ? suttaContainer.classList.contains('hide-pali') : false;
        
        let targetClass = !isPaliHidden && highlighted.some(el => el.classList.contains('pli-lang')) 
                          ? 'pli-lang' 
                          : (highlighted.some(el => el.classList.contains('rus-lang')) ? 'rus-lang' : 'eng-lang');

        let abElements = highlighted.filter(el => el.classList.contains(targetClass) || !el.className.includes('-lang'));
        
        let textArr = [];
        for (let el of abElements) {
            let text = (el.innerText || el.textContent).trim();
            if (text) {
                textArr.push(text);
            }
        }
        textToPass = textArr.join('\n');
    } 
    // =======================================================
    // ПРИОРИТЕТ 2: ОТ ТОЧКИ ФОКУСА (Active / TTS) -> ВНИЗ (С ЛИМИТОМ)
    // =======================================================
    else if (activeWord || ttsActive) {
        let startNode = activeWord && !isWordInsideAB ? activeWord : ttsActive;
        let targetSelector = '';

        if (startNode) {
            if (startNode.classList.contains('pli-lang')) targetSelector = '.pli-lang';
            else if (startNode.classList.contains('rus-lang')) targetSelector = '.rus-lang';
            else if (startNode.classList.contains('eng-lang')) targetSelector = '.eng-lang';
            else if (startNode.classList.contains('tha-lang')) targetSelector = '.tha-lang';
        }
        
        // Если не смогли определить класс (или текст вне стандартной разметки), ставим дефолт
        if (!targetSelector) {
            targetSelector = '.pli-lang';
        }

        let allValidElements = Array.from(suttaContainer.querySelectorAll(targetSelector));
        
        if (allValidElements.length === 0) {
            allValidElements = Array.from(suttaContainer.querySelectorAll('p, h1, h2, h3, h4, li, blockquote'));
        }

        allValidElements = allValidElements.filter(el => 
            el.offsetParent !== null && !el.closest('.tts-ignore, nav, footer, .input-group')
        );

        let startIndex = -1;

        if (startNode) {
            const segmentId = startNode.id || startNode.closest('[id]')?.id;
            if (segmentId) {
                startIndex = allValidElements.findIndex(el => el.id === segmentId || el.closest(`[id="${segmentId}"]`));
            }
            if (startIndex === -1) {
                startIndex = allValidElements.findIndex(el => el === startNode || el.contains(startNode));
            }
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
    
    // =======================================================
    // ГИБРИДНАЯ ЛОГИКА ОТПРАВКИ (URL vs LocalStorage)
    // =======================================================
    if (textToPass) {
        if (textToPass.length <= URL_MAX_LENGTH) {
            localStorage.removeItem('currentMemoText'); 
            window.open(`${baseUrl}?text=${encodeURIComponent(textToPass)}`, '_blank');
        } else {
            localStorage.setItem('currentMemoText', textToPass);
            window.open(baseUrl, '_blank');
        }
    } else {
        // ЕСЛИ НИЧЕГО НЕ ВЫДЕЛИЛОСЬ — ПРОСТО ОТКРЫВАЕМ ПУСТОЙ МЕМО
        localStorage.removeItem('currentMemoText');
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

    fetch("/assets/js/textinfo.json")
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
// АСИНХРОННЫЙ ПОИСК ДОСТУПНОГО ПЕРЕВОДЧИКА (PHP + ФОЛБЭК НА HEAD ЗАПРОСЫ)
// ==========================================================================

window.siteTranslators = null; // Создаем глобальную переменную для имен

async function getTranslator(texttype, slugReady, lang = "ru") {
    let translatorsData = {}; 
    
    // 1. Обязательно загружаем словарь имен (он нужен для UI, чтобы красиво писать "Bhikkhu Sujato" и т.д.)
    try {
        const trResp = await fetch("/assets/js/translators.json");
        if (trResp.ok) {
            translatorsData = await trResp.json();
            window.siteTranslators = translatorsData; 
        }
    } catch (e) {
        console.log("Файл translators.json не найден.");
    }
    
    // 2. Передаем параметр lang прямо в единый скрипт
    let phpUrl = `/read/php/translator-lookup.php?fromjs=${texttype}/${slugReady}&lang=${lang}`;
    let defaultTr = "o";
    
    if (lang === "th") {
        defaultTr = "siamrath";
    } else if (lang === "en") {
        defaultTr = "sujato";
    }

    // 3. ПЫТАЕМСЯ НАЙТИ ЧЕРЕЗ PHP (Быстрый путь)
    try {
        const phpResponse = await fetch(phpUrl);
        if (phpResponse.ok) {
            const data = await phpResponse.text();
            const trnsResp = data.split(" ");
            // Проверяем, что ответ не пустой и не содержит HTML-ошибок (например 404 страницы)
            if (trnsResp[0] && trnsResp[0].trim() !== "" && !trnsResp[0].includes("<")) {
                return trnsResp[0].trim();
            }
        }
    } catch (e) {
        console.log("PHP поиск недоступен или вернул ошибку, переходим к запасному варианту.");
    }

    // 4. ФОЛБЭК: Ищем перебором через HEAD-запросы (Если PHP упал или ничего не нашел)
    const currentListObj = translatorsData[lang] || {};
    const translatorIds = Object.keys(currentListObj); 
    
    if (translatorIds.length === 0) return defaultTr;
    
    const fetchPromises = translatorIds.map(tr => {
        // Для тайского структура папок немного отличается (добавлена папка /translation/)
        let testPath = lang === "th" 
            ? `/assets/texts/${lang}/translation/${texttype}/${slugReady}_translation-${lang}-${tr}.json`
            : `/assets/texts/${lang}/${texttype}/${slugReady}_translation-${lang}-${tr}.json`;
            
        return fetch(testPath, { method: 'HEAD' }).then(response => {
            if (response.ok) return tr;
            throw new Error('Not found');
        });
    });

    try {
        let foundTranslator = await Promise.any(fetchPromises);
        return foundTranslator.trim();
    } catch (e) {
        // Если вообще ничего не нашли, отдаем дефолтные значения
        return defaultTr; 
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


// Логика сдвига кнопки TTS при появлении кнопки ScrollToTop
window.addEventListener('scroll', function() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    const ttsBtn = document.querySelector('.dynamic-tts-btn');
    
    if (!ttsBtn || !scrollBtn) return;

    // Проверяем видимость стрелки "Вверх"
    // Обычно она появляется, когда у неё opacity > 0 или display != none
    const isScrollBtnVisible = window.getComputedStyle(scrollBtn).opacity > 0;

    if (isScrollBtnVisible) {
        ttsBtn.classList.add('shifted');
    } else {
        ttsBtn.classList.remove('shifted');
    }
});


// ==========================================
// ГЛОБАЛЬНЫЙ ОТСЛЕЖИВАТЕЛЬ ОТРИСОВКИ СУТТЫ
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const suttaContainer = document.getElementById('sutta');
    if (!suttaContainer) return;

    // Если текст уже есть на момент загрузки (например, статичная страница)
    if (suttaContainer.querySelector('.pli-lang, .rus-lang, .eng-lang, .tha-lang')) {
        window.dispatchEvent(new Event('suttaRenderedCentral'));
        return;
    }

    // Наблюдатель за изменениями внутри контейнера
    const observer = new MutationObserver(function(mutations, obs) {
        if (suttaContainer.querySelector('.pli-lang, .rus-lang, .eng-lang, .tha-lang')) {
            obs.disconnect(); // Текст появился, прекращаем наблюдение
            window.dispatchEvent(new Event('suttaRenderedCentral'));
        }
    });

    observer.observe(suttaContainer, { childList: true, subtree: true });
});

// ==========================================================================
// ГЛОБАЛЬНЫЙ МЕНЕДЖЕР ЯЗЫКА (АВТООПРЕДЕЛЕНИЕ РЕЖИМОВ)
// ==========================================================================
// Если функция уже существует в файле читалки, мы её не трогаем.
// Как только ты удалишь её из конкретной читалки, сработает этот фоллбэк.
window.toggleThePali = window.toggleThePali || function() {
    // Умное автоопределение: Special (2 языка) или обычная читалка (3 языка)
    // Если есть функция showPaliAll, значит это Special-файл
    const isSpecial = typeof window.showPaliAll === "function";
    
    const storageKey = isSpecial ? "paliToggleSpecial" : "paliToggle";
    const modes = isSpecial ? ["pli-2nd", "pli"] : ["pli-2nd", "pli", "2nd"];
    const defaultMode = "pli-2nd";

    const languageButton = document.getElementById("language-button");
    if (!languageButton) return;

    // Инициализация при первом заходе
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, defaultMode);
    }
    
    window.language = localStorage.getItem(storageKey); 

    // Клонируем кнопку, чтобы убить старые слушатели кликов
    const newButton = languageButton.cloneNode(true);
    languageButton.parentNode.replaceChild(newButton, languageButton);

    newButton.addEventListener("click", () => {
        let currentMode = localStorage.getItem(storageKey) || defaultMode;
        let nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
        let nextMode = modes[nextIndex];

        const applyChange = () => {
            localStorage.setItem(storageKey, nextMode);
            window.language = nextMode;

            // СТАВИМ ЛОКАЛЬНОЕ ВРЕМЯ - ЗАЩИТА ОТ ОБЛАКА
            localStorage.setItem("dg_localSettingsTimestamp", Date.now().toString());

            // Маршрутизация функций отрисовки
            if (nextMode === "pli" && typeof window.showPali === "function") {
                window.showPali();
            } 
            else if (nextMode === "2nd" && typeof window.showEnglish === "function") {
                window.showEnglish();
            } 
            else if (nextMode === "pli-2nd") {
                if (isSpecial && typeof window.showPaliAll === "function") {
                    window.showPaliAll();
                } else if (!isSpecial && typeof window.showPaliEnglish === "function") {
                    window.showPaliEnglish();
                }
            }

            // Моментальная отправка в базу
            if (typeof window.syncSettingsToCloud === "function") {
                window.syncSettingsToCloud().then(() => {
                    if (typeof window.dg_settingsChanged !== 'undefined') {
                        window.dg_settingsChanged = false;
                    }
                });
            }
        };

        // Поддержка плавной анимации текста
        if (typeof window.runWithTransition === "function") {
            window.runWithTransition(applyChange);
        } else {
            applyChange();
        }
    });
};

// Логика кнопки оглавления (TOC) - SPA-защита, слежение и автоцентрирование
(function() {
    let activeSlug = ''; 

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    window.syncTOCLanguageVisibility = function() {
        const sutta = document.getElementById('sutta');
        const panel = document.getElementById('smart-toc-panel');
        if (!sutta || !panel) return;

        const langClasses = ['hide-pali', 'hide-english', 'hide-russian', 'hide-thai'];
        
        langClasses.forEach(cls => {
            if (sutta.classList.contains(cls)) {
                panel.classList.add(cls);
            } else {
                panel.classList.remove(cls);
            }
        });
    };

    function syncTOC() {
        const suttaContainer = document.getElementById('sutta');
        const pillLabel = document.getElementById('smart-toc-current');
        const tocPanel = document.getElementById('smart-toc-panel');
        const tocBtn = document.getElementById('smart-toc-btn');

        if (!suttaContainer || !pillLabel) return;

        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st <= 90) {
            if (tocBtn) tocBtn.classList.add('icon-only');
        } else {
            if (tocBtn) tocBtn.classList.remove('icon-only');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const currentSlug = urlParams.get('q') || '';
        if (activeSlug !== currentSlug) {
            activeSlug = currentSlug;
            if (tocPanel) {
                tocPanel.innerHTML = '';
                tocPanel.classList.remove('active');
            }
        }

        const hasInternalHeaders = suttaContainer.querySelector('h3, h4, h5, h6') !== null;
        let selector = 'h1, h2'; 
        if (hasInternalHeaders) {
            selector += ', h3, h4, h5, h6';
        } else {
            selector += ', .speaker, .rule, .subrule, .verse-line, .anapatti';
        }
        
        const headings = Array.from(suttaContainer.querySelectorAll(selector)).filter(el => {
            if (el.classList.contains('verse-line')) {
                const parentBlock = el.closest('blockquote, section');
                const firstContentBlock = suttaContainer.querySelector('p, blockquote, .rule');
                if (firstContentBlock && (firstContentBlock === parentBlock || firstContentBlock.contains(el))) return false;
                if (el !== parentBlock.querySelector('.verse-line')) return false; 
            }
            return el.innerText.trim().length > 0;
        });

        if (headings.length === 0) {
            if (tocBtn) tocBtn.style.display = 'none';
            return;
        } else {
            if (tocBtn) tocBtn.style.display = 'flex';
        }

        let activeIndex = 0;
        const eyeLevel = window.innerHeight * 0.4;

        for (let i = headings.length - 1; i >= 0; i--) {
            if (headings[i].getBoundingClientRect().top <= eyeLevel) {
                activeIndex = i;
                break;
            }
        }

        if (headings[activeIndex].tagName.startsWith('H')) {
            let labelText = headings[activeIndex].innerText.replace(/\s+/g, ' ').trim();
            // Если это Виная, берем текст конкретного языка для кнопки
            if (headings[activeIndex].classList.contains('inserted-heading')) {
               const isRu = window.location.pathname.includes('/r/') || window.location.pathname.includes('/ml/');
               const isTh = window.location.pathname.includes('/th/');
               let tSpan = headings[activeIndex].querySelector(isRu ? '.rus-lang' : (isTh ? '.tha-lang' : '.eng-lang')) || headings[activeIndex].querySelector('.eng-lang');
               if (tSpan) labelText = tSpan.textContent.trim();
            }
            pillLabel.textContent = capitalize(labelText);
        } else {
            pillLabel.textContent = "Оглавление";
        }

        if (tocPanel && tocPanel.classList.contains('active')) {
            const tocItems = tocPanel.querySelectorAll('.toc-item');
            const newActive = tocItems[activeIndex];
            const currentActive = tocPanel.querySelector('.toc-item.active');

            if (newActive && currentActive !== newActive) {
                if (currentActive) currentActive.classList.remove('active');
                newActive.classList.add('active');

                const panelHeight = tocPanel.clientHeight;
                const itemTop = newActive.offsetTop;
                const itemHeight = newActive.clientHeight;

                tocPanel.scrollTo({
                    top: itemTop - (panelHeight / 2) + (itemHeight / 2),
                    behavior: 'smooth'
                });
            }
        }
    }

function buildFullTOC() {
    const suttaContainer = document.getElementById('sutta');
    const tocPanel = document.getElementById('smart-toc-panel');
    if (!suttaContainer || !tocPanel) return;

    const hasInternalHeaders = suttaContainer.querySelector('h3, h4, h5, h6') !== null;

    let selector = 'h1, h2'; 
    if (hasInternalHeaders) {
        selector += ', h3, h4, h5, h6';
    } else {
        selector += ', .speaker, .rule, .subrule, .verse-line, .anapatti';
    }

    const elements = suttaContainer.querySelectorAll(selector);
    tocPanel.innerHTML = '';

    let lastSpeakerText = '';
    let lastPoemBlock = null;
    // По умолчанию считаем, что мы в контексте h2, если заголовков еще не было
    let currentLevel = 2; 

    const firstContentBlock = suttaContainer.querySelector('p, blockquote, .rule');

    elements.forEach((el) => {
        let text = el.innerText.replace(/\s+/g, ' ').trim();
        if (!text) return;

        // Определяем уровень иерархии
        if (el.tagName.startsWith('H')) {
            currentLevel = parseInt(el.tagName.substring(1));
        }

        let tocClassType = 'h' + currentLevel;

        // Специальная обработка для вложенных типов, чтобы сохранить их специфику в стилях, 
        // но оставить иерархию заголовка
        let extraClass = '';

        if (el.classList.contains('inserted-heading')) {
            const isRuPath = window.location.pathname.includes('/r/') || window.location.pathname.includes('/ru/') || window.location.pathname.includes('/ml/');
            const isThPath = window.location.pathname.includes('/th/');
            
            let targetLangClass = isRuPath ? '.rus-lang' : (isThPath ? '.tha-lang' : '.eng-lang');
            let span = el.querySelector(targetLangClass) || el.querySelector('.eng-lang');
            
            let displayText = span ? span.textContent.replace(/\s+/g, ' ').trim() : text;

            const item = document.createElement('div');
            item.className = `toc-item toc-${tocClassType}`;
            item.textContent = capitalize(displayText); 
            
            item.style.cursor = 'pointer';
            item.onclick = (e) => {
                e.stopPropagation();
                tocPanel.classList.remove('active');
                const offset = 120;
                const targetY = window.pageYOffset + el.getBoundingClientRect().top - offset;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                if (typeof window.activateSegmentForTTS === 'function') {
                    window.activateSegmentForTTS(el);
                }
            };
            tocPanel.appendChild(item);
            return;
        }

        let isCustomMultiLang = false;
        let customLangData = {};

        if (el.classList.contains('speaker')) {
            if (text === lastSpeakerText) return; 
            lastSpeakerText = text;
            extraClass = ' toc-speaker';
        } else if (el.classList.contains('verse-line')) {
            const parentBlock = el.closest('blockquote, section');
            if (parentBlock && parentBlock === lastPoemBlock) return;
            lastPoemBlock = parentBlock;

            if (firstContentBlock && (firstContentBlock === parentBlock || firstContentBlock.contains(el))) {
                return; 
            }

            extraClass = ' toc-v-line';
            isCustomMultiLang = true;

            const getFirstWord = (langClass) => {
                const span = el.querySelector('.' + langClass);
                if (span) {
                    let cleanText = span.textContent.replace(/["“”«»'‘’]/g, '').replace(/\s+/g, ' ').trim();
                    const words = cleanText.split(/[\s,.;:!?]/);
                    let label = words[0] || '';
                    if (label.length <= 3 && words.length > 1) {
                        label += ' ' + words[1];
                    }
                    return label;
                }
                return '';
            };

            const pliFirst = getFirstWord('pli-lang');
            const rusFirst = getFirstWord('rus-lang');
            const engFirst = getFirstWord('eng-lang');
            const thaFirst = getFirstWord('tha-lang');
            const fallbackFirst = text.replace(/["“”«»'‘’]/g, '').split(/[\s,.;:!?]/)[0] || '';

            customLangData = {
                pli: 'Gāthā' + (pliFirst ? ` ${pliFirst}...` : (fallbackFirst ? ` ${fallbackFirst}...` : '')),
                rus: 'Гатха' + (rusFirst ? ` ${rusFirst}...` : (fallbackFirst ? ` ${fallbackFirst}...` : '')),
                eng: 'Gatha' + (engFirst ? ` ${engFirst}...` : (fallbackFirst ? ` ${fallbackFirst}...` : '')),
                tha: 'คาถา' + (thaFirst ? ` ${thaFirst}...` : (fallbackFirst ? ` ${fallbackFirst}...` : ''))
            };
        } else if (el.classList.contains('rule') || el.classList.contains('subrule')) {
            extraClass = ' toc-rule';
        } else if (el.classList.contains('anapatti')) {
            extraClass = ' toc-anapatti';
            isCustomMultiLang = true;
            customLangData = {
                pli: 'Anāpatti',
                rus: 'Без вины',
                eng: 'Non-offense',
                tha: 'อนาปัตติ'
            };
        }

        const item = document.createElement('div');
        // Присваиваем уровень заголовка для отступа и дополнительный класс для стилизации типа контента
        item.className = `toc-item toc-${tocClassType}${extraClass}`;

        const scrollAndHighlight = (targetElement) => {
            tocPanel.classList.remove('active');
            const offset = 120;
            const targetY = window.pageYOffset + targetElement.getBoundingClientRect().top - offset;
            window.scrollTo({ top: targetY, behavior: 'smooth' });

            if (typeof window.activateSegmentForTTS === 'function') {
                window.activateSegmentForTTS(targetElement);
            }
        };

        if (isCustomMultiLang) {
            const isRuPath = window.location.pathname.includes('/r/') || window.location.pathname.includes('/ru/') || window.location.pathname.includes('/ml/');
            const isThPath = window.location.pathname.includes('/th/');
            
            let targetLangClass = isRuPath ? '.rus-lang' : (isThPath ? '.tha-lang' : '.eng-lang');
            let targetLangText = isRuPath ? customLangData.rus : (isThPath ? customLangData.tha : customLangData.eng);
            
            const langs = [
                { cls: 'pli-lang', txt: customLangData.pli },
                { cls: targetLangClass, txt: targetLangText }
            ];
            
            langs.forEach(l => {
                const span = document.createElement('span');
                span.className = l.cls;
                span.textContent = capitalize(l.txt) + ' '; 
                span.style.cursor = 'pointer';
                span.onclick = (e) => {
                    e.stopPropagation();
                    scrollAndHighlight(el);
                };
                item.appendChild(span);
            });
        } else {
            const langSpans = el.querySelectorAll('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
            if (langSpans.length > 0) {
                langSpans.forEach(originalSpan => {
                    const clone = originalSpan.cloneNode(true);
                    clone.querySelectorAll('.copyLink, .copyLink-start, .variant, .match').forEach(child => child.remove());
                    let cleanText = clone.textContent.replace(/\s+/g, ' ').trim();

                    if (cleanText) {
                        clone.textContent = capitalize(cleanText) + ' '; 
                        clone.style.cursor = 'pointer';
                        clone.onclick = (e) => {
                            e.stopPropagation();
                            scrollAndHighlight(originalSpan);
                        };
                        item.appendChild(clone);
                    }
                });
            } else {
                if (text) {
                    item.textContent = capitalize(text);
                    item.onclick = () => scrollAndHighlight(el);
                }
            }
        }

        if (item.innerHTML.trim() !== '' || item.textContent.trim() !== '') {
            tocPanel.appendChild(item);
        }
    });

    if (typeof window.syncTOCLanguageVisibility === 'function') {
        window.syncTOCLanguageVisibility();
    }
    syncTOC();
}


    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#smart-toc-btn');
        const panel = document.getElementById('smart-toc-panel');
        const sutta = document.getElementById('sutta');
        const gearPanel = document.getElementById('smart-panel');

        if (btn) {
            e.stopPropagation();
            if (panel.innerHTML.trim() === '') buildFullTOC();

            if (typeof window.syncTOCLanguageVisibility === 'function') {
                window.syncTOCLanguageVisibility();
            }

            const isOpening = !panel.classList.contains('active');
            panel.classList.toggle('active');
            if (gearPanel) gearPanel.classList.remove('active');

            if (isOpening) {
                syncTOC();
                setTimeout(() => {
                    const activeItem = panel.querySelector('.toc-item.active');
                    if (activeItem) {
                        const panelHeight = panel.clientHeight;
                        const itemTop = activeItem.offsetTop;
                        const itemHeight = activeItem.clientHeight;
                        panel.scrollTop = itemTop - (panelHeight / 2) + (itemHeight / 2);
                    }
                }, 50);
            }
        } else if (panel && !panel.contains(e.target)) {
            panel.classList.remove('active');
        }
    });

    const resetTOC = () => {
        const panel = document.getElementById('smart-toc-panel');
        const tocBtn = document.getElementById('smart-toc-btn');
        if (panel) {
            panel.innerHTML = '';
            panel.classList.remove('active');
        }
        if (tocBtn) tocBtn.classList.remove('visible');

        const urlParams = new URLSearchParams(window.location.search);
        activeSlug = urlParams.get('q') || '';
        syncTOC();
    };

    window.addEventListener('suttaLoaded', resetTOC);
    window.addEventListener('dgSuttaRendered', resetTOC);

    window.addEventListener('scroll', () => {
        const tocBtn = document.getElementById('smart-toc-btn');
        if (tocBtn && tocBtn.classList.contains('visible')) {
            syncTOC();
        }
    }, { passive: true });
})();
