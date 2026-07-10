const fs = require('fs').promises;
const path = require('path');

async function compileLocalDatabase(rootDir, transDir, outputPath) {
    const database = [];
    const transMap = new Map();

    // 1. Собираем карту переводов
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
                const suttaId = file.name.split('_')[0];
                const nameParts = file.name.replace('.json', '').split('-');
                const transKey = `${nameParts[1]}_${nameParts.slice(2).join('-')}`; // например, en_sujato

                if (!transMap.has(suttaId)) {
                    transMap.set(suttaId, []);
                }
                transMap.get(suttaId).push({ transKey, fullPath });
            }
        }
    }

    // 2. Читаем пали и склеиваем с переводами
    async function walkRoot(currentDir) {
        let files;
        try {
            files = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (error) {
            return;
        }

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);

            if (file.isDirectory()) {
                await walkRoot(fullPath);
            } else if (file.isFile() && fullPath.endsWith('.json') && file.name.includes('_root-pli-')) {
                const suttaId = file.name.split('_')[0];
                const content = await fs.readFile(fullPath, 'utf8');
                const jsonData = JSON.parse(content);
                
                // Читаем файлы переводов для текущей сутты один раз
                const transData = {};
                const transFiles = transMap.get(suttaId) || [];
                for (const tFile of transFiles) {
                    try {
                        const tContent = await fs.readFile(tFile.fullPath, 'utf8');
                        transData[tFile.transKey] = JSON.parse(tContent);
                    } catch (e) {
                        console.error(`Ошибка чтения ${tFile.fullPath}`);
                    }
                }

                // Формируем плоские записи для базы данных
                for (const [segmentId, textValue] of Object.entries(jsonData)) {
                    if (typeof textValue !== 'string' || !textValue.trim()) continue;

                    const record = {
                        id: segmentId,
                        sutta: suttaId,
                        pali: textValue,
                        translations: {}
                    };

                    for (const [transKey, transJson] of Object.entries(transData)) {
                        if (transJson[segmentId]) {
                            record.translations[transKey] = transJson[segmentId];
                        }
                    }

                    database.push(record);
                }
            }
        }
    }

    console.log('Сканирование директорий...');
    await walkTrans(transDir);
    await walkRoot(rootDir);

    console.log(`Собрано ${database.length} сегментов. Запись в файл...`);
    await fs.writeFile(outputPath, JSON.stringify(database), 'utf8');
    console.log(`База данных успешно сохранена в ${outputPath}`);
}

// === Конфигурация ===
//const rootPath = '/data/data/com.termux/files/usr/share/apache2/default-site/htdocs/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/';
const rootPath = '/var/www/html/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/';
//const translationPath = '/data/data/com.termux/files/usr/share/apache2/default-site/htdocs/suttacentral.net/sc-data/sc_bilara_data/translation/';
const translationPath = '/var/www/html/htdocs/suttacentral.net/sc-data/sc_bilara_data/translation/';
const outputFile = path.join(__dirname, 'mobile_db.json');

// Запуск
compileLocalDatabase(rootPath, translationPath, outputFile)
    .catch(err => console.error('Критическая ошибка:', err));
