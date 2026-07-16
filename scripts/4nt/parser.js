const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const OUT_DIR = path.join(__dirname, 'output');

// УКАЖИ ЗДЕСЬ ПУТЬ К РЕАЛЬНОМУ РЕПОЗИТОРИЮ SC НА ТВОЕМ СЕРВЕРЕ
const SC_REPO_PATH = '/var/www/suttacentral.net/sc-data/sc_bilara_data';
//const SC_REPO_PATH = '/data/data/com.termux/files/usr/share/apache2/default-site/suttacentral.net/sc-data/sc_bilara_data';

// Хранилище: collections[transKey][suttaId][segId] = text
const collections = {};
// Карта соответствия: suttaToFileMap['an1.12'] = { filePrefix: 'an1.11-20', relativeDir: 'sutta/an/an1' }
const suttaToFileMap = {};

// 1. Построение карты эталонной структуры SuttaCentral
function buildReferenceMap() {
    console.log('Сканируем структуру оригинального репозитория SuttaCentral...');
    const referenceDir = path.join(SC_REPO_PATH, 'root', 'pli', 'ms');
    
    if (!fs.existsSync(referenceDir)) {
        console.warn(`⚠️ ВНИМАНИЕ: Папка ${referenceDir} не найдена!`);
        console.warn('Скрипт будет использовать фолбэк-структуру (каждая сутта в отдельном файле).');
        return;
    }

    function scanDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                scanDir(filePath);
            } else if (file.endsWith('.json')) {
                const filePrefix = file.split('_')[0];
                const relativeDir = path.dirname(path.relative(referenceDir, filePath));

                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    for (const key of Object.keys(data)) {
                        const suttaId = key.split(':')[0];
                        if (!suttaToFileMap[suttaId]) {
                            suttaToFileMap[suttaId] = {
                                filePrefix: filePrefix,
                                relativeDir: relativeDir
                            };
                        }
                    }
                } catch (e) {
                    // Игнорируем ошибки чтения отдельных файлов
                }
            }
        }
    }
    
    scanDir(referenceDir);
    console.log(`Карта структуры построена. Найдено привязок для сутт: ${Object.keys(suttaToFileMap).length}\n`);
}

// 2. Поиск файлов HTML
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'output' || file === 'node_modules' || file.startsWith('.')) continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findHtmlFiles(filePath, fileList);
        } else if (file === 'index.html') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// 3. Сбор данных
function extractRows(nodes) {
    for (const node of nodes) {
        if (node.children) extractRows(node.children);
        if (node.rows) {
            for (const row of node.rows) {
                const segId = row.key;
                if (!segId) continue;
                const suttaId = segId.split(':')[0];

                for (const [transKey, text] of Object.entries(row)) {
                    if (transKey === 'key') continue;
                    if (!collections[transKey]) collections[transKey] = {};
                    if (!collections[transKey][suttaId]) collections[transKey][suttaId] = {};
                    collections[transKey][suttaId][segId] = text;
                }
            }
        }
    }
}

// 4. Фолбэк-маршрутизация на случай, если SC_REPO_PATH недоступен
function parseSlugFallback(slug) {
    const slugParts = slug.match(/^([a-z]+)(\d*)\.*(\d*)/);
    const book = slugParts ? slugParts[1] : slug;
    const firstNum = slugParts ? slugParts[2] : '';
    if (["dn", "mn", "ma", "da"].includes(book)) return `sutta/${book}/${slug}`;
    if (["sn", "an", "sa", "ea"].includes(book)) return `sutta/${book}/${book}${firstNum}/${slug}`;
    if (["kp", "dhp", "ud", "iti", "snp", "thag", "thig", "ja"].includes(book)) return `sutta/kn/${book}/${slug}`;
    return `sutta/${book}/${slug}`;
}

function ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// ==========================================
// ЗАПУСК ПАРСИНГА
// ==========================================
buildReferenceMap();

console.log('Ищем файлы index.html...');
const htmlFiles = findHtmlFiles(ROOT_DIR);
let parsedCount = 0;
const skippedFiles = []; // Массив для сбора пропущенных файлов

for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, 'utf-8');
    const treeMatch = html.match(/const\s+TREE\s*=\s*(\[[\s\S]*?\]);\s*\/\/\s*── TRANSLATIONS ──/);
    
    if (treeMatch) {
        try {
            extractRows(JSON.parse(treeMatch[1]));
            parsedCount++;
        } catch (e) {
            console.error(`❌ Ошибка данных в файле ${filePath}:`, e.message);
            skippedFiles.push(filePath);
        }
    } else {
        // Если регулярка ничего не нашла, файл пропускается
        console.warn(`⚠️ Пропущен (не найдена структура TREE): ${filePath}`);
        skippedFiles.push(filePath);
    }
}

console.log(`\nУспешно распарсено файлов: ${parsedCount} из ${htmlFiles.length}`);

// Выводим итоговый список проблемных файлов
if (skippedFiles.length > 0) {
    console.log(`\n--- Список пропущенных файлов (${skippedFiles.length}) ---`);
    skippedFiles.forEach(file => console.log(`- ${file}`));
    console.log('-------------------------------------------\n');
}

console.log('Генерация файловой структуры SuttaCentral...');

let savedFilesCount = 0;

for (const [transKey, suttas] of Object.entries(collections)) {
    
    // НАДЕЖНАЯ ОЧИСТКА ИМЕНИ АВТОРА
    // Вырезает слово "corrected" (в любом регистре, с пробелами или дефисами)
    const cleanAuthor = transKey.replace(/[\s-]*corrected[\s]*/gi, '').trim();
    
    let type = 'translation';
    let lang = 'en';
    let author = cleanAuthor;

    // Особое условие для Pali
    if (cleanAuthor.toLowerCase() === 'pali') {
        type = 'root';
        lang = 'pli';
        author = 'ms';
    } 

    // Группируем сегменты по файлам
    const groupedOutput = {};

    for (const [suttaId, segments] of Object.entries(suttas)) {
        
        let relativeDir = '';
        let filePrefix = suttaId;
        
        // Пытаемся найти сутту в карте SuttaCentral
        if (suttaToFileMap[suttaId]) {
            relativeDir = suttaToFileMap[suttaId].relativeDir;
            filePrefix = suttaToFileMap[suttaId].filePrefix;
        } else {
            // Фолбэк, если сутта не найдена в оригинальном репо
            const fallbackPath = parseSlugFallback(suttaId);
            relativeDir = path.dirname(fallbackPath);
        }

        const targetDir = path.join(OUT_DIR, type, lang, author, relativeDir);
        const suffix = type === 'root' ? 'root-pli-ms' : `translation-${lang}-${author}`;
        
        // Формируем итоговый путь. author здесь уже 100% очищен от "corrected"
        const finalFilePath = path.join(targetDir, `${filePrefix}_${suffix}.json`);

        if (!groupedOutput[finalFilePath]) {
            groupedOutput[finalFilePath] = {};
        }

        // Объединяем сегменты в нужный файл
        Object.assign(groupedOutput[finalFilePath], segments);
    }

    // Физическое сохранение файлов на диск
    for (const [filePath, allSegments] of Object.entries(groupedOutput)) {
        ensureDirSync(path.dirname(filePath));
        
        // Сортируем ключи, чтобы текст шел по порядку (например, an1.11:1.0, затем an1.11:1.1)
        const sortedSegments = {};
        Object.keys(allSegments)
            .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))
            .forEach(key => {
                sortedSegments[key] = allSegments[key];
            });

        fs.writeFileSync(filePath, JSON.stringify(sortedSegments, null, 2));
        savedFilesCount++;
    }
}

console.log(`🔥 Готово! Сохранено ${savedFilesCount} JSON-файлов в строгом соответствии со структурой SC.`);



