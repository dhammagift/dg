<?php
error_reporting(E_ERROR | E_PARSE);
// reader.php

// --- ПАРАМЕТРЫ ---
// Получаем slug и очищаем его от якорей и лишних символов
$raw_slug = $_GET['q'] ?? '';
$slug = strtolower(preg_replace('/[#?].*$/', '', $raw_slug));

// 1. Убираем лишние пробелы (например, "bu pj1" -> "bupj1" или "mn 10" -> "mn10")
$slug = preg_replace('/(\d+)\s+(\d+)/', '$1.$2', $slug);
$slug = preg_replace('/([a-zA-Z]+)\s+(\d)/', '$1$2', $slug);

// 2. Модификация slug для случаев bi- и bu- (Vinaya)
// Превращает 'bu-pj1' в 'pli-tv-bu-vb-pj1'

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


// Получаем режим скрипта (dev - Деванагари, иначе - латиница)
$script_param = $_GET['script'] ?? '';
$is_dev = ($script_param === 'dev');

// --- ФУНКЦИЯ ЗАГРУЗКИ И КОМПОНОВКИ ДАННЫХ ---
function load_all_languages_interleaved($slug, $is_dev) {
  // Подключаем конфигурацию
  if (file_exists('config/config.php')) {
    include_once('config/config.php');
  } else {
    $basedir = '.'; 
  }

  $data_sources = [
    'html' => [], 'pali' => [], 'en' => [], 'ru' => []
  ];

  $fetch_data_for_type = function($type) use ($slug, $basedir, $is_dev) {
    $aggregated_data = [];
    
    // ОПРЕДЕЛЕНИЕ ПУТЕЙ В ЗАВИСИМОСТИ ОТ ТИПА И СКРИПТА
    $base_paths = [
      'html' => [
        "$basedir/suttacentral.net/sc-data/sc_bilara_data/html/pli/ms/sutta/",
        "$basedir/suttacentral.net/sc-data/sc_bilara_data/html/pli/ms/vinaya/"
      ],
      'en' => [
        "$basedir/suttacentral.net/sc-data/sc_bilara_data/translation/en/"
      ],
      'ru' => [
        "$basedir/assets/texts/sutta/",
        "$basedir/assets/texts/vinaya/"
      ],
    ];

    // Логика для PALI путей
    if ($type === 'pali') {
        if ($is_dev) {
            $base_paths['pali'] = [
                "$basedir/assets/texts/devanagari/root/pli/ms/sutta/",
                "$basedir/assets/texts/devanagari/root/pli/ms/vinaya/"
            ];
        } else {
            $base_paths['pali'] = [
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/sutta/",
                "$basedir/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/vinaya/"
            ];
        }
    }
   
    $search_paths = $base_paths[$type] ?? [];
    if (empty($search_paths)) return [];
   
    $escaped_search_paths = implode(' ', array_map('escapeshellarg', $search_paths));
    
    $dir_check_cmd = "find $escaped_search_paths -type d -name " . escapeshellarg($slug) . " -print -quit";
    $found_dir = shell_exec($dir_check_cmd);
    $is_directory_search = !empty(trim($found_dir));
   
    $cmd = '';
    if ($is_directory_search) {
      $cmd = "find " . escapeshellarg(trim($found_dir)) . " -type f -name '*.json' | sort -V";
    } else {
      $file_pattern = '';
      switch ($type) {
        case 'html':
          $file_pattern = "{$slug}_html.json";
          break;
        case 'pali':
          if ($is_dev) {
              $file_pattern = "{$slug}_rootd-pli-ms.json";
          } else {
              $file_pattern = "{$slug}_root-pli-ms.json";
          }
          break;
        case 'en':
          $file_pattern = "{$slug}_translation-en-*.json";
          break;
        case 'ru':
          $file_pattern = "{$slug}_*.json";
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

  $data_sources['html'] = $fetch_data_for_type('html');
  $data_sources['pali'] = $fetch_data_for_type('pali');
  $data_sources['en'] = $fetch_data_for_type('en');
  $data_sources['ru'] = $fetch_data_for_type('ru');
 
  $all_keys = array_keys($data_sources['pali'] + $data_sources['en'] + $data_sources['ru'] + $data_sources['html']);
  usort($all_keys, 'strnatcmp');

  // --- ГЕНЕРАЦИЯ HTML ТАБЛИЦЫ ---
  $html_output = '<div class=""><table id="sutta-table" class="table table-striped table-bordered" style="width:100%">';
  $html_output .= '<thead><tr><th>ID</th><th>Pali</th><th>English</th><th>Russian</th></tr></thead>';
  $html_output .= '<tbody>';
  
  if (!empty($all_keys) || empty($slug)) {
    foreach ($all_keys as $key) {
      if (strpos($key, ':') === false) continue;
      
      $row_id = htmlspecialchars($key);
      $template = $data_sources['html'][$key] ?? '{}';

      // --- ПОЛУЧЕНИЕ И ОБРАБОТКА ПАЛИ ---
      $raw_pali = $data_sources['pali'][$key] ?? '';

      $hasRp = isset($_GET['rp']);
      $rpValue = $hasRp ? $_GET['rp'] : null;
      $removePunctParam = $hasRp && ($rpValue === 'true' || $rpValue === '1' || $rpValue === '');

      if ($is_dev || $removePunctParam) {
          $raw_pali = str_replace(['-', '—', '–'], ' ', $raw_pali);
          $raw_pali = str_replace(['.', '?', '!'], ' | ', $raw_pali);
          $raw_pali = str_replace(['।', '॥'], ' | ', $raw_pali);
          $raw_pali = preg_replace('/(?!\|)[\p{P}\p{S}]/u', '', $raw_pali);
      }

      $pali_text = htmlspecialchars($raw_pali, ENT_QUOTES, 'UTF-8');
      
      // Иконка-ромбик в стиле твоей читалки
      $open_reader_icon = '<span class="open-reader-link" title="Open in Reader" style="cursor:pointer; opacity:0.3; margin-right:0.3em; user-select:none; transition: opacity 0.2s ease;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=0.3">✦</span>';

      $en_text = htmlspecialchars($data_sources['en'][$key] ?? '', ENT_QUOTES, 'UTF-8');
      $ru_text = htmlspecialchars($data_sources['ru'][$key] ?? '', ENT_QUOTES, 'UTF-8');
      
      $pali_col_html = str_replace('{}', $open_reader_icon . $pali_text, $template);
      $en_col_html = str_replace('{}', $en_text, $template);
      $ru_col_html = str_replace('{}', $ru_text, $template);
      
      $html_output .= "<tr id='{$row_id}'>";
      $html_output .= "<td data-column='ID'>" . htmlspecialchars($key) . "</td>";
      $html_output .= "<td data-column='Pali' class='pali-text copyLink' lang='pi'>{$pali_col_html}</td>";
      $html_output .= "<td data-column='English' class='en-text copyLink' lang='en'>{$en_col_html}</td>";
      $html_output .= "<td data-column='Russian' class='ru-text copyLink' lang='ru'>{$ru_col_html}</td>";
      $html_output .= "</tr>";
    }
  }
  $html_output .= '</tbody></table></div>';
  
  $found_title = '';
  foreach ($all_keys as $key) {
    if (preg_match('/:0\.2$/', $key)) {
      $pali_title = $data_sources['pali'][$key] ?? '';
      $en_title = $data_sources['en'][$key] ?? '';
      $ru_title = $data_sources['ru'][$key] ?? '';
     
      $title_parts = array_filter([strip_tags($pali_title), strip_tags($en_title), strip_tags($ru_title)]);
      if (!empty($title_parts)) {
        $found_title = implode(' / ', $title_parts);
        break;
      }
    }
  }
  return ['content' => $html_output, 'title' => $found_title];
}


// Генерация контента
if ($slug) {
    $result = load_all_languages_interleaved($slug, $is_dev);
} else {
    // Стартовая страница
    if ($is_dev) {
        $welcome_msg = "<p class='p-3'><a href='$mainpagenoslash/r.php?q=sn1&script=dev'><strong>स्न्१</strong></a> वा 
        <a href='$mainpagenoslash/r.php?q=mn1&script=dev'><strong>म्न्१</strong></a> वा
        <a href='$mainpagenoslash/r.php?q=dn1&script=dev'><strong>द्न्१</strong></a> वा 
        <a href='$mainpagenoslash/r.php?q=an1&script=dev'><strong>अन्१</strong></a> वा | 
        <br><br>
        <a href='$mainpagenoslash/r.php'><strong>रोमञ्ञ पाऌइ </strong> / Romanized Pali</a></p>";
    } else {
        $welcome_msg = "<p class='p-3'>Enter 
        <a href='$mainpagenoslash/r.php?q=sn1'><strong>sn1</strong></a>, 
        <a href='$mainpagenoslash/r.php?q=mn1'><strong>mn1</strong></a>, 
        <a href='$mainpagenoslash/r.php?q=dn1'><strong>dn1</strong></a> 
        or <a href='$mainpagenoslash/r.php?q=an1'><strong>an1</strong></a>.<br><br>
        <a href='$mainpagenoslash/r.php?script=dev'><strong>देवनगरि पाऌइ</strong> / Devanagari Pali</a></p>";
    }
    $result = ['content' => $welcome_msg, 'title' => ''];
}

$content = $result['content'];
$title = !empty($result['title']) ? $result['title'] : strtoupper($slug);

// --- ВИЗУАЛЬНАЯ НАСТРОЙКА КНОПКИ (URL формирует JS) ---
if ($is_dev) {
    // Если сейчас Dev, показываем иконку для перехода в Roman
    $toggle_icon = "/assets/svg/devanagari_r.svg";
    $toggle_title = "Romanized Mode";
} else {
    // Если сейчас Roman, показываем иконку для перехода в Dev
    $toggle_icon = "/assets/svg/devanagari_d.svg";
    $toggle_title = "Devanagari Mode";
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
 <meta charset="UTF-8">
 <title><?= htmlspecialchars($title) ?> :: Chapter Reader</title>
 <link rel="icon" type="image/png" sizes="32x32" href="https://dhamma.gift/assets/img/favico_black.png">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <link rel="stylesheet" href="/assets/css/jquery-ui.min.css">
 <link href="/assets/css/styles.css" rel="stylesheet" />
 <link href="/assets/css/extrastyles.css" rel="stylesheet" />
 <link href="/assets/css/paliLookup.css" rel="stylesheet" />
 <link rel="stylesheet" type="text/css" href="/assets/js/datatables/datatables.min.css"/>
 
 <script src="/assets/js/nav-component.js" defer></script>
 <script src="/assets/js/themeswitch.js" defer></script>
 
 <script>
 const path = location.pathname.toLowerCase();
 let lang;
 if (/(\/ru\/|\/r\/|\/ml\/)/.test(path)) {
    lang = 'ru';
 } else if (/\/th\//.test(path)) {
    lang = 'th';
 } else {
    lang = 'en';
 }  
 </script>
 <style>
  /* --- ОБЩИЕ СТИЛИ --- */
.controls-container {
  position: sticky;
  top: 0;
  background: var(--bs-body-bg, #fff);
  padding: 10px;
  border-bottom: 1px solid var(--bs-border-color, #dee2e6);
  z-index: 90;
  transition: background-color 0.3s, border-color 0.3s;
}

* {
    text-align: left;
}

#sutta-table td h1,
#sutta-table td h2 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-top: 2.0rem;
  text-align: center;
}

#sutta-table td h3,
#sutta-table td h4 {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 1.5rem;
}

li {
  list-style-type: none;
  padding-left: 0;
  text-align: center;
}

.endsutta {
  margin-bottom: 5.5rem;
}

/* --- СТИЛИ ДЛЯ ТЕМНОЙ ТЕМЫ --- */
body.dark {
  --bs-body-bg: #212529;
  --bs-body-color: #dee2e6;
  --bs-border-color: #495057;
  --bs-table-color: var(--bs-body-color);
  --bs-table-striped-color: var(--bs-body-color);
  color-scheme: dark;
}

body.dark .controls-container {
  background: #101010;
  border-bottom-color: #333;
}

body.dark .table {
  color: var(--bs-body-color);
}

body.dark .controls-container .form-control {
  background-color: #495057;
  color: #dee2e6;
  border-color: #6c757d;
}

body.dark .controls-container .form-control::placeholder {
  color: #adb5bd;
}

body.dark .controls-container .btn-outline-secondary {
  color: #dee2e6;
  border-color: #6c757d;
}

body.dark .controls-container .btn-outline-secondary:hover {
  background-color: #495057;
}

body.dark .controls-container svg {
  fill: #dee2e6;
}

body.dark .controls-container .toggle-dict-btn img,
body.dark .controls-container a[href="/"] img {
  filter: invert(1) grayscale(100%) brightness(200%);
}

body.dark .controls-container a.text-dark {
  color: #dee2e6 !important;
}

body.dark .dataTables_wrapper .dataTables_length,
body.dark .dataTables_wrapper .dataTables_filter,
body.dark .dataTables_wrapper .dataTables_info,
body.dark .dataTables_wrapper .dataTables_paginate .paginate_button {
  color: #fff !important;
}

body.dark .dataTables_wrapper .dataTables_filter input {
  background-color: #495057;
  color: #dee2e6;
  border: 1px solid #6c757d;
}

body.dark .page-link {
  background-color: #343a40;
  border-color: #495057;
  color: #fff;
}

body.dark .page-link:hover {
  background-color: #495057;
}

body.dark .page-item.disabled .page-link {
  background-color: #212529;
  border-color: #495057;
  color: #6c757d;
}

body.dark .table-striped>tbody>tr:nth-of-type(odd)>* {
  --bs-table-accent-bg: rgba(255, 255, 255, 0.075);
  color: var(--bs-table-color);
}

body.dark .table-bordered {
  border-color: var(--bs-border-color);
}

body.dark .dt-buttons .btn-secondary {
  color: #fff;
  background-color: #5a6268;
  border-color: #545b62;
}

body.dark .dt-buttons .btn-secondary:hover {
  color: #fff;
  background-color: #4e555b;
  border-color: #484e53;
}

#custom-search-filter {
  min-width: 150px;
}

/* --- СТИЛИ ТАБЛИЦЫ --- */
#sutta-table {
  table-layout: fixed;
  width: 100%;
}

#sutta-table td {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  vertical-align: top;
  padding: 8px;
  hyphens: auto;
}

#sutta-table th:not(:nth-child(1)), 
#sutta-table td:not(:nth-child(1)) {
  width: auto;
}

#sutta-table th:nth-child(2):last-child,
#sutta-table td:nth-child(2):last-child,
#sutta-table th:nth-child(3):last-child,
#sutta-table td:nth-child(3):last-child,
#sutta-table th:nth-child(4):last-child,
#sutta-table td:nth-child(4):last-child {
  width: 95% !important;
}

#sutta-table th:nth-child(2):nth-last-child(2),
#sutta-table td:nth-child(2):nth-last-child(2),
#sutta-table th:nth-child(3):nth-last-child(1),
#sutta-table td:nth-child(3):nth-last-child(1),
#sutta-table th:nth-child(3):nth-last-child(2),
#sutta-table td:nth-child(3):nth-last-child(2),
#sutta-table th:nth-child(4):nth-last-child(1),
#sutta-table td:nth-child(4):nth-last-child(1) {
  width: 47.5% !important;
}

#sutta-table th:nth-child(2):nth-last-child(3),
#sutta-table td:nth-child(2):nth-last-child(3),
#sutta-table th:nth-child(3):nth-last-child(2),
#sutta-table td:nth-child(3):nth-last-child(2),
#sutta-table th:nth-child(4):nth-last-child(1),
#sutta-table td:nth-child(4):nth-last-child(1) {
  width: 31.66% !important;
}

@media (max-width: 768px) {
  #sutta-table thead { display: none; }
  #sutta-table, #sutta-table tbody, #sutta-table tr, #sutta-table td {
    display: block; width: 100% !important;
  }
  #sutta-table tr {
    margin-bottom: 1rem; border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: 0.25rem; overflow: hidden;
  }
  #sutta-table td {
    text-align: left; border: none; border-bottom: 1px solid var(--bs-border-color, #dee2e6); padding: 0.75rem;
  }
  #sutta-table tr td:last-child { border-bottom: none; }
  #sutta-table td[data-column]::before {
    content: attr(data-column); font-weight: bold; display: block; margin-bottom: 0.5rem; color: var(--bs-body-color);
  }
  #sutta-table tr + tr td[data-column]::before { display: none; }
  .controls-container { position: static; }
  
  #sutta-table th:nth-child(2):last-child, #sutta-table td:nth-child(2):last-child,
  #sutta-table th:nth-child(3):last-child, #sutta-table td:nth-child(3):last-child,
  #sutta-table th:nth-child(4):last-child, #sutta-table td:nth-child(4):last-child { width: 100% !important; }

  #sutta-table th:nth-child(2):nth-last-child(2), #sutta-table td:nth-child(2):nth-last-child(2),
  #sutta-table th:nth-child(3):nth-last-child(1), #sutta-table td:nth-child(3):nth-last-child(1),
  #sutta-table th:nth-child(3):nth-last-child(2), #sutta-table td:nth-child(3):nth-last-child(2),
  #sutta-table th:nth-child(4):nth-last-child(1), #sutta-table td:nth-child(4):nth-last-child(1) { width: 100% !important; }

  #sutta-table th:nth-child(2):nth-last-child(3), #sutta-table td:nth-child(2):nth-last-child(3),
  #sutta-table th:nth-child(3):nth-last-child(2), #sutta-table td:nth-child(3):nth-last-child(2),
  #sutta-table th:nth-child(4):nth-last-child(1), #sutta-table td:nth-child(4):nth-last-child(1) { width: 100% !important; }
}

/* --- ИСПРАВЛЕНИЕ DATATABLES COLVIS В ТЕМНОЙ ТЕМЕ --- */

/* Фон самого выпадающего списка */
body.dark div.dt-button-collection {
    background-color: #212529 !important;
    border: 1px solid #495057 !important;
}

/* Стили для кнопок внутри списка (ID, Pali, English...) */
body.dark div.dt-button-collection .dt-button {
    background-color: #212529 !important;
    color: #dee2e6 !important; /* Цвет текста */
    border: none !important;
    box-shadow: none !important;
}

/* Ховер (наведение) на пункты списка */
body.dark div.dt-button-collection .dt-button:hover {
    background-color: #495057 !important;
    color: #fff !important;
}

/* Активный пункт (когда галочка стоит/колонка видима) */
body.dark div.dt-button-collection .dt-button.active {
    background-color: #0d6efd !important; /* Синий акцент для активных */
    color: #fff !important;
    font-weight: bold;
}

/* Исправление фона подложки (если она есть) */
body.dark .dt-button-background {
    background: rgba(0, 0, 0, 0.7) !important;
}


#sutta-table td.en-text, 
#sutta-table td.ru-text {
  opacity: 0.55;
}

#sutta-table td.en-text:hover, 
#sutta-table td.ru-text:hover {
  opacity: 1;
  transition: opacity 0.3s ease;
}



 </style>
</head>
<body> 
<div class="container-fluid controls-container">
 <div class="d-flex flex-wrap align-items-center justify-content-between">
  <div class="d-flex align-items-center mb-2 mb-sm-0">
   
   <top-nav-icons type="read" show-dict></top-nav-icons>

   <form id="slugForm" class="d-flex align-items-center flex-nowrap me-2" onsubmit="goToSlug(); return false;">
    <input type="search" class="form-control form-control-sm rounded-pill" id="paliauto" name="q" value="<?= htmlspecialchars($slug) ?>" placeholder="e.g. dn9" style="width: 120px;" autofocus>
    <button type="submit" id="searchbtn" class="btn btn-sm btn-outline-secondary rounded-circle p-1 ms-1 flex-shrink-0" style="width:30px; height:30px;">Go</button>
   </form>
   
   <a id="ttsLink" href="/tts.php" class="mode-switch text-decoration-none text-dark me-2" title="Text-to-Speech Mode">
      <img src="/assets/svg/volume-high.svg" style="width: 25px; height: 25px;">
   </a>
  </div>
  
  <a href="#" id="script-toggle" class="mode-switch text-decoration-none text-dark" title="<?= $toggle_title ?>">
    <img src="<?= $toggle_icon ?>" style="width: 35px; height: 35px;">
  </a> 

  <script src="/assets/js/extraReadingModes.js" defer></script>
     
  <div id="datatables-controls-placeholder" class="d-flex align-items-center">
    <input type="search" id="custom-search-filter" class="form-control form-control-sm" placeholder="Filter...">
  </div>
 </div>
</div>

<div class="container-fluid">
  <div class="row">
    <div class="col-12">
      <?= $content ?>
    </div>
  </div>
</div>
 <script src="/assets/js/jquery-3.7.0.min.js"></script>
 <script src="/assets/js/jquery-ui.min.js"></script>
 <script src="/assets/js/bootstrap.bundle.5.3.1.min.js"></script>
 <script type="text/javascript" src="/assets/js/datatables/datatables.js"></script>
 <script type="text/javascript" src="/assets/js/natural.js"></script>
 <script type="text/javascript" src="/assets/js/strip-html.js"></script>
 <script src="/assets/js/autopali.js" defer></script>
 <script src="/assets/js/paliLookup.js" defer></script>
 <script src="/assets/js/settings.js"></script>
 <script src="/assets/js/smoothScroll.js" defer></script>
 
<script>
// Функция поиска (Go)
function goToSlug() {
  const slug = document.getElementById('paliauto').value.trim().toLowerCase();
  if (!slug) return;
  // Сохраняем параметр script, если он есть
  const urlParams = new URLSearchParams(window.location.search);
  const scriptMode = urlParams.get('script');
  
  let newUrl = `?q=${slug}`;
  if (scriptMode === 'dev') {
      newUrl += '&script=dev';
  }
  window.location.search = newUrl;
}

document.addEventListener("DOMContentLoaded", function() {
    // Делегируем слушатель на body, чтобы избежать привязки к каждой отдельной строке
    document.body.addEventListener('click', function(e) {
        // Проверяем, был ли клик по самой иконке или её внутренностям (path/svg)
        const readerLink = e.target.closest('.open-reader-link');
        
        if (readerLink) {
            e.preventDefault();
            e.stopPropagation(); // Не даем событию всплывать дальше

            const tr = readerLink.closest('tr');
            if (!tr || !tr.id) return;

            // Разбиваем ID (например, "mn1:1.1")
            const parts = tr.id.split(':');
            if (parts.length !== 2) return;

            const slug = parts[0];
            const segment = parts[1];

            // Проверяем URL для подстановки правильного пути ридера
            const currentPath = window.location.pathname.toLowerCase();
            const baseUrl = currentPath.includes('/ru/r.php') ? '/r/' : '/read/';

            // Формируем финальную ссылку
            const finalUrl = `${baseUrl}?q=${slug}#${segment}`;

            // Открываем ридер в новой вкладке
            window.open(finalUrl, '_blank');
        }
    });
});


document.addEventListener("DOMContentLoaded", function() {
  const url = new URL(window.location.href);
  const hasRp = url.searchParams.has('rp');
  const isSavedRp = localStorage.getItem('removePunct') === 'true';

  // 1. Если есть параметр rp — сохраняем в localStorage
  if (hasRp) {
    if (!isSavedRp) localStorage.setItem('removePunct', 'true');
  } 
  // 2. Если параметра нет, но есть запись в localStorage — добавляем rp и перезагружаем
  else if (isSavedRp) {
    url.searchParams.set('rp', '');
//  window.location.replace(url.toString()); // Перезагрузка страницы с новым параметром
  }
});




// Логика кнопки переключения Devanagari/Roman (JS only)
document.addEventListener("DOMContentLoaded", function() {
    const scriptBtn = document.getElementById('script-toggle');
    if (scriptBtn) {
        scriptBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            const url = new URL(window.location.href);
            if (url.searchParams.get('script') === 'dev') {
                url.searchParams.delete('script');
            } else {
                url.searchParams.set('script', 'dev');
            }
            window.location.href = url.toString();
        });
    }
});

// Инициализация переключателя темы
document.addEventListener("DOMContentLoaded", function () {
  const darkSwitch = document.getElementById("darkSwitch");
  const body = document.body;
  const setTheme = (isDark) => {
    if (isDark) {
      body.setAttribute("data-bs-theme", "dark");
      body.classList.add("dark");
      localStorage.setItem("darkSwitch", "dark");
    } else {
      body.setAttribute("data-bs-theme", "light");
      body.classList.remove("dark");
      localStorage.removeItem("darkSwitch");
    }
    darkSwitch.checked = isDark;
  };
  const savedTheme = localStorage.getItem("darkSwitch") === "dark";
  setTheme(savedTheme);
  darkSwitch.addEventListener("change", () => {
    setTheme(darkSwitch.checked);
  });
});

$(document).ready(function() {
  // Определяем текущий режим для отдельного сохранения состояния
  var isDevMode = new URLSearchParams(window.location.search).get('script') === 'dev';
  var stateSuffix = isDevMode ? '_dev' : '_rom';

  var table = $('#sutta-table').DataTable({
    stateSave: true,
    stateSaveCallback: function(settings, data) {
      localStorage.setItem('DataTables_' + settings.sInstance + '_' + location.pathname + stateSuffix, JSON.stringify(data));
    },
    stateLoadCallback: function(settings) {
      return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance + '_' + location.pathname + stateSuffix));
    },
    colReorder: true,
    ordering: false,
    columnDefs: [
      {
        targets: 0,
        visible: false,
        width: "5%"
      },
      {
        targets: [1, 2, 3],
        width: "31.66%"
      }
    ],
    paging: false,
    responsive: true,
    dom: "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12'Q>>" + 
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    search: {
      caseInsensitive: true,
      diacritics: false,
      smart: true
    },
    buttons: [{
      extend: 'colvis',
      text: '🌐',
      className: 'btn-secondary btn-sm'
    }],
    searchBuilder: {
        preDefined: {
            criteria: [
                {
                condition: 'contains',
                data: 'Pali',
                value: ['']
            },
               {
                condition: 'contains',
                data: 'Pali',
                value: ['']
            }
        ],
            logic: 'OR'
        }
    },
    language: {
      search: "Filter...",
      buttons: {
        colvis: 'Column visibility'
      }
    }
  });

  table.on('column-visibility.dt', function() {
    var visibleColumns = table.columns().visible().reduce(function(a, b) {
      return a + (b ? 1 : 0);
    }, 0) - 1; 
    
    if (visibleColumns === 1) {
      table.columns([1, 2, 3]).visible().nodes().to$().css('width', '95%');
    } else if (visibleColumns === 2) {
      table.columns([1, 2, 3]).visible().nodes().to$().css('width', '47.5%');
    } else if (visibleColumns === 3) {
      table.columns([1, 2, 3]).visible().nodes().to$().css('width', '31.66%');
    }
  });
  
  $('#custom-search-filter').on('keyup input', function() {
    table.search(this.value).draw();
  });

  $('.dt-buttons')
    .addClass('me-auto') 
    .prependTo('#datatables-controls-placeholder');

  function scrollToHash() {
    const hash = window.location.hash;
    if (hash && hash.includes('.')) {
      const slug = '<?= $slug ?>'; 
      const segmentId = hash.substring(1);
      const targetId = `${slug}:${segmentId}`;
      const targetElement = $('#' + $.escapeSelector(targetId));

      if (targetElement.length) {
        setTimeout(function() {
          const headerHeight = $('.controls-container').outerHeight() || 70;
          $('html, body').animate({
            scrollTop: targetElement.offset().top - headerHeight - 10 
          }, 500);
          
          const originalColor = targetElement.css('background-color');
          targetElement.css('transition', 'background-color 0.5s ease');
          targetElement.css('background-color', '#1abc9c');
          
          setTimeout(function() {
              targetElement.css('background-color', originalColor);
          }, 3000);
        }, 150); 
      }
    }
  }
  scrollToHash();
});
</script>
</body>
</html>