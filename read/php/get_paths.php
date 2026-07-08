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

// Форматирование слага для SuttaCentral
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

        if ($book === "dn" || $book === "mn") {
            return "{$book}/{$slug}";
        } elseif ($book === "sn" || $book === "an") {
            return "{$book}/{$book}{$firstNum}/{$slug}";
        } elseif ($book === "kp") {
            return "kn/kp/{$slug}";
        } elseif ($book === "dhp") {
            return "kn/dhp/{$slug}";
        } elseif ($book === "ud") {
            return "kn/ud/vagga{$firstNum}/{$slug}";
        } elseif ($book === "iti") {
            $vagga = findItiVagga($firstNum);
            return "kn/iti/vagga{$vagga}/{$slug}";
        } elseif ($book === "snp") {
            return "kn/snp/vagga{$firstNum}/{$slug}";
        } elseif ($book === "thag" || $book === "thig") {
            return "kn/{$book}/{$slug}";
        } elseif ($book === "ja") {
            return "kn/ja/{$slug}";
        }
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
$slugReady = parseSlug($slug);

$texttype = "sutta";
$scCopy = "/suttacentral.net";
$docRoot = $_SERVER['DOCUMENT_ROOT']; 

// Определение Винаи
if (!preg_match('/bu-pm|bi-pm/', $slug) && preg_match('/bu-|bi-|kd|pvr/', $slug)) {
    $texttype = "vinaya";
    $slug = preg_replace('/bu([psan])/', 'bu-$1', $slug);
    $slug = preg_replace('/bi([psn])/', 'bi-$1', $slug);
    if (!str_contains($slug, 'pli-tv-')) $slug = "pli-tv-" . $slug;
    if (!str_contains($slug, 'vb-')) $slug = str_replace(['bu-', 'bi-'], ['bu-vb-', 'bi-vb-'], $slug);
} elseif (preg_match('/bu-pm|bi-pm/', $slug)) {
    $texttype = "vinaya";
    $slug = preg_replace('/bu([psan])/', 'bu-$1', $slug);
    $slug = preg_replace('/bi([psn])/', 'bi-$1', $slug);
    if (!str_contains($slug, 'pli-tv-')) $slug = "pli-tv-" . $slug;
}

// ПРОВЕРКА HTML
$htmlUrlTemplate = "$scCopy/sc-data/sc_bilara_data/html/pli/ms/$texttype/{$slugReady}_html.json";
if (preg_match('/bu-pm|bi-pm/', $slug)) {
    $htmlUrlTemplate = "/assets/html/$texttype/{$slug}_html.json";
}
$htmlUrl = getExistingPath($htmlUrlTemplate, $docRoot);

// ПРОВЕРКА ВАРИАНТОВ
$varLocalUrlTemplate = "/assets/texts/variant/$texttype/{$slugReady}_variant-pli-ms.json";
$varScUrlTemplate = "$scCopy/sc-data/sc_bilara_data/variant/pli/ms/$texttype/{$slugReady}_variant-pli-ms.json";

$varLocalUrl = getExistingPath($varLocalUrlTemplate, $docRoot);
$varScUrl = getExistingPath($varScUrlTemplate, $docRoot);

// ПАЛИ: ОСНОВНОЙ ТЕКСТ (Махасангити)
$rootPaliTemplate = "$scCopy/sc-data/sc_bilara_data/root/pli/ms/$texttype/{$slugReady}_root-pli-ms.json";
if (preg_match('/bu-pm|bi-pm/', $slug)) {
    $rootPaliTemplate = "$scCopy/sc-data/sc_bilara_data/root/pli/ms/$texttype/{$slug}_root-pli-ms.json";
}
$rootPali = getExistingPath($rootPaliTemplate, $docRoot);

// ПАЛИ: ВАРИАНТЫ ИЗДАНИЙ И СКРИПТОВ
$pali_variants = [
    'devanagari' => "/assets/texts/devanagari/root/pli/ms/$texttype/{slug}_rootd-pli-ms.json",
    'thai'       => "/assets/texts/th/root/pli/ms/$texttype/{slug}_rootth-pli-ms.json",
    'sinhala'    => "/assets/texts/sinhala/root/pli/ms/$texttype/{slug}_rootsi-pli-ms.json",
    'myanmar'    => "/assets/texts/myanmar/root/pli/ms/$texttype/{slug}_rootmy-pli-ms.json"
];

$altPali = null;
$variantKey = strtolower($_GET['variant'] ?? $_GET['script'] ?? '');

if (isset($pali_variants[$variantKey])) {
    $targetSlug = preg_match('/bu-pm|bi-pm/', $slug) ? $slug : $slugReady;
    $targetTemplate = str_replace('{slug}', $targetSlug, $pali_variants[$variantKey]);
    $altPali = getExistingPath($targetTemplate, $docRoot);
}

// ПОИСК РУССКИХ ПЕРЕВОДОВ (ru и ru_other)
$ruTranslations = [];
$ruPatterns = [
    rtrim($docRoot, '/') . "/assets/texts/ru/$texttype/{$slugReady}_translation-ru-*.json",
    rtrim($docRoot, '/') . "/assets/texts/ru_other/$texttype/{$slugReady}_translation-ru-*.json"
];

if (preg_match('/bu-pm|bi-pm/', $slug)) {
    $ruPatterns = [
        rtrim($docRoot, '/') . "/assets/texts/ru/$texttype/{$slug}_translation-ru-*.json",
        rtrim($docRoot, '/') . "/assets/texts/ru_other/$texttype/{$slug}_translation-ru-*.json"
    ];
}

$ruFiles = [];
foreach ($ruPatterns as $pattern) {
    $found = glob($pattern);
    if ($found) {
        $ruFiles = array_merge($ruFiles, $found);
    }
}

if ($ruFiles) {
    foreach (array_slice($ruFiles, 0, 2) as $file) {
        $ruTranslations[] = str_replace(rtrim($docRoot, '/'), '', $file);
    }
}

// ПОИСК АНГЛИЙСКИХ ПЕРЕВОДОВ
$enTranslations = [];
$scAuthor = ($texttype === "vinaya") ? "brahmali" : "sujato";
$enOptions = [
    "/assets/texts/en/o/$texttype/{$slugReady}_translation-en-o.json",
    "/assets/texts/en_other/$texttype/{$slugReady}_translation-en-thanissaro.json",
    "$scCopy/sc-data/sc_bilara_data/translation/en/$scAuthor/$texttype/{$slugReady}_translation-en-$scAuthor.json"
];

if (preg_match('/bu-pm|bi-pm/', $slug)) {
    $enOptions = ["$scCopy/sc-data/sc_bilara_data/translation/en/brahmali/$texttype/{$slug}_translation-en-brahmali.json"];
}

foreach ($enOptions as $path) {
    if (count($enTranslations) >= 2) break;
    $validPath = getExistingPath($path, $docRoot);
    if ($validPath !== null) {
        $enTranslations[] = $validPath;
    }
}

// ПОИСК ТАЙСКИХ ПЕРЕВОДОВ
$thTranslations = [];
$thPattern = rtrim($docRoot, '/') . "/assets/texts/th/translation/$texttype/{$slugReady}_translation-th-*.json";
if (preg_match('/bu-pm|bi-pm/', $slug)) {
    $thPattern = rtrim($docRoot, '/') . "/assets/texts/th/translation/$texttype/{$slug}_translation-th-*.json";
}
$thFiles = glob($thPattern);
if ($thFiles) {
    foreach (array_slice($thFiles, 0, 2) as $file) {
        $thTranslations[] = str_replace(rtrim($docRoot, '/'), '', $file);
    }
}

echo json_encode([
    'slug' => $slug,
    'slugReady' => $slugReady,
    'texttype' => $texttype,
    'html' => $htmlUrl,
    'pali_main' => $rootPali,
    'pali_alt' => $altPali,
    'variant_local' => $varLocalUrl,
    'variant_sc' => $varScUrl,
    'translations' => [
        'ru' => $ruTranslations,
        'en' => $enTranslations,
        'th' => $thTranslations
    ]
], JSON_UNESCAPED_SLASHES);


//curl -s "http://localhost:8080/read/php/get_paths.php?slug=mn1" | jq