const fs = require('fs');
const path = require('path');

// 1. ИСПОЛЬЗУЕМ ТЕКУЩУЮ ДИРЕКТОРИЮ ВЫЗОВА ВМЕСТО РАСПОЛОЖЕНИЯ СКРИПТА
const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, 'output');

// 2. УНИВЕРСАЛЬНЫЙ ПОИСК ПУТИ К РЕПОЗИТОРИЮ SC
const possibleRepoPaths = [
    '/var/www/suttacentral.net/sc-data/sc_bilara_data',
    '/data/data/com.termux/files/usr/share/apache2/default-site/suttacentral.net/sc-data/sc_bilara_data'
];

// Ищет первый существующий путь. Если не найдет ни одного, вернет пустую строку.
const SC_REPO_PATH = possibleRepoPaths.find(p => fs.existsSync(p)) || '';

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
        
        let stat;
        try {
            stat = fs.statSync(filePath);
        } catch (e) {
            // Игнорируем битые симлинки и файлы, к которым нет доступа
            continue;
        }

        if (stat.isDirectory()) {
            findHtmlFiles(filePath, fileList);
        } else if (file === 'index.html') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// 3. Извлечение данных с учетом новой структуры (отдельный TREE и массивы в <script id="tx-KEY">)
function extractDataFromHtml(html, filePath) {
    const treeMatch = html.match(/const\s+TREE\s*=\s*(\[[\s\S]*?\]);\s*\/\/\s*── TRANSLATIONS ──/);
    if (!treeMatch) {
        throw new Error('Структура TREE не найдена');
    }

    const treeData = JSON.parse(treeMatch[1]);
    const segIds = [];

    // Рекурсивно собираем ключи сегментов в том же порядке, в котором они идут в массивах текстов
    function traverseTree(nodes) {
        for (const node of nodes) {
            if (node.children) {
                traverseTree(node.children);
            } else if (node.rows) {
                for (const row of node.rows) {
                    if (row.key) {
                        segIds.push(row.key);
                    }
                }
            }
        }
    }
    traverseTree(treeData);

    // Ищем все теги переводов и оригиналов
    const txRegex = /<script\s+type="application\/json"\s+id="tx-([^"]+)">([\s\S]*?)<\/script>/g;
    let txMatch;
    let foundAnyTx = false;

    while ((txMatch = txRegex.exec(html)) !== null) {
        foundAnyTx = true;
        const transKey = txMatch[1];
        let textsArray = [];
        
        try {
            textsArray = JSON.parse(txMatch[2]);
        } catch (e) {
            console.error(`❌ Ошибка парсинга JSON для tx-${transKey} в файле ${filePath}`);
            continue;
        }

        if (!collections[transKey]) {
            collections[transKey] = {};
        }

        // Сопоставляем тексты с id сегментов по их индексу
        for (let i = 0; i < textsArray.length; i++) {
            const segId = segIds[i];
            if (!segId) continue; 
            
            const text = textsArray[i];
            if (!text) continue; // Игнорируем пустые строки

            const suttaId = segId.split(':')[0];

            if (!collections[transKey][suttaId]) {
                collections[transKey][suttaId] = {};
            }
            collections[transKey][suttaId][segId] = text;
        }
    }

    if (!foundAnyTx) {
        throw new Error('Не найдены блоки с текстами (tx-...)');
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
const skippedFiles = [];

for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, 'utf-8');
    try {
        extractDataFromHtml(html, filePath);
        parsedCount++;
    } catch (e) {
        console.error(`❌ Ошибка данных в файле ${filePath}:`, e.message);
        skippedFiles.push(filePath);
    }
}

console.log(`\nУспешно распарсено файлов: ${parsedCount} из ${htmlFiles.length}`);

if (skippedFiles.length > 0) {
    console.log(`\n--- Список пропущенных файлов (${skippedFiles.length}) ---`);
    skippedFiles.forEach(file => console.log(`- ${file}`));
    console.log('-------------------------------------------\n');
}

console.log('Генерация файловой структуры SuttaCentral...');

let savedFilesCount = 0;

// Универсальный словарь известных языков-оригиналов
const rootLanguages = {
    'pali': { lang: 'pli', author: 'ms' },
    'lzh': { lang: 'lzh', author: 'cbta' },
    'san': { lang: 'san', author: 'sutta' },
    'pra': { lang: 'pra', author: 'sutta' },
    'xct': { lang: 'xct', author: 'sutta' },
    'zh':  { lang: 'zh',  author: 'sutta' }
};

for (const [transKey, suttas] of Object.entries(collections)) {
    
    // Надежная очистка имени автора
    const cleanAuthor = transKey.replace(/[\s-]*corrected[\s]*/gi, '').trim();
    const lowerAuthor = cleanAuthor.toLowerCase();
    
    let type = 'translation';
    let lang = 'en'; // Значение по умолчанию
    let author = cleanAuthor;

    // Универсальная маршрутизация root / translation
    if (rootLanguages[lowerAuthor]) {
        type = 'root';
        lang = rootLanguages[lowerAuthor].lang;
        author = rootLanguages[lowerAuthor].author;
    } else {
        // Определение языка перевода, если ключ передан в формате "ru-author"
        const parts = lowerAuthor.split(/[-_]/);
        if (parts.length > 1 && parts[0].length >= 2 && parts[0].length <= 3 && parts[0] !== 'pali') {
            lang = parts[0];
            author = cleanAuthor.substring(parts[0].length + 1); // Оставляем оригинальный регистр автора
        }
    }

    const groupedOutput = {};

    for (const [suttaId, segments] of Object.entries(suttas)) {
        
        let relativeDir = '';
        let filePrefix = suttaId;
        
        if (suttaToFileMap[suttaId]) {
            relativeDir = suttaToFileMap[suttaId].relativeDir;
            filePrefix = suttaToFileMap[suttaId].filePrefix;
        } else {
            const fallbackPath = parseSlugFallback(suttaId);
            relativeDir = path.dirname(fallbackPath);
        }

        const targetDir = path.join(OUT_DIR, type, lang, author, relativeDir);
        const suffix = type === 'root' ? `root-${lang}-${author}` : `translation-${lang}-${author}`;
        
        const finalFilePath = path.join(targetDir, `${filePrefix}_${suffix}.json`);

        if (!groupedOutput[finalFilePath]) {
            groupedOutput[finalFilePath] = {};
        }

        Object.assign(groupedOutput[finalFilePath], segments);
    }

    // Физическое сохранение файлов на диск
    for (const [filePath, allSegments] of Object.entries(groupedOutput)) {
        ensureDirSync(path.dirname(filePath));
        
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

