// Проверка загрузки
// alert("Extra.js with Play/Pause LOADED"); 

// --- Глобальное состояние ---
const ttsState = {
  text: null,       // Текущий текст
  button: null,     // Текущая активная кнопка
  speaking: false,
  paused: false,
  utterance: null
};

// --- Вспомогательные функции ---

// Сброс иконок (вернуть всем Play)
function resetAllIcons() {
  const pauseIcons = document.querySelectorAll('img[src*="pause-grey.svg"]');
  pauseIcons.forEach(img => {
    img.src = '/assets/svg/play-grey.svg';
    img.alt = 'Play';
  });
}

// Переключение иконки конкретной кнопки
function setButtonIcon(button, type) {
  if (!button) return;
  const img = button.querySelector('img');
  if (!img) return;

  if (type === 'pause') { // Показываем иконку Паузы (значит сейчас играет)
    img.src = '/assets/svg/pause-grey.svg';
    img.alt = 'Pause';
  } else { // Показываем иконку Play
    img.src = '/assets/svg/play-grey.svg';
    img.alt = 'Play';
  }
}

// Очистка текста
function cleanTextForTTS(text) {
  return text
    .replace(/\{.*?\}/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Логика TTS ---

function speakRawText(text, langType, button) {
  // Отменяем всё старое
  window.speechSynthesis.cancel();
  
  // Обновляем состояние
  ttsState.text = text;
  ttsState.button = button;
  ttsState.speaking = true;
  ttsState.paused = false;

  // Визуально: сбрасываем другие кнопки, включаем текущую
  resetAllIcons();
  setButtonIcon(button, 'pause');

  const utterance = new SpeechSynthesisUtterance(text);

  // Настройка языка
  if (langType === 'ru') {
    utterance.lang = 'ru-RU';
  } else if (langType === 'th') {
    // Настройка для тайского (только для перевода)
    utterance.lang = 'th-TH';
    utterance.rate = 0.7; // Чуть медленнее для тайского
  } else if (langType === 'pi') {
    // Хинди для деванагари, Английский для латиницы (Стандарт для Пали)
    utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-US';
    if (utterance.lang === 'hi-IN') utterance.rate = 0.8;
  } else {
    // По умолчанию английский
    utterance.lang = 'en-US';
  }

  // События
  utterance.onend = function() {
    ttsState.speaking = false;
    ttsState.paused = false;
    ttsState.text = null;
    ttsState.button = null;
    setButtonIcon(button, 'play');
  };

  utterance.onerror = function(e) {
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      console.error('TTS Error:', e);
      setButtonIcon(button, 'play');
      ttsState.speaking = false;
    }
  };

  // Сохраняем ссылку на объект (иногда нужно для GC)
  ttsState.utterance = utterance;

  // Запуск
  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speak error:", err);
    setButtonIcon(button, 'play');
  }
}

function toggleSpeech(text, langType, button) {
  // Логика Play/Pause как в tts.php
  
  // 1. Если этот же текст уже играет и не на паузе -> ПАУЗА
  if (ttsState.speaking && !ttsState.paused && ttsState.text === text) {
    window.speechSynthesis.pause();
    ttsState.paused = true;
    setButtonIcon(button, 'play'); // Показываем Play, чтобы продолжить
  }
  // 2. Если этот же текст на паузе -> ПРОДОЛЖИТЬ
  else if (ttsState.paused && ttsState.text === text) {
    window.speechSynthesis.resume();
    ttsState.paused = false;
    setButtonIcon(button, 'pause'); // Показываем Pause, чтобы остановить
  }
  // 3. Новый текст или старый закончился -> СТАРТ
  else {
    speakRawText(text, langType, button);
  }
}


// --- Обработчик кликов ---

function handleSuttaClick(e) {
  // Ищем кнопку (поднимаемся вверх, если кликнули по картинке)
  const target = e.target.closest('.copy-pali, .copy-translation, .open-pali, .open-translation, .play-pali, .play-translation');
  if (!target) return;

  e.preventDefault();

  // Определяем тип действия
  const isPlay = target.classList.contains('play-pali') || target.classList.contains('play-translation');
  const isOpen = target.classList.contains('open-pali') || target.classList.contains('open-translation');
  const isCopy = target.classList.contains('copy-pali') || target.classList.contains('copy-translation');
  
  // Определяем тип контента (Пали или Перевод)
  const isPaliTarget = target.classList.contains('play-pali') || target.classList.contains('copy-pali') || target.classList.contains('open-pali');
  
  // Выбираем селектор текста
  const textSelector = isPaliTarget ? '.pli-lang' : '.rus-lang';

  // Ищем контейнер (блок сутты)
  const container = target.closest('.sutta-container') || 
                    target.closest('.text-block') || 
                    target.closest('section') || 
                    target.closest('div');

  // Собираем текст
  const elements = container ? container.querySelectorAll(textSelector) : document.querySelectorAll(textSelector);
  
  if (elements.length === 0) {
    // Если текст не найден — тихо выходим или можно alert для отладки
    console.warn("Text elements not found for selector: " + textSelector);
    return;
  }

  // Чистим и склеиваем текст
  let combinedText = "";
  elements.forEach(el => {
    const clone = el.cloneNode(true);
    const variants = clone.querySelectorAll('.variant');
    variants.forEach(v => v.remove());
    combinedText += cleanTextForTTS(clone.textContent) + "\n\n";
  });

  if (!combinedText.trim()) return;

  // --- ВЫПОЛНЕНИЕ ДЕЙСТВИЯ ---

  if (isPlay) {
    // Определение языка для TTS
    let langType = 'en'; // По умолчанию
    const path = window.location.pathname;

    // --- ОБНОВЛЕННАЯ ЛОГИКА ---
    
    // 1. Если это ПАЛИ — всегда используем стандартную логику (pi)
    if (isPaliTarget) {
      langType = 'pi';
    } 
    // 2. Если это ПЕРЕВОД — проверяем язык страницы
    else {
      // Проверка на Тайский в URL
      if (path.includes('/th/') || path.includes('/thml/') || path.includes('/mlth/')) {
        langType = 'th';
      } 
      // Проверка на Русский в URL
      else if (path.includes('/ru/') || path.includes('/r/') || path.includes('/ml/')) {
        langType = 'ru';
      } 
      // Иначе Английский
      else {
        langType = 'en';
      }
    }
    
    // Запускаем переключатель
    toggleSpeech(combinedText, langType, target);
  } 
  
  else if (isOpen) {
    openInNewTab(combinedText, isPaliTarget);
  } 
  
  else if (isCopy) {
    copyToClipboard(combinedText).then(success => {
      showNotification(success ? "Copied" : "Copy failed");
    });
  }
}

// --- Старые функции (Copy/Open/Notify) ---

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'bubble-notification';
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function generatePageTitle(isPali) {
  const path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '').replace(/\//g, '_');
  return `${path || 'text'}_${isPali ? 'pali' : 'translation'}_tts`;
}

function openInNewTab(content, isPali) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/assets/render.php';
  form.target = '_blank';
  const inputs = {
    title: generatePageTitle(isPali),
    content: content,
    lang: isPali ? 'pi' : 'ru'
  };
  for (const [key, value] of Object.entries(inputs)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try { return document.execCommand('copy'); } 
    catch (e) { return false; } 
    finally { document.body.removeChild(textarea); }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', handleSuttaClick);
});

