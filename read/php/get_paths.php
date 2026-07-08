<?php
error_reporting(E_ERROR | E_PARSE);
header("Content-Type: application/json");

// Определение вагги для Итивуттаки
function findItiVagga($suttaNumber) {
    $suttaNumber = (int)$suttaNumber;
    if ($suttaNumber >= 1 && $suttaNumber <= 10) return "1";
    if ($suttaNumber >= 11 && $suttaNumber <= 20) return "2";
    if ($suttaNumber >= 21 && $suttaNumber <= 27) return "3";
    if ($suttaNumber >= 28 && $suttaNumber <= 37) return "4";
    if ($suttaNumber >= 38 && $suttaNumber <= 49) return "5";
    if ($suttaNumber >= 50 && $suttaNumber <= 59) return "6";
    if ($suttaNumber >= 60 && $suttaNumber <= 69) return "7";
    if ($suttaNumber >= 70 && $suttaNumber <= 79) return "8";
    if ($suttaNumber >= 80 && $suttaNumber <= 89) return "9";
    if ($suttaNumber >= 90 && $suttaNumber <= 99) return "10";
    if ($suttaNumber >= 100 && $suttaNumber <= 112) return "11";
    return "1";
}

// Форматирование слага для структуры директорий
function parseSlug($slug) {
    if (in_array($slug, ['bu-pm', 'bi-pm', 'pli-tv-bu-pm', 'pli-tv-bi-pm', 'bupm', 'bipm'])) {
        $gender = str_contains($slug, 'bi') ? 'bi' : 'bu';
        return "pli-tv-{$gender}-pm";
    }
    if (in_array($slug, ['bu-as', 'bu-vb-as1-7', 'pli-tv-bu-vb-as1-7', 'bi-as', 'bi-vb-as1-7', 'pli-tv-bi-vb-as1-7'])) {
        $fixforbivb = preg_replace('/(\d+)-(\d+)/', '', $slug);
        $bookWithoutNumber = preg_replace('/(\d+)/', '', $fixforbivb);
        $fixforbivb2 = preg_replace('/-([a-z]+)\d+/', '', $slug);
        $bookWithoutNumberAndRule = preg_replace('/-\d+$/', '', $fixforbivb2);
        return "{$bookWithoutNumberAndRule}/{$bookWithoutNumber}1-7";
    }
    if (preg_match('/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/', $slug)) {
        $fixforbivb = preg_replace('/(\d+)-(\d+)/', '', $slug);
        $bookWithoutNumber = preg_replace('/(\d+)/', '', $fixforbivb);
        $fixforbivb2 = preg_replace('/-([a-z]+)\d+/', '', $slug);
        $bookWithoutNumberAndRule = preg_replace('/-\d+$/', '', $fixforbivb2);
        return "{$bookWithoutNumberAndRule}/{$bookWithoutNumber}/{$slug}";
    }
    if (preg_match('/^([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/', $slug)) {
        $bookWithoutNumber = preg_replace('/(\d+|\.)/', '', $slug);
        return "{$bookWithoutNumber}/{$slug}";
    }
    if (preg_match('/^([a-z]+)(\d*)\.*(\d*)/', $slug, $slugParts)) {
        $book = $slugParts[1] ?? $slug;
        $firstNum = $slugParts[2] ?? '';
        if ($book === "dn" || $book === "mn") return "{$book}/{$slug}";
        elseif ($book === "sn" || $book === "an") return "{$book}/{$book}{$firstNum}/{$slug}";
        elseif ($book === "kp") return "kn/kp/{$slug}";
        elseif ($book === "dhp") return "kn/dhp/{$slug}";
        elseif ($book === "ud") return "kn/ud/vagga{$firstNum}/{$slug}";
        elseif ($book === "iti") return "kn/iti/vagga" . findItiVagga($firstNum) . "/{$slug}";
        elseif ($book === "snp") return "kn/snp/vagga{$firstNum}/{$slug}";
        elseif ($book === "thag" || $book === "thig") return "kn/{$book}/{$slug}";
        elseif ($book === "ja") return "kn/ja/{$slug}";
    }
    return $slug;
}

// Хелпер для проверки физического наличия файла
function getExistingPath($webPath, $docRoot) {
    if (empty($webPath)) return null;
    $physicalPath = rtrim($docRoot, '/') . '/' . ltrim($webPath, '/');
    return file_exists($physicalPath) ? $webPath : null;
}

$slug_raw = $_GET['slug'] ?? '';
$parts = explode('&', $slug_raw);
$slug = strtolower($parts[0]);

// 1. Нормализация коротких слагов (включая pm)
if (preg_match('/^(pm|pj|ss|ay|np|pc|pd|sk|as)(\d*)$/', $slug)) {
    $slug = "bu-" . $slug;
}

$texttype = "sutta";
$scCopy = "/suttacentral.net";
$docRoot = $_SERVER['DOCUMENT_ROOT']; 

// 2. Определение Винаи и приведение к полному формату
if (!preg_match('/bu-pm|bi-pm/', $slug) && preg_match('/bu-|bi-|kd|pvr/', $slug)) {
    $texttype = "vinaya";
    $slug = preg_replace('/bu([psan])/', 'bu-$1', $slug);
    $slug = preg_replace('/bi([psn])/', 'bi-$1', $slug);
    if (!str_contains($slug, 'pli-tv-')) $slug = "pli-tv-" . $slug;
    if (!str_contains($slug, 'vb-') && !preg_match('/kd|pvr/', $slug)) {
        $slug = str_replace(['bu-', 'bi-'], ['bu-vb-', 'bi-vb-'], $slug);
    }
} elseif (preg_match('/bu-pm|bi-pm/', $slug)) {
    $texttype = "vinaya";
    $slug = preg_replace('/bu([psan])/', 'bu-$1', $slug);
    $slug = preg_replace('/bi([psn])/', 'bi-$1', $slug);
    if (!str_contains($slug, 'pli-tv-')) $slug = "pli-tv-" . $slug;
}

// Подготовка путей
$slugReady = parseSlug($slug);
$isPm = preg_match('/-pm$/', $slug); 

// ПРОВЕРКА HTML
$htmlUrlTemplate = $isPm 
    ? "/assets/html/$texttype/{$slug}_html.json" 
    : "$scCopy/sc-data/sc_bilara_data/html/pli/ms/$texttype/{$slugReady}_html.json";
$htmlUrl = getExistingPath($htmlUrlTemplate, $docRoot);

// ПРОВЕРКА ВАРИАНТОВ (отдаем массивом файлов)
$variants = [];
$varLocalUrlTemplate = "/assets/texts/variant/$texttype/{$slugReady}_variant-pli-ms.json";
$varMainUrlTemplate = "$scCopy/sc-data/sc_bilara_data/variant/pli/ms/$texttype/{$slugReady}_variant-pli-ms.json";

if ($path = getExistingPath($varLocalUrlTemplate, $docRoot)) {
    $variants[] = $path;
}
if ($path = getExistingPath($varMainUrlTemplate, $docRoot)) {
    $variants[] = $path;
}

// ПАЛИ: ОСНОВНОЙ ТЕКСТ (Махасангити)
$rootPaliTemplate = $isPm 
    ? "$scCopy/sc-data/sc_bilara_data/root/pli/ms/$texttype/{$slug}_root-pli-ms.json"
    : "$scCopy/sc-data/sc_bilara_data/root/pli/ms/$texttype/{$slugReady}_root-pli-ms.json";
$rootPali = getExistingPath($rootPaliTemplate, $docRoot);

// ПАЛИ: АЛЬТЕРНАТИВНЫЕ ИЗДАНИЯ (Массив всех доступных путей)
$pali_variants = [
    'devanagari' => "/assets/texts/devanagari/root/pli/ms/$texttype/{slug}_rootd-pli-ms.json",
    'thai'       => "/assets/texts/th/root/pli/ms/$texttype/{slug}_rootth-pli-ms.json",
    'sinhala'    => "/assets/texts/sinhala/root/pli/ms/$texttype/{slug}_rootsi-pli-ms.json",
    'myanmar'    => "/assets/texts/myanmar/root/pli/ms/$texttype/{slug}_rootmy-pli-ms.json"
];

$altPali = [];
$targetSlug = $isPm ? $slug : $slugReady;
foreach ($pali_variants as $key => $template) {
    $targetTemplate = str_replace('{slug}', $targetSlug, $template);
    $existingPath = getExistingPath($targetTemplate, $docRoot);
    if ($existingPath) {
        $altPali[$key] = $existingPath;
    }
}

// ПОИСК РУССКИХ ПЕРЕВОДОВ
$ruTranslations = [];
$ruPatterns = $isPm 
    ? [rtrim($docRoot, '/') . "/assets/texts/ru/$texttype/{$slug}_translation-ru-*.json", rtrim($docRoot, '/') . "/assets/texts/ru_other/$texttype/{$slug}_translation-ru-*.json"]
    : [rtrim($docRoot, '/') . "/assets/texts/ru/$texttype/{$slugReady}_translation-ru-*.json", rtrim($docRoot, '/') . "/assets/texts/ru_other/$texttype/{$slugReady}_translation-ru-*.json"];

$ruFiles = [];
foreach ($ruPatterns as $pattern) { $found = glob($pattern); if ($found) $ruFiles = array_merge($ruFiles, $found); }
if ($ruFiles) { foreach (array_slice($ruFiles, 0, 2) as $file) { $ruTranslations[] = str_replace(rtrim($docRoot, '/'), '', $file); } }

// ПОИСК АНГЛИЙСКИХ ПЕРЕВОДОВ
$enTranslations = [];
$scAuthor = ($texttype === "vinaya") ? "brahmali" : "sujato";
$enOptions = $isPm 
    ? ["$scCopy/sc-data/sc_bilara_data/translation/en/brahmali/$texttype/{$slug}_translation-en-brahmali.json"]
    : [
        "/assets/texts/en/o/$texttype/{$slugReady}_translation-en-o.json",
        "/assets/texts/en_other/$texttype/{$slugReady}_translation-en-thanissaro.json",
        "$scCopy/sc-data/sc_bilara_data/translation/en/$scAuthor/$texttype/{$slugReady}_translation-en-$scAuthor.json"
    ];

foreach ($enOptions as $path) {
    if (count($enTranslations) >= 2) break;
    $validPath = getExistingPath($path, $docRoot);
    if ($validPath !== null) $enTranslations[] = $validPath;
}

// ПОИСК ТАЙСКИХ ПЕРЕВОДОВ
$thTranslations = [];
$thPattern = $isPm 
    ? rtrim($docRoot, '/') . "/assets/texts/th/translation/$texttype/{$slug}_translation-th-*.json"
    : rtrim($docRoot, '/') . "/assets/texts/th/translation/$texttype/{$slugReady}_translation-th-*.json";

$thFiles = glob($thPattern);
if ($thFiles) { foreach (array_slice($thFiles, 0, 2) as $file) { $thTranslations[] = str_replace(rtrim($docRoot, '/'), '', $file); } }

// ФИЛЬТРАЦИЯ ИНФОРМАЦИИ О ПЕРЕВОДЧИКАХ
$translatorInfo = [];
$trJsonPath = rtrim($docRoot, '/') . "/assets/js/translators.json";
if (file_exists($trJsonPath)) {
    $allTrData = json_decode(file_get_contents($trJsonPath), true);
    
    $extractId = function($path) {
        if (preg_match('/_translation-[a-z]+-(.+)\.json$/', $path, $m)) return $m[1];
        return null;
    };

    $foundIds = ['ru' => [], 'en' => [], 'th' => []];
    foreach ($ruTranslations as $p) $foundIds['ru'][] = $extractId($p);
    foreach ($enTranslations as $p) $foundIds['en'][] = $extractId($p);
    foreach ($thTranslations as $p) $foundIds['th'][] = $extractId($p);

    foreach (['ru', 'en', 'th'] as $lang) {
        if (isset($allTrData[$lang])) {
            foreach ($foundIds[$lang] as $id) {
                if ($id && isset($allTrData[$lang][$id])) {
                    $translatorInfo[$lang][$id] = $allTrData[$lang][$id];
                }
            }
        }
    }
}

// --- НОВАЯ ЛОГИКА: ЧТЕНИЕ TEXTINFO.JSON ---
$textInfoPath = rtrim($docRoot, '/') . "/assets/js/textinfo.json";
$titles = [];
$prevSlug = "";
$prevNames = [];
$nextSlug = "";
$nextNames = [];

if (file_exists($textInfoPath)) {
    $textInfoRaw = file_get_contents($textInfoPath);
    $textInfoRaw = preg_replace('/^(export default |const \w+ = |let \w+ = |var \w+ = )/', '', $textInfoRaw);
    $textInfoRaw = rtrim(trim($textInfoRaw), ';');
    $textInfo = json_decode($textInfoRaw, true);

    if ($textInfo) {
        $keys = array_keys($textInfo);
        
        $currentIndex = array_search($slug, $keys);
        if ($currentIndex === false) $currentIndex = array_search($slugReady, $keys);

        // Извлекаем все переводы
        $extractNames = function($info) {
            $names = [];
            foreach (['pi', 'ru', 'en', 'th'] as $lang) {
                if (isset($info[$lang]) && trim($info[$lang]) !== "" && trim($info[$lang]) !== "~") {
                    $cleanName = preg_replace('/[0-9.-]/', '', $info[$lang]);
                    if (trim($cleanName) !== "") {
                        $names[$lang] = trim($cleanName);
                    }
                }
            }
            return $names;
        };

        if ($currentIndex !== false) {
            // Текущий текст
            $currentInfo = $textInfo[$keys[$currentIndex]];
            $titles = $extractNames($currentInfo);

            // Предыдущий текст
            if ($currentIndex > 0) {
                $prevSlug = $keys[$currentIndex - 1];
                $prevInfo = $textInfo[$prevSlug];
                $prevNames = $extractNames($prevInfo);
            }

            // Следующий текст
            if ($currentIndex < count($keys) - 1) {
                $nextSlug = $keys[$currentIndex + 1];
                $nextInfo = $textInfo[$nextSlug];
                $nextNames = $extractNames($nextInfo);
            }
        }
    }
}

echo json_encode([
    'slug' => $slug, 
    'texttype' => $texttype, 
    'titles' => empty($titles) ? null : $titles, 
    'navigation' => [
        'prev' => ['slug' => $prevSlug, 'names' => empty($prevNames) ? null : $prevNames],
        'next' => ['slug' => $nextSlug, 'names' => empty($nextNames) ? null : $nextNames]
    ],
    'html' => $htmlUrl,
    'pali_main' => $rootPali,
    'pali_alt' => empty($altPali) ? null : $altPali,
    'variants' => empty($variants) ? [] : $variants, 
    'translations' => [
        'ru' => $ruTranslations,
        'en' => $enTranslations,
        'th' => $thTranslations
    ],
    'translator_info' => $translatorInfo
], JSON_UNESCAPED_SLASHES);

