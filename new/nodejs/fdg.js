// transform to API for app and web
// add word endpoint or just sorting???? grouped by words count matech, count texts, add available texts 
// add html response of full datatable response????
// добавить опции для выбор книг  общий набор:
// an sn dn mn + ud dhp iti snp thag thig + vinaya?
// возможность передавать отедльные наборы текстов? 
// доп опция - префильтр по определениям
// по метафорам 
// топ 10 или топ 5 ???

const fs = require('fs').promises;
const path = require('path');

async function searchInDatabase(dbPath, keyword) {
    try {
        const dbContent = await fs.readFile(dbPath, 'utf8');
        const database = JSON.parse(dbContent);
        
        // Добавлен флаг 'g' для глобального поиска всех вхождений в строке
        const regex = new RegExp(keyword, 'gi');
        const searchResults = {};
        let totalMatchesCounter = 0; 

        for (const [suttaId, suttaData] of Object.entries(database)) {
            const matchedSegments = [];
            let suttaMatchesCount = 0;

            for (const segmentObj of suttaData.segments) {
                let maxMatchesInSegment = 0;

                // Считаем в корневом тексте
                if (segmentObj.root_text) {
                    const matches = segmentObj.root_text.match(regex);
                    if (matches) {
                        maxMatchesInSegment = Math.max(maxMatchesInSegment, matches.length);
                    }
                }
                
                // Считаем в вариантах
                if (segmentObj.variant) {
                    const matches = segmentObj.variant.match(regex);
                    if (matches) {
                        maxMatchesInSegment = Math.max(maxMatchesInSegment, matches.length);
                    }
                }
                
                // Считаем во всех переводах, берем максимальное значение для этого сегмента
                if (segmentObj.translations) {
                    for (const transText of Object.values(segmentObj.translations)) {
                        if (transText) {
                            const matches = transText.match(regex);
                            if (matches) {
                                maxMatchesInSegment = Math.max(maxMatchesInSegment, matches.length);
                            }
                        }
                    }
                }

                // Если есть хотя бы одно совпадение
                if (maxMatchesInSegment > 0) {
                    // Сохраняем сегмент и добавляем к нему точное количество найденных слов
                    matchedSegments.push({
                        ...segmentObj,
                        matchCount: maxMatchesInSegment
                    });
                    suttaMatchesCount += maxMatchesInSegment;
                }
            }

            // Если в сутте найдены сегменты, добавляем сутту в результат
            if (matchedSegments.length > 0) {
                searchResults[suttaId] = {
                    sutta_id: suttaId,
                    category: suttaData.category,
                    titles: suttaData.titles,
                    mr: suttaData.mr,
                    count: suttaMatchesCount, // Сумма всех слов в этой сутте
                    segments: matchedSegments
                };
                totalMatchesCounter += suttaMatchesCount; // Плюсуем к общему счетчику
            }
        }

        const filesCount = Object.keys(searchResults).length;

        return {
            metadata: {
                query: keyword,
                totalFiles: filesCount,
                totalMatches: totalMatchesCounter // Общее количество слов по всей базе
            },
            data: searchResults
        };
    } catch (error) {
        console.error(`Ошибка при поиске:`, error.message);
        return null;
    }
}

// === КОНФИГУРАЦИЯ И ЗАПУСК ===
const databaseFile = path.join(__dirname, 'dg_db.json');
//const searchWord = 'paṭigh'; 
const searchWord = 'dukkh'; 

searchInDatabase(databaseFile, searchWord)
    .then(result => {
        if (result) {
            console.log(JSON.stringify(result, null, 2));
        }
    })
    .catch(err => console.error('Критическая ошибка:', err));

