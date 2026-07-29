const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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
            fs.copyFileSync(file.src, path.join(dir, file.dest));
            console.log(`Файл ${file.dest} физически скопирован.`);
        } catch (err) {
            console.error(`Ошибка при копировании ${file.dest}: ${err.message}`);
        }
    });

    let processedCount = 0;

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
        processedCount++;
        if (processedCount % 100 === 0) {
            console.log(`В процессе... Обработано HTML файлов: ${processedCount}`);
        }

        try {
            let rawContent = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(rawContent, { decodeEntities: false });
            let changed = false;

            // 1. ix-row атрибут id
            $('a.ix-row').each((_, el) => {
                const $el = $(el);
                if (!$el.attr('id')) {
                    const href = $el.attr('href') || '';
                    const match = href.match(/([^/]+)\/index\.html/);
                    if (match) {
                        $el.attr('id', match[1]);
                        changed = true;
                    }
                }
            });

            // 2. Внедрение extra.js
            const relativeToRoot = path.relative(currentDir, dir);
            let extraPath = path.join(relativeToRoot, 'extra', 'extra.js').replace(/\\/g, '/');
            if (!extraPath.startsWith('.') && !extraPath.startsWith('/')) {
                extraPath = './' + extraPath; 
            }
            if ($(`script[src="${extraPath}"]`).length === 0) {
                $('head').append(`\n<script src="${extraPath}"></script>\n`);
                changed = true;
            }

            // 3. Динамическое удаление -esque языков, кроме bodhi и russian
            $('script[id^="tx-"], script[id^="nt-"]').each((_, el) => {
                const id = $(el).attr('id');
                if (id && id.endsWith('-esque') && !id.includes('bodhi-esque') && !id.includes('russian-esque')) {
                    $(el).remove();
                    changed = true;
                }
            });

            // 4. Обновление JS: ALL_TRANSLATIONS и генерация HTML с языковыми классами
            $('script').each((_, el) => {
                let scriptContent = $(el).html();
                if (!scriptContent) return;
                let scriptChanged = false;

                if (scriptContent.includes('ALL_TRANSLATIONS')) {
                    try {
                        const transMatch = scriptContent.match(/const ALL_TRANSLATIONS = (\[.*?\]);/);
                        if (transMatch) {
                            let translations = JSON.parse(transMatch[1]);
                            translations = translations.filter(t => {
                                if (t.key.endsWith('-esque')) {
                                    return t.key === 'bodhi-esque' || t.key === 'russian-esque';
                                }
                                return true;
                            });
                            translations.forEach(t => {
                                if (t.key === 'pali') {
                                    t.label = "Pali Mahasangiti";
                                    t.tip = "Root Pāli (Mahāsaṅgīti edition)";
                                } else if (t.label && t.label.includes('IAST')) {
                                    t.label = t.label.replace(/\s*\(IAST\)/gi, '').trim();
                                }
                                if (t.key === 'ru_dhammagift') {
                                    t.group = "Russian";
                                }
                            });
                            scriptContent = scriptContent.replace(transMatch[0], `const ALL_TRANSLATIONS = ${JSON.stringify(translations)};`);
                        }
                        
                        scriptContent = scriptContent.replace(/const CAT_LABELS=\{.*?\};/, match => {
                            if (!match.includes('rus')) return match.replace(/};$/, ",rus:'Rus'};");
                            return match;
                        });
                        scriptChanged = true;
                    } catch (e) {
                        console.error(`Ошибка парсинга ALL_TRANSLATIONS в ${filePath}`);
                    }
                }

                // ПАТЧИМ ФУНКЦИЮ buildLeafTable ДЛЯ ВСТАВКИ КЛАССОВ НА ЛЕТУ
                if (scriptContent.includes("const ct=mk('span','ct grw');")) {
                    scriptContent = scriptContent.replace(
                        /const ct=mk\('span','ct grw'\);/g,
                        `let langCls = /(pali|san|lzh|zh)/.test(key) ? ' pli-lang' : ' eng-lang';
                        const ct=mk('span','ct grw' + langCls);
                        if (langCls.includes('pli-lang')) ct.setAttribute('lang', 'pi');`
                    );
                    scriptChanged = true;
                }

                // ПАТЧИМ ФУНКЦИЮ fillLeafRowsTOC ДЛЯ БОКОВОГО МЕНЮ
                if (scriptContent.includes("const snippet=mk('span','tr-pali');")) {
                    scriptContent = scriptContent.replace(
                        /const snippet=mk\('span','tr-pali'\);/g,
                        `const snippet=mk('span','tr-pali pli-lang');
                        snippet.setAttribute('lang', 'pi');`
                    );
                    scriptChanged = true;
                }

                if (scriptChanged) {
                    $(el).html(scriptContent);
                    changed = true;
                }
            });

            // 5. SEO Метатеги и стили
            if ($('meta[property="og:title"]').length === 0) {
                $('head').append(`\n<meta name="description" content="3 National Pali Canon Editions With Line by Line translations">\n<meta property="og:title" content="4nt DG">\n<meta property="og:description" content="3 National Pali Canon Editions With Line by Line translations">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="4nt DG">\n<meta name="twitter:description" content="3 National Pali Canon Editions With Line by Line translations">\n<style>\n    img[src*="headerlogo.png"] { background-color: #ede5d4; padding: 4px; border-radius: 10px; border: 1px solid var(--bar-border); }\n    .home-logo img, img.home-logo { width: 16px; }\n</style>`);
                changed = true;
            }

            $('style').each((_, el) => {
                let text = $(el).html();
                if (text && text.includes('#1a1612')) {
                    $(el).html(text.replaceAll('#1a1612', '#000'));
                    changed = true;
                }
            });

            // 6. Инпуты и скрытие кнопок
            if ($('#jumpInput').attr('type') !== 'search') {
                $('#jumpInput').attr('type', 'search');
                changed = true;
            }
            if ($('#topBtn').css('display') !== 'none') {
                $('#topBtn').css('display', 'none');
                changed = true;
            }

            // 7. Логика для главной страницы
            if (filePath.endsWith('index.html') && currentDir === dir) {
                $('title').text('4nt DG — Main Pali Editions Line by Line with Translations');
                $('img.logo-full').remove();
                $('#dpd-cta-btn').attr('href', 'https://chromewebstore.google.com/detail/dhammagift-search-and-wor/dnnogjdcmhbiobpnkhdbfnfjnjlikabd');
                $('h1').text('s.4nt.org Dhamma.Gift edition');
                $('p.tagline').first().attr('id', 'dg-edition-text').text('Pali Line by Line with Voice and DPD');

                $('a.col.major[href="major/index.html"]').removeClass('major');
                $('a.col[href="an/index.html"], a.col[href="mn/index.html"], a.col[href="sn/index.html"], a.col[href="dn/index.html"]').addClass('major');

                const desiredOrder = ['an/index.html', 'dn/index.html', 'mn/index.html', 'sn/index.html', 'kn/index.html', 'vin/tv/index.html', 'major/index.html'];
                const $cols = $('.cols');
                if ($cols.length > 0) {
                    const existingLinks = $cols.find('a').toArray();
                    $cols.empty();
                    desiredOrder.forEach(href => {
                        const link = existingLinks.find(l => $(l).attr('href') === href);
                        if (link) $cols.append(link);
                    });
                    existingLinks.forEach(l => {
                        if (!desiredOrder.includes($(l).attr('href'))) $cols.append(l);
                    });
                }
                changed = true;
            }

            // 8. Замена логотипов
            $('img.logo-mini').attr('src', '/assets/img/logo4nt.png');
            $('a.site-logo img').attr('src', '/assets/img/headerlogo.png');
            $('a.home-logo img').attr('src', '/assets/img/logo4nt.png');
            $('a.ft-logo:not(.ft-right) img').attr('src', '/assets/img/logo4nt.png');

            // 9. Добавление новых кнопок в DOM
            const hasRu = rawContent.includes('ru_dhammagift');
            const readerPath = hasRu ? '/r/' : '/read/';
            const hashSymbol = hasRu ? '#' : '';
            
            let slug = path.basename(filePath, '.html');
            if (slug === 'index') {
                slug = path.basename(currentDir);
                if (slug === path.basename(dir)) slug = '';
            }
            let cleanPath = path.relative(dir, currentDir).replace(/\\/g, '/');

            if ($('#voiceLinkBtn').length === 0 && ($('#settingsWrap').length > 0 || $('#siteSettingsWrap').length > 0)) {
                const buttonsHtml = `
                <a class="voice-link icon-btn" id="voiceLinkBtn" data-slug="${slug}" href="javascript:void(0)" title="Listen (TTS)">🔊</a>
                <a class="icon-btn" id="viewModeBtn" onclick="window.toggleViewMode()" href="javascript:void(0)" title="View: Columns / Scroll">📜</a>
                <a class="icon-btn" id="fdg-button" href="https://f.dhamma.gift${readerPath}?q=${slug}${hashSymbol}" title="Search Suttas (Ctrl+1)" rel="noreferrer">
                    <img style="width:18px; height:18px; display:block;" src="/assets/img/gray-white.png" alt="Search">
                </a>
                <a class="icon-btn toggle-dict-btn" title="Popup Dictionary (Alt+A)">
                    <img style="width:18px; height:18px; display:block;" src="/assets/svg/comment.svg" alt="Dictionary">
                </a>`;
                $('#settingsWrap, #siteSettingsWrap').before(buttonsHtml);
                changed = true;
            }

            if ($('#dotsBtn').length === 0 && $('#segBtn').length > 0) {
                $('#segBtn').closest('.set-row').before(`
                    <div class="set-row">
                        <span class="set-lbl" title="Toggle compound dots (·) and punctuation">Toggle Pāli punctuation</span>
                        <button class="icon-btn" id="dotsBtn" onclick="window.toggleDots()" title="Toggle Pāli punctuation">Off</button>
                    </div>
                    <div class="set-row">
                        <span class="set-lbl" title="Select dictionary">Dictionary</span>
                        <select id="dict-select-4nt" style="background: var(--bg); color: var(--text); border: 1px solid var(--bar-border); border-radius: 4px; padding: 2px 4px; font-family: sans-serif; font-size: 0.82rem; outline: none; cursor: pointer;">
                            <option value="standalone">DPD Built-in</option>
                            <option value="dpdfull">DPD Online Popup</option>
                            <option value="newwindow">DPD Online New Window</option>
                            <option value="machinetranslation">DharmaMitra.org</option>
                            <option value="searchonly">Search Only</option>
                            <option value="dicttango">DictTango Android</option>
                            <option value="mdict">Mdict IOS</option>
                            <option value="goldenpc">GoldenDict Desktop</option>
                            <option value="standaloneru">DPD Встроенный (Ru)</option>
                            <option value="dpdfullru">DPD Онлайн Попап (Ru)</option>
                            <option value="newwindowru">DPD Онлайн Новое Окно (Ru)</option>
                        </select>
                    </div>
                `);
                changed = true;
            }

            if ($('#orig-site-btn').length === 0 && $('#morePop').length > 0) {
                const origHref = `javascript:void(0)" onclick="this.href='https://s.4nt.org/${cleanPath ? cleanPath + '/' : ''}'+location.search+location.hash`;
                $('#morePop').append(`
                    <div class="set-row">
                        <span class="set-lbl" title="Open this page on the original s.4nt.org site">Original site</span>
                        <a id="orig-site-btn" class="icon-btn" href="${origHref}" target="_blank" title="Original s.4nt.org site">🌐</a>
                    </div>
                `);
                changed = true;
            }

            let htmlOut = $.html();
            if (htmlOut.includes('🦘')) {
                htmlOut = htmlOut.replace(/🦘/g, '🐇');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(filePath, htmlOut, 'utf8');
            }

        } catch (err) {
            console.error(`Ошибка при обработке ${filePath}: ${err.message}`);
        }
    }

    console.log(`Начинаю обход директорий и обработку файлов в: ${dir}`);
    walk(dir);
    console.log(`Обход завершен. Всего обработано HTML файлов: ${processedCount}`);
    
    try {
        const srcLogo = path.join(dir, 'headerlogo.png');
        const destFavicon = path.join(dir, 'favicon.png');
        if (fs.existsSync(srcLogo)) fs.copyFileSync(srcLogo, destFavicon);
    } catch (err) {
        console.error(`Ошибка при копировании фавиконки: ${err.message}`);
    }
}

processHtml(process.argv[2] || '.');
