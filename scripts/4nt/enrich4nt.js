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

            const newContentIndex = content.replace(pattern, (match, fullTag, folderName) => {
                if (/\sid=/.test(fullTag)) return fullTag;
                return fullTag.slice(0, -1) + ` id="${folderName}">`;
            });
            
            if (newContentIndex !== content) {
                content = newContentIndex;
                changed = true;
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

            // 1. Замена src у <img> с классом logo-mini на logo4nt.png
            const logoMiniRegex = /(<img\b[^>]*class=["'][^"']*?\blogo-mini\b[^"']*?["'][^>]*src=["'])([^"']*)(["'][^>]*>)/gi;
            const newContentMini = content.replace(logoMiniRegex, `$1/assets/img/logo4nt.png$3`);
            if (newContentMini !== content) {
                content = newContentMini;
                changed = true;
            }

            // 2. Замена src у <img> внутри <a> с классом site-logo на headerlogo.png
            const siteLogoRegex = /(<a\b[^>]*class=["'][^"']*?\bsite-logo\b[^"']*?["'][^>]*>[\s\S]*?<img\b[^>]*src=["'])([^"']*)(["'][^>]*>)/gi;
            const newContentSite = content.replace(siteLogoRegex, `$1/assets/img/headerlogo.png$3`);
            if (newContentSite !== content) {
                content = newContentSite;
                changed = true;
            }

            // 3. Замена src у <img> внутри <a> с классом home-logo на logo4nt.png
            const homeLogoRegex = /(<a\b[^>]*class=["'][^"']*?\bhome-logo\b[^"']*?["'][^>]*>[\s\S]*?<img\b[^>]*src=["'])([^"']*)(["'][^>]*>)/gi;
            const newContentHome = content.replace(homeLogoRegex, `$1/assets/img/logo4nt.png$3`);
            if (newContentHome !== content) {
                content = newContentHome;
                changed = true;
            }

            // 4. Замена src у <img> внутри <a> с классом ft-logo (кроме ft-right) на logo4nt.png
            const ftLogoRegex = /(<a\b[^>]*class=["']([^"']*?\bft-logo\b[^"']*?)["'][^>]*>[\s\S]*?<img\b[^>]*src=["'])([^"']*)(["'][^>]*>)/gi;
            const newContentFt = content.replace(ftLogoRegex, (match, p1, classAttr, p3, p4) => {
                // Если в классах нет ft-right, заменяем путь
                if (!classAttr.includes('ft-right')) {
                    return `${p1}/assets/img/logo4nt.png${p4}`;
                }
                return match;
            });
            if (newContentFt !== content) {
                content = newContentFt;
                changed = true;
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
        
        if (fs.existsSync(srcLogo)) {
            fs.copyFileSync(srcLogo, destFavicon);
        }
    } catch (err) {
        console.error(`Ошибка при копировании фавиконки: ${err.message}`);
    }
}


processHtml(process.argv[2] || '.');


