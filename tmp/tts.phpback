<?php
error_reporting(E_ERROR | E_PARSE);
// Параметры запроса
$slug = strtolower($_GET['q'] ?? '');

$slug = preg_replace('/(\d+)\s+(\d+)/', '$1.$2', $slug);

$slug = preg_replace('/([a-zA-Z]+)\s+(\d)/', '$1$2', $slug);

$type = $_GET['type'] ?? 'pali'; // 'pali' или 'trn' (translation)

// Новые параметры для выбора переводчика
$translator_param = $_GET['translator'] ?? '';

if ($slug === 'pm' || preg_match('/^bu[\s-]?pm$/', $slug)) {
    $slug = 'pli-tv-bu-pm';
}
elseif (preg_match('/^bi[\s-]?pm$/', $slug)) {
    $slug = 'pli-tv-bi-pm';
}
// Срабатывает только если не подошло под правила выше
elseif (preg_match('/^(bi-|bu-)(.+)/', $slug, $matches)) {
    $slug = 'pli-tv-' . substr($matches[1], 0, 2) . '-vb-' . $matches[2];
}


// Определяем язык
$is_ru_url = (strpos($_SERVER['REQUEST_URI'], '/ru/') !== false) ||
             (strpos($_SERVER['REQUEST_URI'], '/r/') !== false) ||
             (strpos($_SERVER['REQUEST_URI'], '/ml/') !== false);

if ($type === 'pali') {
    $lang = 'pi';
    $content_type = 'pali';
    $title_lang = 'Pali';
} elseif ($type === 'trn') {
    $lang = $is_ru_url ? 'ru' : 'en';
    $content_type = $is_ru_url ? 'ru' : 'en';
    $title_lang = $is_ru_url ? 'Russian' : 'English';

    // Установка типа контента на основе параметра translator
    if ($lang === 'en' && $translator_param === 'bs') {
        $content_type = 'en-sujato';
    } elseif ($lang === 'en') {
        $content_type = 'en-bodhi'; // 'en-bodhi' теперь по умолчанию
    }

} else {
    $lang = 'ru';
    $content_type = 'ru';
    $title_lang = 'Translation';
}

// Заголовок страницы
$title = htmlspecialchars(
    $slug
        ? str_replace(['-', '_'], ' ', strtolower($slug)) . ' (' .
          ($type === 'pali' ? 'Pali' : $title_lang) . ')'
        : 'TTS Page'
);

// Загрузка контента с HTML-форматированием
function loadContent($slug, $type) {
    include_once('config/config.php');

    // **ИСПРАВЛЕНИЕ 1: Добавлен пробел в конце строки jq для разделения сегментов**
    $jq = 'jq -r \'to_entries[] | "<a id=\"\(.key)\"></a><span>\(.value)</span> " \' | sed "s/' . $slug . '://"';

    if (!in_array($type, ['pali', 'ru', 'en-bodhi', 'en-sujato'])) {
        return ['content' => ($type === 'pali' ? "Pali text not found for: $slug" : "Content not found for: $slug"),
                'file' => '',
                'translator' => ''];
    }

    // Определяем путь к файлу в зависимости от типа
    if ($type === 'pali') {
        $script = $_GET['script'] ?? 'dev';
        $cmd = $script === 'lat'
            ? "find $basedir/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/ -name \"{$slug}_*\" -print -quit"
            : "find $basedir/assets/texts/devanagari/root/pli/ms/ -name \"{$slug}_*\" -print -quit";
    }
    elseif ($type === 'ru') {
        $cmd = "find $basedir/assets/texts/ru/sutta/ $basedir/assets/texts/ru/vinaya/ -name \"{$slug}_*\" -print -quit";
    }
    elseif ($type === 'en-bodhi') {
        $cmd = "find $basedir/assets/texts/en/sutta/ $basedir/assets/texts/en/vinaya/ -name \"{$slug}_translation*\" -print -quit";
    }
    else { // en-sujato
        $cmd = "find $basedir/suttacentral.net/sc-data/sc_bilara_data/translation/en/ -name \"{$slug}_*\" -print -quit";
    }

    $file = trim(shell_exec($cmd));
    if (!$file) {
        return ['content' => ucfirst($type) . " text not found for: $slug", 'file' => '', 'translator' => ''];
    }

    // Загрузка HTML-шаблонов
    $html_file = shell_exec("find $basedir/suttacentral.net/sc-data/sc_bilara_data/html/pli/ms/ -name \"{$slug}_html.json\" -print -quit");
    $html_templates = [];

    if ($html_file) {
        $html_content = shell_exec("cat " . escapeshellarg(trim($html_file)));
        $html_templates = json_decode($html_content, true) ?: [];
    }

    // Загрузка основного контента
    $content = shell_exec("cat " . escapeshellarg($file) . " | $jq");
    $json_content = json_decode(shell_exec("cat " . escapeshellarg($file)), true) ?: [];
/*
    // Применяем HTML-форматирование, если есть шаблоны
    $formatted_content = '';
    if (!empty($json_content)) {
        foreach ($json_content as $key => $text) {
            $template = $html_templates[$key] ?? '<p>{}</p>';
            // **ИСПРАВЛЕНИЕ 2: Добавлен пробел после каждого сегмента**
            $formatted_content .= str_replace('{}', htmlspecialchars($text), $template) . ' ';
        }
        // Удаляем лишний пробел в конце всей строки
  //      $formatted_content = ;
    }


    // Если нет HTML-шаблонов, используем обычное форматирование из $content
    if (empty($html_templates)) {
        $formatted_content = trim($content);
    }

*/

// Применяем HTML-форматирование, если есть шаблоны
    $formatted_content = '';
    if (!empty($json_content)) {
        // Проверяем, является ли скрипт Devanagari (по умолчанию dev, если не lat и тип pali)
        $isDevanagari = ($type === 'pali');

        foreach ($json_content as $key => $text) {
            
            // Логика обработки текста для Devanagari (аналог JS)
            if ($isDevanagari) {
                // 1. Замена тире и дефисов на пробел
                $text = str_replace(['-', '—', '–'], ' ', $text);
                // 2. Удаление пунктуации и кавычек
                $text = str_replace([':', ';', '“', '”', '‘', '’', ',', '"', "'"], '', $text);
                // 3. Замена знаков конца предложения на вертикальную черту
                $text = str_replace(['.', '?', '!'], ' | ', $text);
            }

            $template = $html_templates[$key] ?? '<p>{}</p>';
            // **ИСПРАВЛЕНИЕ 2: Добавлен пробел после каждого сегмента**
            $formatted_content .= str_replace('{}', htmlspecialchars($text), $template) . ' ';
        }
        // Удаляем лишний пробел в конце всей строки
        $formatted_content = $formatted_content;
    }

    // Получаем информацию о переводчике
    $basename = basename($file, '.json');
    $parts = explode('-', $basename);
    $translator = end($parts);

    return [
        'content' => $formatted_content,
        'file' => $file,
        'translator' => $translator,
        'has_html' => !empty($html_templates)
    ];
}

// Загрузка данных
if ($slug) {
    $result = loadContent($slug, $content_type);
    $content = $result['content'];
    $translator = $result['translator'] ?: '';
    $has_html = $result['has_html'] ?? false;
} else {
    $content = htmlspecialchars($_POST['content'] ?? '');
    $translator = '';
    $has_html = false;
}

// Формируем подпись
if ($lang === 'pi') {
    $sourceInfo = 'महासङ्गीति पाळि';
    $script = $_GET['script'] ?? 'dev';
    if ($script === 'lat') {
        $sourceInfo = 'Mahāsaṅgīti Pāḷi';
    }
} else {
    // Обновляем отображение переводчика на основе content_type
    if ($content_type === 'en-sujato') {
        $sourceInfo = 'Translator: Bhikkhu Sujato';
    } elseif ($content_type === 'en-bodhi') {
        $sourceInfo = 'Translator: Bhikkhu Bodhi';
    } else {
        $sourceInfo = $lang === 'ru' ? "Перевод: $translator" : "Translator: $translator";
    }
}
?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/png" sizes="32x32" href="https://dhamma.gift/assets/img/favico_black.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="/assets/css/bootstrap.5.3.1.min.css" rel="stylesheet" />
 <link href="/assets/css/styles.css" rel="stylesheet" />
<meta name="author" content="Pali or Translation" />

  <link href="/assets/css/extrastyles.css" rel="stylesheet" />
  <link href="/assets/css/pages.css" rel="stylesheet" />
<link rel="stylesheet" href="/assets/css/jquery-ui.min.css">
<link href="/assets/css/paliLookup.css" rel="stylesheet" />

<script src="/assets/js/jquery-3.7.0.min.js"></script>
<script src="/assets/js/jquery-ui.min.js"></script>
  <title><?= $title ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .text-content {
      white-space: pre-line;
      text-align: justify;
    }
h1 {
    text-align: center;
}

.division {
  list-style-type: none;
          text-align: center;
  padding-left: 0;
}

li { /*.division  text-align: center;*/
  list-style-type: none;
  padding-left: 0;
 text-align: center;
}

* {
    text-align: left;
}

  </style>
</head>
<body>
    <script>
function updateUrl(lang) {
    const currentUrl = new URL(window.location.href);
    const pathParts = currentUrl.pathname.split('/');
    const slug = currentUrl.searchParams.get('q') || '';
    const currentTranslator = currentUrl.searchParams.get('translator') || '';

    // Очищаем путь от языковых префиксов
    let newPath = pathParts.filter(part => !['ru', 'r', 'ml', 'en'].includes(part)).join('/');

    // Добавляем нужный языковой префикс
    if (lang === 'ru') {
        newPath = newPath.replace(/^\//, '/ru/');
    } else if (lang === 'en') {
        // Убрали префикс '/en/', т.к. он не нужен для англ. перевода
    }
    // Для pi не меняем путь

    // Обновляем параметры type и translator
    currentUrl.searchParams.delete('type');
    currentUrl.searchParams.delete('translator');

    if (lang === 'pi') {
        currentUrl.searchParams.set('type', 'pali');
    } else {
        currentUrl.searchParams.set('type', 'trn');
    }

    if (lang === 'en') {
        // Логика переключения между переводчиками Бодхи и Суджато
        if (currentTranslator === 'bb' || currentTranslator === '') {
            currentUrl.searchParams.set('translator', 'bs');
        } else {
            currentUrl.searchParams.set('translator', 'bb');
        }
    }

    // Собираем новый URL
    currentUrl.pathname = newPath;
    return currentUrl.toString();
}

function setLanguage(lang) {
    const newUrl = updateUrl(lang);
    history.pushState({}, '', newUrl);
    location.reload();
}

function togglePaliScript() {
    const current = localStorage.getItem('paliScript') || 'dev';
    const next = current === 'dev' ? 'lat' : 'dev';
    localStorage.setItem('paliScript', next);

    const url = new URL(window.location.href);
    if (next === 'dev') {
        url.searchParams.delete('script');
    } else {
        url.searchParams.set('script', 'lat');
    }

    window.location.href = url.toString();
}

// Обновленная функция для определения текущего языка и переводчика
function detectLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const translator = urlParams.get('translator');

    if (type === 'pali' || type === null) return 'pi';

    const currentUrl = window.location.pathname.toLowerCase();
    if (currentUrl.includes('/ru/') || currentUrl.includes('/r/') || currentUrl.includes('/ml/')) return 'ru';

    // Теперь, если это английский, мы смотрим на параметр translator
    if (translator === 'bs') {
        return 'en-sujato';
    }
    // По умолчанию 'en-bodhi'
    return 'en-bodhi';
}

function updateLanguageSwitcher(lang) {
    const switcher = document.querySelector('.lang-switcher');

    let piClass = "btn btn-sm btn-outline-secondary rounded-pill text-decoration-none";
    let ruClass = "btn btn-sm btn-outline-secondary rounded-pill text-decoration-none ms-1";
    let enClass = "btn btn-sm btn-outline-secondary rounded-pill text-decoration-none ms-1";

    if (lang === 'pi') {
        piClass = "btn btn-sm btn-primary rounded-pill btn-outline-secondary active";
    } else if (lang === 'ru') {
        ruClass = "btn btn-sm btn-primary rounded-pill btn-outline-secondary active ms-1";
    } else { // en-bodhi или en-sujato
        enClass = "btn btn-sm btn-primary rounded-pill btn-outline-secondary active ms-1";
    }

    switcher.innerHTML = `
        <a class="${piClass}" href="#" onclick="setLanguage('pi'); return false;" title="Pali / Devanagari / Roman Script">pi</a>
        <a class="${enClass}" href="#" onclick="setLanguage('en'); return false;" title="English: ${lang === 'en-sujato' ? 'Sujato' : 'Bodhi'}">en</a>
        <a class="${ruClass}" href="#" onclick="setLanguage('ru'); return false;" title="Russian">ru</a>

    `;

    // Обновляем title для кнопки Pali, если она активна
    if (lang === 'pi') {
        const paliBtn = switcher.querySelector('.active');
        paliBtn.onclick = () => { togglePaliScript(); return false; };
    }
}

</script>
<div class="container mt-3">
  <div class="d-flex flex-wrap align-items-center justify-content-between">

    <div class="d-flex align-items-center order-1 mb-2 mb-sm-0">
      <a id="readLink" href="/read.php" title="Sutta and Vinaya reading" rel="noreferrer" class="me-1">
        <svg fill="#979797" xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 547.596 547.596" stroke="#979797">
          <g><path d="M540.76,254.788L294.506,38.216c-11.475-10.098-30.064-10.098-41.386,0L6.943,254.788 c-11.475,10.098-8.415,18.284,6.885,18.284h75.964v221.773c0,12.087,9.945,22.108,22.108,22.108h92.947V371.067 c0-12.087,9.945-22.108,22.109-22.108h93.865c12.239,0,22.108,9.792,22.108,22.108v145.886h92.947 c12.24,0,22.108-9.945,22.108-22.108v-221.85h75.965C549.021,272.995,552.081,264.886,540.76,254.788z"></path></g>
        </svg>
      </a>

      <a id="homeLink" href="/" title="Sutta and Vinaya search" rel="noreferrer" class="me-0">
        <img width="24px" alt="dhamma.gift icon" class="me-1" src="/assets/img/gray-white.png">
      </a>

	<div id="chapter-button" class="mode-switch me-1">
<a href="/r.php" title="Read Chapters (Ctrl+3)" rel="noreferrer"
><img width="28px"
 alt="Read by Chapters" src="/assets/svg/book.svg"></a>
</div>

    <a alt="Onclick popup dictionary" title="Onclick popup dictionary (Alt+A)" class="toggle-dict-btn text-decoration-none text-black me-1">
      <img src="/assets/svg/comment.svg" class="dictIcon">
    </a>

<a href="#"
   onclick="toggleSpeech('voiceTextContent'); return false;"
   class="text-decoration-none text-black me-1"
   id="speechToggleBtn">
      <img src="/assets/svg/volume-high.svg" style="width: 25px; height: 25px;">
</a>

      <div class="ms-1 form-check form-switch">
        <input type="checkbox" class="form-check-input" id="darkSwitch">
      </div>
      <a href="/assets/common/ttsHelp.html" class="text-decoration-none text-muted ms-0">
<img width="15px"
 alt="Help" src="/assets/svg/question.svg"></a>
        
      </a>
    </div>

    <div class="d-inline-flex align-items-center lang-switcher order-2 order-sm-3 mb-2 mb-sm-0">
              <a class="btn btn-sm btn-outline-secondary rounded-pill text-decoration-none" href="#" onclick="setLanguage('pi'); return false;">pi</a>
      <span class="btn btn-sm btn-primary rounded-pill ms-1">en</span>
      <a class="btn btn-sm btn-outline-secondary rounded-pill text-decoration-none ms-1" href="#" onclick="setLanguage('ru'); return false;">ru</a>

    </div>

    <form id="slugForm" class="d-flex align-items-center flex-nowrap order-3 order-sm-2 mx-auto flex-grow-0" onsubmit="return goToSlug();" style="min-width: 140px; max-width: 250px;">
  <input type="search" class="form-control form-control-sm rounded-pill me-1 flex-grow-1"
         id="paliauto" name="q" value="<?= htmlspecialchars($slug) ?>"
         placeholder="e.g. an3.76" style="min-width: 100px;" autofocus>
  <button type="submit" class="btn btn-sm btn-outline-secondary rounded-circle p-1 flex-shrink-0">
    Go
  </button>
</form>


  </div>
</div>

<div class="text-end text-muted small mt-2">
  <?= htmlspecialchars($sourceInfo) ?>
</div>
<div class="text-content mt-3 pli-lang" id="voiceTextContent" lang="pi"><?= $content ?></div>

<script src="/assets/js/dark-mode-switch/dark-mode-switch.js"></script>

  <script>
    function goToSlug() {
    const slug = document.getElementById('paliauto').value.trim();
    if (!slug) return false;

    const lang = detectLanguage();
    const url = new URL(window.location.href);

    // Обновляем параметры запроса
    url.searchParams.set('q', slug);

    if (lang.startsWith('pi')) {
        url.searchParams.set('type', 'pali');
    } else {
        url.searchParams.set('type', 'trn');
    }

    // Если текущий язык - английский, сохраняем параметр переводчика
    if (lang.startsWith('en')) {
        const translator = lang === 'en-sujato' ? 'bs' : 'bb';
        url.searchParams.set('translator', translator);
    } else {
        url.searchParams.delete('translator');
    }

    // Обновляем URL
    window.location.href = url.toString();
    return false; // не отправлять форму
}

  </script>
<script>
// Глобальные переменные для управления воспроизведением
let isSpeaking = false;
let isPaused = false;
let currentUtterance = null;
let pausedPosition = 0;

// ИЗМЕНЕНИЕ: Начало блока кода для Wake Lock API
let wakeLock = null;

// Функция для запроса блокировки экрана
const acquireWakeLock = async () => {
  // Проверяем, поддерживается ли Wake Lock API браузером
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        // Этот обработчик сработает, если блокировка будет снята системой
        console.log('Блокировка экрана была снята.');
      });
      console.log('Блокировка экрана активирована.');
    } catch (err) {
      console.error(`Не удалось активировать блокировку экрана: ${err.name}, ${err.message}`);
    }
  } else {
    console.warn('Wake Lock API не поддерживается в этом браузере.');
  }
};

// Функция для снятия блокировки экрана
const releaseWakeLock = async () => {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log('Блокировка экрана снята.');
    } catch (err) {
      console.error(`Не удалось снять блокировку экрана: ${err.name}, ${err.message}`);
    }
  }
};

// Снимаем блокировку, если пользователь сворачивает или переключает вкладку
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' && wakeLock !== null) {
    releaseWakeLock();
  }
});
// ИЗМЕНЕНИЕ: Конец блока кода для Wake Lock API


const pageLogger = {
  logs: [],
  maxLogs: 50,
  container: null,

  init: function(showByDefault = false) {
    // Создаем контейнер для логов
    this.container = document.createElement('div');
    this.container.id = 'pageLoggerContainer';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '10px';
    this.container.style.left = '10px';
    this.container.style.right = '10px';
    this.container.style.maxHeight = '30vh';
    this.container.style.overflow = 'auto';
    this.container.style.zIndex = '9998';
    this.container.style.backgroundColor = 'var(--bs-body-bg)';
    this.container.style.color = 'var(--bs-body-color)';
    this.container.style.border = '1px solid var(--bs-border-color)';
    this.container.style.borderRadius = '5px';
    this.container.style.padding = '10px';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    this.container.style.display = showByDefault ? 'block' : 'none';

    // Кнопка закрытия (вверху справа)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'var(--bs-body-color)';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.zIndex = '10000';
    closeBtn.onclick = () => {
      this.container.style.display = 'none';
      const toggleBtn = document.getElementById('loggerToggleBtn');
      if (toggleBtn) toggleBtn.textContent = '📜';
    };

    // Кнопка управления логгером (только если debugVoices в URL)
    if (new URLSearchParams(window.location.search).has('debugVoices')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'loggerToggleBtn';
      toggleBtn.textContent = this.container.style.display === 'none' ? '📜' : '✕';
      toggleBtn.style.position = 'fixed';
      toggleBtn.style.bottom = '10px';
      toggleBtn.style.right = '10px';
      toggleBtn.style.zIndex = '9999';
      toggleBtn.style.width = '36px';
      toggleBtn.style.height = '36px';
      toggleBtn.style.borderRadius = '50%';
      toggleBtn.style.border = '1px solid var(--bs-border-color)';
      toggleBtn.style.backgroundColor = 'var(--bs-body-bg)';
      toggleBtn.style.color = 'var(--bs-body-color)';
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.display = 'flex';
      toggleBtn.style.alignItems = 'center';
      toggleBtn.style.justifyContent = 'center';
      toggleBtn.style.fontSize = '16px';

      toggleBtn.addEventListener('click', () => {
        if (this.container.style.display === 'none') {
          this.container.style.display = 'block';
          toggleBtn.textContent = '✕';
        } else {
          this.container.style.display = 'none';
          toggleBtn.textContent = '📜';
        }
      });

      document.body.appendChild(toggleBtn);
    }

    this.container.appendChild(closeBtn);
    document.body.appendChild(this.container);

    // Перехватываем console.log
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      this.addLog('log', ...args);
      originalConsoleLog.apply(console, args);
    };

    // Перехватываем console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.addLog('error', ...args);
      originalConsoleError.apply(console, args);
    };

    // Перехватываем console.warn
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      this.addLog('warn', ...args);
      originalConsoleWarn.apply(console, args);
    };
  },

  addLog: function(type, ...args) {
    const logEntry = {
      type,
      timestamp: new Date().toISOString().substr(11, 12),
      messages: args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      )
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.updateView();
  },

  updateView: function() {
    if (!this.container) return;

    this.container.innerHTML = this.logs.map(log => {
      const color = {
        log: 'inherit',
        warn: 'orange',
        error: 'red'
      }[log.type];

      return `
        <div style="margin-bottom: 5px; border-bottom: 1px solid var(--bs-border-color); padding-bottom: 5px;">
          <span style="color: ${color}; font-weight: bold;">${log.type.toUpperCase()}</span>
          <span style="color: #666; margin-left: 5px;">${log.timestamp}</span>
          <div style="white-space: pre-wrap; word-break: break-word;">${log.messages.join(' ')}</div>
        </div>
      `;
    }).join('');

    // Автоскролл к новым сообщениям
    this.container.scrollTop = this.container.scrollHeight;
  }
};

// Инициализируем логгер при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const showByDefault = new URLSearchParams(window.location.search).has('debugVoices');
  pageLogger.init(showByDefault);

  if (showByDefault) {
    console.log('Логгер инициализирован. Все console.log будут отображаться здесь.');
  }
});

// Функция для отображения доступных голосов в консоли и на странице
function debugVoices() {
  const voices = window.speechSynthesis.getVoices();

  // Выводим в логгер
  console.log('Доступные голоса:', voices.map(v => ({
    name: v.name,
    lang: v.lang,
    default: v.default,
    local: v.localService
  })));

  // Показываем логгер, если он скрыт
  if (pageLogger.container.style.display === 'none') {
    pageLogger.container.style.display = 'block';
    const toggleBtn = document.getElementById('loggerToggleBtn');
    if (toggleBtn) toggleBtn.textContent = '✕';
  }

  // Определяем текущую тему
  const isDarkMode = document.body.classList.contains('dark-mode') ||
                     document.body.getAttribute('data-theme') === 'dark';

  // Удаляем предыдущий debugDiv если он есть
  const oldDebug = document.querySelector('#voiceDebugContainer');
  if (oldDebug) oldDebug.remove();

  // Создаем основной контейнер
  const debugContainer = document.createElement('div');
  debugContainer.id = 'voiceDebugContainer';
  debugContainer.style.position = 'fixed';
  debugContainer.style.top = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.zIndex = '9999';
  debugContainer.style.width = '350px';
  debugContainer.style.maxWidth = '90vw';

  // Создаем кнопку закрытия (фиксированную в правом верхнем углу контейнера)
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '5px';
  closeBtn.style.right = '5px';
  closeBtn.style.background = isDarkMode ? '#333' : '#fff';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.width = '24px';
  closeBtn.style.height = '24px';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';
  closeBtn.style.color = isDarkMode ? '#eee' : '#333';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.zIndex = '10000';
  closeBtn.onclick = () => debugContainer.remove();

  // Создаем контентное окно
  const debugContent = document.createElement('div');
  debugContent.style.backgroundColor = isDarkMode ? '#222' : '#fff';
  debugContent.style.color = isDarkMode ? '#eee' : '#333';
  debugContent.style.border = '1px solid ' + (isDarkMode ? '#444' : '#ddd');
  debugContent.style.borderRadius = '5px';
  debugContent.style.padding = '15px 10px 10px 10px';
  debugContent.style.maxHeight = '80vh';
  debugContent.style.overflow = 'auto';
  debugContent.style.boxShadow = '0 2px 15px rgba(0,0,0,0.3)';

  // Добавляем заголовок и содержимое
  debugContent.innerHTML = `
    <h3 style="margin:0 0 10px 0;padding-right:20px;">Доступные голоса (${voices.length})</h3>
    <pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;">${JSON.stringify(voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      local: v.localService
    })), null, 2)}</pre>
  `;

  // Собираем все вместе
  debugContainer.appendChild(closeBtn);
  debugContainer.appendChild(debugContent);
  document.body.appendChild(debugContainer);

  // Делаем окно перемещаемым
  let isDragging = false;
  let offsetX, offsetY;

  const header = debugContent.querySelector('h3');
  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - debugContainer.getBoundingClientRect().left;
    offsetY = e.clientY - debugContainer.getBoundingClientRect().top;
    debugContainer.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    debugContainer.style.left = (e.clientX - offsetX) + 'px';
    debugContainer.style.top = (e.clientY - offsetY) + 'px';
    debugContainer.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    debugContainer.style.userSelect = '';
  });
}

// Проверяем GET-параметр
if (new URLSearchParams(window.location.search).has('debugVoices')) {
  // Ждём загрузки голосов
  const checkVoices = setInterval(() => {
    if (window.speechSynthesis.getVoices().length > 0) {
      clearInterval(checkVoices);
      debugVoices();
    }
  }, 100);
}

// Функция для ожидания загрузки голосов
function loadVoices() {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}

// Основная функция озвучки
async function speakTextFromElement(elementId) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Элемент не найден:', elementId);
      return null;
    }

    const htmlLang = document.documentElement.getAttribute('lang') || 'en';
    const text = element.textContent.trim();

    if (!text) {
      alert('Не найден текст для озвучки');
      return null;
    }

    const voices = await loadVoices();

    let langCode;
    let selectedVoice = null;
    let rate = 1.0;

    switch (htmlLang) {
      case 'ru':
        langCode = 'ru-RU';
        selectedVoice = voices.find(v =>
          v.lang === 'ru-RU' &&
          (v.name.includes('Pavel') || v.name.includes('Павел'))
        ) ||
        voices.find(v => v.lang === 'ru-RU');
        break;

      case 'pi':
        if (/[\u0900-\u097F]/.test(text)) {
          const saVoice = voices.find(v => v.lang === 'sa-IN');
          if (saVoice) {
            langCode = 'sa-IN';
            selectedVoice = saVoice;
          } else {
            langCode = 'hi-IN';
            selectedVoice = voices.find(v => v.lang === 'hi-IN');
            rate = 0.4;
          }
        } else {
          langCode = 'en-US';
          selectedVoice = voices.find(v => v.lang === 'en-US');
        }
        break;

      default:
        langCode = 'en-US';
        selectedVoice = voices.find(v => v.lang === 'en-US');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = rate;

    if (langCode === 'hi-IN') {
      utterance.pitch = 0.9;
      utterance.volume = 0.9;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Используется голос:', selectedVoice.name);
    }

    // ИЗМЕНЕНИЕ: Добавлены вызовы releaseWakeLock() в обработчики событий
    utterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
document.getElementById('speechToggleBtn').innerHTML =
  '<img src="/assets/svg/volume-high.svg" alt="tts" style="width: 25px; height: 25px;">';
  
  
      console.log('Воспроизведение завершено');
      releaseWakeLock(); // Снимаем блокировку
    };

    utterance.onerror = (event) => {
      console.error('Ошибка синтеза:', event);
      isSpeaking = false;
      isPaused = false;
document.getElementById('speechToggleBtn').innerHTML =
  '<img src="/assets/svg/volume-high.svg" alt="tts" style="width: 25px; height: 25px;">';
      releaseWakeLock(); // Снимаем блокировку в случае ошибки

      if (langCode !== 'en-US') {
        utterance.lang = 'en-US';
        utterance.voice = null;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return utterance;

  } catch (e) {
      console.error('Ошибка в speakTextFromElement:', e);
      releaseWakeLock(); // Убедимся, что блокировка снята, если произошла ошибка
      return null;
  }
}

// ИЗМЕНЕНИЕ: Функция для тоггла воспроизведения обновлена для управления блокировкой
async function toggleSpeech(elementId) {
  if (isSpeaking && !isPaused) {
    // Пауза воспроизведения
    window.speechSynthesis.pause();
    isPaused = true;
document.getElementById('speechToggleBtn').innerHTML =
  '<img src="/assets/svg/play-grey.svg" alt="play" style="width:25px;height:25px;display:block">';
    console.log('На паузе');
    await releaseWakeLock(); // Снимаем блокировку при паузе
  }
  else if (isPaused) {
    // Продолжение воспроизведения
    await acquireWakeLock(); // Активируем блокировку при возобновлении
    window.speechSynthesis.resume();
    isPaused = false;
document.getElementById('speechToggleBtn').innerHTML =
  '<img src="/assets/svg/pause-grey.svg" alt="pause" style="width:25px;height:25px;display:block">';
    console.log('Продолжено');
  }
  else {
    // Запуск нового воспроизведения
    await acquireWakeLock(); // Активируем блокировку при старте
    window.speechSynthesis.cancel();
    currentUtterance = await speakTextFromElement(elementId);
    if (currentUtterance) {
      isSpeaking = true;
      isPaused = false;
document.getElementById('speechToggleBtn').innerHTML =
  '<img src="/assets/svg/pause-grey.svg" alt="pause" style="width:25px;height:25px;display:block">';
    } else {
      // Если воспроизведение не началось, снимаем блокировку
      await releaseWakeLock();
    }
  }
}

// Инициализация голосов при загрузке страницы
window.speechSynthesis.onvoiceschanged = function() {
  console.log('Доступные голоса обновлены:', window.speechSynthesis.getVoices());
};
</script>
  <script src="/assets/js/autopali.js" defer></script>
  <script src="/assets/js/extraReadingModes.js" defer></script>
      <script src="/assets/js/smoothScroll.js" defer></script>
      <script src="/assets/js/paliLookup.js"></script>
      <script src="/assets/js/settings.js"></script>
      <script src="/read/js/urlForLbl.js" defer></script>
</body>
</html>
