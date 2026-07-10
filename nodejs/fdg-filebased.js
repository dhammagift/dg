const fs = require('fs').promises;
const path = require('path');

async function buildTranslationMap(transDir) {
    const transMap = new Map();

    async function walkTrans(currentDir) {
        let files;
        try {
            files = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (error) {
            return;
        }

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);
            if (file.isDirectory()) {
                await walkTrans(fullPath);
            } else if (file.isFile() && fullPath.endsWith('.json') && file.name.includes('_translation-')) {
                // Извлекаем базовый ID сутты, например "dn1" из "dn1_translation-en-sujato.json"
                const suttaId = file.name.split('_')[0];
                
                // Определяем переводчика и язык из имени файла
                const nameParts = file.name.replace('.json', '').split('-');
                const lang = nameParts[1];
                const author = nameParts.slice(2).join('-');
                const transKey = `${lang}_${author}`;

                if (!transMap.has(suttaId)) {
                    transMap.set(suttaId, []);
                }
                transMap.get(suttaId).push({ transKey, fullPath });
            }
        }
    }

    await walkTrans(transDir);
    return transMap;
}

async function searchAndGroupPali(rootDir, transDir, keyword) {
    const groupedResults = {};
    const regex = new RegExp(keyword, 'i');
    
    // Строим карту переводов для быстрого доступа
    const transMap = await buildTranslationMap(transDir);

    async function walkRoot(currentDir) {
        let files;
        try {
            files = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (error) {
            console.error(`Ошибка чтения директории ${currentDir}:`, error.message);
            return;
        }

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);

            if (file.isDirectory()) {
                await walkRoot(fullPath);
            } else if (file.isFile() && fullPath.endsWith('.json') && file.name.includes('_root-pli-')) {
                const suttaId = file.name.split('_')[0];
                let content;
                try {
                    content = await fs.readFile(fullPath, 'utf8');
                } catch (e) {
                    continue;
                }
                
                const jsonData = JSON.parse(content);
                const matchedSegments = [];

                // Ищем совпадения в пали
                for (const [segmentId, textValue] of Object.entries(jsonData)) {
                    if (typeof textValue === 'string' && regex.test(textValue)) {
                        matchedSegments.push({
                            segment: segmentId,
                            pali: textValue,
                            translations: {} // Сюда добавим переводы
                        });
                    }
                }

                // Если есть совпадения, подтягиваем переводы
                if (matchedSegments.length > 0) {
                    const transFiles = transMap.get(suttaId) || [];
                    
                    // Читаем все файлы переводов для данной сутты
                    for (const tFile of transFiles) {
                        try {
                            const tContent = await fs.readFile(tFile.fullPath, 'utf8');
                            const tJson = JSON.parse(tContent);
                            
                            // Добавляем перевод к соответствующему сегменту
                            for (const match of matchedSegments) {
                                if (tJson[match.segment]) {
                                    match.translations[tFile.transKey] = tJson[match.segment];
                                }
                            }
                        } catch (e) {
                            console.error(`Ошибка чтения перевода ${tFile.fullPath}:`, e.message);
                        }
                    }

                    // Сортируем сегменты внутри сутты
                    matchedSegments.sort((a, b) => 
                        a.segment.localeCompare(b.segment, undefined, { numeric: true, sensitivity: 'base' })
                    );

                    groupedResults[suttaId] = matchedSegments;
                }
            }
        }
    }

    await walkRoot(rootDir);

    // Сортируем ключи сутт (dn1, dn2 ... dn10)
    const sortedGroupedResults = {};
    Object.keys(groupedResults)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .forEach(key => {
            sortedGroupedResults[key] = groupedResults[key];
        });

    return sortedGroupedResults;
}

// === КОНФИГУРАЦИЯ И ЗАПУСК ===
const rootPath = '/var/www/html/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/';
//const rootPath = '/data/data/com.termux/files/usr/share/apache2/default-site/htdocs/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/';
const translationPath = '/var/www/html/suttacentral.net/sc-data/sc_bilara_data/translation/';
//const translationPath = '/data/data/com.termux/files/usr/share/apache2/default-site/htdocs/suttacentral.net/sc-data/sc_bilara_data/translation/';
//const searchWord = 'adhivacanasamph'; // Замени на искомое слово
const searchWord = 'kacchapa'; // Замени на искомое слово

searchAndGroupPali(rootPath, translationPath, searchWord)
    .then(result => {
        // Выводим результат в формате JSON
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => console.error('Критическая ошибка:', err));

