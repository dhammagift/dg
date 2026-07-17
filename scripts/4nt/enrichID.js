const fs = require('fs');
const path = require('path');

const EXTRA_SCRIPT = '<script src="/4nt/extra/extra.js"></script>';

function processHtml(dir) {
    const pattern = /(<a\b[^>]*class="ix-row"[^>]*href="([^/"]+)\/index\.html"[^>]*>)/g;

    function walk(currentDir) {
        let entries;

        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (err) {
            console.error(`Не удалось прочитать ${currentDir}: ${err.message}`);
            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                processFile(fullPath);
            }
        }
    }

    function processFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            // Добавление id к ix-row
            const newContent = content.replace(pattern, (match, fullTag, folderName) => {
                if (/\sid=/.test(fullTag)) return fullTag;
                changed = true;
                return fullTag.slice(0, -1) + ` id="${folderName}">`;
            });
            
            if (newContent !== content) {
                content = newContent;
            }

            // Подключение extra.js
            if (!content.includes('/4nt/extra/extra.js')) {
                content = content.replace(
                    /<\/head>/i,
                    `${EXTRA_SCRIPT}\n</head>`
                );
                changed = true;
            }

            // Замена логотипа
            if (content.includes('debabel-logo-1k.jpg')) {
                content = content.split('debabel-logo-1k.jpg').join('headerlogo.png');
                changed = true;
            }

// Замена эмодзи
if (content.includes('🦘')) {
    content = content.split('🦘').join('🐇');
    changed = true;
}

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
            }

        } catch (err) {
            console.error(`Ошибка при обработке ${filePath}: ${err.message}`);
        }
    }

    // Запускаем обход файлов
    walk(dir);
    
    // Копирование фавиконки после модификации всех HTML
    try {
        const srcLogo = path.join(dir, 'headerlogo.png');
        const destFavicon = path.join(dir, 'favicon.png');
        
        if (fs.existsSync(srcLogo)) {
            fs.copyFileSync(srcLogo, destFavicon);
        } else {
            console.warn(`Файл ${srcLogo} не найден, копирование фавиконки пропущено.`);
        }
    } catch (err) {
        console.error(`Ошибка при копировании фавиконки: ${err.message}`);
    }
}

processHtml(process.argv[2] || '.');
