const fs = require('fs');
const path = require('path');

function createSymlinks(dir) {
    const links = [
        { target: '../scripts/4nt/extra', name: 'extra' },
        { target: '../scripts/4nt/update4nt.sh', name: 'update4nt.sh' },
        { target: '../assets', name: 'assets' },
        { target: '../read', name: 'read' }
    ];
    
    links.forEach(link => {
        const linkPath = path.join(dir, link.name);
        try {
            // Проверяем существование (включая битые симлинки)
            const exists = fs.existsSync(linkPath) || 
                           (fs.lstatSync(linkPath, { throwIfNoEntry: false }) !== undefined);

            if (exists) {
                const stat = fs.lstatSync(linkPath);
                if (stat.isSymbolicLink()) {
                    const currentTarget = fs.readlinkSync(linkPath);
                    if (currentTarget === link.target) {
                        return; // Симлинк уже существует и правильный
                    }
                }
                // Удаляем, если это не симлинк или путь отличается
                fs.rmSync(linkPath, { recursive: true, force: true });
            }
            
            // Создаем новый симлинк
            fs.symlinkSync(link.target, linkPath);
            console.log(`Создан симлинк: ${link.name} -> ${link.target}`);
        } catch (err) {
            console.error(`Ошибка работы с симлинком ${link.name}: ${err.message}`);
        }
    });
}

function processHtml(dir) {
    // Сначала создаем симлинки
    createSymlinks(dir);
    
    const filesToCopy = [
        { src: path.join(dir, '../scripts/4nt/README.md'), dest: 'README.md' },
        { src: path.join(dir, '../scripts/4nt/.gitignore'), dest: '.gitignore' }
    ];

    filesToCopy.forEach(file => {
        try {
            fs.copyFileSync(file.src, path.join(dir, file.dest));
            console.log(`Файл ${file.dest} физически скопирован.`);
        } catch (err) {
            console.error(`Ошибка при копировании ${file.dest}: ${err.message}`);
        }
    });



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
                processFile(fullPath, currentDir);
            }
        }
    }

    function processFile(filePath, currentDir) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            const newContent = content.replace(pattern, (match, fullTag, folderName) => {
                if (/\sid=/.test(fullTag)) return fullTag;
                changed = true;
                return fullTag.slice(0, -1) + ` id="${folderName}">`;
            });
            
            if (newContent !== content) {
                content = newContent;
            }

            const relativeToRoot = path.relative(currentDir, dir);
            let extraPath = path.join(relativeToRoot, 'extra', 'extra.js').replace(/\\/g, '/');
            
            if (!extraPath.startsWith('.') && !extraPath.startsWith('/')) {
                extraPath = './' + extraPath; 
            }
            const extraScript = `<script src="${extraPath}"></script>`;

            if (!content.includes('extra.js"')) {
                content = content.replace(
                    /<\/head>/i,
                    `${extraScript}\n</head>`
                );
                changed = true;
            }

            if (content.includes('debabel-logo-1k.jpg')) {
                content = content.split('debabel-logo-1k.jpg').join('/assets/img/headerlogo.png');
                changed = true;
            }

            const absoluteFilePath = path.resolve(filePath);
            const absoluteRootIndex = path.resolve(dir, 'index.html');
            if (absoluteFilePath === absoluteRootIndex) {
                const logoMiniRegex = /(<img\b[^>]*class="logo-mini"[^>]*src=")[^"]*("[^>]*>)/g;
                if (logoMiniRegex.test(content)) {
                    content = content.replace(logoMiniRegex, `$1/assets/img/logo4nt.png$2`);
                    changed = true;
                }
            }
            
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

    walk(dir);
    
    try {
        const srcLogo = path.join(dir, 'headerlogo.png');
        const destFavicon = path.join(dir, 'favicon.png');
        
        // Копируем фавиконку только если источник существует
        if (fs.existsSync(srcLogo)) {
            fs.copyFileSync(srcLogo, destFavicon);
        }
    } catch (err) {
        console.error(`Ошибка при копировании фавиконки: ${err.message}`);
    }
}

processHtml(process.argv[2] || '.');


