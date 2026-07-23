<?php 
error_reporting(E_ERROR | E_PARSE);
header("Content-Type:text/plain");

function translatorLookup($fromjs, $lang) {
    include_once('../../config/config.php');
    
    // Очистка ввода
    $fromjs = preg_replace('/[^a-zA-Z0-9\-\/\.]/', '', $fromjs);
    $lang = preg_replace('/[^a-z]/', '', strtolower($lang));
    
    // Список разрешенных языков
    $allowed_langs = ['ru', 'en', 'th']; 
    if (!in_array($lang, $allowed_langs)) {
        $lang = 'ru'; 
    }

    $base_dir = rtrim($translatorlocation, '/');
    $search_dirs = [];

    // Формируем пути в порядке приоритета
    if ($lang === 'th') {
        $search_dirs[] = rtrim($thtranslatorlocation, '/'); 
    } elseif ($lang === 'en') {
        // Приоритет 1: o
        $search_dirs[] = $base_dir . '/en/o'; 
        // Приоритет 2: thanissaro и другие
        $search_dirs[] = $base_dir . '/en_other'; 
    } else {
        // Для русского (и по умолчанию)
        $search_dirs[] = $base_dir . '/' . $lang; 
    }
    
    $lang_prefix = $lang; 
    $search_prefix = "{$fromjs}_translation-{$lang_prefix}-";

    // Ищем по всем директориям массива с учетом приоритета
    foreach ($search_dirs as $dir) {
        if (!is_dir($dir)) {
            continue;
        }

        // Рекурсивный поиск с поддержкой симлинков
        $directory = new RecursiveDirectoryIterator($dir, FilesystemIterator::FOLLOW_SYMLINKS | FilesystemIterator::SKIP_DOTS);
        $iterator = new RecursiveIteratorIterator($directory);

        foreach ($iterator as $file) {
            if ($file->isFile() && strpos($file->getFilename(), $search_prefix) === 0) {
                $filename = $file->getFilename();
                
                if (preg_match('/_translation-' . $lang_prefix . '-(.+)\.json$/', $filename, $matches)) {
                    return $matches[1]; // Возвращаем первого найденного переводчика
                }
            }
        }
    }
    
    return "";
}

// Получаем параметры из URL
$fromjs = isset($_GET['fromjs']) ? $_GET['fromjs'] : '';
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'ru'; 

if (!empty($fromjs)) {
    echo translatorLookup($fromjs, $lang);
}
?>
