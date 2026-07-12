const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const app = express();
const PORT = 3000;

const isTermux = fsSync.existsSync('/data/data/com.termux/files/usr');
const BASE = isTermux
    ? '/data/data/com.termux/files/usr/share/apache2/default-site/htdocs'
    : '/var/www/html';

// Массив всех базовых путей для индексации и поиска
const dataSources = [
    `${BASE}/suttacentral.net/sc-data/sc_bilara_data`,
    `${BASE}/dhamma.gift/sc-data/sc_bilara_data` // Сюда можно добавить любые дополнительные пути
];

const skeletonPath = path.join(__dirname, 'dg_db_light.json');

let skeletonDB = {};
let filePathsIndex = { root: {}, variant: {}, translations: {} };

async function buildFileIndex(dir, type) {
    let items;
    try { 
        items = await fs.readdir(dir); 
    } catch (e) { 
        // Игнорируем, если папка не существует
        return; 
    }
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            await buildFileIndex(fullPath, type);
        } else if (item.endsWith('.json')) {
            const suttaId = item.split('_')[0];
            if (type === 'translations') {
                if (!filePathsIndex.translations[suttaId]) filePathsIndex.translations[suttaId] = [];
                filePathsIndex.translations[suttaId].push(fullPath);
            } else {
                filePathsIndex[type][suttaId] = fullPath;
            }
        }
    }
}

async function initServer() {
    try {
        const data = await fs.readFile(skeletonPath, 'utf8');
        skeletonDB = JSON.parse(data);
        console.log(`Skeleton DB loaded. Total suttas: ${Object.keys(skeletonDB).length}`);
        
        console.log('Building file paths index from all sources...');
        for (const source of dataSources) {
            await buildFileIndex(path.join(source, 'root'), 'root');
            await buildFileIndex(path.join(source, 'variant'), 'variant');
            await buildFileIndex(path.join(source, 'translation'), 'translations');
        }
        console.log('File index ready.');
    } catch (err) {
        console.error('Startup error:', err);
    }
}
initServer();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

async function searchWithGrep(keyword, searchScope, exactMatch, targetLangs, lb = 0, la = 0) {
    const grepArgs = ['-ri'];
    if (exactMatch) grepArgs.push('-w'); 
    grepArgs.push(keyword);
    
    const grepDirs = [];
    dataSources.forEach(source => {
        const rPath = path.join(source, 'root');
        const vPath = path.join(source, 'variant');
        
        if (fsSync.existsSync(rPath)) grepDirs.push(rPath);
        if (fsSync.existsSync(vPath)) grepDirs.push(vPath);
        
        targetLangs.forEach(lang => {
            const tPath = path.join(source, 'translation', lang);
            if (fsSync.existsSync(tPath)) grepDirs.push(tPath);
        });
    });

    if (grepDirs.length === 0) {
        return { metadata: { query: keyword, totalFiles: 0, totalMatches: 0, hasVariantMatch: false }, data: {} };
    }

    grepArgs.push(...grepDirs);

    let stdout = '';
    try {
        const result = await execFile('grep', grepArgs, { maxBuffer: 1024 * 1024 * 50 }); 
        stdout = result.stdout;
    } catch (error) {
        if (error.code === 1) {
            return { metadata: { query: keyword, langs: targetLangs, totalFiles: 0, totalMatches: 0, hasVariantMatch: false }, data: {} };
        }
        throw error;
    }

    const searchResults = {};

    let allowedPrefixes = [];
    const defaultPrefixes = ['dn', 'mn', 'sn', 'an', 'ud', 'snp', 'dhp', 'thag', 'thig', 'iti', 'bu-', 'bi-', 'pli-tv-', 'kd', 'pvr'];
    
    if (!searchScope || searchScope === 'default') {
        allowedPrefixes = defaultPrefixes;
    } else if (searchScope === 'all') {
        allowedPrefixes = ['all'];
    } else {
        const rawPrefixes = searchScope.split(',').map(s => s.trim());
        for (const p of rawPrefixes) {
            if (p === 'default') {
                allowedPrefixes.push(...defaultPrefixes);
            } else {
                allowedPrefixes.push(p);
            }
        }
    }

    const lines = stdout.split('\n');
    
    for (const line of lines) {
        if (!line.trim()) continue;

        const match = line.match(/^([^:]+\.json):(.*)$/);
        if (!match) continue;

        const jsonLine = match[2].trim();
        const fileName = path.basename(match[1]);
        const suttaId = fileName.split('_')[0];

        const suttaMeta = skeletonDB[suttaId];
        if (!suttaMeta) continue;

        if (!allowedPrefixes.includes('all')) {
            const isAllowed = allowedPrefixes.some(prefix => {
                if (suttaMeta.category === prefix) return true;
                if (suttaId === prefix) return true;
                if (suttaId.startsWith(prefix)) {
                    const nextChar = suttaId.charAt(prefix.length);
                    return /[0-9.-]/.test(nextChar);
                }
                return false;
            });
            if (!isAllowed) continue;
        }

        let segmentId = "unknown";
        try {
            const cleanLine = jsonLine.replace(/,$/, '');
            const parsedObj = JSON.parse(`{${cleanLine}}`);
            segmentId = Object.keys(parsedObj)[0];
        } catch (e) {
            const fallbackMatch = jsonLine.match(/^"([^"]+)"\s*:\s*"(.*)"\s*,?$/);
            if (fallbackMatch) segmentId = fallbackMatch[1];
        }

        if (!searchResults[suttaId]) {
            searchResults[suttaId] = {
                sutta_id: suttaId,
                category: suttaMeta.category,
                dir_path: suttaMeta.dir_path,
                titles: { root: suttaMeta.title || suttaId },
                mr: suttaMeta.mr,
                count: 0,
                unique_words: [],
                segments: [] 
            };
        }

        if (!searchResults[suttaId].segments.some(s => s.segment === segmentId)) {
            searchResults[suttaId].segments.push({ segment: segmentId });
        }
    }

    const regex = new RegExp(keyword, 'gi');
    const wordExtractionRegex = new RegExp(`[^\\s,.:;!?\"'“”‘’()\\[\\]{}]*${keyword}[^\\s,.:;!?\"'“”‘’()\\[\\]{}]*`, 'gi');
    
    let globalTotalMatches = 0;
    let globalHasVariants = false; 

    for (const suttaId in searchResults) {
        const suttaRes = searchResults[suttaId];
        const uniqueWordsSet = new Set();
        let exactSuttaMatchCount = 0;
        
        let rootData = {};
        if (filePathsIndex.root[suttaId]) {
            rootData = JSON.parse(await fs.readFile(filePathsIndex.root[suttaId], 'utf8').catch(() => '{}'));
        }

        let variantData = {};
        if (filePathsIndex.variant[suttaId]) {
            variantData = JSON.parse(await fs.readFile(filePathsIndex.variant[suttaId], 'utf8').catch(() => '{}'));
        }

        let translationsData = {}; 
        if (filePathsIndex.translations[suttaId]) {
            for (const tPath of filePathsIndex.translations[suttaId]) {
                const tName = path.basename(tPath).replace('.json', '');
                const parts = tName.split('-');
                if (parts.length >= 3) {
                    const langCode = parts[1];
                    if (targetLangs.includes(langCode) || targetLangs.includes('all')) {
                        const transKey = `${langCode}_${parts.slice(2).join('-')}`;
                        translationsData[transKey] = JSON.parse(await fs.readFile(tPath, 'utf8').catch(() => '{}'));
                    }
                }
            }
        }

        let lastZeroSegment = '';
        let titleSegId = '';
        for (const k of Object.keys(rootData)) {
            if (k.match(/:0(?:\.\d+)?$/)) {
                lastZeroSegment = k;
            } else if (k.match(/:[1-9]/)) {
                if (lastZeroSegment) {
                    titleSegId = lastZeroSegment;
                }
                break;
            }
        }
        if (!titleSegId && lastZeroSegment) {
            titleSegId = lastZeroSegment;
        }

        if (titleSegId) {
            if (rootData[titleSegId]) suttaRes.titles.root = rootData[titleSegId];
            for (const tKey in translationsData) {
                if (translationsData[tKey][titleSegId]) {
                    suttaRes.titles[tKey] = translationsData[tKey][titleSegId];
                }
            }
        }

        const rootKeys = Object.keys(rootData);
        const enrichedSegments = [];

        for (let seg of suttaRes.segments) {
            const sId = seg.segment;
            const sIdx = rootKeys.indexOf(sId);
            
            const buildSegData = (id) => {
                const tr = {};
                for (const tKey in translationsData) {
                    if (translationsData[tKey][id]) tr[tKey] = translationsData[tKey][id];
                }
                return {
                    segment: id,
                    root_text: rootData[id] || "",
                    variant: variantData[id] || "",
                    html: skeletonDB[suttaId]?.html?.[id] || "",
                    translations: tr
                };
            };

            const mainSeg = buildSegData(sId);

            const processTextForMatches = (text, isVariant = false) => {
                if (!text) return;
                const matches = text.match(regex);
                if (matches) {
                    exactSuttaMatchCount += matches.length;
                    if (isVariant) globalHasVariants = true;
                }

                const fullWords = text.match(wordExtractionRegex);
                if (fullWords) {
                    fullWords.forEach(word => uniqueWordsSet.add(word.toLowerCase()));
                }
            };

            processTextForMatches(mainSeg.root_text, false);
            processTextForMatches(mainSeg.variant, true); 
            Object.values(mainSeg.translations).forEach(t => processTextForMatches(t, false));
            
            mainSeg.lb_context = [];
            mainSeg.la_context = [];
            
            if (sIdx !== -1) {
                if (lb > 0) {
                    for (let i = Math.max(0, sIdx - lb); i < sIdx; i++) {
                        mainSeg.lb_context.push(buildSegData(rootKeys[i]));
                    }
                }
                if (la > 0) {
                    for (let i = sIdx + 1; i <= Math.min(rootKeys.length - 1, sIdx + la); i++) {
                        mainSeg.la_context.push(buildSegData(rootKeys[i]));
                    }
                }
            }
            
            enrichedSegments.push(mainSeg);
        }

        suttaRes.segments = enrichedSegments;
        suttaRes.count = exactSuttaMatchCount; 
        globalTotalMatches += exactSuttaMatchCount;
        suttaRes.unique_words = Array.from(uniqueWordsSet); 
    }

    const categoryOrder = { 'dhamma': 1, 'khudakka': 2, 'vinaya': 3, 'abhi': 4, 'other': 5 };
    
    const sortedKeys = Object.keys(searchResults).sort((a, b) => {
        const catA = searchResults[a].category;
        const catB = searchResults[b].category;
        const orderA = categoryOrder[catA] || 99;
        const orderB = categoryOrder[catB] || 99;

        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    const sortedData = {};
    for (const key of sortedKeys) {
        searchResults[key].segments.sort((s1, s2) => 
            s1.segment.localeCompare(s2.segment, undefined, { numeric: true, sensitivity: 'base' })
        );
        sortedData[key] = searchResults[key];
    }

    return {
        metadata: {
            query: keyword,
            scope: searchScope || 'default',
            langs: targetLangs,
            lb: lb,
            la: la,
            exactMatch: exactMatch,
            totalFiles: Object.keys(sortedData).length,
            totalMatches: globalTotalMatches,
            hasVariantMatch: globalHasVariants 
        },
        data: sortedData
    };
}

app.get('/search', async (req, res) => {
    const keyword = req.query.q;
    const scope = req.query.scope || 'default';
    const exact = req.query.exact === 'true'; 
    const langsParam = req.query.langs || 'ru,en'; 
    const targetLangs = langsParam.split(',').map(l => l.trim());
    const lb = parseInt(req.query.lb) || 0; 
    const la = parseInt(req.query.la) || 0; 

    if (!keyword) {
        return res.status(400).json({ error: 'Parameter "q" (search word) is mandatory.' });
    }

    try {
        const result = await searchWithGrep(keyword, scope, exact, targetLangs, lb, la);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Search Error. Internal Server Error.' });
    }
});

app.get('/search', async (req, res) => {
    const keyword = req.query.q;
    const scope = req.query.scope || 'default';
    const exact = req.query.exact === 'true'; 
    const langsParam = req.query.langs || 'ru,en'; 
    const targetLangs = langsParam.split(',').map(l => l.trim());

    if (!keyword) {
        return res.status(400).json({ error: 'Parameter "q" (search word) is mandatory.' });
    }

    try {
        const result = await searchWithGrep(keyword, scope, exact, targetLangs);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Search Error. Internal Server Error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Grep Search Server started. API: http://localhost:${PORT}/search?q=kacchapa&scope=dhamma&langs=ru,en`);
});

