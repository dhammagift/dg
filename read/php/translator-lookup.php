<?php 
error_reporting(E_ERROR | E_PARSE);
header("Content-Type:text/plain");

function translatorLookup($fromjs, $lang) {
    include_once('../../config/config.php');
    
    // Очистка ввода: оставляем только буквы, цифры, дефисы и слеши (защита от Directory Traversal)
    $fromjs = preg_replace('/[^a-zA-Z0-9\-\/]/', '', $fromjs);
    
    // Определяем папку и префикс языка на основе параметра
    if ($lang === 'th') {
        $dir = $thtranslatorlocation;
        $lang_prefix = 'th';
    } else {
        // По умолчанию используем основную папку (например, для 'ru')
        $dir = $translatorlocation; 
        $lang_prefix = 'ru'; 
    }

    // Ищем файлы с помощью безопасного glob()
    $pattern = rtrim($dir, '/') . "/{$fromjs}_translation-{$lang_prefix}-*.json";
    $files = glob($pattern);

    if (!empty($files)) {
        $filename = basename($files[0]);
        // Извлекаем имя переводчика (всё, что идет после префикса языка и до .json)
        if (preg_match('/_translation-' . $lang_prefix . '-(.+)\.json$/', $filename, $matches)) {
            return $matches[1];
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