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
