const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(cors());
app.use(express.json());

const execFileAsync = util.promisify(execFile);

// Пути
const HTTP_ROOT = path.resolve(__dirname, '..'); 
const SITE_ROOT = path.resolve(HTTP_ROOT, '..'); 
const OFFLINE_DATA = path.resolve(SITE_ROOT, 'offline-data');
const DHAMMAGIFT_DIR = path.resolve(OFFLINE_DATA, 'dhammagift');
const PALI_DIR = path.resolve(HTTP_ROOT, 'suttacentral.net/sc-data/sc_bilara_data/root/pli/ms');

const DIRS_MAP = {
    'lbl': { path: path.resolve(OFFLINE_DATA, 'lbl'), stripPrefix: OFFLINE_DATA + '/' },
    'ai': { path: path.resolve(DHAMMAGIFT_DIR, 'ai'), stripPrefix: DHAMMAGIFT_DIR + '/' },
    'ru': { path: path.resolve(DHAMMAGIFT_DIR, 'ru'), stripPrefix: DHAMMAGIFT_DIR + '/' },
    'ru_other': { path: path.resolve(DHAMMAGIFT_DIR, 'ru_other'), stripPrefix: DHAMMAGIFT_DIR + '/' },
    'en': { path: path.resolve(DHAMMAGIFT_DIR, 'en'), stripPrefix: DHAMMAGIFT_DIR + '/' },
    'en_other': { path: path.resolve(DHAMMAGIFT_DIR, 'en_other'), stripPrefix: DHAMMAGIFT_DIR + '/' }
};

async function runGrepInFolder(searchQuery, targetDir) {
    try {
        const stat = await fs.stat(targetDir);
        if (!stat.isDirectory()) return [];
    } catch (e) {
        return [];
    }

    try {
        const args = ['-r', '-F', '-i', searchQuery, targetDir];
        const { stdout } = await execFileAsync('grep', args, { maxBuffer: 1024 * 1024 * 10 });
        return stdout.split('\n').filter(l => l.trim() !== '');
    } catch (error) {
        return [];
    }
}

app.post('/api/find-match-stream', async (req, res) => {
    const sourceText = (req.body.text || '').trim();
    const segmentId = (req.body.id || '').trim();
    const requestedLang = req.body.lang || 'ru';

    if (!sourceText && !segmentId) {
        return res.status(400).json({ error: 'Нужен text или id' });
    }

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    // Определяем каскадные этапы (группы папок)
    let searchStages = [];
    if (requestedLang === 'ru') {
        searchStages = [
            ['lbl', 'ru'],       // Этап 1: Главные переводы
            ['ai'],              // Этап 2: ИИ
            ['ru_other']         // Этап 3: Остальные
        ];
    } else if (requestedLang === 'en') {
        searchStages = [
            ['lbl', 'en'],       // Этап 1: Главные
            ['en_other']         // Этап 2: Остальные
        ];
    }

    const sentFiles = new Set();
    let globalSentCount = 0;
    const MAX_RESULTS = 30; 

    // Функция для весов сортировки внутри этапа
    const getSortWeight = (translatorPath) => {
        const match = translatorPath.match(/-([^-]+)\.json$/);
        const name = match ? match[1] : '';
        if (name === 'o' || name === 'ru') return 1;
        if (name === 'ai') return 2;
        if (name === 'sv+edited+o') return 3;
        if (name === 'sv') return 4;
        return 5;
    };

    async function fetchAndSendTranslations(idsArray, matchTypeInfo) {
        if (idsArray.length === 0 || globalSentCount >= MAX_RESULTS) return;

        const tmpFilePath = path.join(__dirname, `grep_ids_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`);
        const patterns = idsArray.map(id => `"${id}":`).join('\n');
        await fs.writeFile(tmpFilePath, patterns);

        // Проходим по этапам последовательно
        for (const stageFolders of searchStages) {
            if (globalSentCount >= MAX_RESULTS) break;

            let stageMatches = [];

            // Ищем по всем папкам текущего этапа
            for (const folder of stageFolders) {
                const dirInfo = DIRS_MAP[folder];
                if (!dirInfo) continue;

                try {
                    const stat = await fs.stat(dirInfo.path);
                    if (!stat.isDirectory()) continue;
                } catch(e) { continue; }

                try {
                    const args = ['-r', '-F', '-f', tmpFilePath, dirInfo.path];
                    const { stdout } = await execFileAsync('grep', args, { maxBuffer: 1024 * 1024 * 20 });
                    const lines = stdout.split('\n').filter(l => l.trim() !== '');

                    for (const line of lines) {
                        const firstColon = line.indexOf(':');
                        const filePath = firstColon !== -1 ? line.substring(0, firstColon) : 'unknown';
                        let content = firstColon !== -1 ? line.substring(firstColon + 1).trim() : line;
                        const relativePath = filePath.replace(dirInfo.stripPrefix, '');

                        const idMatch = content.match(/"([^"]+)"\s*:/);
                        const actualId = idMatch ? idMatch[1] : 'unknown';

                        const matchKey = `${actualId}_${relativePath}`;
                        if (!sentFiles.has(matchKey)) {
                            sentFiles.add(matchKey);
                            stageMatches.push({
                                matchType: matchTypeInfo,
                                folder: folder,
                                translator: relativePath,
                                content: content,
                                id: actualId
                            });
                        }
                    }
                } catch (error) {
                    // Игнорируем ошибки grep, если ничего не найдено
                }
            }

            // Если на этом этапе что-то нашли — сортируем и отдаем
            if (stageMatches.length > 0) {
                stageMatches.sort((a, b) => {
                    const weightA = getSortWeight(a.translator);
                    const weightB = getSortWeight(b.translator);
                    if (weightA !== weightB) return weightA - weightB;
                    return a.translator.localeCompare(b.translator);
                });

                for (const matchObj of stageMatches) {
                    if (globalSentCount >= MAX_RESULTS) break;
                    res.write(JSON.stringify(matchObj) + '\n');
                    globalSentCount++;
                }
            }
        }
        
        try {
            await fs.unlink(tmpFilePath);
        } catch(e) {}
    }

    if (segmentId) {
        // Сначала ищем точное совпадение по ID
        await fetchAndSendTranslations([segmentId], 'id');
    }

    if (sourceText && globalSentCount < MAX_RESULTS) {
        // Если лимит не исчерпан, ищем по тексту
        const paliLines = await runGrepInFolder(sourceText, PALI_DIR);
        
        const foundIds = new Set();
        for (const line of paliLines) {
            const match = line.match(/"([^"]+)"\s*:/);
            if (match && match[1]) foundIds.add(match[1]);
        }

        if (segmentId) {
            foundIds.delete(segmentId); // Исключаем уже найденный ID
        }

        if (foundIds.size > 0) {
            await fetchAndSendTranslations(Array.from(foundIds), 'text');
        }
    }

    res.end();
});

app.listen(3001, () => {
    console.log('Потоковый API поиска запущен (Порт 3001)');
});
