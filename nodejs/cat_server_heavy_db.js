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
        console.log('Таймаут неактивности (15 минут). Память очищена.');
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
                    
                    for (const key in seg.translations) {
                        let lang = '';
                        if (key.startsWith('ru')) lang = 'ru';
                        else if (key.startsWith('en')) lang = 'en';
                        else continue;

                        const cleanTrans = seg.translations[key].trim();
                        if (cleanTrans) {
                            const mapKey = `${lang}_${cleanPali}`;
                            
                            if (!memoryMap.has(mapKey)) {
                                memoryMap.set(mapKey, new Map());
                            }
                            
                            const currentTransMap = memoryMap.get(mapKey);
                            if (!currentTransMap.has(cleanTrans)) {
                                currentTransMap.set(cleanTrans, key);
                            } else {
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
        
        translationMemory = [];
        for (const [mapKey, transMap] of memoryMap.entries()) {
            const lang = mapKey.substring(0, 2);
            const pali = mapKey.substring(3);
            const normalizedPali = pali.toLowerCase();
            
            for (const [trans, key] of transMap.entries()) {
                translationMemory.push({ 
                    pali: pali, 
                    normalizedPali: normalizedPali,
                    length: normalizedPali.length,
                    ru: trans, 
                    translator: key,
                    lang: lang
                });
            }
        }
        
        isDbLoaded = true;
        console.log(`Успешно загружено ${translationMemory.length} пар в память.`);
    } catch (error) {
        console.error('Ошибка при загрузке dg_db.json:', error);
    }
}

// Оптимизированная версия алгоритма Левенштейна
function getLevenshteinDistance(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let v0 = new Int32Array(b.length + 1);
    let v1 = new Int32Array(b.length + 1);

    for (let i = 0; i <= b.length; i++) {
        v0[i] = i;
    }

    for (let i = 0; i < a.length; i++) {
        v1[0] = i + 1;
        for (let j = 0; j < b.length; j++) {
            const cost = (a[i] === b[j]) ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for (let j = 0; j <= b.length; j++) {
            v0[j] = v1[j];
        }
    }

    return v1[b.length];
}

app.post('/api/find-match', async (req, res) => {
    await ensureDbLoaded();
    resetInactivityTimer();
    
    const sourceText = req.body.text || '';
    const threshold = req.body.threshold || 0.4;
    const requestedLang = req.body.lang || 'ru'; 
    
    const normalizedSource = sourceText.trim().toLowerCase();
    const L1 = normalizedSource.length;
    
    if (L1 === 0) {
        return res.json([]);
    }
    
    const matches = [];
    
    for (let i = 0; i < translationMemory.length; i++) {
        const tmItem = translationMemory[i];
        
        if (tmItem.lang !== requestedLang) continue;
        
        const L2 = tmItem.length;
        
        const maxPossibleSim = Math.min(L1, L2) / Math.max(L1, L2);
        if (maxPossibleSim < threshold) continue;
        
        if (normalizedSource === tmItem.normalizedPali) {
            matches.push({
                ru: tmItem.ru,
                pali: tmItem.pali,
                translator: tmItem.translator,
                similarity: 1.0
            });
            continue;
        }

        const distance = getLevenshteinDistance(normalizedSource, tmItem.normalizedPali);
        const maxLength = Math.max(L1, L2);
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



