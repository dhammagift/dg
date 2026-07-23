<?php 
error_reporting(E_ERROR | E_PARSE);
header("Content-Type:text/plain");

function translatorLookup($fromjs, $lang) {
    include_once('../../config/config.php');
    
    // Очистка ввода
    $fromjs = preg_replace('/[^a-zA-Z0-9\-\/\.]/', '', $fromjs);
    $lang = preg_replace('/[^a-z]/', '', strtolower($lang));
    
    // Список разрешенных языков (защита от поиска в системных папках вроде 'variant' или 'vinaya')
    $allowed_langs = ['ru', 'en', 'th']; 
    if (!in_array($lang, $allowed_langs)) {
        $lang = 'ru'; // Если пришла какая-то дичь, падаем на русский по умолчанию
    }

    // Формируем пути
    if ($lang === 'th') {
        $dir = rtrim($thtranslatorlocation, '/'); 
    } else {
        // Теперь скрипт пойдет в assets/texts/en, если lang=en, и assets/texts/ru, если lang=ru
        $dir = rtrim($translatorlocation, '/') . '/' . $lang; 
    }
    
    $lang_prefix = $lang; 

    // Защита: если папка не найдена, даже не начинаем поиск
    if (!is_dir($dir)) {
        return "";
    }

    $search_prefix = "{$fromjs}_translation-{$lang_prefix}-";

    // 3. Рекурсивный поиск с поддержкой симлинков (теперь он не выйдет за пределы папки ru)
    $directory = new RecursiveDirectoryIterator($dir, FilesystemIterator::FOLLOW_SYMLINKS | FilesystemIterator::SKIP_DOTS);
    $iterator = new RecursiveIteratorIterator($directory);

    foreach ($iterator as $file) {
        if ($file->isFile() && strpos($file->getFilename(), $search_prefix) === 0) {
            $filename = $file->getFilename();
            
            if (preg_match('/_translation-' . $lang_prefix . '-(.+)\.json$/', $filename, $matches)) {
                return $matches[1];
            }
        }
    }
    
    return "";
}



// Получаем параметры из URL
$fromjs = isset($_GET['fromjs']) ? $_GET['fromjs'] : '';
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'ru'; // Если язык не передан, ставим 'ru'

if (!empty($fromjs)) {
    echo translatorLookup($fromjs, $lang);
}
?>