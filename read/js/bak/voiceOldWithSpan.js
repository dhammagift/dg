/// --- Конфигурация путей ---
const makeJsonUrl = (slug) => {
  const basePath = '/assets/texts/devanagari/root/pli/ms/';
  const suffix = '_rootd-pli-ms.json';
  const fullPath = `${basePath}${slug}${suffix}`;
  return fullPath;
};

// --- Глобальное состояние ---
let wakeLock = null; 

const SCROLL_STORAGE_KEY = 'tts_auto_scroll'; 
const MODE_STORAGE_KEY = 'tts_preferred_mode';

const RATE_PALI_KEY = 'tts_rate_pali'; 
const RATE_TRN_KEY = 'tts_rate_trn';

const LAST_SLUG_KEY = 'tts_last_slug';   
const LAST_INDEX_KEY = 'tts_last_index'; 
const PALI_ALERT_KEY = 'tts_pali_alert_shown';

// ! ИЗМЕНЕНИЕ: Добавлен коэффициент нормализации для Пали
// В UI будет 1.0, а в движок пойдет 1.0 * 0.5 = 0.5
const PALI_RATIO = 0.5; 

const RATES_PALI = [0.25, 0.5, 0.6, 0.8, 1.0, 1.25, 1.5];
const RATES_TRN = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5];

const ttsState = {
  playlist: [],
  currentIndex: 0,
  button: null,
  speaking: false,
  paused: false,
  utterance: null,
  langSettings: null,
  autoScroll: localStorage.getItem(SCROLL_STORAGE_KEY) !== 'false', 
  currentSlug: null,
  isNavigating: false 
};

const synth = window.speechSynthesis;

// --- Утилиты ---

function updateRateOptions(isPali, activeRate) {
  const rateSelect = document.getElementById('tts-rate-select');
  if (!rateSelect) return;

  const ratesToUse = isPali ? RATES_PALI : RATES_TRN;
  
  let displayRates = [...ratesToUse];
  // Используем activeRate (это UI значение, например 1.0)
  if (!displayRates.includes(activeRate)) {
    displayRates.push(activeRate);
    displayRates.sort((a, b) => a - b);
  }

  const optionsHtml = displayRates.map(r => 
    `<option value="${r}" ${r === activeRate ? 'selected' : ''}>${r}x</option>`
  ).join('');

  if (rateSelect.innerHTML !== optionsHtml) {
    rateSelect.innerHTML = optionsHtml;
  }
  
  rateSelect.value = activeRate;
}

function getRateForLang(lang) {
  if (lang === 'pi-dev') {
    // ! ИЗМЕНЕНИЕ: Дефолт теперь 1.0 (как и у перевода)
    // Мы сохраняем "визуальную" скорость. Реальное замедление будет в playCurrentSegment.
    return parseFloat(localStorage.getItem(RATE_PALI_KEY)) || 1.0; 
  } else {
    return parseFloat(localStorage.getItem(RATE_TRN_KEY)) || 1.0; 
  }
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released');
      });
      console.log('Wake Lock active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
}

async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock released manually');
  }
}

function clearTtsStorage() {
  localStorage.removeItem(LAST_SLUG_KEY);
  localStorage.removeItem(LAST_INDEX_KEY);
  console.log('TTS Storage cleared (end of track reached)');
}

function cleanTextForTTS(text) {
  if (!text) return "";
  return text
    .replace(/[Пп]ер\./g, 'Перевод') 
    .replace(/Англ,/g, 'английского,') 
    .replace(/[Рр]ед\./g, 'отредактировано') 
    .replace(/Trn:/g, 'Translated by') 
    .replace(/Pāḷi MS/g, 'पालि महासङ्गीति')
    .replace(/”/g, '')
	//pan into pana
    .replace(/ पन[\.:, ]/g, 'पना ') 
    //.replace(/ पन /g, 'पना ') 
	//ss s mm m into ssa sa mma ma 
    .replace(/स्स[\.:, ]/g, 'स्सा ')
    .replace(/स[\.:, ]/g, 'सा ')
    .replace(/म्म[\.:, ]/g, 'म्मा ')
    .replace(/म[\.:, ]/g, 'मा ')
	//f into ph  
	.replace(/फस्स/g, 'प्हस्स')
	.replace(/फ/g, 'प्ह')

    .replace(/…पे…/g, '…पेय्याल…')
    .replace(/’ति/g, 'ति')
    .replace(/\{.*?\}/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/_/g, '').trim();
}

function setButtonIcon(type) {
  const allImgs = document.querySelectorAll('.play-main-button img');
  allImgs.forEach(img => {
    img.src = (type === 'pause') ? '/assets/svg/pause-grey.svg' : '/assets/svg/play-grey.svg';
  });
}

function resetUI() {
  document.querySelectorAll('.tts-active').forEach(el => el.classList.remove('tts-active'));
}

async function fetchSegmentsData(slug) {
  try {
    const response = await fetch(makeJsonUrl(slug));
    return response.ok ? await response.json() : null;
  } catch (e) { 
    console.warn(`Не удалось загрузить JSON для ${slug}`, e);
    return null; 
  }
}

function detectTranslationLang() {
  const path = window.location.pathname;
  
  // if (path.match(/\/d\/|\/memorize\//)) return 'pi-dev'; 
  if (path.includes('/th/') || path.includes('/thml/')) return 'th';
  if (path.includes('/en/') || path.includes('/b/') || path.includes('/read/')) return 'en';
  return 'ru';
}

function getElementId(el) {
  return el.id || el.closest('[id]')?.id;
}

async function prepareTextData(slug) {
  const container = document.querySelector('.sutta-container') || document;
  
  const paliElements = container.querySelectorAll('.pli-lang');
  const translationElements = container.querySelectorAll('.rus-lang, .tha-lang, .eng-lang');
  
  const paliJsonData = await fetchSegmentsData(slug);
  const cleanJsonMap = {};
  
  if (paliJsonData) {
    Object.keys(paliJsonData).forEach(key => {
      const cleanKey = key.split(':').pop();
      const rawText = paliJsonData[key].replace(/<[^>]*>/g, '').trim(); 
      cleanJsonMap[cleanKey] = cleanTextForTTS(rawText); 
    });
  }

  const allIds = new Set();
  const allNodesInOrder = container.querySelectorAll('.pli-lang, .rus-lang, .tha-lang, .eng-lang');
  
  allNodesInOrder.forEach(el => {
    const id = getElementId(el);
    if (id) allIds.add(id);
  });
  
  const textData = [];
  
  allIds.forEach(id => {
    const paliElement = Array.from(paliElements).find(el => getElementId(el) === id);
    const translationElement = Array.from(translationElements).find(el => getElementId(el) === id);
    
    let paliDev = '';
    let translation = '';
    
    if (cleanJsonMap[id]) {
      paliDev = cleanJsonMap[id].replace(/<[^>]*>/g, '').trim();
    }
    
    if (translationElement) {
      const clone = translationElement.cloneNode(true);
      clone.querySelectorAll('.variant, .not_translate, sup, .ref').forEach(v => v.remove());
      translation = cleanTextForTTS(clone.textContent);
    }
    
    if (paliDev || translation) {
      textData.push({
        id: id,
        paliDev: paliDev,
        translation: translation,
        paliElement: paliElement || null,
        translationElement: translationElement || null
      });
    }
  });
  
  return textData;
}


function createPlaylistFromData(textData, mode) {
  const playlist = [];
  const translationLang = detectTranslationLang();
  
  textData.forEach(item => {
    if (mode === 'pi') {
      if (item.paliDev) {
        playlist.push({
          text: item.paliDev,
          lang: 'pi-dev',
          element: item.paliElement,
          id: item.id
        });
      }
    }
    else if (mode === 'trn') {
      if (item.translation) {
        playlist.push({
          text: item.translation,
          lang: translationLang,
          element: item.translationElement,
          id: item.id
        });
      }
    }
    else if (mode === 'pi-trn') {
      if (item.paliDev) {
        playlist.push({
          text: item.paliDev,
          lang: 'pi-dev',
          element: item.paliElement,
          id: item.id
        });
      }
      if (item.translation) {
        playlist.push({
          text: item.translation,
          lang: translationLang,
          element: item.translationElement,
          id: item.id
        });
      }
    }
    else if (mode === 'trn-pi') {
      if (item.translation) {
        playlist.push({
          text: item.translation,
          lang: translationLang,
          element: item.translationElement,
          id: item.id
        });
      }
      if (item.paliDev) {
        playlist.push({
          text: item.paliDev,
          lang: 'pi-dev',
          element: item.paliElement,
          id: item.id
        });
      }
    }
  });
  
  return playlist;
}

// --- Ядро TTS ---
function playCurrentSegment() {
  if (ttsState.currentIndex < 0 || ttsState.currentIndex >= ttsState.playlist.length) {
    clearTtsStorage();
    stopPlayback();
    return;
  }

  if (!wakeLock && !ttsState.paused) {
    requestWakeLock();
  }

  if (ttsState.utterance) {
    ttsState.utterance.onend = null;
    ttsState.utterance.onerror = null;
  }

  synth.cancel();
  resetUI();

  const item = ttsState.playlist[ttsState.currentIndex];
  
  if (ttsState.currentSlug) {
    if (ttsState.currentIndex >= ttsState.playlist.length - 2) {
       clearTtsStorage(); 
    } else {
       localStorage.setItem(LAST_SLUG_KEY, ttsState.currentSlug);
       localStorage.setItem(LAST_INDEX_KEY, ttsState.currentIndex);
    }
  }
  
  if (item.element) {
    document.querySelectorAll('.active-word').forEach(e => e.classList.remove('active-word'));
    
    // Логика для active-word (словарь) остается только на Пали элементе, если он активен
    if (item.element.classList.contains('pli-lang')) {
      item.element.classList.add('active-word');
    }
    
    // ! ИЗМЕНЕНИЕ: Подсветка всей группы (Пали + Перевод)
    const segmentId = item.id;
    // Ищем элемент-контейнер по ID (обычно ID висит на обертке сегмента)
    const segmentContainer = document.getElementById(segmentId);

    if (segmentContainer) {
        // Находим внутри контейнера все текстовые блоки (пали и переводы)
        const connectedElements = segmentContainer.querySelectorAll('.pli-lang, .rus-lang, .tha-lang, .eng-lang');
        
        if (connectedElements.length > 0) {
            // Если нашли - подсвечиваем их все
            connectedElements.forEach(el => el.classList.add('tts-active'));
        } else {
            // Если структура другая и вложенности нет - подсвечиваем сам контейнер
            segmentContainer.classList.add('tts-active');
        }
    } else {
        // Фолбэк: если по ID контейнер не найден, подсвечиваем только то, что играет
        item.element.classList.add('tts-active');
    }
    
    if (ttsState.autoScroll) {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const utterance = new SpeechSynthesisUtterance(item.text);
  
  // ! ИЗМЕНЕНИЕ: Разделяем UI-скорость и Аудио-скорость
  let uiRate = 1.0;     
  let audioRate = 1.0;  
  let isPali = false;

  if (item.lang === 'ru') {
    utterance.lang = 'ru-RU';
    uiRate = getRateForLang('ru');
    audioRate = uiRate;
  } else if (item.lang === 'th') { 
    utterance.lang = 'th-TH'; 
    uiRate = getRateForLang('th'); 
    audioRate = uiRate;
  } else if (item.lang === 'en') {
    utterance.lang = 'en-US';
    uiRate = getRateForLang('en');
    audioRate = uiRate;
  } else if (item.lang === 'pi-dev') {
    utterance.lang = 'sa-IN'; 
    utterance._fallbackAttempt = 0; 
    isPali = true;
    
    uiRate = getRateForLang('pi-dev');
    audioRate = uiRate * PALI_RATIO;
  }

  utterance.rate = audioRate;
  
  const rateSelect = document.getElementById('tts-rate-select');
  if (rateSelect) {
      updateRateOptions(isPali, uiRate);

      if (isPali) {
          rateSelect.style.borderStyle = '';
          rateSelect.title = "Скорость Пали (нормализована: 1.0 = медленно)";
      } else {
          rateSelect.style.borderStyle = 'dashed';
          rateSelect.title = "Скорость Перевода";
      }
  }

  utterance.onend = () => {
    if (ttsState.speaking && !ttsState.paused) {
      ttsState.currentIndex++;
      if (ttsState.currentIndex < ttsState.playlist.length) {
        playCurrentSegment();
      } else {
        clearTtsStorage();
        stopPlayback();
      }
    }
  };

  utterance.onerror = (e) => {
    console.error('TTS Error', e);
    
    if (item.lang === 'pi-dev') {
      const currentAttempt = utterance._fallbackAttempt || 0;
      
      if (currentAttempt === 0 && utterance.lang === 'sa-IN') {
        console.log('Sanskrit failed, trying Hindi...');
        utterance.lang = 'hi-IN';
        utterance._fallbackAttempt = 1;
        utterance.rate = audioRate; 
        
        setTimeout(() => {
          if (ttsState.speaking && !ttsState.paused && ttsState.utterance === utterance) {
            synth.speak(utterance);
          }
        }, 1);
        return;
      }
      
      if (currentAttempt === 1 && utterance.lang === 'hi-IN') {
        console.log('Hindi failed, trying English...');
        utterance.lang = 'en-US';
        utterance._fallbackAttempt = 2;
        utterance.rate = audioRate;
        
        setTimeout(() => {
          if (ttsState.speaking && !ttsState.paused && ttsState.utterance === utterance) {
            synth.speak(utterance);
            
            const pathLang = location.pathname.split('/')[1];
            const isRuLike = ['ru', 'r', 'ml'].includes(pathLang);
            const title = isRuLike ? 'TTS:' : 'TTS Hint:';
            const helpUrl = isRuLike 
                ? '/assets/common/ttsHelp.html#tts-help-ru' 
                : '/assets/common/ttsHelp.html#tts-help-en';
            const helpLink = `<a href="${helpUrl}" target="_blank" style="color: #4da6ff; text-decoration: underline;">(?)</a>`;
            const message = isRuLike 
              ? `Не найдено модулей близких к Пали. Установлен Английский. См. помощь ${helpLink}.`
              : `No Pāḷi-friendly voices found. Using English. See help ${helpLink}.`;
            
            showVoiceHint(title, message, PALI_ALERT_KEY);
          }
        }, 1);
        return;
      }
    }
    
    if (document.hidden || e.error === 'interrupted') {
      console.warn('Playback paused due to background error');
      ttsState.paused = true;
      setButtonIcon('play');
      return; 
    }

    if (ttsState.speaking && !ttsState.paused) {
      ttsState.currentIndex++;
      if (ttsState.currentIndex < ttsState.playlist.length) {
        playCurrentSegment();
      } else {
        clearTtsStorage();
        stopPlayback();
      }
    }
  };
  
  ttsState.utterance = utterance;
  
  if (!ttsState.paused) {
    setTimeout(() => {
      if (ttsState.speaking && !ttsState.paused && ttsState.utterance === utterance) {
        synth.speak(utterance);
      }
    }, 50);
  }
}


// --- Обработчики событий ---
async function handleSuttaClick(e) {
  const container = e.target.closest('.sutta-container') || document;
  const voiceLink = e.target.closest('.voice-link');
  const playBtn = e.target.closest('.play-main-button');
  const navBtn = e.target.closest('.prev-main-button, .next-main-button');

  if (voiceLink) {
    e.preventDefault();
    const parent = voiceLink.closest('.voice-dropdown');
    parent.classList.add('active');
    
    if (!ttsState.speaking) {
      const modeSelect = document.getElementById('tts-mode-select');
      const mode = e.target.closest('.voice-dropdown')?.querySelector('#tts-mode-select')?.value 
                   || localStorage.getItem(MODE_STORAGE_KEY) 
                   || (window.location.pathname.match(/\/d\/|\/memorize\//) ? 'pi' : 'trn');
      const targetSlug = voiceLink.dataset.slug;
      
      startPlayback(container, mode, targetSlug, 0);
    }
    return;
  }

  if (navBtn) {
    e.preventDefault();
    if (!ttsState.speaking || ttsState.playlist.length === 0) return;
    
    let direction = navBtn.classList.contains('prev-main-button') ? -1 : 1;
    let newIndex = ttsState.currentIndex + direction;
    
    if (direction < 0 && newIndex < 0) newIndex = 0;
    else if (direction > 0 && newIndex >= ttsState.playlist.length) newIndex = ttsState.playlist.length - 1;
    
    if (newIndex === ttsState.currentIndex) return;
    
    synth.cancel();
    ttsState.currentIndex = newIndex;
    
    if (ttsState.paused) {
      resetUI();
      const item = ttsState.playlist[ttsState.currentIndex];
      if (item && item.element) {
        item.element.classList.add('tts-active');
        if (ttsState.autoScroll) {
          item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      playCurrentSegment();
    }
    return;
  }

  if (playBtn && !e.target.classList.contains('voice-link')) {
    e.preventDefault();

    const activeWordElement = container.querySelector('.active-word');
    const activeId = activeWordElement ? getElementId(activeWordElement) : null;
    
    const currentItem = ttsState.playlist[ttsState.currentIndex];
    const currentId = currentItem ? currentItem.id : null;

    const shouldJump = activeId && (!ttsState.speaking || activeId !== currentId);

    if (shouldJump) {
      let mode = localStorage.getItem(MODE_STORAGE_KEY) || 'trn';

      if (mode !== 'pi-trn' && mode !== 'trn-pi') {
        mode = activeWordElement.classList.contains('pli-lang') ? 'pi' : 'trn';
        localStorage.setItem(MODE_STORAGE_KEY, mode);
        const modeSelect = document.getElementById('tts-mode-select');
        if (modeSelect) modeSelect.value = mode;
      }

      let targetSlug = playBtn.dataset.slug || ttsState.currentSlug;
      startPlayback(container, mode, targetSlug, 0);
      
    } else {
      if (ttsState.speaking) {
        if (ttsState.paused) {
          ttsState.paused = false;
          setButtonIcon('pause');
          playCurrentSegment();
        } else {
          ttsState.paused = true;
          synth.cancel();
          setButtonIcon('play');
        }
      } else {
        const mode = document.getElementById('tts-mode-select')?.value || localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
        let targetSlug = playBtn.dataset.slug || ttsState.currentSlug;
        startPlayback(container, mode, targetSlug, 0);
      }
    }
    return;
  }

  if (e.target.closest('.close-tts-btn')) {
    e.preventDefault();
    stopPlayback();
    const dropdown = e.target.closest('.voice-dropdown');
    if (dropdown) dropdown.classList.remove('active');
  }
}

function stopPlayback() {
  synth.cancel();
  ttsState.speaking = false;
  ttsState.paused = false;
  ttsState.isNavigating = false;
  releaseWakeLock();

  if (ttsState.utterance) {
    ttsState.utterance.onend = null;
    ttsState.utterance.onerror = null;
    ttsState.utterance = null;
  }
  setButtonIcon('play');
  resetUI();
}

async function startPlayback(container, mode, slug, startIndex = 0) {
  const textData = await prepareTextData(slug);
  if (!textData.length) {
    console.warn('Нет данных для воспроизведения');
    return;
  }
  
  const playlist = createPlaylistFromData(textData, mode);
  if (!playlist.length) {
    console.warn('Плейлист пуст для режима:', mode);
    return;
  }
  
  let actualStartIndex = startIndex;
  const activeWord = container.querySelector('.active-word');
  
  if (activeWord) {
    const activeId = getElementId(activeWord);
    if (activeId) {
      const foundIndex = playlist.findIndex(item => item.id === activeId);
      if (foundIndex !== -1) {
        actualStartIndex = foundIndex;
      } else {
        const sourceIndex = textData.findIndex(item => item.id === activeId);
        if (sourceIndex !== -1) {
          for (let i = sourceIndex + 1; i < textData.length; i++) {
            const nextId = textData[i].id;
            const nextInPlaylistIndex = playlist.findIndex(item => item.id === nextId);
            if (nextInPlaylistIndex !== -1) {
              actualStartIndex = nextInPlaylistIndex;
              console.log(`Сегмент ${activeId} пуст. Переход к: ${nextId}`);
              break; 
            }
          }
        }
      }
    }
  } else {
    if (actualStartIndex === 0 && slug) {
      const lastSlug = localStorage.getItem(LAST_SLUG_KEY);
      const lastIndex = parseInt(localStorage.getItem(LAST_INDEX_KEY) || '0');
      if (lastSlug === slug && lastIndex < playlist.length) {
        actualStartIndex = lastIndex;
      }
    }
  }
  
  stopPlayback();
  
  ttsState.playlist = playlist;
  ttsState.currentIndex = actualStartIndex;
  ttsState.currentSlug = slug;
  ttsState.langSettings = mode;
  ttsState.speaking = true;
  ttsState.paused = false;
  ttsState.isNavigating = false;
  
  setButtonIcon('pause');
  playCurrentSegment();
}

function showVoiceHint(title, message, storageKey) {
  if (localStorage.getItem(storageKey)) return;
  if (document.getElementById('active-voice-hint')) return;

  const notification = document.createElement('div');
  notification.id = 'active-voice-hint'; 

  notification.innerHTML = `
      <div class="hint" style="display: flex; align-items: center; gap: 10px;">
          <div>💡 <strong>${title}</strong> ${message}</div>
          <button id="closeVoiceHintBtn" style="
              background: none; border: none; color: white;
              font-size: 16px; cursor: pointer; padding: 0 0 0 10px;
          " title="(Esc)">×</button>
      </div>
  `;

  Object.assign(notification.style, {
      position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: 'rgba(66, 66, 106, 1)', color: 'white',
      padding: '12px 20px', borderRadius: '8px', fontSize: '14px', zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.5s ease-out',
      maxWidth: '600px', minWidth: '200px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)'
  });

  document.body.appendChild(notification);

  if (!document.getElementById('voice-hint-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-hint-styles';
      style.textContent = `
          @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
          #closeVoiceHintBtn:hover { color: #ccc; }
      `;
      document.head.appendChild(style);
  }

  const closeBtn = notification.querySelector('#closeVoiceHintBtn');
  closeBtn.addEventListener('click', function() {
      notification.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => {
          notification.remove();
          localStorage.setItem(storageKey, 'true'); 
      }, 300);
  });
}

// --- Интерфейс ---
function getTTSInterfaceHTML(texttype, slugReady, slug) {
  const isSpecialPath = window.location.pathname.match(/\/d\/|\/memorize\//);
  const defaultMode = isSpecialPath ? 'pi' : 'trn';
  const savedMode = localStorage.getItem(MODE_STORAGE_KEY) || defaultMode;
  
  let initialRate;
  let currentRatesList; 
  
  if (savedMode === 'pi') {
      // ! ИЗМЕНЕНИЕ: Дефолт = 1.0 (было 0.6)
      initialRate = parseFloat(localStorage.getItem(RATE_PALI_KEY)) || 1.0;
      currentRatesList = RATES_PALI; 
  } else {
      initialRate = parseFloat(localStorage.getItem(RATE_TRN_KEY)) || 1.0;
      currentRatesList = RATES_TRN;  
  }

  if (!currentRatesList.includes(initialRate)) {
      currentRatesList = [...currentRatesList, initialRate].sort((a,b) => a - b);
  }

  const pathLang = location.pathname.split('/')[1];
  const isRuLike = ['ru', 'r', 'ml'].includes(pathLang);

  const modeLabels = isRuLike
    ? { 'pi': 'Пали', 'pi-trn': 'Пали + Рус', 'trn': 'Перевод', 'trn-pi': 'Рус + Пали' }
    : { 'pi': 'Pāḷi', 'pi-trn': 'Pāḷi + Trn', 'trn': 'Trn', 'trn-pi': 'Trn + Pāḷi' };
  
  return `
  <span class="voice-dropdown">
    <a style="transform: translateY(-2px)" data-slug="${texttype}/${slugReady}" href="javascript:void(0)" title="Text-to-Speech (Atl+R)" class="fdgLink mainLink voice-link">Voice</a>&nbsp;
    <span class="voice-player">
      <a href="javascript:void(0)" class="close-tts-btn">&times;</a>

      <a href="javascript:void(0)" class="prev-main-button tts-icon-btn">
        <img src="/assets/svg/backward-step.svg" class="tts-icon backward">
      </a>

      <a href="javascript:void(0)" class="play-main-button tts-icon-btn large">
        <img src="/assets/svg/play-grey.svg" class="tts-icon play">
      </a> 

      <a href="javascript:void(0)" class="next-main-button tts-icon-btn">
        <img src="/assets/svg/forward-step.svg" class="tts-icon forward">
      </a>

      <br>

      <select id="tts-mode-select" class="tts-mode-select">
        ${Object.entries(modeLabels).map(([val, label]) =>
          `<option value="${val}" ${savedMode === val ? 'selected' : ''}>${label}</option>`
        ).join('')}
      </select>

      <select id="tts-rate-select" class="tts-rate-select" title="${savedMode === 'pi' ? 'Speed (Pali)' : 'Speed (Translation)'}">
        ${currentRatesList.map(r =>
          `<option value="${r}" ${initialRate == r ? 'selected' : ''}>${r}x</option>`
        ).join('')}
      </select>
      
      <br>

      <label class="tts-checkbox-custom">
        <input type="checkbox" id="tts-scroll-toggle" ${ttsState.autoScroll ? 'checked' : ''}>
        Scroll
      </label>

      <a href="/tts.php${window.location.search}" class="tts-link tts-text-link">TTS</a>
      <a class="tts-link" title='sc-voice.net' href='https://www.sc-voice.net/?src=sc#/sutta/$fromjs'>VSC</a>
    `;
}

// --- Обработчик изменения настроек ---
async function handleTTSSettingChange(e) {
  // 1. Режим (Mode)
  if (e.target.id === 'tts-mode-select') {
    e.preventDefault();
    const newMode = e.target.value;
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
      
    if (ttsState.speaking || ttsState.paused) {
      const wasPaused = ttsState.paused;
      const currentId = ttsState.playlist[ttsState.currentIndex]?.id;
      const pausedIndex = ttsState.currentIndex;
      
      synth.cancel();
      
      const textData = await prepareTextData(ttsState.currentSlug);
      const newPlaylist = createPlaylistFromData(textData, newMode);
      
      if (!newPlaylist.length) return;
      
      let newIndex = 0;
      if (currentId) {
        const foundIndex = newPlaylist.findIndex(item => item.id === currentId);
        if (foundIndex !== -1) newIndex = foundIndex;
      } else if (pausedIndex < newPlaylist.length) {
        newIndex = pausedIndex;
      }
      
      ttsState.playlist = newPlaylist;
      ttsState.currentIndex = newIndex;
      ttsState.langSettings = newMode;
      ttsState.speaking = true;
      ttsState.paused = wasPaused;
      
      if (!wasPaused) {
        setButtonIcon('pause');
        playCurrentSegment();
      } else {
        setButtonIcon('play');
        resetUI();
        const item = ttsState.playlist[ttsState.currentIndex];
        if (item && item.element) {
          item.element.classList.add('tts-active');
          if (ttsState.autoScroll) {
            item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  }
  
  // 2. Скорость (Rate)
  if (e.target.id === 'tts-rate-select') {
    const newRate = parseFloat(e.target.value);
    
    // Определяем, какую именно скорость обновлять
    let targetKey = RATE_TRN_KEY; 

    // Если прямо сейчас идет воспроизведение — берем язык текущего сегмента
    if (ttsState.speaking && !ttsState.paused && ttsState.playlist[ttsState.currentIndex]) {
        const currentItem = ttsState.playlist[ttsState.currentIndex];
        if (currentItem.lang === 'pi-dev') {
            targetKey = RATE_PALI_KEY;
        }
    } else {
        // Если плеер стоит, смотрим на общий режим
        const currentMode = localStorage.getItem(MODE_STORAGE_KEY);
        if (currentMode === 'pi') {
            targetKey = RATE_PALI_KEY;
        }
    }

    localStorage.setItem(targetKey, newRate);
    
    // Применяем сразу же
    if (ttsState.speaking && !ttsState.paused) {
      synth.cancel();
      playCurrentSegment();
    }
  }

  // 3. Автопрокрутка
  if (e.target.id === 'tts-scroll-toggle') {
     ttsState.autoScroll = e.target.checked;
     localStorage.setItem(SCROLL_STORAGE_KEY, e.target.checked);
     if (ttsState.autoScroll && (ttsState.speaking || ttsState.paused)) {
        const item = ttsState.playlist[ttsState.currentIndex];
        if (item && item.element) {
           item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
     }
  }
}

document.addEventListener('change', handleTTSSettingChange);
window.speechSynthesis.onvoiceschanged = () => synth.getVoices();
document.addEventListener('click', handleSuttaClick);
document.addEventListener('DOMContentLoaded', () => { 

//для аудио voice 

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function initVoicePlayers() {
document.querySelectorAll('.voice-link').forEach(link => {
link.removeEventListener('click', handleClick);
link.removeEventListener('touchstart', handleTouch);

if (isSafari) {
link.addEventListener('touchstart', handleTouch, {
passive: true
});
link.addEventListener('click', handleClick);
} else {
link.addEventListener('click', handleClick);
}
});

// Кнопка закрытия
document.querySelectorAll('.close-player').forEach(btn => {
btn.addEventListener('click', function(e) {
e.stopPropagation();
this.closest('.voice-dropdown').classList.remove('active');
});
});
}

function handleClick(e) {
e.preventDefault();
togglePlayer(this);
}

function handleTouch(e) {
e.preventDefault();
togglePlayer(this);
}

function togglePlayer(link) {
const dropdown = link.closest('.voice-dropdown');
const wasActive = dropdown.classList.contains('active');

closeAllPlayers();

if (!wasActive) {
dropdown.classList.add('active');
// Убрал автозапуск аудио для всех браузеров, включая Safari
// Теперь аудио будет запускаться только при клике на Play внутри плеера
}
}

function closeAllPlayers() {
document.querySelectorAll('.voice-dropdown.active').forEach(dropdown => {
dropdown.classList.remove('active');
});
}

initVoicePlayers();

if (typeof MutationObserver !== 'undefined') {
new MutationObserver(initVoicePlayers).observe(document.body, {
childList: true,
subtree: true
});
}


  synth.getVoices();
});

document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

// --- НОВАЯ ЭКСПОРТИРУЕМАЯ ФУНКЦИЯ ---
// Позволяет активировать сегмент программно (например, из smoothScroll.js)
window.activateSegmentForTTS = function(element) {
  if (!element) return;
  
  // Если передали контейнер (строку целиком), ищем внутри неё текстовый блок
  let targetElement = element;
  if (!targetElement.matches(".pli-lang, .rus-lang, .eng-lang, .tha-lang")) {
      const childLang = targetElement.querySelector(".pli-lang, .rus-lang, .eng-lang, .tha-lang");
      if (childLang) {
          targetElement = childLang;
      } else {
          // Если внутри нет языковых классов, выходим
          return;
      }
  }

  removeAllHighlights();
  targetElement.classList.add("active-word");
  
  const rowContainer = targetElement.closest("[id]") || targetElement;
  addTtsButton(rowContainer, targetElement);
};

document.addEventListener("click", function (e) {
  // Игнорируем клики по служебным элементам
  if (e.target.closest('.tts-ignore') || e.target.closest('.dynamic-tts-btn')) return;
  
  // Проверяем, был ли клик по сегменту текста
  const clickedSegment = e.target.closest(".pli-lang, .rus-lang, .eng-lang, .tha-lang");

  if (clickedSegment) {
    // Если кликнули по уже активному — снимаем выделение
    if (clickedSegment.classList.contains("active-word")) {
      removeAllHighlights();
      return;
    }

    // Иначе активируем через нашу новую функцию
    window.activateSegmentForTTS(clickedSegment);
    return;
  }

  // Если клик был в пустоту (не по плееру и не по кнопкам) — убираем выделение
  if (
    !e.target.closest(".voice-player") &&
    !e.target.closest(".tts-mode-select") &&
    !e.target.closest(".tts-rate-select") &&
    !e.target.closest("#tts-scroll-toggle") && 
    !e.target.closest(".dynamic-tts-btn")
  ) {
    removeAllHighlights();
  }
});

function removeAllHighlights() {
    document.querySelectorAll(".active-word").forEach(el => el.classList.remove("active-word"));
    const oldBtn = document.querySelector('.dynamic-tts-btn');
    if (oldBtn) oldBtn.remove();
}

function addTtsButton(containerElement, specificElement) {
    if (ttsState.speaking || ttsState.paused) return;

    const oldBtn = document.querySelector('.dynamic-tts-btn');
    if (oldBtn) oldBtn.remove();

    const btnContainer = document.createElement('div');
    btnContainer.className = 'dynamic-tts-btn'; 
    btnContainer.innerHTML = `<img src="/assets/svg/play.svg" alt="Play">`;

    document.body.appendChild(btnContainer);

    // Позиционируем кнопку относительно элемента
    // Можно добавить логику позиционирования, если CSS (fixed) не подходит
    // Но сейчас она fixed right: 20px, так что ок.

    btnContainer.addEventListener('click', (e) => {
        e.stopPropagation(); 
        e.preventDefault();

        let mode = localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
        
        if (mode !== 'pi-trn' && mode !== 'trn-pi') {
            const targetEl = specificElement || containerElement; 
            mode = targetEl.classList.contains('pli-lang') ? 'pi' : 'trn';
            
            localStorage.setItem(MODE_STORAGE_KEY, mode);
            const modeSelect = document.getElementById('tts-mode-select');
            if (modeSelect) modeSelect.value = mode;
        }

        const mainPlayBtn = document.querySelector('.voice-dropdown .voice-link');
        const slug = mainPlayBtn ? mainPlayBtn.dataset.slug : ttsState.currentSlug;

        startPlayback(document, mode, slug);

        const voiceDropdown = document.querySelector('.voice-dropdown');
        if (voiceDropdown) voiceDropdown.classList.add('active');

        btnContainer.remove();
    });
}
