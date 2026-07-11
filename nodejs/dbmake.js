// составить конфиги json с разбивкой поиск, ридер, сайт... сейчас в се в куче
// решить как будет работать поиск и база. только пали с путямы - это хорошо. если будет 3-4 вида пали. база станет большой. 
// и ка кбыть с переводами? 

const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

const isTermux = fsSync.existsSync('/data/data/com.termux/files/usr');

const BASE = isTermux
    ? '/data/data/com.termux/files/usr/share/apache2/default-site/htdocs'
    : '/var/www/html';

const rootPath = `${BASE}/suttacentral.net/sc-data/sc_bilara_data/root/`;
const translationPath = `${BASE}/suttacentral.net/sc-data/sc_bilara_data/translation/`;
const htmlPath = `${BASE}/suttacentral.net/sc-data/sc_bilara_data/html/`;
const variantPath = `${BASE}/suttacentral.net/sc-data/sc_bilara_data/variant/`;
const textInfoPath = `${BASE}/assets/js/textinfo.json`;

const outputFile = path.join(__dirname, 'dg_db.json');

const targetLanguages = ['en', 'ru', 'de', 'ko'];

// Список исключений (папки и файлы, содержащие эти строки, будут пропущены)
//const excludePatterns = ['xplayground', 'name', 'site', 'blurbs'];
// 1. Заменяем массив строк на массив регулярных выражений (масок)
// Флаг /i/ означает регистронезависимость
const excludePatterns = [
    /xplayground/i,
    /name/i, 
    /site/i,       // Эта маска уже полностью отрезает папку site и всё внутри неё
    /blurbs/i,
    
    // Новые исключения с использованием масок:
    /dukkh/i,
    /subjects/i,
    /terminology/i,
    /similes/i,
    /-guide-/i,        // Маска: ловит sn-guide-sujato, mn-guide-sujato, dn-guide-sujato
    /an-introduction/i // Маска: ловит an-introduction-bodhi, introduction и любые другие variations
];

async function loadTextInfo(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const jsonString = content.replace(/^(var|let|const)\s+\w+\s*=\s*/, '').replace(/;[\s]*$/, '');
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn(`File textinfo.js not found or parcing error:`, error.message);
        return {};
    }
}

async function compileLocalDatabase() {
    const db = {}; 
    const textInfoData = await loadTextInfo(textInfoPath);



async function walkDirectory(currentDir, callback) {
     let items;
     try {
         items = await fs.readdir(currentDir);
     } catch (error) {
         return;
     }
     for (const item of items) {
         
         // 2. Меняем проверку: вместо .includes() используем .test() для регулярных выражений
         if (excludePatterns.some(pattern => pattern.test(item))) {
             continue;
         }
         
            const fullPath = path.join(currentDir, item);
            try {
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    await walkDirectory(fullPath, callback);
                } else if (stat.isFile() && fullPath.endsWith('.json')) {
                    await callback(fullPath, item);
                }
            } catch (err) {
                // Игнорируем битые симлинки и проблемы с правами доступа
            }
        }
    }

    async function readJson(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (e) {
            return {};
        }
    }

    console.log('1. Parcing Root texts, setting headers and categories...');
    await walkDirectory(rootPath, async (fullPath, fileName) => {
        const suttaId = fileName.split('_')[0];
        
        if (!db[suttaId]) {
            db[suttaId] = { 
                category: 'other', 
                titleSegmentId: '', 
                titles: {}, 
                mr: 0, 
                segments: {} 
            };
            
            if (textInfoData[suttaId] && textInfoData[suttaId].mtph) {
                db[suttaId].mr = parseInt(textInfoData[suttaId].mtph, 10) || 0;
            }
        }

        // Определение категорий согласно требованиям
        if (fullPath.includes('/vinaya/')) db[suttaId].category = 'vinaya';
        else if (fullPath.includes('/sutta/kn/')) db[suttaId].category = 'khudakka';
        else if (fullPath.includes('/sutta/')) db[suttaId].category = 'dhamma';
        else if (fullPath.includes('/abhidhamma/')) db[suttaId].category = 'abhi';

        const data = await readJson(fullPath);
        
        let lastZeroSegment = '';
        let foundText = false;

        for (const [segmentId, text] of Object.entries(data)) {
            if (typeof text === 'string' && text.trim()) {
                db[suttaId].segments[segmentId] = {
                    segment: segmentId,
                    root_text: text, 
                    html: '',
                    variant: '',
                    translations: {}
                };

                if (!foundText) {
                    if (segmentId.match(/:0(?:\.\d+)?$/)) {
                        lastZeroSegment = segmentId;
                    } else if (segmentId.match(/:[1-9]/)) {
                        foundText = true;
                        if (lastZeroSegment) {
                            db[suttaId].titleSegmentId = lastZeroSegment;
                            db[suttaId].titles['root'] = data[lastZeroSegment];
                        }
                    }
                }
            }
        }
        
        if (!foundText && lastZeroSegment && !db[suttaId].titleSegmentId) {
            db[suttaId].titleSegmentId = lastZeroSegment;
            db[suttaId].titles['root'] = data[lastZeroSegment];
        }
    });

    console.log('2. Parcing HTML...');
    await walkDirectory(htmlPath, async (fullPath, fileName) => {
        const suttaId = fileName.split('_')[0];
        if (!db[suttaId]) return;
        const data = await readJson(fullPath);
        for (const [segmentId, htmlTag] of Object.entries(data)) {
            if (db[suttaId].segments[segmentId]) {
                db[suttaId].segments[segmentId].html = htmlTag;
            }
        }
    });

    console.log('3. Parcing Variants...');
    await walkDirectory(variantPath, async (fullPath, fileName) => {
        const suttaId = fileName.split('_')[0];
        if (!db[suttaId]) return;
        const data = await readJson(fullPath);
        for (const [segmentId, variantText] of Object.entries(data)) {
            if (db[suttaId].segments[segmentId]) {
                db[suttaId].segments[segmentId].variant = variantText;
            }
        }
    });

    console.log('4. Parcing Translations...');
    await walkDirectory(translationPath, async (fullPath, fileName) => {
        const suttaId = fileName.split('_')[0];
        if (!db[suttaId]) return;

        const nameParts = fileName.replace('.json', '').split('-');
        if (nameParts.length < 3) return;
        
        const langCode = nameParts[1];
        if (targetLanguages.length > 0 && !targetLanguages.includes(langCode)) return; 

        const transKey = `${langCode}_${nameParts.slice(2).join('-')}`;
        const data = await readJson(fullPath);
        
        for (const [segmentId, transText] of Object.entries(data)) {
            if (db[suttaId].segments[segmentId] && transText) {
                db[suttaId].segments[segmentId].translations[transKey] = transText;
            }
            if (segmentId === db[suttaId].titleSegmentId && transText) {
                db[suttaId].titles[transKey] = transText;
            }
        }
    });

    console.log('5. Formatting and sorting Data Base...');
    const finalDatabase = {};
    
    const sortedSuttas = Object.keys(db).sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (const suttaId of sortedSuttas) {
        const segmentsArray = Object.values(db[suttaId].segments).sort((a, b) => 
            a.segment.localeCompare(b.segment, undefined, { numeric: true, sensitivity: 'base' })
        );
        
        if (segmentsArray.length > 0) {
            finalDatabase[suttaId] = {
                category: db[suttaId].category,
                titles: db[suttaId].titles,
                mr: db[suttaId].mr,
                segments: segmentsArray
            };
        }
    }

    console.log(`Saving DB into ${outputFile}...`);
    await fs.writeFile(outputFile, JSON.stringify(finalDatabase), 'utf8');
    console.log('Build done.!');
}

compileLocalDatabase().catch(err => console.error('Critical error:', err));




