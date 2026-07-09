const fs = require('fs').promises;
const path = require('path');
const util = require('util'); 

async function agnosticSearch(baseDir, keyword, extensions) {
    const results = {};
    const regex = new RegExp(keyword, 'i');
    let totalMatchesCounter = 0;

    async function walk(currentDir) {
        let files;
        try {
            files = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (error) {
            return;
        }

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);
            if (file.isDirectory()) {
                await walk(fullPath);
            } else {
                const ext = path.extname(file.name).toLowerCase();
                if (extensions.includes(ext) || extensions.length === 0) {
                    await processFile(fullPath, file.name);
                }
            }
        }
    }

    async function processFile(filePath, fileName) {
        try {
            const buffer = await fs.readFile(filePath);
            let rawContent = buffer.toString('utf8');

            if (rawContent.includes('') || /windows-1251/i.test(rawContent)) {
                const decoder = new util.TextDecoder('windows-1251');
                rawContent = decoder.decode(buffer);
            }
            
            let docTitle = fileName;
            const titleMatch = rawContent.match(/<title>([^<]*)<\/title>/i);
            const h1Match = rawContent.match(/<h1>([^<]*)<\/h1>/i);
            
            if (titleMatch && titleMatch[1].trim()) {
                docTitle = titleMatch[1].trim();
            } else if (h1Match && h1Match[1].trim()) {
                docTitle = h1Match[1].trim();
            }

            const cleanText = rawContent.replace(/<[^>]*>?/gm, ' ');

            if (regex.test(cleanText)) {
                const matches = [];
                const lines = cleanText.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const matchIndex = line.toLowerCase().indexOf(keyword.toLowerCase());
                    
                    if (matchIndex !== -1) {
                        const start = Math.max(0, matchIndex - 80);
                        const end = Math.min(line.length, matchIndex + keyword.length + 80);
                        const snippet = line.substring(start, end).replace(/\s+/g, ' ').trim();
                        
                        matches.push({
                            lineNum: i + 1,
                            text: '...' + snippet + '...'
                        });
                        totalMatchesCounter++;
                    }
                }

                if (matches.length > 0) {
                    results[filePath] = {
                        title: docTitle,
                        fileName: fileName,
                        count: matches.length,
                        matches: matches
                    };
                }
            }
        } catch (error) {
            // Игнорируем файлы, которые невозможно прочитать
        }
    }

    await walk(baseDir);

    // Формируем единый объект ответа
    const filesCount = Object.keys(results).length;
    
    return {
        metadata: {
            query: keyword,
            totalFiles: filesCount,
            totalMatches: totalMatchesCounter
        },
        data: results
    };
}

// === КОНФИГУРАЦИЯ И ЗАПУСК ===
const searchPath = '/var/www/offline-data/theravada.ru/Teaching/Canon/Suttanta/Texts/'; 
const searchWord = 'усилие'; 
const targetExtensions = ['.html', '.htm', '.php', '.txt', '.md']; 

agnosticSearch(searchPath, searchWord, targetExtensions)
    .then(response => {
        // Выводим итоговый JSON целиком
        console.log(JSON.stringify(response, null, 2));
    })
    .catch(err => console.error('Критическая ошибка:', err));


