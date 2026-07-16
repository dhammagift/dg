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
            content = content.replace(pattern, (match, fullTag, folderName) => {
                if (/\sid=/.test(fullTag)) return fullTag;
                changed = true;
                return fullTag.slice(0, -1) + ` id="${folderName}">`;
            });

            // Подключение extra.js
            if (!content.includes('/4nt/extra/extra.js')) {
                content = content.replace(
                    /<\/head>/i,
                    `${EXTRA_SCRIPT}\n</head>`
                );
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
            }

        } catch (err) {
            console.error(`Ошибка при обработке ${filePath}: ${err.message}`);
        }
    }

    walk(dir);
}

processHtml(process.argv[2] || '.');