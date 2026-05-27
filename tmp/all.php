<?php
// reader.php

// --- ПАРАМЕТРЫ ---
// Получаем slug и очищаем его от возможных якорей (например, #ll)
$raw_slug = $_GET['q'] ?? '';
$slug = strtolower(preg_replace('/#.*$/', '', $raw_slug));

// --- ФУНКЦИЯ ЗАГРУЗКИ И КОМПОНОВКИ ДАННЫХ ---
/**
 * Загружает данные для всех языков на основе slug.
 * Динамически определяет, является ли slug директорией или файлом, и выполняет соответствующий поиск.
 *
 * @param string $slug Идентификатор сутты или коллекции (например, 'dn1', 'sn', 'pli-tv-bu-vb-pj').
 * @return array Сгенерированный HTML и заголовок.
 */
function load_all_languages_interleaved($slug) {
    // Подключаем конфигурацию, где определена переменная $basedir
    if (file_exists('config/config.php')) {
        include_once('config/config.php');
    } else {
        $basedir = '.'; // Установите значение по умолчанию, если конфиг отсутствует
    }

    $data_sources = [
        'html' => [], 'pali' => [], 'en' => [], 'ru' => []
    ];

    /**
     * Внутренняя функция для поиска и загрузки JSON-файлов.
     * @param string $type Тип контента ('html', 'pali', 'en', 'ru').
     * @param string $slug Идентификатор для поиска.
     * @param string $basedir Базовый путь к данным.
     * @return array Массив с данными из JSON-файлов.
     */
    $fetch_data_for_type = function($type) use ($slug, $basedir) {
        $aggregated_data = [];
        
        // Базовые пути для поиска. Теперь это массивы для поддержки sutta и vinaya.
        $base_paths = [
            'html' => [
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/html/pli/ms/sutta/",
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/html/pli/ms/vinaya/"
            ],
            'pali' => [
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/sutta/",
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/vinaya/"
            ],
            'en'   => [
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/translation/en/"
            ],
            'ru'   => [
                "$basedir/assets/texts/ru/sutta/",
                "$basedir/assets/texts/vinaya/"
            ],
        ];
        
        $search_paths = $base_paths[$type] ?? [];
        if (empty($search_paths)) return [];
        
        $escaped_search_paths = implode(' ', array_map('escapeshellarg', $search_paths));

        // Проверяем, существует ли директория, соответствующая slug.
        $dir_check_cmd = "find $escaped_search_paths -type d -name " . escapeshellarg($slug) . " -print -quit";
        $found_dir = shell_exec($dir_check_cmd);
        
        $is_directory_search = !empty(trim($found_dir));
        
        $cmd = '';
        if ($is_directory_search) {
            // Сценарий 1: Slug - это директория. Ищем все .json файлы внутри неё.
            $cmd = "find " . escapeshellarg(trim($found_dir)) . " -type f -name '*.json' | sort -V";
        } else {
            // Сценарий 2: Slug - это файл. Ищем по шаблону во всех базовых путях.
            $file_pattern = '';
            switch ($type) {
                case 'html':
                    $file_pattern = "{$slug}_html.json";
                    break;
                case 'pali':
                    $file_pattern = "{$slug}_root-pli-ms.json";
                    break;
                case 'en':
                    // Ищем любой английский перевод
                    $file_pattern = "{$slug}_translation-en-*.json";
                    break;
                case 'ru':
                    // Ищем любой русский файл, начинающийся со slug
                    $file_pattern = "{$slug}*.json";
                    break;
            }
            
            if ($file_pattern) {
                $cmd = "find $escaped_search_paths -type f -name " . escapeshellarg($file_pattern);
            }
        }

        if (empty($cmd)) return [];

        $file_list_str = shell_exec($cmd);
        if (empty($file_list_str)) return [];

        $files = array_filter(explode("\n", trim($file_list_str)));
        
        foreach ($files as $file) {
            if (empty($file) || !is_file($file)) continue;

            $json_content = file_get_contents($file);
            $decoded = json_decode($json_content, true);
            if (is_array($decoded)) {
                $aggregated_data = array_merge($aggregated_data, $decoded);
            }
        }
        return $aggregated_data;
    };

    // Загружаем данные для каждого языка
    $data_sources['html'] = $fetch_data_for_type('html');
    $data_sources['pali'] = $fetch_data_for_type('pali');
    $data_sources['en']   = $fetch_data_for_type('en');
    $data_sources['ru']   = $fetch_data_for_type('ru');
    
    // Собираем все уникальные ключи (ID сегментов) из всех источников
    $all_keys = array_keys(
        $data_sources['html'] + $data_sources['pali'] + $data_sources['en'] + $data_sources['ru']
    );
    // Сортируем ключи естественным образом
    usort($all_keys, 'strnatcmp');

    // --- ГЕНЕРАЦИЯ HTML ---
    $html_output = '<div id="reader-container" class="line-by-line-container">';
    if (empty($all_keys) && !empty($slug)) {
        $html_output .= "<p class='p-3'>По вашему запросу '<strong>" . htmlspecialchars($slug) . "</strong>' ничего не найдено. Попробуйте другой запрос.</p>";
    } else {
        foreach ($all_keys as $key) {
            if (strpos($key, ':') === false) continue;
            
            $template = $data_sources['html'][$key] ?? '<p>{}</p>';
            
            $pali_text = $data_sources['pali'][$key] ?? '';
            $en_text   = $data_sources['en'][$key] ?? '';
            $ru_text   = $data_sources['ru'][$key] ?? '';
            
            $pali_col_html = str_replace('{}', $pali_text, $template);
            $en_col_html   = str_replace('{}', $en_text,   $template);
            $ru_col_html   = str_replace('{}', $ru_text,   $template);

            $html_output .= "<div class='segment' id='{$key}'>";
            $html_output .= "<div class='pali-text text-column pli-lang' lang='pi'>{$pali_col_html}</div>";
            $html_output .= "<div class='en-text text-column' lang='en'>{$en_col_html}</div>";
            $html_output .= "<div class='ru-text text-column' lang='ru'>{$ru_col_html}</div>";
            $html_output .= "</div>";
        }
    }
    $html_output .= '</div>';

    // --- НАХОДИМ ЗАГОЛОВОК ДЛЯ СТРАНИЦЫ ---
    $found_title = '';
    // Ищем ключ заголовка, обычно он имеет вид "dn1:0.2"
    foreach ($all_keys as $key) {
        if (preg_match('/:0\.2$/', $key)) {
            $pali_title = $data_sources['pali'][$key] ?? '';
            $en_title   = $data_sources['en'][$key] ?? '';
            $ru_title   = $data_sources['ru'][$key] ?? '';
            
            // Собираем заголовок из доступных языков
            $title_parts = array_filter([$pali_title, $en_title, $ru_title]);
            if (!empty($title_parts)) {
                $found_title = implode(' / ', $title_parts);
                break; // Нашли заголовок, выходим из цикла
            }
        }
    }

    return ['content' => $html_output, 'title' => $found_title];
}

// Если slug не пустой, загружаем контент. Иначе показываем сообщение.
$result = $slug ? load_all_languages_interleaved($slug) : [
    'content' => "<p class='p-3'>Пожалуйста, укажите идентификатор сутты в строке поиска, например, <strong>dn1</strong> или <strong>sn</strong>.</p>",
    'title' => ''
];

$content = $result['content'];
// Устанавливаем заголовок страницы: используем найденный или возвращаемся к slug
$title = !empty($result['title']) ? $result['title'] : strtoupper($slug);

?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title><?= htmlspecialchars($title) ?> :: Parallel Reader</title>
  <link rel="icon" type="image/png" sizes="32x32" href="https://dhamma.gift/assets/img/favico_black.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="/assets/css/bootstrap.5.3.1.min.css" rel="stylesheet" />
  <link href="/assets/css/styles.css" rel="stylesheet" />
  <meta name="author" content="Pali or Translation" />
  <link href="/assets/css/extrastyles.css" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/css/jquery-ui.min.css">
  <link href="/assets/css/paliLookup.css" rel="stylesheet" />
  <script src="/assets/js/jquery-3.7.0.min.js"></script>
  <script src="/assets/js/jquery-ui.min.js"></script>

  <style>
    body {
        --border-color: #dee2e6;
    }
    body.dark-mode {
        --border-color: #495057;
    }
    .line-by-line-container {
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .segment {
        display: flex;
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.3s;
    }
    .segment:hover {
        background-color: rgba(128, 128, 128, 0.1);
    }
    .text-column {
        flex: 1;
        padding: 0.5rem;
        min-width: 0;
        text-align: justify;
        transition: all 0.3s;
        line-height: 1.6;
    }
    .text-column:not(:last-child) {
        border-right: 1px solid var(--border-color);
    }
    .text-column p {
        margin-bottom: 0;
    }
    #reader-container.hide-pali .pali-text,
    #reader-container.hide-en .en-text,
    #reader-container.hide-ru .ru-text {
        display: none;
    }
    #reader-container.hide-ru .en-text,
    #reader-container.hide-en .pali-text,
    #reader-container.hide-pali.hide-en .ru-text,
    #reader-container.hide-pali.hide-ru .en-text {
        border-right: none;
    }
    
    .controls-container {
        position: sticky;
        top: 0;
        background: var(--bs-body-bg);
        padding: 10px;
        border-bottom: 1px solid var(--border-color);
        z-index: 1000;
        transition: background-color 0.3s, border-color 0.3s;
    }
    /* --- ИСПРАВЛЕНИЕ ДЛЯ ТЕМНОЙ ТЕМЫ --- */
    body.dark-mode .controls-container {
        background: #2b3035; /* Цвет фона для темной темы */
        --border-color: #495057;
    }

    [class$="-text"] { 
        word-break: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
    }
  </style>
</head>
<body>

<div class="container-fluid controls-container">
  <div class="d-flex flex-wrap align-items-center justify-content-between">
    
    <div class="d-flex align-items-center mb-2 mb-sm-0 me-auto">
      <a id="readLink" href="/read.php" title="Sutta and Vinaya reading" rel="noreferrer" class="me-1">
        <svg fill="#979797" xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 547.596 547.596" stroke="#979797">
          <g><path d="M540.76,254.788L294.506,38.216c-11.475-10.098-30.064-10.098-41.386,0L6.943,254.788 c-11.475,10.098-8.415,18.284,6.885,18.284h75.964v221.773c0,12.087,9.945,22.108,22.108,22.108h92.947V371.067 c0-12.087,9.945-22.108,22.109-22.108h93.865c12.239,0,22.108,9.792,22.108,22.108v145.886h92.947 c12.24,0,22.108-9.945,22.108-22.108v-221.85h75.965C549.021,272.995,552.081,264.886,540.76,254.788z"></path></g>
        </svg>
      </a>
        <a href="/" title="Home" class="me-2"><img width="24px" alt="dhamma.gift icon" src="/assets/img/gray-white.png"></a>
        <form id="slugForm" class="d-flex align-items-center flex-nowrap me-2" onsubmit="goToSlug(); return false;">
            <input type="search" class="form-control form-control-sm rounded-pill" 
                   id="paliauto" name="q" value="<?= htmlspecialchars($slug) ?>" 
                   placeholder="e.g. dn9" style="width: 120px;" autofocus>
            <button type="submit" class="btn btn-sm btn-outline-secondary rounded-circle p-1 ms-1 flex-shrink-0" style="width:30px; height:30px;">Go</button>
        </form>
        <a alt="Onclick popup dictionary" title="Onclick popup dictionary (Alt+A)" class="toggle-dict-btn text-decoration-none text-dark me-2">
          <img src="/assets/svg/comment.svg" class="dictIcon" style="width: 20px; height: 20px;">
        </a>
        <a href="/tts.php" class="text-decoration-none text-dark me-2" title="Text-to-Speech Mode">🔊</a>
        <div class="form-check form-switch me-2">
            <input type="checkbox" class="form-check-input" id="darkSwitch">
        </div>
    </div>
    
    <div class="d-inline-flex align-items-center lang-toggle-group mb-2 mb-sm-0 ms-auto">
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-primary active lang-toggle-btn" data-lang="pali">PI</button>
            <button type="button" class="btn btn-outline-primary active lang-toggle-btn" data-lang="en">EN</button>
            <button type="button" class="btn btn-outline-primary active lang-toggle-btn" data-lang="ru">RU</button>
        </div>
    </div>
  </div>
</div>

<div class="container-fluid">
    <div class="row">
        <div class="col-12 px-0">
            <?= $content ?>
        </div>
    </div>
</div>

  <script src="/assets/js/autopali.js" defer></script>
  <script src="/assets/js/smoothScroll.js" defer></script>
  <script src="/assets/js/dark-mode-switch/dark-mode-switch.js"></script>
  <script src="/assets/js/paliLookup.js"></script>
  <script src="/assets/js/settings.js"></script>

<script>
function goToSlug() {
    const slug = document.getElementById('paliauto').value.trim().toLowerCase();
    if (!slug) return;
    window.location.search = `q=${slug}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const readerContainer = document.getElementById('reader-container');
    const langToggleButtons = document.querySelectorAll('.lang-toggle-btn');

    function updateVisibility() {
        if (!readerContainer) return;
        
        langToggleButtons.forEach(button => {
            const lang = button.dataset.lang;
            if (button.classList.contains('active')) {
                readerContainer.classList.remove(`hide-${lang}`);
            } else {
                readerContainer.classList.add(`hide-${lang}`);
            }
        });
    }

    langToggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            updateVisibility();
        });
    });

    updateVisibility();
});
</script>

</body>
</html>
