const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

let translationMemory = [];
let isDbLoaded = false;
let inactivityTimer = null;

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        translationMemory = [];
        isDbLoaded = false;
        console.log('Таймаут неактивности (30 минут). Память очищена.');
    }, IDLE_TIMEOUT_MS);
}

async function ensureDbLoaded() {
    if (isDbLoaded) return;
    
    try {
        const dbPath = path.join(__dirname, 'dg_db.json');
        console.log(`Загрузка базы из: ${dbPath}`);
        
        const fileContent = await fs.readFile(dbPath, 'utf8');
        const db = JSON.parse(fileContent);
        
        const memoryMap = new Map();
        
        for (const suttaId in db) {
            const segments = db[suttaId].segments;
            
            if (!Array.isArray(segments)) continue;
            
            for (const seg of segments) {
                const pali = seg.root_text;
                
                if (pali && seg.translations) {
                    const cleanPali = pali.trim();
                    if (!cleanPali) continue;
                    
                    // Перебираем всех переводчиков для этой строки
                    for (const key in seg.translations) {
                        if (key.startsWith('ru') || key.startsWith('en')) {
                            const cleanTrans = seg.translations[key].trim();
                            if (cleanTrans) {
                                if (!memoryMap.has(cleanPali)) {
                                    memoryMap.set(cleanPali, new Map());
                                }
                                
                                const currentTransMap = memoryMap.get(cleanPali);
                                // Если такого текста еще нет, добавляем
                                if (!currentTransMap.has(cleanTrans)) {
                                    currentTransMap.set(cleanTrans, key);
                                } else {
                                    // Если текст дублируется, сохраняем приоритетный ключ 'o' или 'edited+o'
                                    const existingKey = currentTransMap.get(cleanTrans);
                                    if ((key.includes('_o') || key.includes('edited+o')) && !existingKey.includes('_o')) {
                                        currentTransMap.set(cleanTrans, key);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        translationMemory = [];
        for (const [pali, transMap] of memoryMap.entries()) {
            for (const [trans, key] of transMap.entries()) {
                translationMemory.push({ pali: pali, ru: trans, translator: key });
            }
        }
        
        isDbLoaded = true;
        console.log(`Успешно загружено ${translationMemory.length} пар в память.`);
    } catch (error) {
        console.error('Ошибка при загрузке dg_db.json:', error);
    }
}

function getLevenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

app.post('/api/find-match', async (req, res) => {
    await ensureDbLoaded();
    resetInactivityTimer();
    
    const sourceText = req.body.text || '';
    const threshold = req.body.threshold || 0.4;
    const normalizedSource = sourceText.trim().toLowerCase();
    
    if (!normalizedSource) {
        return res.json([]);
    }
    
    const matches = [];
    
    for (let i = 0; i < translationMemory.length; i++) {
        const tmItem = translationMemory[i];
        const normalizedTm = tmItem.pali.trim().toLowerCase();
        
        const distance = getLevenshteinDistance(normalizedSource, normalizedTm);
        const maxLength = Math.max(normalizedSource.length, normalizedTm.length);
        const similarity = (maxLength - distance) / maxLength;

        if (similarity >= threshold) {
            matches.push({
                ru: tmItem.ru,
                pali: tmItem.pali,
                translator: tmItem.translator,
                similarity: similarity
            });
        }
    }
    
    // Сортировка: сначала по % совпадения, затем по приоритету переводчика
    const topMatches = matches.sort((a, b) => {
        if (b.similarity !== a.similarity) {
            return b.similarity - a.similarity;
        }
        const aPref = a.translator.includes('_o') || a.translator.includes('edited+o');
        const bPref = b.translator.includes('_o') || b.translator.includes('edited+o');
        
        if (aPref && !bPref) return -1;
        if (!aPref && bPref) return 1;
        return 0;
    }).slice(0, 5);
    
    res.json(topMatches);
});

app.listen(3001, () => {
    console.log('API поиска переводов запущено локально на порту 3001');
});

