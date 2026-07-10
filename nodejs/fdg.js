// transform to API for app and web
// add word endpoint or just sorting???? grouped by words count matech, count texts, add available texts 
// add html response of full datatable response????
// добавить опции для выбор книг  общий набор:
// an sn dn mn + ud dhp iti snp thag thig + vinaya?
// возможность передавать отедльные наборы текстов? 
// доп опция - префильтр по определениям
// по метафорам 
// топ 10 или топ 5 ???


console.log('Пример: http://localhost:3000/search?q=pa%E1%B9%ADigh&lb=1&la=2');

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

/**
 * Основная функция поиска по базе данных
 */
async function searchInDatabase(dbPath, keyword, searchScope = 'default', lb = 0, la = 0) {
    try {
        const dbContent = await fs.readFile(dbPath, 'utf8');
        const database = JSON.parse(dbContent);

        const regex = new RegExp(keyword, 'gi');
        const wordExtractionRegex = new RegExp(`[^\\s,.:;!?\"'“”‘’()\\[\\]{}]*${keyword}[^\\s,.:;!?\"'“”‘’()\\[\\]{}]*`, 'gi');

        const searchResults = {};
        let totalMatchesCounter = 0;

        // Настройка фильтра префиксов
        let allowedPrefixes = [];
        if (!searchScope || searchScope === 'default') {
            allowedPrefixes = ['dn', 'mn', 'sn', 'an', 'ud', 'snp', 'dhp', 'thag', 'thig', 'iti', 'bu-', 'bi-', 'pli-tv-', 'kd', 'pvr'];
        } else if (searchScope === 'all') {
            allowedPrefixes = ['all'];
        } else if (Array.isArray(searchScope)) {
            allowedPrefixes = searchScope;
        } else if (typeof searchScope === 'string') {
            allowedPrefixes = searchScope.split(',').map(s => s.trim());
        }

        for (const [suttaId, suttaData] of Object.entries(database)) {

            // Строгая фильтрация по префиксам (исключает ложные срабатывания вроде mnd для mn)
            if (!allowedPrefixes.includes('all')) {
                const isAllowed = allowedPrefixes.some(prefix => {
                    if (suttaId === prefix) return true;
                    if (suttaId.startsWith(prefix)) {
                        const nextChar = suttaId.charAt(prefix.length);
                        // После префикса должна идти цифра, точка или дефис (отсекаем буквы)
                        return /[0-9.-]/.test(nextChar);
                    }
                    return false;
                });
                if (!isAllowed) continue;
            }

            const matchedSegments = [];
            let suttaMatchesCount = 0;
            const uniqueWordsSet = new Set();

            // Итерация классическим циклом for для доступа к соседним индексам (lb и la)
            for (let i = 0; i < suttaData.segments.length; i++) {
                const segmentObj = suttaData.segments[i];
                let maxMatchesInSegment = 0;
                let segmentHasMatch = false;

                const processTextForMatches = (text) => {
                    if (!text) return;
                    const matches = text.match(regex);
                    if (matches) {
                        segmentHasMatch = true;
                        maxMatchesInSegment = Math.max(maxMatchesInSegment, matches.length);

                        const fullWords = text.match(wordExtractionRegex);
                        if (fullWords) {
                            fullWords.forEach(word => uniqueWordsSet.add(word.toLowerCase()));
                        }
                    }
                };

                processTextForMatches(segmentObj.root_text);
                processTextForMatches(segmentObj.variant);

                if (segmentObj.translations) {
                    for (const transText of Object.values(segmentObj.translations)) {
                        processTextForMatches(transText);
                    }
                }

                if (segmentHasMatch) {
                    // Извлечение контекста вокруг найденной строки
                    const contextBefore = lb > 0 ? suttaData.segments.slice(Math.max(0, i - lb), i) : [];
                    const contextAfter = la > 0 ? suttaData.segments.slice(i + 1, Math.min(suttaData.segments.length, i + 1 + la)) : [];

                    matchedSegments.push({
                        ...segmentObj,
                        matchCount: maxMatchesInSegment,
                        lb_context: contextBefore,
                        la_context: contextAfter
                    });
                    suttaMatchesCount += maxMatchesInSegment;
                }
            }

            if (matchedSegments.length > 0) {
                searchResults[suttaId] = {
                    sutta_id: suttaId,
                    category: suttaData.category,
                    titles: suttaData.titles,
                    mr: suttaData.mr,
                    count: suttaMatchesCount,
                    unique_words: Array.from(uniqueWordsSet),
                    segments: matchedSegments
                };
                totalMatchesCounter += suttaMatchesCount;
            }
        }

        const filesCount = Object.keys(searchResults).length;

        return {
            metadata: {
                query: keyword,
                scope: searchScope || 'default',
                lb: lb,
                la: la,
                totalFiles: filesCount,
                totalMatches: totalMatchesCounter
            },
            data: searchResults
        };
    } catch (error) {
        console.error(`Ошибка при поиске:`, error.message);
        return null;
    }
}

// API Эндпоинт для поиска
app.get('/search', async (req, res) => {
    const keyword = req.query.q;
    const scope = req.query.scope || 'default';
    const lb = parseInt(req.query.lb) || 0; // Строки до
    const la = parseInt(req.query.la) || 0; // Строки после

    if (!keyword) {
        return res.status(400).json({ error: 'Параметр "q" (поисковое слово) обязателен.' });
    }

    const databaseFile = path.join(__dirname, 'dg_db.json');
    const result = await searchInDatabase(databaseFile, keyword, scope, lb, la);

    if (result) {
        res.json(result);
    } else {
        res.status(500).json({ error: 'Внутренняя ошибка сервера при поиске.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер поиска запущен. API доступно по адресу: http://localhost:${PORT}/search`);
});


