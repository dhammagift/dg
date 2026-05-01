<?php
/**
 * Исправленный генератор sitemap.xml для проекта dhamma.gift
 */
function generateDhammaSitemap($inputFile = 'forsitemap.txt', $outputFile = 'sitemap.xml') {
    $baseUrl = "https://dhamma.gift";
    $endpoints = [
        'read' => '1.0',     // English
        'r' => '1.0',        // Russian
        'ml' => '0.8',       // Multilingual
        'b' => '1.0',        // Tool
        'memorize' => '0.5'  // Meditation
    ];
    
    if (!file_exists($inputFile)) {
        echo "Ошибка: файл $inputFile не найден." . PHP_EOL;
        return false;
    }
    
    $indices = file($inputFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $currentDate = date('Y-m-d');

    // Разбиваем строку, чтобы обойти short_open_tag
    $xml = '<' . '?xml version="1.0" encoding="UTF-8"?' . '>' . PHP_EOL;
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

    foreach ($indices as $id) {
        $cleanId = trim($id);
        foreach ($endpoints as $path => $priority) {
            $loc = htmlspecialchars("$baseUrl/$path/?q=$cleanId");
            $xml .= "  <url>" . PHP_EOL;
            $xml .= "    <loc>$loc</loc>" . PHP_EOL;
            $xml .= "    <lastmod>$currentDate</lastmod>" . PHP_EOL;
            $xml .= "    <priority>$priority</priority>" . PHP_EOL;
            $xml .= "  </url>" . PHP_EOL;
        }
    }

    $xml .= '</urlset>';
    
    if (file_put_contents($outputFile, $xml)) {
        echo "Sitemap успешно создан: $outputFile" . PHP_EOL;
        return true;
    } else {
        echo "Ошибка записи файла." . PHP_EOL;
        return false;
    }
}

// Вызов функции
generateDhammaSitemap();

