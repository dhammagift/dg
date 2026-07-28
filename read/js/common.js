
//window.otrnranges = ['sn56.11', 'sn12.2', 'sn54.1'];

    // Проверяем, является ли страница русскоязычной
window.isRuPath = window.location.pathname.includes('/r/') || 
                     window.location.pathname.includes('/ru/') || 
                     window.location.pathname.includes('/ml/') || 
                     window.location.pathname.includes('/mt/');
                     
window.isLocalHost = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1');                     
       
                     
function throttle(mainFunction, delay) {
    let timerFlag = null;
    return function (...args) {
        if (timerFlag === null) {
            mainFunction(...args);
            timerFlag = setTimeout(() => {
                timerFlag = null;
            }, delay);
        }
    };
}                     
                     
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
  
  // 1. Ищем выделенное слово TTS
  let activeElement = document.querySelector('.active-word');
  let anchorData = null;

  if (activeElement) {
      // Если слово есть, привязываемся к родительской строке [id]
      const row = activeElement.closest('[id]') || activeElement;
      anchorData = { element: row, topOffset: row.getBoundingClientRect().top };
  } else {
      // Если слова нет, используем стандартный поиск верхнего элемента
      anchorData = getTopVisibleSegment();
  }

  if (suttaContainer) suttaContainer.classList.add("text-hidden");

  setTimeout(() => {
      // Вызываем само переключение языка (hide-pali, hide-russian и т.д.)
      stateChangeCallback();

      // 2. Восстанавливаем позицию прокрутки
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
          
          // 3. Восстанавливаем маркер TTS и кнопку Play
          if (activeElement && typeof window.activateSegmentForTTS === 'function') {
              const row = activeElement.closest('[id]') || activeElement;
              const spans = row.querySelectorAll('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
              
              let visibleTarget = row;
              
              // Ищем первый язык в строке, который сейчас ВИДИМ (не скрыт через display: none)
              for (let span of spans) {
                  if (span.offsetParent !== null) { 
                      visibleTarget = span;
                      break;
                  }
              }
              
              // Заново вешаем желтое выделение и кнопку плеера на видимый язык
              window.activateSegmentForTTS(visibleTarget);
          }
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
    let lastManualInteraction = 0; // Время последнего физического действия пользователя

    const gearBtn = document.getElementById('smart-gear-btn');
    const smartPanel = document.getElementById('smart-panel');
    const tocBtn = document.getElementById('smart-toc-btn');
    const tocPanel = document.getElementById('smart-toc-panel');
    const headerHeight = 90; 

    // Фиксация физического взаимодействия (мышь, тач, клавиатура)
    const recordManualAction = (e) => { 
        // Игнорируем нажатия на элементы плеера, чтобы они не будили панели
        if (e && e.target && typeof e.target.closest === 'function') {
            if (e.target.closest('#voice-player-container, .dynamic-tts-btn')) {
                return;
            }
        }
        lastManualInteraction = Date.now(); 
    };

    ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(type => {
        window.addEventListener(type, recordManualAction, { passive: true });
    });

    // Проверка: было ли действие пользователя в последние 2.5 секунды
    function isManualAction() {
        return (Date.now() - lastManualInteraction) < 2500;
    }

    function isTTSAutoScrolling() {
        if (typeof window.ttsAPI !== 'undefined') {
            const state = window.ttsAPI.getState();
            // Считаем автоскроллом только если TTS говорит, скролл включен И нет ручного ввода
            return state.speaking && !state.paused && state.autoScroll && !isManualAction();
        }
        return false;
    }

    function keepSmartUIAlive() {
        // Если это "чистый" автоскролл TTS — блокируем появление
        if (isTTSAutoScrolling()) return;

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

// ЛОГИКА ТРИГГЕРА В УГЛУ (Тап/Клик/Наведение всегда вызывают кнопки)
    function checkTriggerZone(clientX, clientY) {
        const triggerSize = 100; 
        // Проверяем верхний правый угол
        if (clientX > window.innerWidth - triggerSize && clientY < triggerSize) {
            // Принудительно обновляем время взаимодействия, чтобы перебить блокировку TTS
            lastManualInteraction = Date.now();
            keepSmartUIAlive();
        }
    }

// 1. Срабатывание по наведению мыши (оптимизировано)
    document.addEventListener('mousemove', throttle((e) => {
        checkTriggerZone(e.clientX, e.clientY, false);
    }, 100), { passive: true });

    // 2. Срабатывание по клику мыши
    document.addEventListener('mousedown', (e) => {
        checkTriggerZone(e.clientX, e.clientY, false);
    }, { passive: true });

    // 3. Срабатывание по касанию пальцем
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            checkTriggerZone(e.touches[0].clientX, e.touches[0].clientY, true);
        }
    }, { passive: true });

// ЛОГИКА СКРОЛЛА (Оптимизировано)
    window.addEventListener('scroll', throttle(function() {
        if (ignoreScroll) return; 

        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st < 0) return; 

        const isGearActive = smartPanel && smartPanel.classList.contains('active');
        const isTocActive = tocPanel && tocPanel.classList.contains('active');

        // 1. Если это автоскролл плеера (без участия рук) — жестко прячем кнопки
        if (isTTSAutoScrolling()) {
            if (!isGearActive && !isTocActive) {
                if (gearBtn) gearBtn.classList.remove('visible');
                if (tocBtn) tocBtn.classList.remove('visible');
            }
            lastScrollTop = st <= 0 ? 0 : st;
            return;
        }

        // 2. Обычный режим или ручной скролл
        if (st <= headerHeight) {
            // В зоне шапки прячем ВСЕГДА для чистоты
            if (!isGearActive && !isTocActive) {
                if (gearBtn) gearBtn.classList.remove('visible');
                if (tocBtn) tocBtn.classList.remove('visible');
            }
        } else if (st < lastScrollTop) {
            // === ИЗМЕНЕНО: Показываем кнопки ТОЛЬКО при скролле ВВЕРХ ===
            keepSmartUIAlive(); 
        }
        // Скролл ВНИЗ игнорируется: таймер просто дотикает и скроет кнопки сам
        
        lastScrollTop = st <= 0 ? 0 : st;
    }, 150), { passive: true });

    // ОБРАБОТЧИКИ КЛИКОВ И МОДАЛЬНЫХ ОКОН
    if (gearBtn) {
        gearBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            lastManualInteraction = Date.now(); 
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
            lastManualInteraction = Date.now();
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

    const baseUrl = window.isRuPath ? '/ru/memo/' : '/memo/';
    
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
// ГЕНЕРАЦИЯ ДОПОЛНИТЕЛЬНЫХ ССЫЛОК (DPR, BJT, Voice, 4nt, SC, BB, TBW, Th.ru, Th.su)
// ==========================================================================

function getDprUrl(slug) {
    if (typeof dprLinksData === 'undefined') return null;
    let cleanSlug = slug.split('&')[0].toLowerCase();
    let dprItem = dprLinksData.find(item => item[0] === cleanSlug);
    if (dprItem && dprItem[1]) {
        return "https://d.dhamma.gift/_dprhtml/index.html?loc=" + dprItem[1];
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

// 1. Функция, которая отрабатывает при рендере (возвращает пустой контейнер с data-атрибутами)
// Сохраняем оригинальное имя, чтобы не менять код в читалках
function generateThirdPartyLinks(slug, slugReady, texttype, translator) {
    return `<span class="deferred-links-container" 
                  data-slug="${slug}" 
                  data-slugready="${slugReady}" 
                  data-texttype="${texttype}" 
                  data-translator="${translator}">
            </span>`;
}

// 2. Основная функция генерации ссылок (внутренняя сборка HTML)
function buildThirdPartyLinksHTML(slug, slugReady, texttype, translator) {
    let scLink = "";

    // Voice
    scLink += `<a data-slug="${texttype}/${slugReady}" href="javascript:void(0)" title="Text-to-Speech (Alt+R)" class="voice-link">Voice</a> `;

    // 4nt
    let url4nt = typeof get4ntUrl === 'function' ? get4ntUrl(slug) : null;
    if (url4nt) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const sParam = urlParams.get('s');
            
            if (sParam) {
                const parsedUrl = new URL(url4nt, window.location.origin);
                parsedUrl.searchParams.set('s', sParam);
                url4nt = parsedUrl.href;
            }
        } catch (err) {
            console.error('Ошибка при формировании ссылки 4nt:', err);
        }
        
        scLink += `<a target="_blank" class="s4ntLink" title="s.4nt.org" href="${url4nt}">4nt</a> `;
    }

    // DPR
    let dprUrl = typeof getDprUrl === 'function' ? getDprUrl(slug) : null;
    if (dprUrl) scLink += `<a target="_blank" title="Myanmar and Thai Editions at DPR" href="${dprUrl}">DPR</a> `;

    // BJT
    let bjtUrl = typeof getBjtUrl === 'function' ? getBjtUrl(slug) : null;
    if (bjtUrl) scLink += `<a target="_blank" title="Buddha Jayanthi (Sri Lanka Edition at Tipitaka.lk)" href="${bjtUrl}">BJT</a> `;

    // SC
    scLink += `<a target="_blank" title='SuttaCentral.net' href="https://suttacentral.net/${slug}">SC</a> `;
        
    // BB, TBW, Th.ru, Th.su
    const isForceLocal = localStorage.getItem('forceLocal') === 'true';
    const isLocal = window.isLocalHost || isForceLocal;

    if (typeof tbwLinksData !== 'undefined') {
        const hasTbw = tbwLinksData.find(item => Array.isArray(item) ? item[0] === slug : item === slug);
        if (hasTbw) {
            const isBbPath = window.location.pathname.startsWith('/b/');
            if (!isBbPath && isLocal) {
                scLink += ` <a target="" title="BB and Other translations" href="/b/?q=${slug}">BB</a>`;
            }

            const bookMatch = slug.match(/^[a-z]+/);
            const book = bookMatch ? bookMatch[0] : "";

            if (isLocal) {
                scLink += ` <a target="_blank" title="TheBuddhasWords.net (Offline Copy)" href="/bw/${book}/${slug}.html">TBW</a>`;
            } else {
                scLink += ` <a target="_blank" title="TheBuddhasWords.net (Offline Copy)" href="https://thebuddhaswords.net/${book}/${slug}.html">TBW</a>`;
            }
        }
    }

    if (window.isRuPath) {
        if (typeof thruLinksData !== 'undefined') {
            const ruItem = thruLinksData.find(item => item[0] === slug);
            if (ruItem) {
                scLink += ` <a title="Theravada.ru (Offline Copy)" target="_blank" href="/theravada.ru/Teaching/Canon/Suttanta/Texts/${ruItem[1]}">Th.ru</a>`;
            }
        }

        if (isLocal) {
            if (typeof thsuLinksDataoffl !== 'undefined') {
                const suItem = thsuLinksDataoffl.find(item => item[0] === slug);
                if (suItem) scLink += ` <a title="Theravada.su" target="_blank" href="/tipitaka.theravada.su/dn/${suItem[1]}">Th.su</a>`;
            }
        } else {
            if (typeof thsuLinksData !== 'undefined') {
                const suItem = thsuLinksData.find(item => item[0] === slug);
                if (suItem) scLink += ` <a title="Theravada.su" target="_blank" href="https://tipitaka.theravada.su/${suItem[1]}">Th.su</a>`;
            }
        }
    }

    return scLink;
}


// 3. Функция наполнения (Hydration) через MutationObserver
function hydrateThirdPartyLinks() {
    const containers = document.querySelectorAll('.deferred-links-container:not(.hydrated)');
    
    if (containers.length > 0) {
        containers.forEach(container => {
            const slug = container.getAttribute('data-slug');
            const slugReady = container.getAttribute('data-slugready');
            const texttype = container.getAttribute('data-texttype');
            const translator = container.getAttribute('data-translator');
            
            if (slug) {
                container.classList.add('hydrated');
                container.innerHTML = buildThirdPartyLinksHTML(slug, slugReady, texttype, translator);
            }
        });

        // Показываем сразу все ссылки одним кадром
        requestAnimationFrame(() => {
            document
                .querySelectorAll('.sc-link, .deferred-links-container')
                .forEach(el => el.classList.add('links-loaded'));
        });

        return;
    }

    // Если контейнеров еще нет в DOM, запускаем наблюдатель
    const suttaArea = document.getElementById('sutta') || document.body;

    const observer = new MutationObserver((mutations, obs) => {
        const targetContainers = document.querySelectorAll('.deferred-links-container:not(.hydrated)');
        if (targetContainers.length > 0) {
            obs.disconnect(); // Как только появились — останавливаем наблюдатель
            hydrateThirdPartyLinks(); // Запускаем наполнение
        }
    });

    observer.observe(suttaArea, {
        childList: true,
        subtree: true
    });
}
// 4. Привязка обработчиков к стандартным событиям приложения
window.addEventListener('suttaLoaded', hydrateThirdPartyLinks);
window.addEventListener('suttaRenderedCentral', hydrateThirdPartyLinks);



// ==========================================================================
// ПОИСК И ОТРИСОВКА ПРЕДЫДУЩЕЙ И СЛЕДУЮЩЕЙ СУТТЫ
// ==========================================================================

function renderNavigation(slug, slugReady) {
    // Откладываем выполнение, чтобы не блокировать отрисовку основного текста
    requestAnimationFrame(() => {
        setTimeout(() => {
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
                    
                    let currentItem = textInfo[slug] || textInfo[slugReady];
                    let cleanSlug = slug.replace(/pli-tv-|b[ui]-vb-/g, "");
                    let newTitle = cleanSlug; 

                    if (currentItem && currentItem.pi && currentItem.pi.trim() !== "~" && currentItem.pi.trim() !== "") {
                        let cleanPaliName = currentItem.pi.replace(/[0-9.-]/g, '').trim();
                        
                        if (cleanPaliName) {
                            let translatedName = "";
                            
                            if (window.isRuPath && currentItem.ru && currentItem.ru.trim() !== "~") {
                                translatedName = currentItem.ru.replace(/[0-9.-]/g, '').trim();
                            } else if (!window.isRuPath && currentItem.en && currentItem.en.trim() !== "~") {
                                translatedName = currentItem.en.replace(/[0-9.-]/g, '').trim();
                            }

                            if (translatedName) {
                                newTitle = `${cleanPaliName} ${translatedName} ${cleanSlug}`;
                            } else {
                                newTitle = `${cleanPaliName} ${cleanSlug}`;
                            }
                        }
                    }
                    
                    document.title = newTitle;
                    
                    let metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) metaDesc.content = newTitle;
                    let ogTitle = document.querySelector('meta[property="og:title"]');
                    if (ogTitle) ogTitle.content = newTitle;

                    const keys = Object.keys(textInfo);
                    let currentIndex = keys.indexOf(slug);
                    if (currentIndex === -1) currentIndex = keys.indexOf(slugReady);
                    if (currentIndex === -1) return;

                    const next = document.getElementById("next");
                    const next2 = document.getElementById("next2");
                    const previous = document.getElementById("previous");
                    const previous2 = document.getElementById("previous2");

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
        }, 0);
    });
}

// ==========================================================================
// АСИНХРОННЫЙ ПОИСК ДОСТУПНОГО ПЕРЕВОДЧИКА (PHP + ФОЛБЭК НА HEAD ЗАПРОСЫ)
// ==========================================================================

window.siteTranslators = null; // Создаем глобальную переменную для имен

async function getTranslator(texttype, slug, lang = 'ru') {
  // 1. Сначала пробуем PHP-поиск. 
  // Если бэкенд ожидает только slugReady (как в рабочем примере из терминала: mn44):
  let phpUrl = `/read/php/translator-lookup.php?fromjs=${slug}&lang=${lang}`;
  
  // Если вашему PHP всё-таки нужен полный путь, но в другом формате, 
  // поменяйте форму строки выше, например: `${texttype}/${slugReady}` замените на то, что нужно.

  try {
    const phpResponse = await fetch(phpUrl);
    if (phpResponse.ok) {
      const data = await phpResponse.text();
      const trnsResp = data.split(' ');
      if (
        trnsResp[0] &&
        trnsResp[0].trim() !== '' &&
        !trnsResp[0].includes('<')
      ) {
        return trnsResp[0].trim();
      }
    }
  } catch (e) {
    console.log(
      'PHP поиск недоступен или вернул ошибку, переходим к запасному варианту.'
    );
  }

  // 2. Если PHP ничего не вернул, определяем дефолтного переводчика
  let defaultTr = 'o';
  if (lang === 'th') {
    defaultTr = 'siamrath';
  } else if (lang === 'en') {
    defaultTr = 'sujato';
  } else if (lang === 'bb') {
    defaultTr = 'bodhi';
  }

  // 3. Загружаем translators.json только при провале PHP
  let translatorsData = {};
  if (window.siteTranslators) {
    translatorsData = window.siteTranslators;
  } else {
    try {
      const trResp = await fetch('/assets/js/translators.json');
      if (trResp.ok) {
        translatorsData = await trResp.json();
        window.siteTranslators = translatorsData;
      }
    } catch (e) {
      console.log('Файл translators.json не найден.');
      return defaultTr;
    }
  }

  // 4. Клиентский поиск по списку переводчиков из JSON
  const currentListObj = translatorsData[lang] || {};
  const translatorIds = Object.keys(currentListObj);

  if (translatorIds.length === 0) return defaultTr;

  const fetchLang = lang === 'bb' ? 'en' : lang;

  const fetchPromises = translatorIds.map(async (tr) => {
    let testPath =
      fetchLang === 'th'
        ? `/assets/texts/${fetchLang}/translation/${texttype}/${slugReady}_translation-${fetchLang}-${tr}.json`
        : `/assets/texts/${fetchLang}/${texttype}/${slugReady}_translation-${fetchLang}-${tr}.json`;

    const response = await fetch(testPath, { method: 'HEAD' });
    if (response.ok) return tr;
    throw new Error('Not found');
  });

  try {
    let foundTranslator = await Promise.any(fetchPromises);
    return foundTranslator.trim();
  } catch (e) {
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
  //  const isRu = (lang === 'ru');
    
    // Определяем базовые пути в зависимости от языка
    const readPath = window.isRuPath ? '/r/' : '/read/';
    const assetsPath = window.isRuPath ? '/ru/assets/texts/' : '/assets/texts/';
    const mainReadPath = window.isRuPath ? '/ru/read.php' : '/read.php';

    // Локализация текстов
    const t = {
        instructions: window.isRuPath
            ? `Для перехода тексты должны быть указаны с номерами. Пример: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> или <span class="abbr">bi-pj1</span>.<br>Доступны dn, mn, sn, an, некоторые книги kn, обе патимоккхи и виная вибханги.`
            : `Use text indexes for navigation.<br>E.g.: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> or <span class="abbr">bi-ss1</span>.<br>Dn, mn, sn, an, some kn books, both patimokkhas and vinaya vibhanga are available.`,
        mainSuttas: window.isRuPath ? "Основные Сутты" : "Main Suttas",
        otherTexts: window.isRuPath ? "Часть KN" : "Other Texts",
        bhikkhuVinaya: window.isRuPath ? "Бхиккху Виная" : "Bhikkhu Vinaya",
        bhikkhuniVinaya: window.isRuPath ? "Бхиккхуни Виная" : "Bhikkhunī Vinaya",
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

// Логика сдвига кнопки TTS при появлении кнопки ScrollToTop (Оптимизировано)
window.addEventListener('scroll', throttle(function() {
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
}, 150), { passive: true });

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

// Логика кнопки оглавления (TOC) - SPA-защита, слежение, автоцентрирование и свайп
(function() {
    let activeSlug = ''; 
    let cachedTOCNodes = null;
    const isMemoPath = window.location.pathname.includes('/memorize/');

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    window.syncTOCLanguageVisibility = function() {
        const sutta = document.getElementById('sutta');
        const panel = document.getElementById('smart-toc-panel');
        if (!sutta || !panel) return;

        if (isMemoPath) {
            panel.classList.remove('hide-pali', 'hide-english', 'hide-russian', 'hide-thai');
            return;
        }

        const langClasses = ['hide-pali', 'hide-english', 'hide-russian', 'hide-thai'];
        
        langClasses.forEach(cls => {
            if (sutta.classList.contains(cls)) {
                panel.classList.add(cls);
            } else {
                panel.classList.remove(cls);
            }
        });
    };

    function getTOCNodes() {
        if (cachedTOCNodes) {
            return { nodes: cachedTOCNodes };
        }

        const suttaContainer = document.getElementById('sutta');
        if (!suttaContainer) return { nodes: [] };

        const hasInternalHeaders = suttaContainer.querySelector('h3, h4, h5, h6') !== null;
        let selector = 'h1, h2, .endsutta'; 
        if (hasInternalHeaders) {
            selector += ', h3, h4, h5, h6';
        } else {
            selector += ', .speaker, .rule, .subrule, .verse-line, .anapatti, .uddana-intro';
        }

        let standardNodes = Array.from(suttaContainer.querySelectorAll(selector)).filter(el => {
            if (el.classList.contains('verse-line')) {
                const parentBlock = el.closest('blockquote, section');
                if (parentBlock && (parentBlock.querySelector('.uddana-intro') || parentBlock.previousElementSibling?.classList.contains('uddana-intro'))) return false;
                const firstContentBlock = suttaContainer.querySelector('p, blockquote, .rule');
                if (firstContentBlock && (firstContentBlock === parentBlock || firstContentBlock.contains(el))) return false;
                if (el !== parentBlock?.querySelector('.verse-line')) return false; 
            }
            return el.innerText.trim().length > 0;
        });

        const realHeaders = suttaContainer.querySelectorAll('h2, h3, h4, h5, h6');
        const segments = Array.from(suttaContainer.querySelectorAll('span[id]'));
        let fallbackNodes = [];
        
        if (realHeaders.length <= 3 && segments.length > 120 && !hasInternalHeaders) {
            const fractions = [0, 0.25, 0.5, 0.75];
            
            fractions.forEach(frac => {
                let targetIndex = Math.floor(segments.length * frac);
                let found = segments[targetIndex];
                
                for (let i = targetIndex; i < Math.min(targetIndex + 20, segments.length); i++) {
                    if (segments[i].id.match(/\.1$/)) {
                        found = segments[i];
                        break;
                    }
                }
                
                if (found && !fallbackNodes.includes(found) && !standardNodes.includes(found)) {
                    found.dataset.fallback = 'true';
                    fallbackNodes.push(found);
                }
            });
        }

        let combinedNodes = [...standardNodes, ...fallbackNodes];
        combinedNodes.sort((a, b) => {
            if (a === b) return 0;
            if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
                return -1;
            }
            return 1;
        });

        cachedTOCNodes = combinedNodes;
        return { nodes: cachedTOCNodes };
    }

    function syncTOC() {
        const suttaContainer = document.getElementById('sutta');
        const pillLabel = document.getElementById('smart-toc-current');
        const tocPanel = document.getElementById('smart-toc-panel');
        const tocBtn = document.getElementById('smart-toc-btn');

        if (!suttaContainer || !pillLabel) return;

        const urlParams = new URLSearchParams(window.location.search);
        const currentSlug = urlParams.get('q') || '';
        if (activeSlug !== currentSlug) {
            activeSlug = currentSlug;
            cachedTOCNodes = null; 
            if (tocPanel) {
                tocPanel.innerHTML = '';
                tocPanel.classList.remove('active');
            }
        }

        const { nodes: headings } = getTOCNodes();

        if (headings.length === 0) {
            if (tocBtn) tocBtn.classList.add('hidden-toc');
            return;
        } else {
            if (tocBtn) tocBtn.classList.remove('hidden-toc');
        }

        let activeIndex = 0;
        const eyeLevel = window.innerHeight * 0.4;

        for (let i = headings.length - 1; i >= 0; i--) {
            if (headings[i].getBoundingClientRect().top <= eyeLevel) {
                activeIndex = i;
                break;
            }
        }

        const isTh = window.location.pathname.includes('/th/');
        const langClass = window.isRuPath ? '.rus-lang' : (isTh ? '.tha-lang' : '.eng-lang');

        // ОРИГИНАЛЬНАЯ ЛОГИКА ТЕКСТА
        let labelText = '';
        if (isMemoPath) {
            const fullSpan = headings[activeIndex].querySelector('.rus-lang, .eng-lang, .tha-lang');
            labelText = fullSpan ? fullSpan.textContent : headings[activeIndex].innerText;
        } else {
            labelText = headings[activeIndex].innerText;
        }

        if (headings[activeIndex].tagName.startsWith('H')) {
            labelText = labelText.replace(/\s+/g, ' ').trim();
            if (headings[activeIndex].classList.contains('inserted-heading')) {
               let tSpan = headings[activeIndex].querySelector(langClass) || headings[activeIndex].querySelector('.eng-lang');
               if (tSpan) labelText = tSpan.textContent.trim();
            }
            pillLabel.textContent = capitalize(labelText);
        } else if (headings[activeIndex].classList.contains('endsutta') || headings[activeIndex].classList.contains('uddana-intro')) {
            let tSpan = headings[activeIndex].querySelector(langClass) || headings[activeIndex].querySelector('.eng-lang') || headings[activeIndex].querySelector('.pli-lang');
            labelText = tSpan ? tSpan.textContent.replace(/[()\[\]"“”«»'‘’]/g, '').trim() : labelText.replace(/[()\[\]"“”«»'‘’]/g, '').trim();
            pillLabel.textContent = capitalize(labelText);
        } else {
            pillLabel.textContent = capitalize(labelText.split('\n')[0].trim());
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

        const { nodes: elements } = getTOCNodes();
        tocPanel.innerHTML = '';

        let lastSpeakerText = '';
        let lastPoemBlock = null;
        let currentLevel = 2; 
        const firstContentBlock = suttaContainer.querySelector('p, blockquote, .rule');

        elements.forEach((el) => {
            let text = el.innerText.replace(/[()\[\]"“”«»'‘’]/g, '').replace(/\s+/g, ' ').trim();
            if (!text) return;

            if (el.tagName.startsWith('H')) {
                currentLevel = parseInt(el.tagName.substring(1));
            }

            let tocClassType = 'h' + currentLevel;
            let extraClass = '';

            const isThPath = window.location.pathname.includes('/th/');
            const targetLang = window.isRuPath ? 'rus-lang' : (isThPath ? 'tha-lang' : 'eng-lang');

            if (el.classList.contains('inserted-heading')) {
                let span = el.querySelector('.' + targetLang) || el.querySelector('.eng-lang');
                let displayText = span ? span.textContent.replace(/[()\[\]"“”«»'‘’]/g, '').replace(/\s+/g, ' ').trim() : text;

                const item = document.createElement('div');
                item.className = `toc-item toc-${tocClassType}`;
                item.textContent = capitalize(displayText); 
                item.onclick = (e) => {
                    e.stopPropagation();
                    tocPanel.classList.remove('active');
                    const offset = 120;
                    const targetY = window.pageYOffset + el.getBoundingClientRect().top - offset;
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                    if (typeof window.activateSegmentForTTS === 'function') window.activateSegmentForTTS(el);
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
                if (parentBlock && (parentBlock.querySelector('.uddana-intro') || parentBlock.previousElementSibling?.classList.contains('uddana-intro'))) return;
                if (parentBlock && parentBlock === lastPoemBlock) return;
                lastPoemBlock = parentBlock;
                if (firstContentBlock && (firstContentBlock === parentBlock || firstContentBlock.contains(el))) return;
                extraClass = ' toc-v-line';
                if (!isMemoPath) {
                    isCustomMultiLang = true;
                    const getFirstWord = (langClass) => {
                        const span = el.querySelector('.' + langClass);
                        if (span) {
                            let cleanText = span.textContent.replace(/[()\[\]"“”«»'‘’:;]/g, '').replace(/\s+/g, ' ').trim();
                            const words = cleanText.split(/[\s,.;:!?]/);
                            let label = words[0] || '';
                            if (label.length <= 3 && words.length > 1) label += ' ' + words[1];
                            return label;
                        }
                        return '';
                    };
                    customLangData = {
                        pli: 'Gāthā' + (getFirstWord('pli-lang') ? ` ${getFirstWord('pli-lang')}...` : ''),
                        rus: 'Гатха' + (getFirstWord('rus-lang') ? ` ${getFirstWord('rus-lang')}...` : ''),
                        eng: 'Gatha' + (getFirstWord('eng-lang') ? ` ${getFirstWord('eng-lang')}...` : ''),
                        tha: 'คาถา' + (getFirstWord('tha-lang') ? ` ${getFirstWord('tha-lang')}...` : '')
                    };
                }
            } else if (el.classList.contains('rule') || el.classList.contains('subrule')) {
                extraClass = ' toc-rule';
            } else if (el.classList.contains('anapatti')) {
                extraClass = ' toc-anapatti';
                if (!isMemoPath) {
                    isCustomMultiLang = true;
                    customLangData = { pli: 'Anāpatti', rus: 'Без вины', eng: 'Non-offense', tha: 'อนาปัตти' };
                }
            } else if (el.classList.contains('uddana-intro')) {
                tocClassType = 'h1';
                extraClass = ' toc-uddana';
                if (!isMemoPath) {
                    isCustomMultiLang = true;
                    customLangData = { pli: 'Tassuddānaṁ', rus: 'Содержание', eng: 'Summary', tha: 'สรุป' };
                }
            } else if (el.classList.contains('endsutta')) {
                tocClassType = 'h1';
                extraClass = ' toc-endsutta';
            }

            const item = document.createElement('div');
            item.className = `toc-item toc-${tocClassType}${extraClass}`;

            const scrollAndHighlight = (targetElement) => {
                tocPanel.classList.remove('active');
                const offset = 120;
                let scrollTarget = targetElement;
                if (!scrollTarget.offsetParent || scrollTarget.getBoundingClientRect().height === 0) {
                    scrollTarget = scrollTarget.closest('[id]') || scrollTarget.parentElement || scrollTarget;
                }
                const targetY = window.pageYOffset + scrollTarget.getBoundingClientRect().top - offset;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                if (typeof window.activateSegmentForTTS === 'function') window.activateSegmentForTTS(targetElement);
            };

            if (isCustomMultiLang) {
                let targetLangText = window.isRuPath ? customLangData.rus : (isThPath ? customLangData.tha : customLangData.eng);
                const langs = [{ cls: 'pli-lang', txt: customLangData.pli }, { cls: targetLang, txt: targetLangText }];
                langs.forEach(l => {
                    const span = document.createElement('span');
                    span.className = l.cls;
                    span.textContent = capitalize(l.txt) + ' '; 
                    span.onclick = (e) => { e.stopPropagation(); scrollAndHighlight(el); };
                    item.appendChild(span);
                });
            } else {
                const langSpans = el.querySelectorAll('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
                if (langSpans.length > 0) {
                    langSpans.forEach(originalSpan => {
                        if (isMemoPath && originalSpan.classList.contains('pli-lang')) return;
                        const clone = originalSpan.cloneNode(true);
                        clone.querySelectorAll('.copyLink, .copyLink-start, .variant').forEach(child => child.remove());
                        let cleanText = clone.textContent.replace(/[()\[\]"“”«»'‘’]/g, '').replace(/\s+/g, ' ').trim();
                        if (cleanText) {
                            if (el.dataset.fallback === 'true') {
                                let words = cleanText.split(/\s+/);
                                if (words.length > 8) cleanText = words.slice(0, 8).join(' ') + '...';
                            }
                            clone.textContent = capitalize(cleanText) + ' '; 
                            clone.onclick = (e) => { e.stopPropagation(); scrollAndHighlight(originalSpan); };
                            item.appendChild(clone);
                        }
                    });
                } else {
                    if (el.dataset.fallback === 'true') {
                        let words = text.split(/\s+/);
                        if (words.length > 8) text = words.slice(0, 8).join(' ') + '...';
                    }
                    item.textContent = capitalize(text);
                    item.onclick = () => scrollAndHighlight(el);
                }
            }
            if (item.innerHTML.trim() !== '' || item.textContent.trim() !== '') tocPanel.appendChild(item);
        });

        if (typeof window.syncTOCLanguageVisibility === 'function') window.syncTOCLanguageVisibility();
        syncTOC();
    }

    function initSwipeGestures() {
        const panel = document.getElementById('smart-toc-panel');
        if (!panel) return;

        let startX = 0, startY = 0;
        let isDragging = false;

        const handleStart = (x, y) => {
            startX = x;
            startY = y;
            isDragging = true;
        };

        const handleEnd = (x, y) => {
            if (!isDragging) return;
            isDragging = false;
            const xDiff = x - startX;
            const yDiff = y - startY;

            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
                panel.classList.remove('active');
            }
        };

        panel.addEventListener('touchstart', (e) => handleStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });
        panel.addEventListener('touchend', (e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });

        panel.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY), { passive: true });
        window.addEventListener('mouseup', (e) => {
            if (isDragging) handleEnd(e.clientX, e.clientY);
        }, { passive: true });
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#smart-toc-btn');
        const panel = document.getElementById('smart-toc-panel');
        const gearPanel = document.getElementById('smart-panel');

        if (btn) {
            e.stopPropagation();
            if (panel.innerHTML.trim() === '') buildFullTOC();
            if (typeof window.syncTOCLanguageVisibility === 'function') window.syncTOCLanguageVisibility();

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

    window.addEventListener('suttaLoaded', () => { activeSlug = ''; cachedTOCNodes = null; syncTOC(); });
    window.addEventListener('dgSuttaRendered', () => { activeSlug = ''; cachedTOCNodes = null; syncTOC(); });
    window.addEventListener('scroll', throttle(() => syncTOC(), 150), { passive: true });
    
    document.addEventListener('DOMContentLoaded', initSwipeGestures);

})();


function generateLanguageLinks(modes = ['ru', 'en']) {
    const labels = {
        'ru': { text: 'Ru', title: 'Русский' },
        'en': { text: 'En', title: 'Английский' },
        'th': { text: 'Th', title: 'Тайский' },
        'ml': { text: 'R+E', title: 'Русский + Английский' },
        'rev': { text: 'R+R', title: 'Два русских перевода' }
    };
    
    let html = '';
    for (let mode of modes) {
        if (labels[mode]) {
            html += `<a href="#" class="btn-language" data-lang="${mode}" title="${labels[mode].title} (Alt+1)">${labels[mode].text}</a>&nbsp;`;
        }
    }
    return html;
}


window.handleFetchError = function(slug, isRussian) {
    const suttaArea = document.getElementById("sutta");
    if (!suttaArea) return;

    const decodedSlug = decodeURIComponent(slug);
    
    // Защита от бесконечных редиректов
    const redirectKey = `redirect_${slug}`;
    const redirectCount = parseInt(localStorage.getItem(redirectKey) || 0);
    
    if (redirectCount >= 3) {
        console.error('Exceeded maximum redirects for slug:', slug);
        
        const errorMsg = window.isRuPath 
            ? `<p>Поиск "${decodedSlug}" не удался. Пожалуйста, попробуйте другой запрос.</p>
               <div class="spinner-border" role="status"><span class="visually-hidden">Загрузка...</span></div>
               <br><br><p>Подсказка: <br>С главной страницы доступно больше настроек поиска.</p>`
            : `<p>Search for "${decodedSlug}" failed. Please try another slug.</p>
               <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
               <br><br><p>Note: <br>More search options available from the main page.</p>`;
               
        suttaArea.innerHTML = errorMsg;
        localStorage.removeItem(redirectKey);
        return;
    }

    localStorage.setItem(redirectKey, redirectCount + 1);

const prefix = window.isRuPath ? "/ru" : "";


    // Фолбэк-поиск через XHR
    var xhr = new XMLHttpRequest();
    xhr.open("GET", prefix + "/?p=-kn&q=" + encodeURIComponent(slug), true);
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    xhr.setRequestHeader("Referer", window.location.href);
    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                if (!xhr.responseText.includes("Page not found") && 
                    !xhr.responseText.includes("404") &&
                    xhr.responseText.trim().length > 0) {
                    window.location.href = prefix + "/?p=-kn&q=" + encodeURIComponent(slug);
                } else {
                    console.log('Page not found or empty response');
                }
            } else if (xhr.status == 404) {
                console.log('Error 404: Page not found');
            } else {
                console.log('Error sending request. Status:', xhr.status);
            }
        }
    };
    
    const loadingMsg = window.isRuPath
        ? `<p>Идёт Поиск "${decodedSlug}". Пожалуйста, Ожидайте.</p>
           <div class="spinner-border" role="status"><span class="visually-hidden">Загрузка...</span></div>
           <p>Подсказка: <br>С главной страницы доступно больше настроек поиска.<br></p>`
        : `<p>Searching for "${decodedSlug}". Please wait.</p>
           <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
           <p>Hint: <br>More search options are available from the main page.<br></p>`;
           
    suttaArea.innerHTML = loadingMsg;
};


window.applyRemovePunct = function(dataObj, segment) {
    if (localStorage.getItem("removePunct") === "true" && dataObj && dataObj[segment] !== undefined) {
        dataObj[segment] = dataObj[segment].replace(/[-—–]/g, ' ')
                                           .replace(/[:;“”‘’,"']/g, '')
                                           .replace(/[.?!]/g, ' | ');
    }
};


// ==========================================================================
// УМНЫЙ ПЕРЕХОД МЕЖДУ РЕЖИМАМИ (СОХРАНЕНИЕ ПОЗИЦИИ И TTS)
// ==========================================================================

let dg_lastActiveWordId = null;

function captureActiveWord() {
    const activeWord = document.querySelector('.active-word');
    if (activeWord) {
        // Ищем ID у самого элемента или его родителя
        const elementWithId = activeWord.id ? activeWord : activeWord.closest('[id]');
        if (elementWithId && elementWithId.id) {
            const id = elementWithId.id;
            // Жестко отсекаем технические контейнеры и берем только якоря текста
            if (!id.includes('links-container') && !id.includes('trn') && id !== 'sutta') {
                dg_lastActiveWordId = id;
                return;
            }
        }
    }
    dg_lastActiveWordId = null;
}

// Перехват до снятия выделения
document.addEventListener('mousedown', captureActiveWord, true);
document.addEventListener('touchstart', captureActiveWord, { capture: true, passive: true });

// Глобальный перехватчик переходов
document.addEventListener('click', function(event) {
    const btnLang = event.target.closest('.btn-language');
    const anchor = event.target.closest('a');

    const currentUrl = new URL(window.location.href);
    const currentQ = currentUrl.searchParams.get('q');

    if (!currentQ) return;

    let targetUrl = null;

    if (btnLang) {
        event.preventDefault();
        const targetLang = btnLang.getAttribute('data-lang');
        if (!targetLang) return;

        let newPath = '';
        if (targetLang === 'en') newPath = '/read/';
        else if (targetLang === 'ru') newPath = '/r/';
        else if (targetLang === 'th') newPath = '/th/read/';
        else if (targetLang === 'ml') newPath = '/ml/';
        else if (targetLang === 'rev') newPath = '/rev/';
        else return;

        targetUrl = new URL(currentUrl.origin + newPath + currentUrl.search);
    }
    else if (anchor && anchor.href) {
        try {
            const linkUrl = new URL(anchor.href);
            if (linkUrl.origin === currentUrl.origin &&
                linkUrl.searchParams.get('q') === currentQ &&
                linkUrl.pathname !== currentUrl.pathname) {

                if (anchor.target === '_blank') return;

                event.preventDefault();
                targetUrl = new URL(linkUrl.href);
            }
        } catch(e) {}
    }

    if (targetUrl) {
        // 1. Исключительный приоритет: восстанавливаем активный TTS
        if (dg_lastActiveWordId) {
            targetUrl.hash = '#' + dg_lastActiveWordId;
        } 
        // 2. Штатное поведение: прокидываем старый хэш (если TTS не было)
        else if (currentUrl.hash) {
            targetUrl.hash = currentUrl.hash;
        }

        sessionStorage.removeItem('dg_temp_tts_restore');
        window.location.href = targetUrl.toString();
    }
});

// ==========================================
// ИКОНКИ АУДИО И ПОДЕЛИТЬСЯ ДЛЯ СТРОКИ 0.1
// ==========================================
function addIconsTo01() {
    const segment01 = document.getElementById('0.1');
    if (!segment01) return;

    if (segment01.classList.contains('icons-added')) return;
    segment01.classList.add('icons-added');

    const langSpans = segment01.querySelectorAll('.pli-lang, .rus-lang, .eng-lang, .tha-lang');

    langSpans.forEach((span, index) => {
        // Если это первый доступный язык (любой), он главный. Остальные скрыты по умолчанию.
        const hideClass = index === 0 ? '' : 'trn-title-icon';

        // 1. Убираем стартовые якоря, они здесь не нужны
        const copyStarts = span.querySelectorAll('.copyLink-start');
        copyStarts.forEach(el => el.remove());

        // 2. Находим конечную ссылку и вешаем классы для CSS
        const oldLinks = span.querySelectorAll('.copyLink');
        if (oldLinks.length > 0) {
            const shareLink = oldLinks[oldLinks.length - 1]; 
            
            shareLink.classList.add('copy-Link-special');
            if (hideClass) {
                shareLink.classList.add(hideClass);
            }
            
            // Вставляем SVG вместо текста и прячем от TTS
            shareLink.innerHTML = '<img src="/assets/svg/link-solid-full.svg" class="title-svg-icon" alt="" aria-hidden="true">';
            
            // Удаляем дубликаты
            for (let i = 0; i < oldLinks.length - 1; i++) {
                oldLinks[i].remove();
            }
        }

        // 3. Добавляем SVG Play в начало
        const playBtn = document.createElement('span');
        playBtn.className = hideClass ? `title-play-btn ${hideClass}` : 'title-play-btn';
        playBtn.innerHTML = '<img src="/assets/svg/volume-solid-full.svg" class="title-svg-icon" alt="" aria-hidden="true">';
        
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.activateSegmentForTTS === 'function') {
                window.activateSegmentForTTS(span);
                
                const playerContainer = document.getElementById('voice-player-container');
                const isPlayerActive = playerContainer && playerContainer.classList.contains('active');

                if (isPlayerActive) {
                    const mainPlayBtn = playerContainer.querySelector('.play-main-button');
                    if (mainPlayBtn) mainPlayBtn.click();
                } else if (!window.isVoiceScriptLoaded && typeof window.loadVoiceScripts === 'function') {
                    window.loadVoiceScripts(() => {
                        const dynamicBtn = document.querySelector('.dynamic-tts-btn');
                        if (dynamicBtn) dynamicBtn.click();
                    });
                } else {
                    const dynamicBtn = document.querySelector('.dynamic-tts-btn');
                    if (dynamicBtn) dynamicBtn.click();
                }
            }
        });
        
        span.insertBefore(playBtn, span.firstChild);
    });
}


// Привязываем выполнение к стандартным событиям окончания загрузки сутты
window.addEventListener('suttaLoaded', addIconsTo01);
window.addEventListener('suttaRenderedCentral', addIconsTo01);


//Smart link in each line
document.addEventListener('DOMContentLoaded', () => {
  // Определяем глобальную (для этого блока) переменную среды

  // Определяем язык интерфейса по URL
  const path = window.location.pathname;
  
  const labels = {
    quote: window.isRuPath ? 'Цитата' : 'Quote',
    link: window.isRuPath ? 'Ссылка' : 'Link',
    audio: window.isRuPath ? 'Слушать' : 'Voice',
    bookmark: window.isRuPath ? 'Избранное' : 'Bookmark',
    memo: window.isRuPath ? 'Запомнить' : 'Memorize',
    compare: window.isRuPath ? 'Сравнить' : 'Compare'
  };

  // 1. Создаем HTML структуру меню
  const menuHtml = `
    <div id="segment-context-menu" class="segment-menu-hidden">
      <ul>
        <li id="sm-quote"><img src="/assets/svg/copy.svg" class="menu-icon" alt=""> ${labels.quote}</li>
        <li id="sm-link"><img src="/assets/svg/copy.svg" class="menu-icon" alt=""> ${labels.link}</li>
        <li id="sm-audio"><img src="/assets/svg/play.svg" class="menu-icon" alt=""> ${labels.audio}</li>
        <li id="sm-bookmark"><img src="/assets/svg/star-black.svg" class="menu-icon" alt=""> ${labels.bookmark}</li>
        <li id="sm-memo"><img src="/assets/svg/memo-black.svg" class="menu-icon" alt=""> ${labels.memo}</li>
        <li id="sm-compare"><img src="/assets/svg/code-compare-solid-full.svg" class="menu-icon" alt=""> ${labels.compare}</li>
      </ul>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', menuHtml);

  const menu = document.getElementById('segment-context-menu');
  let currentContext = null;

  // 2. Открытие меню по клику на .copyLink
  document.addEventListener('click', (e) => {
    // ... [ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ] ...
    if (e.isSimulated) return;

    const copyBtn = e.target.closest('.copyLink');

    if (copyBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const memoBtn = document.getElementById('sm-memo');
      if (memoBtn) {
        const isMeditate = Math.random() > 0.5;
        const textRu = isMeditate ? 'Медитировать' : 'Запомнить';
        const textEn = isMeditate ? 'Meditate' : 'Memorize';
        memoBtn.innerHTML = `<img src="/assets/svg/memo-black.svg" class="menu-icon" alt=""> ${window.isRuPath ? textRu : textEn}`;
      }

      const parentSpan = copyBtn.closest('span[id]');
      if (!parentSpan) return;

      const onclickAttr = copyBtn.getAttribute('onclick') || '';
      const urlMatch = onclickAttr.match(/copyToClipboard\('([^']*)'\)/);
      let rawUrl = urlMatch ? urlMatch[1] : window.location.href;

      currentContext = {
        element: copyBtn,
        parentSpan: parentSpan,
        url: rawUrl,
        hash: parentSpan.id.toLowerCase()
      };

      menu.style.left = '-9999px';
      menu.style.top = '-9999px';
      menu.classList.remove('segment-menu-hidden');

      const btnRect = copyBtn.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();

      const offsetTop = 25; 
      const offsetLeft = 0; 

      let left = btnRect.left + offsetLeft;
      let top = btnRect.top + window.scrollY + offsetTop;

      if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width - 10;
      }

      if (top + menuRect.height > window.innerHeight + window.scrollY) {
        top = btnRect.top + window.scrollY - menuRect.height - 10;
      }

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;

      return;
    }

    if (!menu.contains(e.target)) {
      menu.classList.add('segment-menu-hidden');
    }
  }, true); 

  // 3. Логика кнопок меню

  // --- ЦИТАТА ---
  document.getElementById('sm-quote').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.add('segment-menu-hidden');
    if (!currentContext) return;

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    clickEvent.isSimulated = true;
    currentContext.element.dispatchEvent(clickEvent);
  });

  // --- ССЫЛКА ---
  document.getElementById('sm-link').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.add('segment-menu-hidden');
    if (!currentContext) return;

    try {
      const baseUrl = new URL(currentContext.url);
      if (baseUrl.searchParams.has('q')) {
        baseUrl.searchParams.set('q', baseUrl.searchParams.get('q').toLowerCase());
      }
      baseUrl.hash = currentContext.hash;
      let finalUrl = baseUrl.href;

      if (window.isLocalHost) {
        finalUrl = finalUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/gi, 'https://dhamma.gift');
      }

      navigator.clipboard.writeText(finalUrl).then(() => {
        if (typeof showBubbleNotification === 'function') {
          showBubbleNotification(window.isRuPath ? "Ссылка скопирована" : "Link copied");
        }
      });
    } catch (err) {
      console.error('URL parse error', err);
    }
  });

  // --- АУДИО ---
  document.getElementById('sm-audio').addEventListener('click', (e) => {
    // ... [ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ] ...
    e.stopPropagation();
    menu.classList.add('segment-menu-hidden');
    if (!currentContext) return;

    const targetLangSegment = currentContext.element.closest('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
    
    if (targetLangSegment && typeof window.activateSegmentForTTS === 'function') {
      window.activateSegmentForTTS(targetLangSegment);

      const playerContainer = document.getElementById('voice-player-container');
      const isPlayerActive = playerContainer && playerContainer.classList.contains('active');

      if (isPlayerActive) {
        const playBtn = playerContainer.querySelector('.play-main-button');
        if (playBtn) playBtn.click();
      } else if (!window.isVoiceScriptLoaded && typeof window.loadVoiceScripts === 'function') {
        window.loadVoiceScripts(() => {
            const dynamicBtn = document.querySelector('.dynamic-tts-btn');
            if (dynamicBtn) dynamicBtn.click();
        });
      } else {
        const dynamicBtn = document.querySelector('.dynamic-tts-btn');
        if (dynamicBtn) dynamicBtn.click();
      }
    }
  });

  // --- ЗАКЛАДКА ---
  document.getElementById('sm-bookmark').addEventListener('click', (e) => {
    // ... [ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ] ...
    e.stopPropagation();
    menu.classList.add('segment-menu-hidden');
    if (!currentContext) return;

    if (typeof toggleFavoriteGlobal === 'function') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');

      const targetLangSegment = currentContext.element.closest('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
      const fallbackSpan = currentContext.parentSpan.querySelector('.rus-lang, .eng-lang, .tha-lang') || currentContext.parentSpan.querySelector('.pli-lang');
      const textSpan = targetLangSegment || fallbackSpan;
      
      let textSnippet = textSpan ? textSpan.textContent.replace(/[✦]/g, '').trim().substring(0, 40) + '...' : currentContext.hash;

      const uniqueLineSlug = `${q}#${currentContext.hash}`;

      const bookmarkData = {
        slug: uniqueLineSlug, 
        id: currentContext.hash,
        title: `${q} - ${textSnippet}`,
        path: window.location.pathname,
        search: window.location.search + '#' + currentContext.hash,
        timestamp: Date.now()
      };

      toggleFavoriteGlobal(bookmarkData);
    }
  });

  // --- MEMO (ЗАПОМИНАНИЕ) ---
  document.getElementById('sm-memo').addEventListener('click', (e) => {
    // ... [ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ] ...
    e.stopPropagation();
    menu.classList.add('segment-menu-hidden');
    if (!currentContext) return;

    const suttaContainer = document.getElementById('sutta') || document;
    const targetLangSegment = currentContext.element.closest('.pli-lang, .rus-lang, .eng-lang, .tha-lang');
    
    let targetSelector = '.pli-lang';
    if (targetLangSegment) {
        if (targetLangSegment.classList.contains('rus-lang')) targetSelector = '.rus-lang';
        else if (targetLangSegment.classList.contains('eng-lang')) targetSelector = '.eng-lang';
        else if (targetLangSegment.classList.contains('tha-lang')) targetSelector = '.tha-lang';
    }

    let allValidElements = Array.from(suttaContainer.querySelectorAll(targetSelector));
    
    if (allValidElements.length === 0) {
        allValidElements = Array.from(suttaContainer.querySelectorAll('p, h1, h2, h3, h4, li, blockquote'));
    }

    allValidElements = allValidElements.filter(el => 
        el.offsetParent !== null && !el.closest('.tts-ignore, nav, footer, .input-group')
    );

    const segmentId = currentContext.parentSpan.id;
    let startIndex = allValidElements.findIndex(el => el.id === segmentId || el.closest(`[id="${segmentId}"]`));
    
    let textToPass = '';
    const MAX_CHARS = 1200;
    const URL_MAX_LENGTH = 1500;

    if (startIndex !== -1) {
        let currentLength = 0;
        let textArr = [];
        for (let i = startIndex; i < allValidElements.length; i++) {
            let text = (allValidElements[i].innerText || allValidElements[i].textContent).replace(/✦/g, '').trim();
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

    const baseUrl = window.isRuPath ? '/ru/memo/' : '/memo/';

    if (textToPass) {
        if (textToPass.length <= URL_MAX_LENGTH) {
            localStorage.removeItem('currentMemoText'); 
            window.open(`${baseUrl}?text=${encodeURIComponent(textToPass)}`, '_blank');
        } else {
            localStorage.setItem('currentMemoText', textToPass);
            window.open(baseUrl, '_blank');
        }
    } else {
        localStorage.removeItem('currentMemoText');
        window.open(baseUrl, '_blank');
    }
  });

// --- СРАВНИТЬ (COMPARE) - ЛОКАЛЬНАЯ И ОНЛАЙН ВЕРСИИ ---
  document.getElementById('sm-compare').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.add('segment-menu-hidden');
    if (!currentContext) return;

    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get('q');
    const sParam = urlParams.get('s');

    if (!slug) return;
    
    slug = slug.split('&')[0].toLowerCase();

    if (typeof get4ntUrl === 'function') {
      let url4nt = get4ntUrl(slug);

      if (url4nt) {
        try {
          const anchorBase = url4nt.split('#')[1] || slug;
          const urlWithoutHash = url4nt.split('#')[0];
          
          // Единый объект URL для надежной работы с параметрами
          const parsedUrl = new URL(urlWithoutHash, window.location.origin);

          // Настраиваем хост и пути для онлайн-версии
          if (!window.isLocalHost) {
            parsedUrl.protocol = 'https:';
            parsedUrl.hostname = 's.dhamma.gift';
            parsedUrl.pathname = parsedUrl.pathname.replace(/^\/4nt/, '');
          }

          // Добавляем параметры запроса
          const newParams = new URLSearchParams();
          newParams.set('cols', 'pali,pali_royal_iast,pali_myanmar_iast,pali_bjt_iast');
          
          if (sParam) {
            newParams.set('s', sParam);
          }
          
          parsedUrl.search = newParams.toString();
          
          // Логика формирования хэша в зависимости от наличия диапазона
          if (slug.includes('-')) {
              // Для диапазонов (an1.11-20) используем только ID строки (an1.12:1.2)
              parsedUrl.hash = `#tr-${currentContext.hash}`;
          } else {
              // Для обычных сутт (mn1) используем классическую склейку (mn1:1.2)
              parsedUrl.hash = `#tr-${anchorBase}:${currentContext.hash}`;
          }

          window.open(parsedUrl.href, '_blank');
        } catch (err) {
          console.error('Ошибка при формировании ссылки для сравнения:', err);
        }
      } else {
        console.warn('Функция get4ntUrl не вернула ссылку для slug:', slug);
      }
    } else {
      console.error('Функция get4ntUrl не определена на странице.');
    }
  });  
});

