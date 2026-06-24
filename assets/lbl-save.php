<?php
include_once(__DIR__ . '/../config/config.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

$filename = isset($_GET['file']) ? basename($_GET['file']) : 'backup_' . time() . '.json';
$jsonString = file_get_contents('php://input');

// Принудительно добавляем 'lbl/' к пути из конфига
$saveDirectory = rtrim($linebylinerulocation, '/') . '/lbl/'; 

// Создаем папку, если ее нет
if (!file_exists($saveDirectory)) {
    mkdir($saveDirectory, 0755, true);
}

// Запись файла
if (file_put_contents($saveDirectory . $filename, $jsonString)) {
    http_response_code(200);
    echo "OK";
} else {
    http_response_code(500);
    echo "Error writing file to: " . $saveDirectory;
}

//curl -X POST -H "Content-Type: application/json" -d '{"test": "it works"}' "http://localhost:8080/assets/lbl-save.php?file=test_curl.json"

?> 
