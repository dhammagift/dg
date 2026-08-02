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

async function runGrepInFolder(searchQuery, targetDir, isRegex = false) {
    try {
        const stat = await fs.stat(targetDir);
        if (!stat.isDirectory()) return [];
    } catch (e) {
        return [];
    }

    try {
        const flag = isRegex ? '-E' : '-F';
        const args = ['-r', flag, '-i', searchQuery, targetDir];
        const { stdout } = await execFileAsync('grep', args, { maxBuffer: 1024 * 1024 * 20 });
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

    let searchStages = [];
    if (requestedLang === 'ru') {
        searchStages = [
            { folders: ['lbl', 'ru'], name: 'o' },
            { folders: ['ai'], name: 'ai' },
            { folders: ['ru_other'], name: 'other' }
        ];
    } else if (requestedLang === 'en') {
        searchStages = [
            { folders: ['lbl', 'en'], name: 'en_main' },
            { folders: ['en_other'], name: 'en_other' }
        ];
    }

    const sentFiles = new Set();
    let globalSentCount = 0;
    const MAX_RESULTS = 30; 

    // Получаем ID из Пали с учетом частей предложений
    async function getPaliIds(text) {
        const foundIds = new Set();
        if (!text) return Array.from(foundIds);

        // 1. Сначала точное совпадение
        const exactLines = await runGrepInFolder(text, PALI_DIR, false);
        exactLines.forEach(line => {
            const match = line.match(/"([^"]+)"\s*:/);
            if (match) foundIds.add(match[1]);
        });

        // 2. Если точных мало, бьем на фразы, чтобы не пропускать длинные куски
        if (foundIds.size < 5) {
            const subPhrases = text.split(/[,;,—\.\?]/).map(s => s.trim()).filter(s => s.length >= 15);
            for (const phrase of subPhrases) {
                const phraseLines = await runGrepInFolder(phrase, PALI_DIR, false);
                phraseLines.forEach(line => {
                    const match = line.match(/"([^"]+)"\s*:/);
                    if (match) foundIds.add(match[1]);
                });
            }
        }

        return Array.from(foundIds);
    }

    // Поиск и немедленный стриминг для конкретного этапа
    async function streamStage(stage, idsArray, matchType) {
        if (idsArray.length === 0 || globalSentCount >= MAX_RESULTS) return;

        const tmpFilePath = path.join(__dirname, `grep_ids_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`);
        const patterns = idsArray.map(id => `"${id}":`).join('\n');
        await fs.writeFile(tmpFilePath, patterns);

        for (const folder of stage.folders) {
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
                    if (globalSentCount >= MAX_RESULTS) break;

                    const firstColon = line.indexOf(':');
                    if (firstColon === -1) continue;
                    
                    const filePath = line.substring(0, firstColon);
                    const content = line.substring(firstColon + 1).trim();
                    const relativePath = filePath.replace(dirInfo.stripPrefix, '');

                    const idMatch = content.match(/"([^"]+)"\s*:/);
                    const actualId = idMatch ? idMatch[1] : 'unknown';

                    const matchKey = `${actualId}_${relativePath}`;
                    if (!sentFiles.has(matchKey)) {
                        sentFiles.add(matchKey);
                        const matchObj = {
                            matchType: matchType,
                            folder: folder,
                            translator: relativePath,
                            content: content,
                            id: actualId
                        };
                        // Моментальная отправка найденного
                        res.write(JSON.stringify(matchObj) + '\n');
                        globalSentCount++;
                    }
                }
            } catch (error) {
                // Игнорируем ошибки grep
            }
        }
        
        try {
            await fs.unlink(tmpFilePath);
        } catch(e) {}
    }

    // Шаг 1: Поиск и стриминг по ID (если есть)
    if (segmentId) {
        for (const stage of searchStages) {
            await streamStage(stage, [segmentId], 'id');
        }
    }

    // Шаг 2: Поиск и стриминг по тексту
    if (sourceText && globalSentCount < MAX_RESULTS) {
        const textIds = await getPaliIds(sourceText);
        
        // Убираем ID, который уже обработали на Шаге 1
        if (segmentId) {
            const index = textIds.indexOf(segmentId);
            if (index > -1) textIds.splice(index, 1);
        }

        if (textIds.length > 0) {
            // Сначала отдаем все переводы из первой группы, затем из второй и т.д.
            for (const stage of searchStages) {
                await streamStage(stage, textIds, 'text');
            }
        }
    }

    res.end();
});

app.listen(3001, () => {
    console.log('Потоковый API поиска запущен (Порт 3001)');
});
