const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // Требует установки: npm install cheerio

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
            const exists = fs.existsSync(linkPath) || 
                           (fs.lstatSync(linkPath, { throwIfNoEntry: false }) !== undefined);

            if (exists) {
                const stat = fs.lstatSync(linkPath);
                if (stat.isSymbolicLink()) {
                    const currentTarget = fs.readlinkSync(linkPath);
                    if (currentTarget === link.target) {
                        return; 
                    }
                }
                fs.rmSync(linkPath, { recursive: true, force: true });
            }
            
            fs.symlinkSync(link.target, linkPath);
            console.log(`Создан симлинк: ${link.name} -> ${link.target}`);
        } catch (err) {
            console.error(`Ошибка работы с симлинком ${link.name}: ${err.message}`);
        }
    });
}

function processHtml(dir) {
    createSymlinks(dir);
    
    const filesToCopy = [
        { src: path.join(dir, '../scripts/4nt/.gitignore'), dest: '.gitignore' }
    ];

    filesToCopy.forEach(file => {
        try {
            if (fs.existsSync(file.src)) {
                fs.copyFileSync(file.src, path.join(dir, file.dest));
                console.log(`Файл ${file.dest} физически скопирован.`);
            }
        } catch (err) {
            console.error(`Ошибка при копировании ${file.dest}: ${err.message}`);
        }
    });

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
                processFile(fullPath, currentDir, dir);
            }
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

function processFile(filePath, currentDir, dir) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let changed = false;

        const relativeToRoot = path.relative(currentDir, dir);
        const isRootIndex = filePath.endsWith('index.html') && relativeToRoot === '';

        // 1. Восстановление ID для ссылок
        $('a.ix-row[href$="/index.html"]').each((i, el) => {
            if (!$(el).attr('id')) {
                const href = $(el).attr('href');
                const folderName = href.split('/')[0];
                if (folderName) {
                    $(el).attr('id', folderName);
                    changed = true;
                }
            }
        });

        // 2. Внедрение скриптов, стилей и метатегов
        let extraPath = path.join(relativeToRoot, 'extra', 'extra.js').replace(/\\/g, '/');
        if (!extraPath.startsWith('.') && !extraPath.startsWith('/')) {
            extraPath = './' + extraPath; 
        }

        if ($('head').length > 0) {
            if ($(`script[src="${extraPath}"]`).length === 0) {
                $('head').append(`
                    <link rel="stylesheet" href="${relativeToRoot || '.'}/assets/css/paliLookup.css">
                    <link rel="stylesheet" href="${relativeToRoot || '.'}/assets/css/extrastyles.css">
                    <link rel="stylesheet" href="${relativeToRoot || '.'}/read/css/voice.css">
                    <link rel="stylesheet" href="${relativeToRoot || '.'}/extra/extra.css">
                    <meta name="description" content="3 National Pali Canon Editions With Line by Line translations">
                    <meta property="og:title" content="4nt DG">
                    <meta property="og:description" content="3 National Pali Canon Editions With Line by Line translations">
                    <meta property="og:type" content="website">
                    <meta name="twitter:card" content="summary">
                    <meta name="twitter:title" content="4nt DG">
                    <meta name="twitter:description" content="3 National Pali Canon Editions With Line by Line translations">
                    <script src="${extraPath}"></script>
                `);
                changed = true;
            }
        }

        // 3. Специфичные изменения для корневого index.html
        if (isRootIndex) {
            $('title').text('4nt DG — Main Pali Editions Line by Line with Translations');
            $('img.logo-full').remove();
            $('h1').text('s.4nt.org Dhamma.Gift edition');
            
            const firstTagline = $('h1 + p.tagline');
            if (firstTagline.length > 0) {
                firstTagline.attr('id', 'dg-edition-text');
                firstTagline.text('Pali Line by Line with Voice and DPD');
            }
            
            $('#dpd-cta-btn').attr('href', 'https://chromewebstore.google.com/detail/dhammagift-search-and-wor/dnnogjdcmhbiobpnkhdbfnfjnjlikabd');
            changed = true;
        }

        // 4. Замена логотипов
        $('img.logo-mini, a.home-logo img, a.ft-logo:not(.ft-right) img').attr('src', `${relativeToRoot || '.'}/assets/img/logo4nt.png`);
        $('a.site-logo img').attr('src', `${relativeToRoot || '.'}/assets/img/headerlogo.png`);
        changed = true;

        // 4.1 Изменение мелких элементов UI для всех страниц
        $('#jumpInput').attr('type', 'search');
        $('#topBtn').css('display', 'none');

        $('style').each((i, el) => {
            const styleText = $(el).html();
            if (styleText && styleText.includes('#1a1612')) {
                $(el).html(styleText.replaceAll('#1a1612', '#000'));
                changed = true;
            }
        });

        // 4.2 Специфичные изменения только для index.html (Сортировка ссылок)
        if (isRootIndex) {
            const colsContainer = $('.cols');
            if (colsContainer.length > 0) {
                const desiredOrder = [
                    'an/index.html',
                    'dn/index.html',
                    'mn/index.html',
                    'sn/index.html',
                    'kn/index.html',
                    'vin/tv/index.html',
                    'major/index.html'
                ];
                
                desiredOrder.forEach(href => {
                    const link = colsContainer.find(`a.col[href="${href}"]`);
                    if (link.length > 0) {
                        colsContainer.append(link);
                    }
                });
            }

            $('a.col[href="major/index.html"]').removeClass('major');
            
            const targetHrefs = ['an/index.html', 'mn/index.html', 'sn/index.html', 'dn/index.html'];
            targetHrefs.forEach(href => {
                $(`a.col[href="${href}"]`).addClass('major');
            });
            changed = true;
        }

        // 5. Обработка языковых классов
        $('.ct, .tr-pali').each((i, el) => {
            const $el = $(el);
            let isPali = false;

            if ($el.hasClass('ct')) {
                const td = $el.closest('td.c');
                if (td.length > 0) {
                    const tdClasses = td.attr('class') || '';
                    const classArray = tdClasses.split(/\s+/);
                    
                    isPali = classArray.some(cls => 
                        cls.startsWith('t-pali') || ['t-san', 't-lzh', 't-zh'].includes(cls)
                    );

                    if (isPali && !$el.hasClass('pli-lang')) {
                        $el.addClass('pli-lang');
                        $el.attr('lang', 'pi');
                        changed = true;
                    } else if (!isPali && !$el.hasClass('eng-lang')) {
                        $el.addClass('eng-lang');
                        changed = true;
                    }
                }
            }

            if ($el.hasClass('tr-pali') && !$el.hasClass('pli-lang')) {
                $el.addClass('pli-lang');
                $el.attr('lang', 'pi');
                changed = true;
            }
        });

        // 6. Удаление лишних языков (Арабский, Китайский, Испанский)
        const scriptsToRemove = ['#tx-arabic-esque', '#tx-chinese-esque', '#tx-spanish-esque'];
        scriptsToRemove.forEach(id => {
            if ($(id).length > 0) {
                $(id).remove();
                changed = true;
            }
        });

        if (changed) {
            let outputHtml = $.html();
            
            // Удаление объектов из переменной ALL_TRANSLATIONS 
            const regexToRemoveTranslations = /\{"key":\s*"(arabic-esque|chinese-esque|spanish-esque)".*?"tip":\s*"[^"]+"\},?/g;
            if (regexToRemoveTranslations.test(outputHtml)) {
                outputHtml = outputHtml.replace(regexToRemoveTranslations, '');
                // Очистка возможных артефактов запятых в массиве JS, если элемент был последним
                outputHtml = outputHtml.replace(/\[\s*,/g, '[').replace(/,\s*\]/g, ']');
            }

            // Быстрая замена эмодзи
            if (outputHtml.includes('🦘')) {
                outputHtml = outputHtml.split('🦘').join('🐇');
            }
            fs.writeFileSync(filePath, outputHtml, 'utf8');
        }

    } catch (err) {
        console.error(`Ошибка при обработке ${filePath}: ${err.message}`);
    }
}

// Запуск скрипта
processHtml(process.argv[2] || '.');
