/// --- Конфигурация путей ---
const makeJsonUrl = (slug) => {
  const basePath = '/assets/texts/devanagari/root/pli/ms/';
  const suffix = '_rootd-pli-ms.json';
  const fullPath = `${basePath}${slug}${suffix}`;
//  alert(fullPath); 
  return fullPath;
};

// --- Глобальное состояние ---
let wakeLock = null; // Переменная для Wake Lock

const SCROLL_STORAGE_KEY = 'tts_auto_scroll'; // Ключ для настройки скролла
const MODE_STORAGE_KEY = 'tts_preferred_mode';
const RATE_STORAGE_KEY = 'tts_preferred_rate';
const LAST_SLUG_KEY = 'tts_last_slug';   
const LAST_INDEX_KEY = 'tts_last_index'; 
const PALI_ALERT_KEY = 'tts_pali_alert_shown'; // Ключ для алерта

const ttsState = {
  playlist: [],
  currentIndex: 0,
  button: null,
  speaking: false,
  paused: false,
  utterance: null,
  langSettings: null,
  userRate: parseFloat(localStorage.getItem(RATE_STORAGE_KEY)) || 1.0,
  // По умолчанию скролл включен (true), если в localStorage не записано 'false'
  autoScroll: localStorage.getItem(SCROLL_STORAGE_KEY) !== 'false', 
  currentSlug: null,
  isNavigating: false 
};

const synth = window.speechSynthesis;

// --- Утилиты ---

// 1. Wake Lock: Запрос
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

// 2. Wake Lock: Сброс
async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock released manually');
  }
}

// 3. Очистка хранилища (позиции)
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
    //Eng-tts rules
    .replace(/Trn:/g, 'Translated by') 
    //Pali-tts rules
    .replace(/Pāḷi MS/g, 'पालि महासङ्गीति')
    .replace(/”/g, '')
    .replace(/ पन[\.:,]/g, 'पना ') 
    .replace(/ पन /g, 'पना ') 
    .replace(/स्स /g, 'स्सा ')
    .replace(/स /g, 'सा ')
    .replace(/म्म /g, 'म्मा ')
    .replace(/…पे…/g, '…पेय्याल…')
    .replace(/’ति/g, 'ति')
    //general-tts rupes
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
  if (path.includes('/th/') || path.includes('/thml/')) return 'th';
  if (path.includes('/en/') || path.includes('/b/') || path.includes('/read/')) return 'en';
  return 'ru';
}

function getElementId(el) {
  return el.id || el.closest('[id]')?.id;
}

// Главная функция: собирает все данные для текста
async function prepareTextData(slug) {
  const container = document.querySelector('.sutta-container') || document;
  
  // 1. Оставляем эти коллекции отдельно. Они нужны, чтобы ниже корректно находить 
  // paliElement и translationElement для вашей логики старта.
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

  // 2. ИСПРАВЛЕНИЕ ПОРЯДКА (FIX)
  // Собираем ID, проходя по всем элементам СРАЗУ в порядке их появления в HTML.
  // Это гарантирует, что Origin Story (где нет пали) будет в начале, а не в конце.
  const allIds = new Set();
  const allNodesInOrder = container.querySelectorAll('.pli-lang, .rus-lang, .tha-lang, .eng-lang');
  
  allNodesInOrder.forEach(el => {
    const id = getElementId(el);
    if (id) allIds.add(id);
  });
  
  const textData = [];
  
  // 3. Логика формирования объектов остается вашей.
  // Мы идем по правильному порядку ID, но ищем элементы в старых списках.
  allIds.forEach(id => {
    // Здесь сохраняется ваша логика привязки конкретных элементов
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
        // Ссылки на DOM-элементы на месте, логика клика по активному слову будет работать
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
  // 1. Проверка границ и очистка в конце
  if (ttsState.currentIndex < 0 || ttsState.currentIndex >= ttsState.playlist.length) {
    clearTtsStorage();
    stopPlayback();
    return;
  }

  // 2. Включаем Wake Lock, если играем
  if (!wakeLock && !ttsState.paused) {
    requestWakeLock();
  }

  // Очищаем старые обработчики
  if (ttsState.utterance) {
    ttsState.utterance.onend = null;
    ttsState.utterance.onerror = null;
  }

  synth.cancel();
  resetUI();

  const item = ttsState.playlist[ttsState.currentIndex];
  
  // 3. Сохранение позиции
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
    
    if (item.element.classList.contains('pli-lang')) {
      item.element.classList.add('active-word');
    }
    
    item.element.classList.add('tts-active');
    
    // Автопрокрутка
    if (ttsState.autoScroll) {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const utterance = new SpeechSynthesisUtterance(item.text);
  let multiplier = 1.0;
  let fallbackAttempt = 0; // 0 = санскрит, 1 = хинди, 2 = английский

  // Инициализируем utterance с санскритом по умолчанию для пали
  if (item.lang === 'ru') {
    utterance.lang = 'ru-RU';
  } else if (item.lang === 'th') { 
    utterance.lang = 'th-TH'; 
    multiplier = 0.5; 
  } else if (item.lang === 'en') {
    utterance.lang = 'en-US';
  } else if (item.lang === 'pi-dev') {
     //   utterance.lang = 'hi-IN';
    utterance.lang = 'sa-IN'; // ПЕРВАЯ ПОПЫТКА: санскрит
    utterance._fallbackAttempt = 0; // сохраняем номер попытки
    multiplier = 0.5;
  }

  utterance.rate = ttsState.userRate * multiplier;

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
    
    // --- ОБРАБОТКА FALLBACK ДЛЯ ПАЛИ ---
    if (item.lang === 'pi-dev') {
      const currentAttempt = utterance._fallbackAttempt || 0;
      
      // 1. САНСКРИТ УПАЛ -> ПРОБУЕМ ХИНДИ
      if (currentAttempt === 0 && utterance.lang === 'sa-IN') {
        console.log('Sanskrit failed, trying Hindi...');
        utterance.lang = 'hi-IN';
        utterance._fallbackAttempt = 1;
        utterance.rate = ttsState.userRate * 0.5; // тот же множитель
        
        // Пробуем снова с хинди
        setTimeout(() => {
          if (ttsState.speaking && !ttsState.paused && ttsState.utterance === utterance) {
            synth.speak(utterance);
          }
        }, 1);
        return;
      }
      
      // 2. ХИНДИ УПАЛ -> ПРОБУЕМ АНГЛИЙСКИЙ
      if (currentAttempt === 1 && utterance.lang === 'hi-IN') {
        console.log('Hindi failed, trying English...');
        utterance.lang = 'en-US';
        utterance._fallbackAttempt = 2;
        utterance.rate = ttsState.userRate; // обычная скорость для английского
        
        // Пробуем с английским
        setTimeout(() => {
          if (ttsState.speaking && !ttsState.paused && ttsState.utterance === utterance) {
            synth.speak(utterance);
            
       const pathLang = location.pathname.split('/')[1];
        const isRuLike = ['ru', 'r', 'ml'].includes(pathLang);

        const title = isRuLike ? 'TTS:' : 'TTS Hint:';
        
       // 1. Определяем правильную ссылку в зависимости от языка
        const helpUrl = isRuLike 
            ? '/assets/common/ttsHelp.html#tts-help-ru' 
            : '/assets/common/ttsHelp.html#tts-help-en';

        // 2. Формируем HTML ссылки
        const helpLink = `<a href="${helpUrl}" target="_blank" style="color: #4da6ff; text-decoration: underline;">(?)</a>`;

        const message = isRuLike 
          ? `Не найдено модулей близких к Пали. Установлен Английский. См. помощь ${helpLink}, как включить Санскрит/Хинди/Непальский.`
          : `No Pāḷi-friendly voices found. Using English. See help ${helpLink} on how to enable Sanskrit/Hindi/Nepali.`;
        
        showVoiceHint(title, message, PALI_ALERT_KEY);
            
          }
        }, 1);
        return;
      }
      
      // 3. АНГЛИЙСКИЙ ТОЖЕ УПАЛ -> ПРОПУСКАЕМ СЕГМЕНТ
      if (currentAttempt === 2 && utterance.lang === 'en-US') {
        console.log('All fallbacks failed, skipping segment...');
        // Продолжаем как обычную ошибку - переходим к следующему сегменту
      }
    }
    
    // --- ОБРАБОТКА ОСТАЛЬНЫХ ОШИБОК ---
    if (document.hidden || e.error === 'interrupted') {
      console.warn('Playback paused due to background error');
      ttsState.paused = true;
      setButtonIcon('play');
      return; 
    }

    // Стандартная обработка: переходим к следующему сегменту
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

  // --- 1. Обработка меню Voice ---
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

  // --- 2. Обработка кнопок Вперед/Назад ---
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
        // Проверка скролла при ручной навигации на паузе
        if (ttsState.autoScroll) {
          item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      playCurrentSegment();
    }
    return;
  }

  // --- 3. Обработка кнопки PLAY (Главная логика) ---
if (playBtn && !e.target.classList.contains('voice-link')) {
  e.preventDefault();

  const activeWordElement = container.querySelector('.active-word');
  const activeId = activeWordElement ? getElementId(activeWordElement) : null;
  
  const currentItem = ttsState.playlist[ttsState.currentIndex];
  const currentId = currentItem ? currentItem.id : null;

  // Если выделено слово, и оно либо не то, что сейчас играет, либо плеер вообще не запущен
  const shouldJump = activeId && (!ttsState.speaking || activeId !== currentId);

  if (shouldJump) {
    let mode = localStorage.getItem(MODE_STORAGE_KEY) || 'trn';

    // ЛОГИКА ПЕРЕКЛЮЧЕНИЯ: если режим не комбинированный, меняем его под тип выделенного слова
    if (mode !== 'pi-trn' && mode !== 'trn-pi') {
      mode = activeWordElement.classList.contains('pli-lang') ? 'pi' : 'trn';
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      
      // Обновляем визуальный селект
      const modeSelect = document.getElementById('tts-mode-select');
      if (modeSelect) modeSelect.value = mode;
    }

    let targetSlug = playBtn.dataset.slug || ttsState.currentSlug;
    startPlayback(container, mode, targetSlug, 0);
    
  } else {
    // Стандартная логика паузы/продолжения
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
      // Старт с начала, если ничего не выделено
      const mode = document.getElementById('tts-mode-select')?.value || localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
      let targetSlug = playBtn.dataset.slug || ttsState.currentSlug;
      startPlayback(container, mode, targetSlug, 0);
    }
  }
  return;
}


  // --- 4. Кнопка закрытия ---
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
  
  // Освобождаем Wake Lock
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
  
  // Ищем элемент active-word
  const activeWord = container.querySelector('.active-word');
  
  if (activeWord) {
    const activeId = getElementId(activeWord);
    
    if (activeId) {
      // 1. Пробуем найти точное совпадение в плейлисте
      const foundIndex = playlist.findIndex(item => item.id === activeId);
      
      if (foundIndex !== -1) {
        actualStartIndex = foundIndex;
      } else {
        // 2. ВАРИАНТ 1: Если точного совпадения нет (пустой перевод), ищем БЛИЖАЙШИЙ СЛЕДУЮЩИЙ
        // Находим, где этот ID находится в полных сырых данных
        const sourceIndex = textData.findIndex(item => item.id === activeId);
        
        if (sourceIndex !== -1) {
          // Идем вниз по списку от найденного места
          for (let i = sourceIndex + 1; i < textData.length; i++) {
            const nextId = textData[i].id;
            // Проверяем, есть ли этот сосед в нашем плейлисте
            const nextInPlaylistIndex = playlist.findIndex(item => item.id === nextId);
            
            if (nextInPlaylistIndex !== -1) {
              actualStartIndex = nextInPlaylistIndex;
              console.log(`Сегмент ${activeId} пуст/пропущен. Переход к ближайшему: ${nextId}`);
              break; 
            }
          }
        }
      }
    }
  } else {
    // Если active-word нет, пробуем восстановить позицию (только для старта с 0)
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

// --- Функция показа красивого уведомления (копия стиля из uihelp.js) ---
function showVoiceHint(title, message, storageKey) {
  // 1. Если пользователь уже закрывал его ранее (глобально) — выходим
  if (localStorage.getItem(storageKey)) return;

  // 2. НОВОЕ: Если подсказка прямо сейчас уже висит на экране — выходим
  if (document.getElementById('active-voice-hint')) return;

  const notification = document.createElement('div');
  notification.id = 'active-voice-hint'; // Даем ID для проверки

  notification.innerHTML = `
      <div class="hint" style="display: flex; align-items: center; gap: 10px;">
          <div>💡 <strong>${title}</strong> ${message}</div>
          <button id="closeVoiceHintBtn" style="
              background: none;
              border: none;
              color: white;
              font-size: 16px;
              cursor: pointer;
              padding: 0 0 0 10px;
          " title="(Esc)">×</button>
      </div>
  `;

  // Стилизация
  Object.assign(notification.style, {
      position: 'fixed',
      top: '30%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(66, 66, 106, 1)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      animation: 'fadeInUp 0.5s ease-out',
      maxWidth: '600px',
      minWidth: '200px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.1)'
  });

  document.body.appendChild(notification);

  // Анимации
  if (!document.getElementById('voice-hint-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-hint-styles';
      style.textContent = `
          @keyframes fadeInUp {
              from { opacity: 0; transform: translate(-50%, 10px); }
              to { opacity: 1; transform: translate(-50%, 0); }
          }
          @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
          }
          #closeVoiceHintBtn:hover { color: #ccc; }
      `;
      document.head.appendChild(style);
  }

  // Обработчик закрытия
  const closeBtn = notification.querySelector('#closeVoiceHintBtn');
  closeBtn.addEventListener('click', function() {
      notification.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => {
          notification.remove();
          localStorage.setItem(storageKey, 'true'); // Запоминаем, что закрыли навсегда
      }, 300);
  });
}



// --- Интерфейс ---
function getTTSInterfaceHTML(texttype, slugReady, slug) {
  const isSpecialPath = window.location.pathname.match(/\/d\/|\/memorize\//);
  const defaultMode = isSpecialPath ? 'pi' : 'trn';
  const savedMode = localStorage.getItem(MODE_STORAGE_KEY) || defaultMode;
  const savedRate = localStorage.getItem(RATE_STORAGE_KEY) || "1.0";
  
  const pathLang = location.pathname.split('/')[1];
  const isRuLike = ['ru', 'r', 'ml'].includes(pathLang);

  const modeLabels = isRuLike
    ? {
        'pi': 'Пали',
        'pi-trn': 'Пали + Рус',
        'trn': 'Перевод',
        'trn-pi': 'Рус + Пали'
      }
    : {
        'pi': 'Pāḷi',
        'pi-trn': 'Pāḷi + Trn',
        'trn': 'Trn',
        'trn-pi': 'Trn + Pāḷi'
      };
  
  const rates = [0.25, 0.5, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

  return `
  <span class="voice-dropdown">
    <a style="transform: translateY(-2px)"  data-slug="${texttype}/${slugReady}" href="javascript:void(0)" title="Text-to-Speech (Atl+R)" class="fdgLink mainLink voice-link">Voice</a>&nbsp;
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

      <select id="tts-rate-select" class="tts-rate-select">
        ${rates.map(r =>
          `<option value="${r}" ${savedRate == r ? 'selected' : ''}>${r}x</option>`
        ).join('')}
      </select>
      
      <br>

<label class="tts-checkbox-custom">
  <input type="checkbox" id="tts-scroll-toggle" ${ttsState.autoScroll ? 'checked' : ''}>
  Scroll
</label>



      <br>
      <a href="/tts.php${window.location.search}" class="tts-text-link">TTS</a> |
      <a title='sc-voice.net' href='https://www.sc-voice.net/?src=sc#/sutta/$fromjs'>VSC</a>&nbsp;`;
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
    ttsState.userRate = parseFloat(e.target.value);
    localStorage.setItem(RATE_STORAGE_KEY, e.target.value);
    if (ttsState.speaking && !ttsState.paused) {
      synth.cancel();
      playCurrentSegment();
    }
  }

  // 3. Автопрокрутка (Scroll Toggle)
  if (e.target.id === 'tts-scroll-toggle') {
     ttsState.autoScroll = e.target.checked;
     localStorage.setItem(SCROLL_STORAGE_KEY, e.target.checked);
     // Если мы на паузе и включили скролл — сразу подкрутим к текущему элементу
     if (ttsState.autoScroll && (ttsState.speaking || ttsState.paused)) {
        const item = ttsState.playlist[ttsState.currentIndex];
        if (item && item.element) {
           item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
     }
  }
}

// --- Инициализация ---
document.addEventListener('change', handleTTSSettingChange);
window.speechSynthesis.onvoiceschanged = () => synth.getVoices();
document.addEventListener('click', handleSuttaClick);
document.addEventListener('DOMContentLoaded', () => { 
  synth.getVoices();
});

// Слушатель для восстановления WakeLock при возврате на вкладку
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});


// --- 1. ОБРАБОТЧИК КЛИКОВ (ТОЛЬКО источник клика: pali ИЛИ перевод) ---
document.addEventListener("click", function (e) {

  if (e.target.closest('.tts-ignore') || e.target.closest('.dynamic-tts-btn')) {
    return;
  }
  
  // Клик по сегменту текста
  const clickedSegment = e.target.closest(
    ".pli-lang, .rus-lang, .eng-lang, .tha-lang"
  );

  if (clickedSegment) {
    // ПРОВЕРКА ПОВТОРНОГО КЛИКА:
    // Если нажали на уже активный сегмент — снимаем выделение и выходим
    if (clickedSegment.classList.contains("active-word")) {
      removeAllHighlights();
      return;
    }

    // 1. Снимаем все старые подсветки и кнопку перед тем как подсветить новый
    removeAllHighlights();

    // 2. Подсвечиваем ТОЛЬКО то, по чему кликнули
    clickedSegment.classList.add("active-word");

    // 3. Контейнер с id (общий для pali + перевода)
    const rowContainer =
      clickedSegment.closest("[id]") || clickedSegment;

    // 4. Добавляем кнопку TTS
    addTtsButton(rowContainer, clickedSegment);

    return;
  }

  // Клик мимо — убираем подсветку и кнопку
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


// Чистилка
function removeAllHighlights() {
    document.querySelectorAll(".active-word").forEach(el => el.classList.remove("active-word"));
    const oldBtn = document.querySelector('.dynamic-tts-btn');
    if (oldBtn) oldBtn.remove();
}

// --- 2. ФУНКЦИЯ ДОБАВЛЕНИЯ КНОПКИ ---
function addTtsButton(containerElement, specificElement) {
    if (ttsState.speaking || ttsState.paused) return;

    // Удаляем старую кнопку
    const oldBtn = document.querySelector('.dynamic-tts-btn');
    if (oldBtn) oldBtn.remove();

    const btnContainer = document.createElement('div');
    btnContainer.className = 'dynamic-tts-btn'; 
    btnContainer.innerHTML = `<img src="/assets/svg/play.svg" alt="Play">`;

    document.body.appendChild(btnContainer);

    btnContainer.addEventListener('click', (e) => {
        e.stopPropagation(); 
        e.preventDefault();

        // Берем режим из выделенного сегмента или хранилища
        let mode = localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
        
        // Если режим не "смешанный", переключаем его под тип кликнутого элемента
        if (mode !== 'pi-trn' && mode !== 'trn-pi') {
            const targetEl = specificElement || containerElement; 
            mode = targetEl.classList.contains('pli-lang') ? 'pi' : 'trn';
            
            localStorage.setItem(MODE_STORAGE_KEY, mode);

            // --- ОБНОВЛЯЕМ ДРОПДАУН В UI (FIX) ---
            const modeSelect = document.getElementById('tts-mode-select');
            if (modeSelect) {
                modeSelect.value = mode;
            }
        }

        const mainPlayBtn = document.querySelector('.voice-dropdown .voice-link');
        const slug = mainPlayBtn ? mainPlayBtn.dataset.slug : ttsState.currentSlug;

        startPlayback(document, mode, slug);

        const voiceDropdown = document.querySelector('.voice-dropdown');
        if (voiceDropdown) voiceDropdown.classList.add('active');

        btnContainer.remove();
    });
}
