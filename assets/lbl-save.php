<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// Получаем корень сайта (автоматически адаптируется под сервер и Termux)
$basedir = rtrim($_SERVER['DOCUMENT_ROOT'], '/');

// Уходим на уровень выше от корня сайта и заходим в offline-data/lbl
$saveDirectory = $basedir . '/../offline-data/lbl/';

// Формируем имя файла, исправлена опечатка GET на $_GET
$filename = isset($_GET['file']) ? basename($_GET['file']) : 'backup_' . time() . '.json';
$jsonString = file_get_contents('php://input');

// Создаем физическую папку, если ее нет
if (!file_exists($saveDirectory)) {
    mkdir($saveDirectory, 0755, true);
}

// Проверяем, что папка существует и доступна для записи
if (!is_dir($saveDirectory) || !is_writable($saveDirectory)) {
    http_response_code(500);
    exit("Error: Directory does not exist or is not writable: " . $saveDirectory);
}

// Сохраняем файл со строгой проверкой !== false
if (file_put_contents($saveDirectory . $filename, $jsonString) !== false) {
    http_response_code(200);
    echo "OK";
} else {
    http_response_code(500);
    echo "Error writing file to: " . $saveDirectory;
}
?>
