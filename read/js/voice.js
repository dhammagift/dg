// --- КОНФИГУРАЦИЯ "БЕСПЛАТНОГО ПРОБНОГО ПЕРИОДА" ---
window.TRIAL_KEY = ""; 
const TRIAL_BLOCK_KEY = 'tts_block_trial_key'; 

(async function loadTrialKey() {
    // 0. LEGACY CHECK: Если это старая страница, мы просто не грузим ключ.
    // Функция isLegacyPage() "поднимется" (hoisting), поэтому её можно вызвать здесь.
    if (typeof isLegacyPage === 'function' && isLegacyPage()) {
        console.log("Legacy Mode: Trial Key disabled.");
        return; // Выходим. window.TRIAL_KEY останется ""
    }

    // 1. ПРОВЕРКА: Если пользователь нажал сброс, мы блокируем загрузку
    if (localStorage.getItem(TRIAL_BLOCK_KEY)) {
        console.log("🚫 Trial TTS Key is BLOCKED by user reset.");
        return; 
    }

    // 2. ЗАГРУЗКА: Если блокировки нет, грузим как обычно
    try {
        const response = await fetch('/config/tts-config.json');
        if (response.ok) {
            const data = await response.json();
            if (data.key) {
                window.TRIAL_KEY = data.key;
                console.log("🎁 Trial TTS Key Loaded");
            }
        }
    } catch (e) { }
})();

/// --- Конфигурация путей ---
const makeJsonUrl = (slug) => {
  const basePath = '/assets/texts/devanagari/root/pli/ms/';
  const suffix = '_rootd-pli-ms.json';
  const fullPath = `${basePath}${slug}${suffix}`;
  return fullPath;
};

// --- Глобальное состояние и Константы ---
let wakeLock = null; 

const SCROLL_STORAGE_KEY = 'tts_auto_scroll'; 
const SEGMENT_DELAY_KEY = 'tts_segment_delay';
const MODE_STORAGE_KEY = 'tts_preferred_mode';
const NATIVE_PALI_KEY  = 'tts_native_pali_enabled'; 
const NATIVE_TRN_KEY = 'tts_native_trn_enabled'; 

const RATE_PALI_KEY = 'tts_rate_pali'; 
const RATE_TRN_KEY = 'tts_rate_trn';

const LAST_SLUG_KEY = 'tts_last_slug';   
const LAST_INDEX_KEY = 'tts_last_index'; 
const PALI_ALERT_KEY = 'tts_pali_alert_shown';

// --- Google TTS Config ---
const GOOGLE_KEY_STORAGE = 'tts_google_key';
const GOOGLE_PALI_SETTINGS_KEY = 'tts_google_pali_custom_voice'; 

// Раздельные ключи для голоса перевода в зависимости от контекста
const GOOGLE_TRN_KEY_RU    = 'tts_google_trn_ru';
const GOOGLE_TRN_KEY_EN    = 'tts_google_trn_en';
const GOOGLE_TRN_KEY_STUDY = 'tts_google_trn_study'; // Для /d/ и /memorize/

let googleVoicesList = []; 

// Дефолтные настройки для Пали
const DEFAULT_PALI_CONFIG = { languageCode: 'pa-IN', name: 'pa-IN-Chirp3-HD-Achird' };

// --- Изолируем память для BB ---
function getSavedSlugName(slug) {
    if (!slug) return slug;
    return window.location.pathname.includes('/b/') ? 'bb_' + slug : slug;
}



// --- ЛОГИКА ОПРЕДЕЛЕНИЯ КОНТЕКСТА (URL) ---
function getContextInfo() {
  const path = window.location.pathname;
  
  // 1. Режим заучивания /d/ или /memorize/ (Индийский контекст для обоих слотов)
  if (path.includes('/d/') || path.includes('/memorize/')) {
      return {
          type: 'study',
          storageKey: GOOGLE_TRN_KEY_STUDY,
          defaultConfig: { languageCode: 'pa-IN', name: 'pa-IN-Chirp3-HD-Achird' }, 
          isIndianContext: true
      };
  }

  // 2. Русский контекст
  if (path.includes('/ru') || path.includes('/r/') || path.includes('/ml')) {
      return {
          type: 'ru',
          storageKey: GOOGLE_TRN_KEY_RU,
          defaultConfig: { languageCode: 'ru-RU', name: 'ru-RU-Standard-D' },
          isIndianContext: false
      };
  }

  // 3. Дефолт (Английский/Тайский и прочие)
  return {
      type: 'en',
      storageKey: GOOGLE_TRN_KEY_EN,
      defaultConfig: { languageCode: 'en-US', name: 'en-US-Standard-D' },
      isIndianContext: false
  };
}

const PALI_RATIO = 0.6; 

const RATES_PALI = [0.25, 0.5, 0.6, 0.8, 1.0, 1.25, 1.5];
const RATES_TRN = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5];

const ttsState = {
  playlist: [],
  currentIndex: 0,
  button: null,
  speaking: false,
  paused: false,
  utterance: null,   
  googleAudio: null, 
  langSettings: null,
  autoScroll: localStorage.getItem(SCROLL_STORAGE_KEY) !== 'false', 
  currentSlug: null,
  endIndex: undefined,
  startIndex: undefined, 
  isNavigating: false 
};

// Восстанавливаем сохраненную задержку (в миллисекундах)
window.TTS_SEGMENT_DELAY = (parseFloat(localStorage.getItem(SEGMENT_DELAY_KEY)) || 0) * 1000;

const synth = window.speechSynthesis;

// --- Утилиты ---

// --- "Вечная Тишина" (Heartbeat Audio) ---
const SILENCE_URL = '/assets/sounds/silence.mp3';
let silenceAudio = new Audio(SILENCE_URL);
silenceAudio.loop = true; 
silenceAudio.volume = 0.05;

function showToast(message) {
    const oldToast = document.getElementById('tts-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.id = 'tts-toast';
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(50, 50, 50, 0.9)', color: '#00ff00', padding: '12px 24px',
        borderRadius: '8px', zIndex: '10000', fontSize: '14px', pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontFamily: 'sans-serif', textAlign: 'center',
        transition: 'opacity 0.5s'
    });
    document.body.appendChild(toast);
    
    setTimeout(() => { 
        if(toast.parentNode) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        } 
    }, 3000);
}

function toggleSilence(enable) {
    if (enable) {
        // --- ИСПРАВЛЕНИЕ ---
        // Проверяем, что загружен именно наш mp3, иначе перезаряжаем его
        if (!silenceAudio.src || !silenceAudio.src.includes('silence.mp3')) {
             silenceAudio.src = SILENCE_URL;
        }
        
        if (!silenceAudio.paused) return;
        // -------------------

        const playPromise = silenceAudio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Media Session Setup
                if ('mediaSession' in navigator) {
                    // ЯВНО ГОВОРИМ ANDROID, ЧТО МЫ ИГРАЕМ (убираем баги анимации)
                    navigator.mediaSession.playbackState = 'playing';
                  
                    const slug = new URLSearchParams(location.search).get('q')?.toLowerCase() || ttsState.currentSlug || '';

                    // 1. Ищем заголовок Пали
                    const paliNode = document.querySelector('h1 .pli-lang, .pli-lang h1, h1[lang="pi"], [lang="pi"] h1');
                    const paliH1 = paliNode ? paliNode.innerText.trim() : '';            
                  
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: `${slug} ${paliH1}`.trim(),
                        artist: "Dhamma.gift Voice",
                        artwork: [{ src: '/assets/img/albumart.png', sizes: '1024x1024', type: 'image/png' }]
                    });

                    navigator.mediaSession.setActionHandler('play', () => { 
                        document.querySelector('.play-main-button')?.click();
                    });
                    navigator.mediaSession.setActionHandler('pause', () => {
                        document.querySelector('.play-main-button')?.click();
                    });
                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        document.querySelector('.prev-main-button')?.click();
                    });
                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        document.querySelector('.next-main-button')?.click();
                    });
                }
            }).catch(e => {
               console.warn("Silence file playback failed:", e);
            });
        }
    } else {
        // --- PAUSE ---
        if (!silenceAudio.paused) {
            silenceAudio.pause();
            
            if ('mediaSession' in navigator) {
                // ЯВНО ГОВОРИМ ANDROID, ЧТО МЫ НА ПАУЗЕ (останавливает "змейку")
                navigator.mediaSession.playbackState = 'paused'; 
                
                // ВАЖНО: Мы БОЛЬШЕ НЕ удаляем метаданные и кнопки здесь!
                // Иначе плеер в шторке станет пустым и перестанет реагировать.
            }
        }
    }
}

function updateRateOptions(isPali, activeRate) {
  const rateSelect = document.getElementById('tts-rate-select');
  if (!rateSelect) return;

  const ratesToUse = isPali ? RATES_PALI : RATES_TRN;
  
  let displayRates = [...ratesToUse];
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
    return parseFloat(localStorage.getItem(RATE_PALI_KEY)) || 1.0; 
  } else {
    return parseFloat(localStorage.getItem(RATE_TRN_KEY)) || 1.0; 
  }
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {});
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
}

async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
  }
}

function clearTtsStorage() {
  localStorage.removeItem(LAST_SLUG_KEY);
  localStorage.removeItem(LAST_INDEX_KEY);
}

function cleanTextForTTS(text) {
  if (!text) return "";

  // 1. Стандартная базовая очистка (мусор, теги, сокращения)
  let clean = text
    .replace(/[Пп]ер\./g, 'Перевод') 
    .replace(/Англ,/g, 'английского,') 
    .replace(/ [Рр]ед\./g, ' отредактировано') 

    .replace(/Trn:/g, 'Translated by') 
    .replace(/Pāḷi MS/g, 'पालि महासङ्गीति')
    .replace(/”/g, '')
    .replace(/ पन[\.:, ]/g, 'पना ') 
    .replace(/ तेन[\.:, ]/g, 'तेना ') 
    .replace(/स्स[\.:, ]/g, 'स्सा ')
    .replace(/स[\.:, ]/g, 'सा ')
    .replace(/म्म[\.:, ]/g, 'म्मा ')
    .replace(/म[\.:, ]/g, 'मा ')
    .replace(/फस्स/g, 'प्हस्स')
    .replace(/फ/g, 'प्ह')
 // .replace(/,/g, '.')
  //  .replace(/।/g, '।.')
    .replace(/…पे…/g, '…पेय्याल…')
    .replace(/’ति/g, 'ति')
    .replace(/\{.*?\}/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[ \t]+/g, ' ')  
    .replace(/[-–—]/g, ' ')
    .replace(/_/g, '').trim();

  // --- УМНАЯ ЛОГИКА (SMART SPLIT) ---
  
  // Лимит "безопасности" для Google TTS без точек.
  // Обычно 200 символов сплошного текста (без пауз) - это предел, где нейросеть начинает сбоить.
  const SAFE_LENGTH_LIMIT = 200;

  if (clean.length > SAFE_LENGTH_LIMIT) {
      // Только если текст ДЛИННЫЙ, мы меняем структуру:
      
      // 1. Превращаем запятые и точки с запятой в "Данды" (полные остановки)
    //  clean = clean.replace(/,/g, ' ।');
      clean = clean.replace(/;/g, ' ।');

      clean = clean.replace(/ होती /g, ' होती । ');
  }

  return clean;
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
  // Принудительно отключаем загрузку SC-файлов для текстов Бхиккху Бодхи
  if (window.location.pathname.includes('/b/')) {
      return null;
  }
  
  try {
    const response = await fetch(makeJsonUrl(slug));
    return response.ok ? await response.json() : null;
  } catch (e) { 
    console.warn(`Не удалось загрузить JSON для ${slug}`, e);
    return null; 
  }
}


/*
function detectTranslationLang() {
  const path = window.location.pathname;
  if (path.includes('/th/') || path.includes('/thml/')) return 'th';
  if (path.includes('/en/') || path.includes('/b/') || path.includes('/read/')) return 'en';
  return 'ru';
}
*/

function detectTranslationLang() {
  // ---> НОВОЕ: Исключение ТОЛЬКО для новых статей (нет пали И это не Легаси) <---
  const hasPali = document.querySelectorAll('.pli-lang').length > 0;
  
  if (!hasPali && !isLegacyPage()) {
      const htmlLang = document.documentElement.lang ? document.documentElement.lang.toLowerCase() : '';
      if (htmlLang.startsWith('en')) return 'en';
      if (htmlLang.startsWith('th')) return 'th';
      if (htmlLang.startsWith('ru')) return 'ru';
  }

  // ---> СТАРАЯ ЛОГИКА (для сутт и Легаси работает как раньше) <---
  const path = window.location.pathname;
  if (path.includes('/th/') || path.includes('/thml/')) return 'th';
  if (path.includes('/en/') || path.includes('/b/') || path.includes('/read/')) return 'en';
  
  return 'ru';
}


function getElementId(el) {
  return el.id || el.closest('[id]')?.id;
}

// --- Google API Helper & Voice Management ---

async function loadGoogleVoices(apiKey) {
    if (googleVoicesList.length > 0) return googleVoicesList; 

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`);
        const data = await response.json();
        if (data.voices) {
            // --- ФИЛЬТР БЕЗОПАСНОСТИ ---
            // Убираем голоса Studio, так как они платные сразу (без Free Tier)
            googleVoicesList = data.voices.filter(v => !v.name.includes('Studio'));
            // ---------------------------
            
            return googleVoicesList;
        } else if (data.error) {
             console.warn('Google API Error:', data.error);
             return [];
        }
    } catch (e) {
        console.warn('Не удалось загрузить список голосов Google:', e);
    }
    return [];
}


function setupVoiceSelectors(voices, langSelectId, voiceSelectId, storageKey, defaultConfig) {
    const langSelect = document.getElementById(langSelectId);
    const voiceSelect = document.getElementById(voiceSelectId);
    
    if (!langSelect || !voiceSelect) return;

    const languages = {}; 
    const voicesByLang = {}; 

    voices.forEach(v => {
        const langCode = v.languageCodes[0];
        if (!voicesByLang[langCode]) {
            voicesByLang[langCode] = [];
            languages[langCode] = langCode; 
        }
        voicesByLang[langCode].push(v);
    });

    const sortedLangs = Object.keys(languages).sort();

    let currentConfig = defaultConfig;
    const savedSettingRaw = localStorage.getItem(storageKey);
    if (savedSettingRaw) {
        try {
            currentConfig = JSON.parse(savedSettingRaw);
        } catch(e) {}
    }

    if (!languages[currentConfig.languageCode]) {
        currentConfig = defaultConfig; 
    }

    langSelect.innerHTML = sortedLangs.map(code => 
        `<option value="${code}" ${code === currentConfig.languageCode ? 'selected' : ''}>${code}</option>`
    ).join('');

    const isPremium = (name) => {
        return name.includes('Wavenet') || name.includes('Neural2') || name.includes('Chirp') || name.includes('Polyglot');
    };

    const renderVoices = (langCode, selectedVoiceName) => {
        const currentVoices = voicesByLang[langCode] || [];
        
        currentVoices.sort((a, b) => {
            if (a.ssmlGender !== b.ssmlGender) {
                if (a.ssmlGender === 'MALE') return -1;
                if (b.ssmlGender === 'MALE') return 1;
                return a.ssmlGender.localeCompare(b.ssmlGender);
            }
            const aPrem = isPremium(a.name);
            const bPrem = isPremium(b.name);
            if (aPrem && !bPrem) return -1;
            if (!aPrem && bPrem) return 1;
            
            return a.name.localeCompare(b.name);
        });

        let activeVoiceName = selectedVoiceName;
        if (!currentVoices.find(v => v.name === activeVoiceName)) {
            if (currentVoices.length > 0) {
                activeVoiceName = currentVoices[0].name;
            }
        }

        voiceSelect.innerHTML = currentVoices.map(v => {
            const shortName = v.name.replace(langCode + '-', '');
            const premiumMarker = isPremium(v.name) ? '💎' : '📦'; 
            const genderMarker = v.ssmlGender === 'MALE' ? 'M' : (v.ssmlGender === 'FEMALE' ? 'F' : '?');
            const label = `${premiumMarker} [${genderMarker}] ${shortName}`;
            const isSelected = v.name === activeVoiceName;
            
            return `<option value="${v.name}" ${isSelected ? 'selected' : ''}>${label}</option>`;
        }).join('');
        
        return { languageCode: langCode, name: activeVoiceName };
    };

    let validConfig = renderVoices(langSelect.value, currentConfig.name);
    saveGoogleChoice(storageKey, validConfig.languageCode, validConfig.name);

    const newLangSelect = langSelect.cloneNode(true);
    langSelect.parentNode.replaceChild(newLangSelect, langSelect);
    
    const newVoiceSelect = voiceSelect.cloneNode(true);
    voiceSelect.parentNode.replaceChild(newVoiceSelect, voiceSelect);

    newLangSelect.onchange = () => {
        const newLang = newLangSelect.value;
        const newValidConfig = renderVoices(newLang, ''); 
        saveGoogleChoice(storageKey, newValidConfig.languageCode, newValidConfig.name);
    };

    newVoiceSelect.onchange = () => {
        saveGoogleChoice(storageKey, newLangSelect.value, newVoiceSelect.value);
    };
}

function saveGoogleChoice(key, langCode, voiceName) {
    if (!langCode || !voiceName) return;
    const settings = {
        languageCode: langCode,
        name: voiceName
    };
    localStorage.setItem(key, JSON.stringify(settings));
}

// --- ОСНОВНАЯ ФУНКЦИЯ ПОПУЛЯЦИИ СПИСКОВ (УЧИТЫВАЕТ КОНТЕКСТ) ---
async function populateVoiceSelectors(apiKey, forceRefresh = false) {
    const container = document.getElementById('google-voice-settings-container');
    if (container) container.style.display = 'block';

    if (forceRefresh) {
        googleVoicesList = []; 
    }

    const allSelects = document.querySelectorAll('.google-voice-select-group select');
    if (googleVoicesList.length === 0) {
        allSelects.forEach(s => s.innerHTML = '<option>Loading...</option>');
    }

    const voices = await loadGoogleVoices(apiKey);
    if (!voices || !voices.length) {
        allSelects.forEach(s => s.innerHTML = '<option>Error / No Key</option>');
        return;
    }

    // Вспомогательная функция проверки на "Индийский регион"
    const isIndianLang = (code) => {
        return code.includes('-IN') || code.includes('ne-NP') || code.includes('si-LK');
    };

    // 1. Для Пали: Только Индийские
    const paliVoices = voices.filter(v => isIndianLang(v.languageCodes[0]));

    // 2. Для Перевода: Зависит от контекста URL
    const context = getContextInfo();
    let trnVoices = [];

    if (context.isIndianContext) {
        // Если это /d/ или /memorize/ -> предлагаем Индийские языки
        trnVoices = voices.filter(v => isIndianLang(v.languageCodes[0]));
    } else {
        // Иначе -> Русский, Английский, Тайский
        trnVoices = voices.filter(v => {
            const code = v.languageCodes[0];
            return code.startsWith('ru-') || code.startsWith('en-') || code.startsWith('th-');
        });
    }

    // --- НАСТРОЙКА UI ---

    // 1. Настройка Pali
    setupVoiceSelectors(paliVoices, 'google-lang-select-pali', 'google-voice-select-pali', GOOGLE_PALI_SETTINGS_KEY, DEFAULT_PALI_CONFIG);

    // 2. Настройка Translation (используем динамический ключ и конфиг)
    
    // Пытаемся найти умный дефолт, если сохраненного нет
    let bestDefaultVoice = null;

    if (context.isIndianContext) {
         // Для Study режима ищем Хинди или Санскрит
         bestDefaultVoice = trnVoices.find(v => v.name.includes('pa-IN-Standard-D')) || 
                            trnVoices.find(v => v.languageCodes[0] === 'pa-IN') ||
                            trnVoices[0];
    } else {
        // Для обычного режима
        const pageLang = detectTranslationLang(); 
        const preferredName = (pageLang === 'ru') ? 'ru-RU-Standard-D' : 
                              (pageLang === 'th') ? 'th-TH-Standard-A' : 'en-US-Standard-D';
        
        bestDefaultVoice = trnVoices.find(v => v.name === preferredName) || 
                           trnVoices.find(v => v.name.includes('Standard') && v.languageCodes[0].startsWith(pageLang)) ||
                           context.defaultConfig;
    }
    
    // Fallback
    const finalDefaultConfig = bestDefaultVoice ? { languageCode: bestDefaultVoice.languageCodes[0], name: bestDefaultVoice.name } : context.defaultConfig;

    // Важно: передаем context.storageKey
    setupVoiceSelectors(trnVoices, 'google-lang-select-trn', 'google-voice-select-trn', context.storageKey, finalDefaultConfig);
    
    togglePaliDropdownVisibility();
}

function togglePaliDropdownVisibility() {
    const isNative = document.getElementById('native-pali-toggle')?.checked;
    const paliDropdowns = document.getElementById('pali-google-dropdowns');
    if (paliDropdowns) {
        paliDropdowns.style.display = isNative ? 'none' : 'block';
    }
}

// --- ПОЛУЧЕНИЕ АУДИО (УЧИТЫВАЕТ КОНТЕКСТ) ---
async function fetchGoogleAudio(text, lang, rate, apiKey) {
  let targetConfig = null;

  if (lang === 'pi-dev') {
      // --- PALI ---
      const savedPali = localStorage.getItem(GOOGLE_PALI_SETTINGS_KEY);
      if (savedPali) {
          try { targetConfig = JSON.parse(savedPali); } catch (e) {}
      }
      if (!targetConfig) targetConfig = DEFAULT_PALI_CONFIG;

      // === GOOGLE-SPECIFIC PALI PATCH (Schwa Deletion Fix) ===
      if (text) {
          const C = '[\u0915-\u0939\u0933]'; 
          const B = '(?=\\s|[।,:;.?!\"]|$)';

          // Модификации текста для Google
          text = text.replace(new RegExp(`(${C})${B}`, 'g'), '$1ा');
          text = text.replace(new RegExp(`(${C})ि${B}`, 'g'), '$1ी');
          text = text.replace(new RegExp(`(${C})ु${B}`, 'g'), '$1ू');
text = text.replace(/न(?![ािीुूेोृॄॢॣंःँ्])/g, 'ना');
text = text.replace(/म(?![ािीुूेोृॄॢॣंःँ्])/g, 'मा');
text = text.replace(/ो$/g, 'ोो');
      }
      // ========================================================

  } else {
      // --- TRANSLATION (Dynamic) ---
      const context = getContextInfo(); 
      const savedTrn = localStorage.getItem(context.storageKey);
      if (savedTrn) {
          try { targetConfig = JSON.parse(savedTrn); } catch (e) {}
      }
      if (!targetConfig) targetConfig = context.defaultConfig;
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  
  const payload = {
    input: { text: text },
    voice: { languageCode: targetConfig.languageCode, name: targetConfig.name },
    audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: rate 
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
        // Тут мы оставляем алерт, так как если мы получили ответ от сервера, значит мы онлайн.
        const errorMsg = JSON.stringify(data.error, null, 2);
     //   alert(`⚠️ GOOGLE TTS ERROR!\n\nTEXT SENT:\n${text}\n\nERROR:\n${errorMsg}`);
        throw new Error(data.error.message);
    }
    // -------------------------------------

    return data.audioContent; 
  } catch (e) {
    // Добавлена проверка navigator.onLine
//    if ( !e.message.includes('Google API Error') && !e.message.includes('Synthesize failed')) {
    if (navigator.onLine && !e.message.includes('Google API Error') && !e.message.includes('Synthesize failed')) {
    //  alert(`⚠️ ERROR:\n\nTEXT:\n${text}\n\nEXCEPTION:\n${e.message}`);
    }
    // ------------------------------------------------

    console.warn('Google TTS Fetch Error:', e);
    return null; // Возвращаем null, чтобы сработал Native Fallback
  }
}

/*
async function fetchGoogleAudio(text, lang, rate, apiKey) {
  let targetConfig = null;

  if (lang === 'pi-dev') {
      // --- PALI ---
      const savedPali = localStorage.getItem(GOOGLE_PALI_SETTINGS_KEY);
      if (savedPali) {
          try { targetConfig = JSON.parse(savedPali); } catch (e) {}
      }
      if (!targetConfig) targetConfig = DEFAULT_PALI_CONFIG;
  } else {
      // --- TRANSLATION (Dynamic) ---
      const context = getContextInfo(); // Получаем текущий контекст
      
      const savedTrn = localStorage.getItem(context.storageKey);
      if (savedTrn) {
          try { targetConfig = JSON.parse(savedTrn); } catch (e) {}
      }
      
      // Если настройки нет, берем дефолт из контекста
      if (!targetConfig) targetConfig = context.defaultConfig;
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  
  const payload = {
    input: { text: text },
    voice: { languageCode: targetConfig.languageCode, name: targetConfig.name },
    audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: rate 
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.audioContent; 
  } catch (e) {
    console.warn('Google TTS Fetch Error:', e);
    return null;
  }
}

*/

async function prepareTextData(slug) {
  // 1. ПРОВЕРКА: Если это старая страница, используем Адаптер
  if (isLegacyPage()) {
      return prepareLegacyData();
  }

  const container = document.querySelector('.sutta-container') || document;
  
  const paliElements = container.querySelectorAll('.pli-lang');
  const translationElements = container.querySelectorAll('.rus-lang, .tha-lang, .eng-lang');
  
  // ---> НОВОЕ: Если стандартных блоков перевода нет, запускаем парсер статей <---
  if (paliElements.length === 0 && translationElements.length === 0) {
      return prepareGeneralArticleData();
  }
  const paliJsonData = await fetchSegmentsData(slug);
  
  // --- НАЧАЛО ИЗМЕНЕНИЙ ---
  // Сначала собираем все ID, которые фактически отрендерены на странице
  const allIds = new Set();
  const allNodesInOrder = container.querySelectorAll('.pli-lang, .rus-lang, .tha-lang, .eng-lang');
  
  allNodesInOrder.forEach(el => {
    const id = getElementId(el);
    if (id) allIds.add(id);
  });

  // Динамически определяем формат ID для текущей страницы:
  // Если хотя бы в одном ID есть двоеточие (например, "an2.1:1.1"), 
  // значит reader-rus оставил полный слаг (режим диапазона).
  let useFullKey = false;
  for (const id of allIds) {
      if (id.includes(':')) {
          useFullKey = true;
          break;
      }
  }

  const cleanJsonMap = {};
  const jsonKeys = []; 

  if (paliJsonData) {
    Object.keys(paliJsonData).forEach(key => {
      // Используем полный ключ, если это диапазон, иначе обрезаем до цифр
      const cleanKey = useFullKey ? key : key.split(':').pop();
      
      const rawText = paliJsonData[key].replace(/<[^>]*>/g, '').trim(); 
      cleanJsonMap[cleanKey] = cleanTextForTTS(rawText);
      jsonKeys.push(cleanKey); 
    });
  }
  // --- КОНЕЦ ИЗМЕНЕНИЙ ---

  const textData = [];
  
  allIds.forEach(id => {
    const paliElement = Array.from(paliElements).find(el => getElementId(el) === id);
    const translationElement = Array.from(translationElements).find(el => getElementId(el) === id);
    
    let paliDev = '';
    let translation = '';
    
    if (cleanJsonMap[id]) {
      paliDev = cleanJsonMap[id];
      const currentIndex = jsonKeys.indexOf(id);
      if (currentIndex !== -1) {
        // Логика склеивания (lookahead) для слов на Пали
        let lookAheadIndex = currentIndex + 1;
        while (lookAheadIndex < jsonKeys.length) {
          const nextKey = jsonKeys[lookAheadIndex];
          if (allIds.has(nextKey)) break;
          const nextVal = cleanJsonMap[nextKey];
          if (nextVal) {
             const lowerNext = nextVal.charAt(0).toLowerCase() + nextVal.slice(1);
             paliDev += " " + lowerNext;
          }
          lookAheadIndex++;
        }
      }
    } else if (paliElement) {
      // --- ФОЛБЭК ДЛЯ BB (/b/) ---
      // Файл не качался, берем текст с экрана (он может быть латиницей или деванагари)
      let rawDomText = paliElement.textContent.replace(/<[^>]*>/g, '').trim();
      let cleanedText = cleanTextForTTS(rawDomText);
      
      // Конвертируем для Google TTS (функция не тронет текст, если он уже деванагари)
      if (window.convertPaliToDevanagari) {
          paliDev = window.convertPaliToDevanagari(cleanedText);
      } else {
          paliDev = cleanedText;
      }
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
    const addPali = () => {
        if (item.paliDev) playlist.push({
          text: item.paliDev, lang: 'pi-dev', element: item.paliElement, id: item.id
        });
    };
    const addTrn = () => {
        if (item.translation) playlist.push({
          text: item.translation, lang: translationLang, element: item.translationElement, id: item.id
        });
    };

    if (mode === 'pi') { addPali(); }
    else if (mode === 'trn') { addTrn(); }
    else if (mode === 'pi-trn') { addPali(); addTrn(); }
    else if (mode === 'trn-pi') { addTrn(); addPali(); }
  });
  
  return playlist;
}

function shouldRequestWakeLockForItem(item) {
  const googleKey = (localStorage.getItem(GOOGLE_KEY_STORAGE) || window.TRIAL_KEY);

  // Если Google TTS недоступен, остаётся нативный голос — экран можно держать как раньше
  if (!googleKey || googleKey.length <= 10) return true;
  if (!item) return true;

  const useNativePali = localStorage.getItem(NATIVE_PALI_KEY) === 'true';
  const useNativeTrn  = localStorage.getItem(NATIVE_TRN_KEY) === 'true';

  if (item.lang === 'pi-dev') return !useNativePali;
  return !useNativeTrn;
}

// --- Ядро TTS ---
async function playCurrentSegment() {
 
 if (window.ttsDelayTimeout) clearTimeout(window.ttsDelayTimeout);
 
   if (ttsState.googleAudio) {
      ttsState.googleAudio.pause();       // 1. Остановить звук
      ttsState.googleAudio.onended = null; // 2. Убить переключение на след. фразу
      ttsState.googleAudio = null;         // 3. Удалить ссылку
  }
  window.speechSynthesis.cancel();         // 4. Сбросить нативный голос
  
  if (ttsState.currentIndex < 0 || ttsState.currentIndex >= ttsState.playlist.length) {
    clearTtsStorage();
    stopPlayback();
    return;
  }

  const item = ttsState.playlist[ttsState.currentIndex];

  if (!wakeLock && !ttsState.paused && shouldRequestWakeLockForItem(item)) {
    requestWakeLock();
  }

  if (ttsState.utterance) {
    ttsState.utterance.onend = null;
    ttsState.utterance.onerror = null;
  }
  
  synth.cancel();
  
  if (ttsState.googleAudio) {
      ttsState.googleAudio.pause();
      ttsState.googleAudio = null;
  }

  resetUI();


  if (ttsState.currentSlug) {
    if (ttsState.currentIndex >= ttsState.playlist.length - 2) {
       clearTtsStorage(); 
    } else {
       // Оборачиваем слаг в наш хелпер
       localStorage.setItem(LAST_SLUG_KEY, getSavedSlugName(ttsState.currentSlug));
       localStorage.setItem(LAST_INDEX_KEY, ttsState.currentIndex);
    }
  }

  
  if (item.element) {
    document.querySelectorAll('.active-word').forEach(e => e.classList.remove('active-word'));
    
    if (item.element.classList.contains('pli-lang')) {
      item.element.classList.add('active-word');
    }
    
    const segmentId = item.id;
    const segmentContainer = document.getElementById(segmentId);

    if (segmentContainer) {
        const connectedElements = segmentContainer.querySelectorAll('.pli-lang, .rus-lang, .tha-lang, .eng-lang');
        if (connectedElements.length > 0) {
            connectedElements.forEach(el => el.classList.add('tts-active'));
        } else {
            segmentContainer.classList.add('tts-active');
        }
    } else {
        item.element.classList.add('tts-active');
    }
    
      if (ttsState.autoScroll) {
      // Скроллим к контейнеру (id), так как само слово может быть скрыто
      const scrollTarget = document.getElementById(item.id) || item.element;
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }

  let uiRate = 1.0;     
  let audioRateBrowser = 1.0; 
  let audioRateGoogle = 1.0;  
  
  let isPali = false;
  let targetLang = 'en';

  if (item.lang === 'ru') {
    uiRate = getRateForLang('ru');
    audioRateBrowser = uiRate;
    audioRateGoogle = uiRate;
    targetLang = 'ru';
  } else if (item.lang === 'th') { 
    uiRate = getRateForLang('th'); 
    audioRateBrowser = uiRate;
    audioRateGoogle = uiRate;
    targetLang = 'th';
  } else if (item.lang === 'en') {
    uiRate = getRateForLang('en');
    audioRateBrowser = uiRate;
    audioRateGoogle = uiRate;
    targetLang = 'en';
  } else if (item.lang === 'pi-dev') {
    isPali = true;
    targetLang = 'pi-dev';
    // Проверяем, менял ли пользователь скорость вручную. Если нет — ставим 0.8
    const savedPaliRate = localStorage.getItem(RATE_PALI_KEY);
    uiRate = savedPaliRate !== null ? parseFloat(savedPaliRate) : 0.8;
    
    audioRateBrowser = uiRate * PALI_RATIO; 
    audioRateGoogle  = uiRate;              
  }

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

  // === ГИБРИДНЫЙ РЕЖИМ ===
  const googleKey = (localStorage.getItem(GOOGLE_KEY_STORAGE) || window.TRIAL_KEY); 
  const useNativePali = localStorage.getItem(NATIVE_PALI_KEY) === 'true';
  const useNativeTrn  = localStorage.getItem(NATIVE_TRN_KEY) === 'true'; // <--- Читаем настройку
  
  let tryGoogle = false;

  if (googleKey && googleKey.length > 10) {
      if (isPali) {
          // Если Пали, используем Google ТОЛЬКО если Native выключен
          if (!useNativePali) {
              tryGoogle = true;
          }
      } else {
          // Если Перевод: используем Google, ТОЛЬКО если Native выключен
          if (!useNativeTrn) { // <--- Было безусловное true, теперь проверка
              tryGoogle = true;
          }
      }
  }

  if (tryGoogle) {
      try {
          // 1. ЗАПОМИНАЕМ, какой индекс мы собираемся озвучить
          const targetIndex = ttsState.currentIndex; 

          // Ждем ответа от серверов Google...
          const audioContent = await fetchGoogleAudio(item.text, targetLang, audioRateGoogle, googleKey);
          
          // 2. ПРОВЕРЯЕМ: если пока мы ждали интернет, пользователь нажал Next/Prev,
          // индекс изменился. Значит, эта скачанная аудиозапись уже устарела. Выкидываем её!
          if (targetIndex !== ttsState.currentIndex || !ttsState.speaking) {
              return; 
          }

          if (audioContent) {
              const audio = new Audio("data:audio/mp3;base64," + audioContent);
              ttsState.googleAudio = audio;
              
              audio.onended = () => {
                  ttsState.googleAudio = null;
                  if (ttsState.speaking && !ttsState.paused) {
                      const delay = window.TTS_SEGMENT_DELAY || 0;
                      const isRangeEnd = ttsState.endIndex !== undefined && ttsState.currentIndex >= ttsState.endIndex;

                      if (!isRangeEnd) {
                          ttsState.currentIndex++; // Индекс увеличивается ДО таймаута
                      }

                      const finishOrNext = () => {
                          if (isRangeEnd) {
                              ttsState.speaking = false;
                              setButtonIcon('play');
                              document.dispatchEvent(new CustomEvent('tts-range-finished'));
                          } else {
                              playCurrentSegment();
                          }
                      };

                      if (delay > 0) {
                          window.ttsDelayTimeout = setTimeout(finishOrNext, delay);
                      } else {
                          finishOrNext();
                      }
                  }
              };


              
audio.onerror = (err) => {
    console.error("Google Audio playback error", err);
    // Вместо безусловного перехода к следующему, можно либо вызвать фолбэк на нативный:
    playBrowserTTS(item.text, targetLang, audioRateBrowser, isPali); 
    // Либо, если мы понимаем что это ошибка доступа, просто паузить.
};

              if (!ttsState.paused) {
                  const playPromise = audio.play();
                  if (playPromise !== undefined) {
                      playPromise.catch(e => {
                          console.warn("Autoplay blocked or failed", e);
                          ttsState.paused = true; 
                          setButtonIcon('play');
                      });
                  }
              }
              return; 
          }
      } catch (e) {
          console.warn("Google TTS failed, falling back to browser", e);
      }
  }

  // Фолбэк на Native (Browser)
  playBrowserTTS(item.text, targetLang, audioRateBrowser, isPali);
}

function playBrowserTTS(text, langKey, rate, isPali) {
  const utterance = new SpeechSynthesisUtterance(text);
  
  if (langKey === 'ru') utterance.lang = 'ru-RU';
  else if (langKey === 'th') utterance.lang = 'th-TH';
  else if (langKey === 'en') utterance.lang = 'en-US';
  else if (langKey === 'pi-dev') {
     utterance.lang = 'sa-IN'; 
     utterance._fallbackAttempt = 0; 
  }

  utterance.rate = rate;

  utterance.onend = () => {
      if (ttsState.speaking && !ttsState.paused) {
          const delay = window.TTS_SEGMENT_DELAY || 0;
          const isRangeEnd = ttsState.endIndex !== undefined && ttsState.currentIndex >= ttsState.endIndex;

          if (!isRangeEnd) {
              ttsState.currentIndex++; 
          }

          const finishOrNext = () => {
              if (isRangeEnd) {
                  ttsState.speaking = false;
                  setButtonIcon('play');
                  document.dispatchEvent(new CustomEvent('tts-range-finished'));
              } else {
                  playCurrentSegment();
              }
          };

          if (delay > 0) {
              window.ttsDelayTimeout = setTimeout(finishOrNext, delay);
          } else {
              finishOrNext();
          }
      }
  };



  utterance.onerror = (e) => {
    // 1. БЛОКИРОВКА БРАУЗЕРОМ (Autoplay blocked)
    // Хром выдает 'not-allowed', если юзер еще не кликнул по странице.
    if (e.error === 'not-allowed') {
      console.warn('TTS: Autoplay blocked by browser policy.');
      ttsState.paused = true;
      setButtonIcon('play');
      return; // ОСТАНАВЛИВАЕМСЯ. Индекс не растет, ждем клика (forceUnlock подхватит).
    }

    // 2. КРИТИЧЕСКИЕ СИСТЕМНЫЕ ОШИБКИ
    // Если упал сервис речи в Windows/Android или нет сети для облачного голоса.
    if (e.error === 'audio-busy' || e.error === 'network') {
      console.error('TTS: Critical system error:', e.error);
      ttsState.paused = true;
      setButtonIcon('play');
      return; 
    }

    console.error('Browser TTS Error:', e);
    
    // 3. ЛОГИКА ФОЛБЭКОВ ДЛЯ ПАЛИ (Sanskrit -> Hindi -> English)
    if (langKey === 'pi-dev') {
      const currentAttempt = utterance._fallbackAttempt || 0;
      
      if (currentAttempt === 0 && utterance.lang === 'sa-IN') {
        console.log('Sanskrit failed, trying Hindi...');
        utterance.lang = 'hi-IN';
        utterance._fallbackAttempt = 1;
        utterance.rate = rate; 
        setTimeout(() => { if (ttsState.speaking && !ttsState.paused) synth.speak(utterance); }, 1);
        return;
      }
      
      if (currentAttempt === 1 && utterance.lang === 'hi-IN') {
        console.log('Hindi failed, trying English...');
        utterance.lang = 'en-US';
        utterance._fallbackAttempt = 2;
        utterance.rate = rate;
        
        setTimeout(() => {
          if (ttsState.speaking && !ttsState.paused) {
            synth.speak(utterance);
            
            const pathLang = location.pathname.split('/')[1];
            const isRuLike = ['ru', 'r', 'ml'].includes(pathLang);
            const helpUrl = isRuLike ? '/assets/common/ttsHelp.html#tts-help-ru' : '/assets/common/ttsHelp.html#tts-help-en';
            const title = isRuLike ? 'TTS:' : 'TTS Hint:';
            const helpLink = `<a href="${helpUrl}" target="_blank" style="color: #4da6ff;">(?)</a>`;
            const message = isRuLike 
              ? `Не найдено модулей близких к Пали. Установлен Английский. См. помощь ${helpLink}.`
              : `No Pāḷi-friendly voices found. Using English. See help ${helpLink}.`;
            showVoiceHint(title, message, PALI_ALERT_KEY);
          }
        }, 1);
        return;
      }
    }
    
    // 4. ПРЕРЫВАНИЕ ИЛИ СКРЫТИЕ ВКЛАДКИ
    if (document.hidden || e.error === 'interrupted') {
      ttsState.paused = true;
      setButtonIcon('play');
      return; 
    }

    // 5. ПРОПУСК СЕГМЕНТА (для мелких ошибок)
    // Переходим к следующей фразе, только если это не блокировка и не пауза.
    if (ttsState.speaking && !ttsState.paused) {
      ttsState.currentIndex++;
      playCurrentSegment();
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


async function handleSuttaClick(e) {
  // === НОВОЕ: Перехват клика по мини-кнопке (после загрузки скрипта) ===
  const dynamicBtn = e.target.closest('.dynamic-tts-btn');
  if (dynamicBtn) {
      e.preventDefault();
      e.stopPropagation();

      let mode = localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
      if (mode !== 'pi-trn' && mode !== 'trn-pi') {
          const activeWord = document.querySelector('.active-word');
          if (activeWord) {
              mode = activeWord.classList.contains('pli-lang') ? 'pi' : 'trn';
              localStorage.setItem(MODE_STORAGE_KEY, mode);
              const modeSelect = document.getElementById('tts-mode-select');
              if (modeSelect) modeSelect.value = mode;
          }
      }
      
      let slug = ttsState.currentSlug;
      if (!slug) {
          const mainPlayBtn = document.querySelector('a.voice-link[data-slug]');
          if (mainPlayBtn) slug = mainPlayBtn.dataset.slug;
      }
      if (!slug && typeof isLegacyPage === 'function' && isLegacyPage()) {
           slug = window.location.pathname.split('/').pop() || 'legacy_page';
      }
      if (!slug) return;
      
      const player = getOrBuildPlayer();
      const internalPlayBtn = player.querySelector('.play-main-button');
      if (internalPlayBtn) internalPlayBtn.dataset.slug = slug;
      
      player.classList.add('active');
      startPlayback(document, mode, slug); 
      dynamicBtn.remove();
      return;
  }
  // =====================================================================

  if (e.target.closest('#tts-settings-toggle')) {
    e.preventDefault();
    const panel = document.getElementById('tts-settings-panel');
    const icon = document.getElementById('tts-settings-icon');
    const abPanel = document.getElementById('memorize-panel');
    
    let wasAbPanelOpen = false;
    if (abPanel && abPanel.classList.contains('visible')) {
        wasAbPanelOpen = true;
        abPanel.classList.remove('visible'); 
    }

    if (panel) {
        panel.classList.toggle('visible');
        if (panel.classList.contains('visible')) {
            if (icon) icon.style.transform = 'rotate(90deg)';
        } else {
            if (icon) icon.style.transform = 'rotate(0deg)';
            const advSettings = document.getElementById('tts-advanced-settings');
            if (advSettings) advSettings.classList.remove('visible');
            const basicPanel = document.getElementById('tts-basic-settings');
            if (basicPanel) {
                basicPanel.style.maxHeight = '200px';
                basicPanel.style.opacity = '1';
            }
        }
    }
    return;
  }

  const container = e.target.closest('.sutta-container') || document;
  const voiceLink = e.target.closest('.voice-link');
  const playBtn = e.target.closest('.play-main-button');
  const navBtn = e.target.closest('.prev-main-button, .next-main-button');

  if (voiceLink) {
    e.preventDefault();
    let targetSlug = voiceLink.dataset.slug;
    if (!targetSlug) {
        targetSlug = window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
    }
    const player = getOrBuildPlayer();
    const internalPlayBtn = player.querySelector('.play-main-button');
    if (internalPlayBtn && targetSlug) {
        internalPlayBtn.dataset.slug = targetSlug;
    }
    player.classList.add('active');
    if (!ttsState.speaking) {
      const mode = player.querySelector('#tts-mode-select')?.value 
                   || localStorage.getItem(MODE_STORAGE_KEY) 
                   || 'trn';
      startPlayback(container, mode, targetSlug, 0);
    }
    return;
  }

  if (navBtn) {
    e.preventDefault();
    if (!ttsState.speaking || ttsState.playlist.length === 0) return;
    if (window.ttsDelayTimeout) clearTimeout(window.ttsDelayTimeout);
    if (ttsState.utterance) {
        ttsState.utterance.onend = null;
    }
    let direction = navBtn.classList.contains('prev-main-button') ? -1 : 1;
    let newIndex = ttsState.currentIndex + direction;
    
    if (ttsState.startIndex !== undefined && ttsState.endIndex !== undefined) {
        if (direction > 0 && newIndex > ttsState.endIndex) {
            newIndex = ttsState.startIndex; 
        } else if (direction < 0 && newIndex < ttsState.startIndex) {
            newIndex = ttsState.endIndex;   
        }
    } else {
        if (direction < 0 && newIndex < 0) newIndex = 0;
        else if (direction > 0 && newIndex >= ttsState.playlist.length) newIndex = ttsState.playlist.length - 1;
    }
    
    if (newIndex === ttsState.currentIndex) return;
    synth.cancel();
    if (ttsState.googleAudio) {
        ttsState.googleAudio.pause();
        ttsState.googleAudio.onended = null;
        ttsState.googleAudio = null;
    }
    ttsState.currentIndex = newIndex;
    if (ttsState.paused) {
      resetUI();
      const item = ttsState.playlist[ttsState.currentIndex];
      if (item && item.element) {
        item.element.classList.add('tts-active');
        if (ttsState.autoScroll) {
          const scrollTarget = document.getElementById(item.id) || item.element;
          scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      playCurrentSegment();
    }
    return;
  }

  if (playBtn && !e.target.classList.contains('voice-link')) {
    e.preventDefault();
    const pageVoiceLink = document.querySelector('.voice-link[data-slug]');
    const freshPageSlug = pageVoiceLink ? pageVoiceLink.dataset.slug : null;
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
      let targetSlug = freshPageSlug || playBtn.dataset.slug || ttsState.currentSlug;
      startPlayback(container, mode, targetSlug, 0);
    } else {
      if (ttsState.speaking) {
        if (ttsState.paused) {
          // --- RESUME ---
          ttsState.paused = false;
          setButtonIcon('pause');
          toggleSilence(true);

          if (shouldRequestWakeLockForItem(ttsState.playlist[ttsState.currentIndex])) {
            requestWakeLock();
          }
          if (ttsState.googleAudio) {
              ttsState.googleAudio.play();
          } else {
              playCurrentSegment(); 
          }
        } else {
          // --- PAUSE ---
          ttsState.paused = true;
          releaseWakeLock(); // <--- ВЫКЛЮЧАЕМ ЭКРАН ПРИ ПАУЗЕ
          if (window.ttsDelayTimeout) clearTimeout(window.ttsDelayTimeout); 
          if (ttsState.utterance) ttsState.utterance.onend = null; 
          synth.cancel();
          if (ttsState.googleAudio) {
              ttsState.googleAudio.pause();
          }
          toggleSilence(false); 
          setButtonIcon('play');
        }
      } else {
        // --- START FRESH ---
        const mode = document.getElementById('tts-mode-select')?.value || localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
        let targetSlug = freshPageSlug || playBtn.dataset.slug || ttsState.currentSlug;
        startPlayback(container, mode, targetSlug, 0);
      }
    }
    return;
  }

  if (e.target.closest('.close-tts-btn')) {
    e.preventDefault();
    stopPlayback();
    const activeWord = document.querySelector('.active-word');
    if (activeWord) {
        const rowContainer = activeWord.closest("[id]") || activeWord;
        addTtsButton(rowContainer, activeWord);
    }
  }
}


function stopPlayback() {
  if (window.ttsDelayTimeout) clearTimeout(window.ttsDelayTimeout); // УБИВАЕМ ПРИЗРАКА
  if (ttsState.utterance) ttsState.utterance.onend = null;
  synth.cancel();
  
  if (ttsState.googleAudio) {
      ttsState.googleAudio.pause();
      ttsState.googleAudio.src = ''; // Выгружаем из памяти
      ttsState.googleAudio.load();
      ttsState.googleAudio = null;
  }
  
  // --- ПОЛНАЯ ОСТАНОВКА ФОНОВОЙ ТИШИНЫ ---
  // Вместо toggleSilence(false) мы жестко отвязываем файл:
  silenceAudio.pause();
  silenceAudio.src = ''; // Отвязываем mp3 файл
  silenceAudio.load();   // Заставляем браузер забыть его. Это действие закроет шторку Android!
  // ---------------------------------------

  // --- ПОЛНАЯ ОЧИСТКА ПЛЕЕРА ИЗ ТРЕЯ ---
  if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
  }
  // -----------------------------------------------

  ttsState.speaking = false;
  ttsState.paused = false;
  ttsState.isNavigating = false;
  releaseWakeLock();
  
  const player = document.getElementById('voice-player-container');
  if (player) {
    player.classList.remove('active');
  }
  
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
      // Оборачиваем текущий слаг в наш хелпер для проверки
      if (lastSlug === getSavedSlugName(slug) && lastIndex < playlist.length) {
        actualStartIndex = lastIndex;
      }
    }

  }
  
  synth.cancel();
  if (ttsState.googleAudio) {
      ttsState.googleAudio.pause();
      ttsState.googleAudio = null;
  }
  
  toggleSilence(true);
  
  ttsState.playlist = playlist;
  ttsState.currentIndex = actualStartIndex;
  ttsState.currentSlug = slug;
  
  ttsState.endIndex = undefined; // Сброс границы заучивания
  document.dispatchEvent(new CustomEvent('tts-playback-started')); // Сигнал отключения цикла
  
  ttsState.langSettings = mode;
  ttsState.speaking = true;
  ttsState.paused = false;
  ttsState.isNavigating = false;
  
  setButtonIcon('pause');
  
  // --- НОВОЕ: Показываем Hint при первом воспроизведении, если активен триал ---
  // --- НОВОЕ: Показываем Hint при первом воспроизведении (с ссылкой) ---
  if (window.TRIAL_KEY && !localStorage.getItem(GOOGLE_KEY_STORAGE)) {
      if (!localStorage.getItem('tts_trial_play_hint_shown')) {
          
          const isRu = window.location.pathname.includes('/ru') || window.location.pathname.includes('/r/');
          const title = isRu ? "Демо-режим:" : "Demo Mode:";
          
          // Ссылки на поиск Google
          const searchUrlRu = "https://www.google.com/search?q=%D0%BA%D0%B0%D0%BA+%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C+%D0%B0%D0%BF%D0%B8+%D0%BA%D0%BB%D1%8E%D1%87+%D0%B3%D1%83%D0%B3%D0%BB+tts";
          const searchUrlEn = "https://www.google.com/search?q=how+to+get+google+cloud+text+to+speech+api+key";
          
          // Стиль для ссылки (светло-голубой, чтобы видно на темном)
          const linkStyle = "color: #4da6ff; text-decoration: underline; font-weight: bold;";

          const message = isRu 
              ? `Включены <b>голоса от Google</b>. Если понравится, вы можете <a href="${searchUrlRu}" target="_blank" style="${linkStyle}">получить свой ключ</a> бесплатно.` 
              : `<b>Google voices</b> active. If you like it, you can <a href="${searchUrlEn}" target="_blank" style="${linkStyle}">get your own key</a> for free.`;

          if (typeof showVoiceHint === 'function') {
              showVoiceHint(title, message, 'tts_trial_play_hint_shown');
          }
      }
  }
  // -----------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  
  setTimeout(() => {
     playCurrentSegment();
  }, 100);
}

function showVoiceHint(title, message, storageKey) {
  if (localStorage.getItem(storageKey)) return;
  if (document.getElementById('active-voice-hint')) return;

  const notification = document.createElement('div');
  notification.id = 'active-voice-hint'; 

  notification.innerHTML = `
      <div class="hint" style="display: flex; align-items: center; gap: 10px;">
          <div>💡 <strong>${title}</strong> ${message}</div>
          <button id="closeVoiceHintBtn" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 0 0 0 10px;" title="(Esc)">×</button>
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

function getPlayerHtml() {
  const isSpecialPath = window.location.pathname.match(/\/d\/|\/memorize\//);
  const defaultMode = isSpecialPath ? 'pi' : 'trn';
  const savedMode = localStorage.getItem(MODE_STORAGE_KEY) || defaultMode;
  
  const saved = localStorage.getItem(GOOGLE_KEY_STORAGE);
  const savedKey = saved ?? window.TRIAL_KEY ?? '';
  const isNativePali = localStorage.getItem(NATIVE_PALI_KEY) === 'true'; 
  const isNativeTrn = localStorage.getItem(NATIVE_TRN_KEY) === 'true'; 
  let initialRate;
  let currentRatesList; 
  
  if (savedMode === 'pi') {
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

  const helpUrl = isRuLike 
    ? '/assets/common/ttsHelp.html#tts-help-ru' 
    : '/assets/common/ttsHelp.html#tts-help-en';

  const modeLabels = isRuLike
    ? { 'pi': 'Пали', 'pi-trn': 'Пали + Рус', 'trn': 'Перевод', 'trn-pi': 'Рус + Пали' }
    : { 'pi': 'Pāḷi', 'pi-trn': 'Pāḷi + Trn', 'trn': 'Trn', 'trn-pi': 'Trn + Pāḷi' };
  
  const style = `
  <style>
    .tts-settings-btn { left: 15px; }
    .close-tts-btn    { right: 15px; }

    .tts-top-btn:hover { color: #333; }
    .dark .tts-top-btn { color: #bbb; }
    .dark .tts-top-btn:hover { color: #fff; }

    .tts-controls-row {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 5px;
        margin-bottom: 5px;
    }

    #tts-settings-panel {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.4s ease, opacity 0.4s ease, margin-top 0.4s ease;
        margin-top: 0;
    }
    
    #tts-settings-panel.visible {
        max-height: 800px; /* Увеличили запас высоты */
        opacity: 1;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #444;
    }

    /* --- Advanced Settings Styles --- */
    #tts-advanced-settings {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.4s ease, opacity 0.4s ease;
        margin-top: 0;
        border-top: 1px solid #555;
        padding-top: 0;
    }

    #tts-advanced-settings.visible {
        max-height: 500px;
        opacity: 1;
        margin-top: 8px;
        padding-top: 8px;
    }

    .extra-settings-toggle {
        background: none;
        border: none;
        color: #777;
        font-size: 11px;
        width: 100%;
        cursor: pointer;
        margin-top: 8px;
        padding: 4px 0;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    .extra-settings-toggle:hover { color: #ccc; }
    /* ----------------------------- */
	
    .tts-main-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 15px;
        height: 40px;
    }

    .tts-controls-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
  
    .tts-top-btn {
        position: static !important;
        color: #555; /* Было #999. Сделали темнее для видимости на белом */
        font-size: 24px;
        text-decoration: none !important;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .tts-top-btn:hover {
        color: #000; /* Было #fff. Теперь черный при наведении в светлой теме */
    }

    /* Стили для темной темы (оставляем белую подсветку) */
    .dark .tts-top-btn {
        color: #bbb; 
    }
    .dark .tts-top-btn:hover {
        color: #fff; 
    }
    

    .tts-icon {
        filter: invert(0.5);
    }

    .close-tts-btn {
      transform: translate(-5px, 0px);
    }

    #google-api-key-input {
        width: 100px;
        background: #eee;
        border: 1px solid #ccc;
        color: #333;
        border-radius: 4px;
        padding: 2px 4px;
        font-size: 11px;
        transition: background 0.3s, color 0.3s;
    }

    .dark #google-api-key-input {
        background: #333;
        border: 1px solid #555;
        color: #ccc;
    }

    .refresh-api-btn {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 14px;
        padding: 0 4px;
        transition: color 0.2s;
        display: inline-flex;
        align-items: center;
    }
    .refresh-api-btn:hover {
        color: #fff;
    }
    
    .reset-tts-btn {
        background: none;
        border: none;
        color: #777;
        cursor: pointer;
        font-size: 14px;
        padding: 0 4px;
        transition: color 0.2s;
        display: inline-flex;
        align-items: center;
    }
    .reset-tts-btn:hover {
        color: #ff5555;
    }
    
    .api-key-row {
        display: flex; 
        align-items: center; 
        justify-content: center;
        gap: 5px;
        margin-top: 5px;
    }

    .google-voice-select-group {
        margin-bottom: 8px;
    }
    
    .voice-header-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        margin-bottom: 2px;
    }

    .google-voice-label {
        font-size: 11px; color: #aaa; margin-bottom: 0;
    }
    
    .google-voice-dropdown {
        width: 100%; 
        max-width: 150px; 
        margin-bottom: 4px; 
        font-size: 11px; 
        border: 1px solid #ccc;
        background: #eee; 
        color: #333; 
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .dark .google-voice-dropdown {
        background: #333; 
        color: #ccc; 
        border: 1px solid #555;
    }
  </style>
  `;

  return style + `
    <div style="text-align: center;">
       <div class="tts-main-row">
        <a href="javascript:void(0)" id="tts-settings-toggle" class="tts-top-btn tts-settings-btn" title="Settings">
            <svg id="tts-settings-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="transition: transform 0.3s ease;">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
        </a>

        <div class="tts-controls-row">
            <a href="javascript:void(0)" class="prev-main-button tts-icon-btn">
                <img src="/assets/svg/backward-step.svg" class="tts-icon backward" width="20">
            </a>
            <a href="javascript:void(0)" class="play-main-button tts-icon-btn large">
                <img src="/assets/svg/play-grey.svg" class="tts-icon play" width="34">
            </a>
            <a href="javascript:void(0)" class="next-main-button tts-icon-btn">
                <img src="/assets/svg/forward-step.svg" class="tts-icon forward" width="20">
            </a>
        </div>

        <a href="javascript:void(0)" class="tts-top-btn close-tts-btn">&times;</a>
    </div>
    
    <div id="tts-settings-panel">
          <div id="tts-basic-settings" style="overflow: hidden; transition: max-height 0.4s ease, opacity 0.4s ease; max-height: 200px; opacity: 1;">
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

              <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 5px;">
                <label class="tts-checkbox-custom">
                  <input type="checkbox" id="tts-scroll-toggle" ${ttsState.autoScroll ? 'checked' : ''}>
                  Scroll
                </label>
                <label class="tts-checkbox-custom">
                  <input type="checkbox" id="tts-autoplay-toggle" ${localStorage.getItem('ttsMode') === 'true' ? 'checked' : ''}>
                  Autoplay
                </label>
              </div>
          </div>
  

              <div style="display: flex; justify-content: center; margin-bottom: 8px;">
                  <label class="tts-delay-label" title="Пауза между фразами (секунды)">
                            <img src="/assets/svg/hourglass-regular-full.svg" width="14" height="14" alt="timer" style=" vertical-align: text-bottom;">
                    Delay
<span id="tts-segment-delay-input" class="tts-editable-span" contenteditable="true" inputmode="decimal" spellcheck="false">${localStorage.getItem('tts_segment_delay') || 0}</span>


                      sec
                  </label>
              </div>

      
          <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 8px; flex-wrap: wrap;">
          
<button id="tts-advanced-toggle-btn" class="extra-settings-toggle" style="width: auto; margin: 0; padding: 0; display: inline-flex;">
    🔧 Google Voice
</button>


            
            <a href="/tts.php${window.location.search}" class="tts-link tts-text-link">TTS</a>
            <a class="tts-link" title='sc-voice.net' href='https://www.sc-voice.net/?src=sc#/sutta/$fromjs'>VSC</a>
            
            <span id="audio-file-link-placeholder" style="display: none;"></span>
            
            <a href="${helpUrl}" target="_blank" class="tts-link" title="Help" style="text-decoration: none;">?</a>


          </div>


          <div id="tts-advanced-settings">
              <div class="api-key-row">
                <input type="password" id="google-api-key-input" 
                       value="${savedKey}" 
                       placeholder="Google API Key" 
                       title="Enter Google Cloud TTS API Key for premium voices">
                <button id="refresh-voices-btn" class="refresh-api-btn" title="Refresh Voice List">
        <img src="/assets/svg/rotate-right-solid-full.svg" width="16" height="16" alt="Refresh">     
                </button>
<button id="reset-tts-btn" class="reset-tts-btn" title="Full Reset (Clear Data)">
    <img src="/assets/svg/trash-can-regular-full.svg" width="16" height="16" alt="Reset">
</button>

              </div>

              <div id="google-voice-settings-container" style="display:none; margin-top: 8px;">
                  
                  <div class="google-voice-select-group">
                           <div class="google-voice-label">Pāḷi Voice: <label class="tts-checkbox-custom" style="margin: 0; font-size: 10px;">
                              <input type="checkbox" id="native-pali-toggle" ${isNativePali ? 'checked' : ''}>
                              Native
                           </label></div>

                      <div id="pali-google-dropdowns" style="display: ${isNativePali ? 'none' : 'block'};">
                           <select id="google-lang-select-pali" class="google-voice-dropdown"></select>
                           <select id="google-voice-select-pali" class="google-voice-dropdown"></select>
                      </div>
                  </div>

                  <div class="google-voice-select-group">
                      <div class="google-voice-label">Trn Voice:
                          <label class="tts-checkbox-custom" style="margin: 0; font-size: 10px;">
                              <input type="checkbox" id="native-trn-toggle" ${isNativeTrn ? 'checked' : ''}>
                              Native
                          </label>
                      </div>
                      
                      <div id="trn-google-dropdowns" style="display: ${isNativeTrn ? 'none' : 'block'};">
                          <select id="google-lang-select-trn" class="google-voice-dropdown"></select>
                          <select id="google-voice-select-trn" class="google-voice-dropdown"></select>
                      </div>
                      </div>


              </div>
          </div>
      </div>
    </div>
    `;
}


function getOrBuildPlayer() {
    const playerId = 'voice-player-container';
    let playerContainer = document.getElementById(playerId);

    if (!playerContainer) {
        playerContainer = document.createElement('div');
        playerContainer.id = playerId;
        playerContainer.className = 'voice-dropdown'; 
        
        const player = document.createElement('div');
        player.className = 'voice-player';
        playerContainer.appendChild(player);
        document.body.appendChild(playerContainer);
    }
    
    const playerInner = playerContainer.querySelector('.voice-player');
    if (playerInner) {
        playerInner.innerHTML = getPlayerHtml();

        const savedKey = (localStorage.getItem(GOOGLE_KEY_STORAGE) || window.TRIAL_KEY);
        if (savedKey && savedKey.length > 10) {
            setTimeout(() => populateVoiceSelectors(savedKey), 100);
        }
    }

    const placeholder = playerContainer.querySelector('#audio-file-link-placeholder');
    const sourceLink = document.querySelector('span.tts-link[data-src]');

    if (sourceLink && placeholder) {
        const fileUrl = sourceLink.getAttribute('data-src');
        if (fileUrl) {
            placeholder.innerHTML = `<a class='tts-link' href='${fileUrl}' target='_blank'>File</a>`;
            placeholder.style.display = "inline"; 
        } else {
             placeholder.style.display = "none";
        }
    } else if (placeholder) {
        placeholder.style.display = "none";
    }

    return playerContainer;
}

// --- Интерфейс (для index.js) ---
function getTTSInterfaceHTML(texttype, slugReady, slug) {
  return `<a data-slug="${texttype}/${slugReady}" href="javascript:void(0)" title="Text-to-Speech (Alt+R)" class="voice-link">Voice</a>`;
}

// --- Обработчик изменения настроек ---
async function handleTTSSettingChange(e) {

// --- Toggle Advanced Settings ---
  if (e.target.id === 'tts-advanced-toggle-btn') {
      e.preventDefault();
      const advancedPanel = document.getElementById('tts-advanced-settings');
      const basicPanel = document.getElementById('tts-basic-settings'); 
      
      // Находим контейнер задержки (он идет сразу после basicPanel в HTML)
      const delayLabel = document.querySelector('.tts-delay-label')?.parentElement;

      if (advancedPanel) {
          const isOpening = !advancedPanel.classList.contains('visible');
          advancedPanel.classList.toggle('visible');
          
          if (isOpening) {
              // Скрываем основные настройки
              if (basicPanel) {
                  basicPanel.style.maxHeight = '0px';
                  basicPanel.style.opacity = '0';
              }
              // Скрываем блок Delay
              if (delayLabel) {
                  delayLabel.style.display = 'none';
              }
          } else {
              // Возвращаем основные настройки
              if (basicPanel) {
                  basicPanel.style.maxHeight = '200px';
                  basicPanel.style.opacity = '1';
              }
              // Возвращаем блок Delay
              if (delayLabel) {
                  delayLabel.style.display = 'flex';
              }
          }
      }
      return;
  }
  
  // 0. RESET BUTTON (Сброс всего)
  if (e.target.id === 'reset-tts-btn') {
      e.preventDefault();

      const pathLang = location.pathname.split('/')[1];
      const isRuLike = ['ru', 'r', 'ml'].includes(pathLang);

const resetMessage = isRuLike
  ? 'Сбросить настройки голоса: отключить Google TTS, удалить API-ключ и включить системные голоса?'
  : 'Reset voice settings: disable Google TTS, remove the API key, and use system voices?';
      if (confirm(resetMessage)) {
          // 1. Список ключей для удаления (чистим старое)
          const keysToRemove = [
              GOOGLE_KEY_STORAGE, 
              GOOGLE_PALI_SETTINGS_KEY, 
              'tts_google_trn_custom_voice',
              GOOGLE_TRN_KEY_RU,
              GOOGLE_TRN_KEY_EN,
              GOOGLE_TRN_KEY_STUDY,
              SCROLL_STORAGE_KEY, 
              MODE_STORAGE_KEY, 
              NATIVE_PALI_KEY,
              NATIVE_TRN_KEY,
              RATE_PALI_KEY, 
              RATE_TRN_KEY, 
              LAST_SLUG_KEY, 
              LAST_INDEX_KEY, 
              PALI_ALERT_KEY
          ];
          
          keysToRemove.forEach(k => localStorage.removeItem(k));

          // 2. ВАЖНО: Ставим блокировку, чтобы триал не вернулся при перезагрузке
          localStorage.setItem(TRIAL_BLOCK_KEY, 'true'); 

          // 3. Дебаг сообщение
          const debugMsg = isRuLike 
            ? "✅ Google TTS отключен.\nКлючи стерты. Включена блокировка триала.\nТеперь работают только нативные голоса."
            : "✅ Google TTS disabled.\nKeys cleared. Trial blocked.\nNow using native voices only.";
       //   alert(debugMsg);
          
          window.location.reload();
      }
      return;
  }

  // 0. Toggle Native Pali
  if (e.target.id === 'native-pali-toggle') {
      const isChecked = e.target.checked;
      localStorage.setItem(NATIVE_PALI_KEY, isChecked);
      togglePaliDropdownVisibility();
      return; 
  }

  // 0. Toggle Native Translation
  if (e.target.id === 'native-trn-toggle') {
      const isChecked = e.target.checked;
      localStorage.setItem(NATIVE_TRN_KEY, isChecked);
      
      // Скрываем/показываем выпадающие списки
      const trnDropdowns = document.getElementById('trn-google-dropdowns');
      if (trnDropdowns) {
          trnDropdowns.style.display = isChecked ? 'none' : 'block';
      }
      return; 
  }



  // 1. Refresh Button (Обработка клика по кнопке обновления)
  if (e.target.id === 'refresh-voices-btn') {
      e.preventDefault();
      const input = document.getElementById('google-api-key-input');
      const key = input ? input.value.trim() : '';
      if (key.length > 10) {
          populateVoiceSelectors(key, true); // forceRefresh = true
      }
      return;
  }

  // 2. Save API Key
  if (e.target.id === 'google-api-key-input') {
      const key = e.target.value.trim();
      localStorage.setItem(GOOGLE_KEY_STORAGE, key);
      
      // Если юзер ввел ключ руками — снимаем блокировку
      localStorage.removeItem(TRIAL_BLOCK_KEY); 
      
      return;
  }

  // 3. Mode
  if (e.target.id === 'tts-mode-select') {
    e.preventDefault();
    const newMode = e.target.value;
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
      
    if (ttsState.speaking || ttsState.paused) {
      const wasPaused = ttsState.paused;
      const currentId = ttsState.playlist[ttsState.currentIndex]?.id;
      const pausedIndex = ttsState.currentIndex;
      
      synth.cancel();
      if (ttsState.googleAudio) {
          ttsState.googleAudio.pause();
          ttsState.googleAudio = null;
      }
      
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
          const scrollTarget = document.getElementById(item.id) || item.element;
          scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        }
      }
    }
  }
  
  // 4. Rate
  if (e.target.id === 'tts-rate-select') {
    const newRate = parseFloat(e.target.value);
    
    let targetKey = RATE_TRN_KEY; 
    if (ttsState.speaking && !ttsState.paused && ttsState.playlist[ttsState.currentIndex]) {
        const currentItem = ttsState.playlist[ttsState.currentIndex];
        if (currentItem.lang === 'pi-dev') {
            targetKey = RATE_PALI_KEY;
        }
    } else {
        const currentMode = localStorage.getItem(MODE_STORAGE_KEY);
        if (currentMode === 'pi') {
            targetKey = RATE_PALI_KEY;
        }
    }

    localStorage.setItem(targetKey, newRate);
    
    if (ttsState.speaking && !ttsState.paused) {
      synth.cancel();
      if (ttsState.googleAudio) {
          ttsState.googleAudio.pause();
          ttsState.googleAudio = null;
      }
      playCurrentSegment();
    }
  }

  // 5. Scroll
  if (e.target.id === 'tts-scroll-toggle') {
     ttsState.autoScroll = e.target.checked;
     localStorage.setItem(SCROLL_STORAGE_KEY, e.target.checked);

     if (ttsState.autoScroll && (ttsState.speaking || ttsState.paused)) {
        const item = ttsState.playlist[ttsState.currentIndex];
        if (item && item.element) {
           const scrollTarget = document.getElementById(item.id) || item.element;
           scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
     }

  }
  
    // 6. Autoplay (связка с ttsMode)
  if (e.target.id === 'tts-autoplay-toggle') {
     const isChecked = e.target.checked;
     const isRu = window.location.pathname.match(/\/(ru|r|ml)\//);
     
     if (isChecked) {
         localStorage.setItem('ttsMode', 'true');
    //     showToast(isRu ? "Автоплей включен" : "Autoplay enabled");
     } else {
         localStorage.removeItem('ttsMode');
   //      showToast(isRu ? "Автоплей выключен" : "Autoplay disabled");
     }
     return;
  }


}

document.addEventListener('change', handleTTSSettingChange);
document.addEventListener('click', (e) => {
    // Добавили проверку e.target.id === 'tts-advanced-toggle-btn'
    if (e.target.id === 'refresh-voices-btn' || 
        e.target.id === 'reset-tts-btn' || 
        e.target.id === 'tts-advanced-toggle-btn') {
        handleTTSSettingChange(e);
    } else {
        handleSuttaClick(e);
    }
});


window.speechSynthesis.onvoiceschanged = () => synth.getVoices();

function initTTS() {
  // --- Та самая часть с контекстным меню ---
  document.addEventListener('contextmenu', function(e) {
    if (!e.target.closest('a.voice-link')) return;
    if (localStorage.getItem('ttsMode') === 'true') {
        e.preventDefault();
        e.stopImmediatePropagation();
        const currentSearch = window.location.search; 
        const ttsUrl = `${window.location.origin}/t2s.html${currentSearch}`;
        setTimeout(() => window.open(ttsUrl, '_blank'), 500);
    }
  }, { passive: false });

  synth.getVoices();
  
  // --- AUTOPLAY LOGIC ---
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('autoplay') || localStorage.getItem('ttsMode') === 'true') {
      setTimeout(() => {
          let slug = null;
          
          // 1. Ищем ID сутты
          const voiceLink = document.querySelector('.voice-link[data-slug]');
          if (voiceLink) {
              slug = voiceLink.dataset.slug;
          } else if (typeof isLegacyPage === 'function' && isLegacyPage()) {
              slug = window.location.pathname.split('/').pop() || 'legacy_page';
          }

          if (slug) {
              console.log("🚀 Autoplay: Starting logic for", slug);
              
              const player = getOrBuildPlayer();
              player.classList.add('active'); 
              const internalPlayBtn = player.querySelector('.play-main-button');
              if (internalPlayBtn) internalPlayBtn.dataset.slug = slug;

              // 2. ОПРЕДЕЛЕНИЕ РЕЖИМА
              let mode = urlParams.get('mode');
              const validModes = ['pi', 'trn', 'pi-trn', 'trn-pi'];

              if (!mode || !validModes.includes(mode)) {
                  mode = localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
              } else {
                  const modeSelect = document.getElementById('tts-mode-select');
                  if (modeSelect) modeSelect.value = mode;
                  localStorage.setItem(MODE_STORAGE_KEY, mode);
              }

              // 3. ЗАПУСК
              startPlayback(document, mode, slug, 0);

              // 4. СТРАХОВКА ОТ БЛОКИРОВКИ
              const forceUnlock = (e) => {
                  const isPlayerClick = e && e.target && e.target.closest('.voice-player');
                  
                  if (ttsState.speaking && ttsState.paused && !isPlayerClick) {
                      console.log("🔓 Audio Unlocked by Background Action!");
                      ttsState.paused = false;
                      setButtonIcon('pause');
                      toggleSilence(true); 

                      if (ttsState.googleAudio) {
                          ttsState.googleAudio.play().catch(err => console.warn(err));
                      } else {
                          playCurrentSegment();
                      }
                  }

                  ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => 
                      document.removeEventListener(evt, forceUnlock)
                  );
              };

              // Восстановил твои обработчики в исходном виде
              ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => 
                  document.addEventListener(evt, forceUnlock, { passive: true })
              );

              ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => 
                  document.addEventListener(evt, forceUnlock, { once: true, passive: true })
              );
          }
      }, 1000); 
  }
}

// Запускаем немедленно, если DOM уже готов (при ленивой загрузке), 
// или ждем готовности, если грузится стандартно
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTTS);
} else {
    initTTS();
}



document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

// --- АДАПТЕР ДЛЯ THERAVADA.RU (LEGACY HTML) ---

function isLegacyPage() {
    // Если есть блок с классом "a" ИЛИ специфичная для старого дизайна ячейка таблицы
    return document.querySelectorAll('.a').length > 0 || document.querySelector('td[style*="justify"]') !== null;
}

function prepareLegacyData() {
    const textData = [];
    let segmentCounter = 0;
    let contentCell = null;

    // 1. ОСНОВНОЙ ПУТЬ: Ищем абзацы с классом .a (работает для 95% длинных сутт)
    const firstDivA = document.querySelector('.a');
    if (firstDivA) {
        contentCell = firstDivA.parentElement;
    } 
    // 2. ФОЛБЭК: Для коротких сутт (типа AN 1.6), где нет класса .a
    else {
        // Ищем все ячейки с вертикальным выравниванием (стандартная верстка контента там)
        const candidateCells = document.querySelectorAll('td[valign="top"]');
        for (const cell of candidateCells) {
            // Ищем ячейку, где есть текст, и отсекаем футер (счетчики, копирайты)
            if (cell.textContent.trim().length > 50 && 
                !cell.querySelector('.bottom') && 
                !cell.textContent.includes('theravada.ru – при копировании')) {
                contentCell = cell;
                break;
            }
        }
    }

    if (!contentCell) {
        console.warn("Legacy Parser: Контейнер не найден.");
        return [];
    }

    // 3. ФИКС ОБЁРТКИ: Если весь текст завёрнут в один единственный <div> внутри ячейки, 
    // проваливаемся в него, чтобы парсер мог разобрать текст по предложениям
    if (contentCell.children.length === 1 && contentCell.firstElementChild.tagName === 'DIV') {
        contentCell = contentCell.firstElementChild;
    }

    // Вспомогательная функция для создания сегмента
    const pushSegment = (nodes, text) => {
        if (!text || text.length < 2) return;
        
        // Фильтры мусора
        if (text.includes('Тхеравада.ру') || text.includes('редакция перевода')) return;
        if (text.includes('Содержание')) return;
        
        const segmentId = `legacy-seg-${segmentCounter++}`;
        
        // ВАЖНО: Если у нас несколько узлов (например, "Т" + "ак..."), 
        // мы должны обернуть их в один SPAN, чтобы подсвечивать всё сразу.
        let elementToHighlight;
        
        if (nodes.length === 1 && nodes[0].nodeType === 1 && nodes[0].id) {
            // Если это один элемент и у него уже есть ID (например div.a), используем его
            elementToHighlight = nodes[0];
        } else {
            // Иначе создаем обертку
            const wrapper = document.createElement('span');
            wrapper.className = 'rus-lang legacy-wrapper';
            wrapper.id = segmentId;
            
            // Вставляем обертку перед первым узлом
            const firstNode = nodes[0];
            const parent = firstNode.parentNode;
            if (parent) {
                parent.insertBefore(wrapper, firstNode);
                // Перемещаем все узлы внутрь обертки
                nodes.forEach(node => wrapper.appendChild(node));
                elementToHighlight = wrapper;
            } else {
                // Если узлы оторваны от DOM (редкий случай), просто вернем первый
                elementToHighlight = firstNode;
            }
        }
        
        // Чистим текст для TTS
        const cleanText = text
            .replace(/\[\d+\]/g, '')      
            .replace(/\(\d+\)/g, '')      
            .replace(/\d+\)/g, '')      
            .replace(/^\d+\./, '')        
            .replace(/\s+/g, ' ')  
            .replace(/\*/g, '')
            .replace(/^[\*\-•]\s*/, '')
            .trim();

        if (cleanText.length > 0) {
            textData.push({
                id: elementToHighlight.id || segmentId,
                paliDev: "", 
                translation: cleanText,
                paliElement: null,
                translationElement: elementToHighlight
            });
        }
    };

    // 2. ПРОХОД ПО УЗЛАМ (Группировка)
    // Мы идем по детям контейнера. Если видим текст/font/b/i -> копим в буфер.
    // Если видим DIV/P/BR/TABLE -> сбрасываем буфер в сегмент, а потом обрабатываем блок.
    
    const childNodes = Array.from(contentCell.childNodes);
    let bufferNodes = [];
    let bufferText = "";

    const flushBuffer = () => {
        if (bufferNodes.length > 0) {
            pushSegment(bufferNodes, bufferText.trim());
            bufferNodes = [];
            bufferText = "";
        }
    };

    const isInline = (node) => {
        if (node.nodeType === 3) return true; // Текст
        if (!node.tagName) return false;
        // Теги, которые считаем частью строки
        const inlineTags = ['FONT', 'B', 'I', 'SPAN', 'A', 'STRONG', 'EM', 'SUP', 'SUB'];
        return inlineTags.includes(node.tagName);
    };

    childNodes.forEach((node) => {
        // Игнорируем пустые текстовые узлы (пробелы между дивами)
        if (node.nodeType === 3 && node.textContent.trim().length === 0) {
            // Но если мы внутри предложения (буфер не пуст), пробел может быть важен?
            // Обычно в HTML пробелы между тегами схлопываются. Добавим пробел в текст, но узел можно не сохранять, если он пустой.
            if (bufferNodes.length > 0) bufferText += " ";
            return;
        }

        if (isInline(node)) {
            // Это часть текущего предложения
            bufferNodes.push(node);
            bufferText += node.textContent;
        } else {
            // Это блочный элемент (DIV, BR, TABLE и т.д.) -> Разрыв
            flushBuffer();

            // Если это BR, просто игнорируем (он сработал как разрыв)
            if (node.tagName === 'BR') return;

            // Если это DIV (например div.a с диалогом), обрабатываем его как отдельный сегмент
            if (['DIV', 'P', 'H1', 'H2', 'H3', 'H4'].includes(node.tagName)) {
                // Берем весь текст блока
                pushSegment([node], node.textContent);
            }
        }
    });

    // Сбрасываем остатки буфера (если текст был в самом конце)
    flushBuffer();

    return textData;
}


function prepareGeneralArticleData() {
    const textData = [];
    let segmentCounter = 0;

    // Ищем все потенциально текстовые элементы на странице
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');

    elements.forEach(el => {
        // Пропускаем элементы навигации, футера или скрытые блоки (чтобы не читать меню)
        if (el.closest('.input-group') || el.closest('footer') || el.closest('nav') || el.closest('.tts-ignore')) {
            return;
        }

        const text = el.textContent.trim();
        
        // Берем только элементы, где есть хотя бы немного текста
        if (text.length > 2) {
            // Генерируем уникальный ID для элемента, если его нет (нужно для подсветки и автоскролла)
            if (!el.id) {
                el.id = `gen-seg-${segmentCounter}`;
            }
            segmentCounter++;

            textData.push({
                id: el.id,
                paliDev: "", // В обычных статьях пали не разделен, читаем всё как перевод
                translation: cleanTextForTTS(text),
                paliElement: null,
                translationElement: el
            });
        }
    });

    return textData;
}

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


// Экспорт API для внешних модулей (memorize.js)
window.ttsAPI = {
    getState: () => ttsState,
    playRange: async function(startId, endId) {
        const mode = document.getElementById('tts-mode-select')?.value || localStorage.getItem(MODE_STORAGE_KEY) || 'trn';
        let slug = ttsState.currentSlug || window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
        
        const textData = await prepareTextData(slug);
        const playlist = createPlaylistFromData(textData, mode);
        
        if (!playlist.length) return;

        let sIdx = playlist.findIndex(item => item.id === startId);
        let eIdx = playlist.findIndex(item => item.id === endId);
        
        if (sIdx === -1) sIdx = 0;
        if (eIdx === -1) eIdx = playlist.length - 1;

        ttsState.playlist = playlist;
        ttsState.currentIndex = sIdx;
        ttsState.startIndex = sIdx;
        ttsState.endIndex = eIdx;
        ttsState.currentSlug = slug;
        ttsState.langSettings = mode;
        ttsState.speaking = true;
        ttsState.paused = false;
        
        setButtonIcon('pause');
        toggleSilence(true);
        playCurrentSegment();
    },
    stop: stopPlayback,
    keepSilenceAlive: toggleSilence,
    releaseWakeLock: releaseWakeLock
};

// --- Обработка поля Delay (Span ContentEditable) ---
document.addEventListener('input', (e) => {
    if (e.target.id === 'tts-segment-delay-input') {
        let text = e.target.innerText.replace(/[^0-9.,]/g, '').replace(',', '.');
        let parts = text.split('.');
        if (parts.length > 2) text = parts[0] + '.' + parts.slice(1).join('');
        
        if (text !== e.target.innerText) {
            e.target.innerText = text;
            const range = document.createRange();
            range.selectNodeContents(e.target);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        
        let val = parseFloat(text);
        if (isNaN(val) || val < 0) val = 0;
        localStorage.setItem(SEGMENT_DELAY_KEY, val);
        window.TTS_SEGMENT_DELAY = val * 1000;
    }
});

document.addEventListener('focusout', (e) => {
    if (e.target.id === 'tts-segment-delay-input') {
        let val = parseFloat(e.target.innerText);
        if (e.target.innerText.trim() === '' || isNaN(val)) {
            e.target.innerText = '0';
            localStorage.setItem(SEGMENT_DELAY_KEY, 0);
            window.TTS_SEGMENT_DELAY = 0;
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.id === 'tts-segment-delay-input' && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
    }
});

document.addEventListener('focusin', (e) => {
    if (e.target.id === 'tts-segment-delay-input') {
        const range = document.createRange();
        range.selectNodeContents(e.target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
});
// ---------------------------------------------------


// --- Глобальная функция конвертации Pāli -> Devanagari ---
window.convertPaliToDevanagari = function(str) {
    if (!str) return str;
    const mapping = {
        'kh':'ख', 'gh':'घ', 'ch':'छ', 'jh':'झ', 'ṭh':'ठ', 'ḍh':'ढ', 'th':'थ', 'dh':'ध', 'ph':'फ', 'bh':'भ',
        'k':'क', 'g':'ग', 'ṅ':'ङ', 'c':'च', 'j':'ज', 'ñ':'ञ', 'ṭ':'ट', 'ḍ':'ड', 'ṇ':'ण', 't':'त', 'd':'द', 'n':'न',
        'p':'प', 'b':'ब', 'm':'म', 'y':'य', 'r':'र', 'l':'ल', 'ḷ':'ळ', 'v':'व', 's':'स', 'h':'ह'
    };
    const vowels = {'a':'अ', 'ā':'आ', 'i':'इ', 'ī':'ई', 'u':'उ', 'ū':'ऊ', 'e':'ए', 'o':'ओ'};
    const marks = {'ā':'ा', 'i':'ि', 'ī':'ी', 'u':'ु', 'ū':'ू', 'e':'े', 'o':'ो'};
    
    let res = ""; 
    let i = 0; 
    str = str.toLowerCase();

    const isSingleWord = !str.trim().includes(' ');

    if (isSingleWord) {
        const cleanWord = str.replace(/[.,;!?\n|]/g, '').trim();
        const specialCases = {};
        
        if (specialCases[cleanWord]) {
            let punctuation = str.match(/[.,;!?\n|]+$/);
            return specialCases[cleanWord] + (punctuation ? punctuation[0] : '');
        }
    }

    while (i < str.length) {
        let char = str[i]; 
        let nextChar = str[i+1] || ''; 
        let doubleChar = char + nextChar;
        
        if (char === 'ṃ' || char === 'ṁ') { 
            res += (isSingleWord && i === str.length - 1) ? 'ङ्' : 'ं'; 
            i++; 
            continue; 
        }
        
        if (vowels[char]) {
            if (i === 0 || !str[i-1].match(/[a-zāīūṭḍṇṅñṃḷ]/i) || vowels[str[i-1]]) res += vowels[char];
            i++; continue;
        }
        
        let cons = mapping[doubleChar] ? doubleChar : (mapping[char] ? char : null);
        if (cons) {
            res += mapping[cons]; 
            i += cons.length; 
            let v = str[i];
            if (vowels[v]) {
                if (v !== 'a') res += marks[v];
                i++;
            } else if (!v || (v !== ' ' && !v.match(/[.,;!?\n]/))) {
                res += '्'; 
                if (v === 'h' && char === 'm') res += '\u200C';
            }
            continue;
        }
        res += char; 
        i++;
    }
    return res;
};
