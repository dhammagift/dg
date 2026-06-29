const CACHE_NAME = 'pwa-fdg-v1';
const urlsToCache = [
    '/ru/index.php',
    '/read.php',
    '/ru/read.php',
    '/index.php',
    '/assets/js/settings.js',
    '/assets/img/icon-192x192.png',
    '/assets/img/icon-512x512.png',
    '/read/index.html',
    '/memo/',
    '/r/index.html',
    '/pm.php',
    '/bipm.php',
    '/assets/js/audioLazyLoad.js',
    '/assets/js/autopali.js',
    '/assets/js/bootstrap.bundle.5.3.1.min.js',
    '/assets/js/standalone-dpd/dpd_deconstructor.js',
    '/assets/js/standalone-dpd/dpd_ebts.js',
    '/assets/js/standalone-dpd/dpd_i2h.js',
    '/assets/js/standalone-dpd/ru/dpd_ebts.js',
    '/assets/texts/sutta_words.txt',
    '/assets/js/copyToClipboard.js',
    '/assets/js/jquery-3.7.0.min.js',
    '/assets/js/jquery-ui.min.js',
    '/assets/js/jquery-ui.js',
    '/assets/js/linksbw.js',
    '/assets/js/linksdpr.js',
    '/assets/js/linksru.js',
    '/assets/js/openDpr.js',
    '/assets/js/loadCssJsMain.js',
    '/assets/js/openBw.js',
    '/assets/js/openFdg.js',
    '/assets/js/openRu.js',
    '/assets/js/opentexts.js',
    '/assets/js/textinfo.js',
    '/assets/js/paliLookup.js',
    '/assets/js/pmjs.js',
    '/assets/js/randPlaceholder.js',
    '/assets/js/setDefaultMode.js',
    '/assets/js/smoothScroll.js',
    '/assets/js/switchView.js',
    '/assets/js/themeswitch.js',
    '/assets/js/tocjs.js',
    '/assets/js/uihelp.js',
    '/assets/js/variantsButton.js',
    '/read/js/common.js',
    '/read/js/voice.js',
    '/read/js/loadAssets.js',
    '/read/js/urlForLbl.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Кэшируем каждый файл индивидуально, чтобы ошибка одного не ломала весь процесс
                return Promise.all(
                    urlsToCache.map((url) => {
                        return cache.add(url).catch((error) => {
                            console.error('Не удалось закэшировать файл:', url, error);
                        });
                    })
                );
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        // Шаг 1: Ищем в кэше, игнорируя "хвосты" вроде ?source=pwa
        caches.match(event.request, { ignoreSearch: true })
            .then((response) => {
                if (response) {
                    return response; // Нашли в кэше — отдаем
                }
                
                // Шаг 2: Если в кэше нет, идем в сеть. 
                return fetch(event.request).catch(() => {
                    // Шаг 3: Если сеть упала (оффлайн) и мы запрашивали HTML-страницу (navigate)
                    if (event.request.mode === 'navigate') {
                        // Выдаем главную страницу как спасательный круг
                        return caches.match('/index.php');
                    }
                });
            })
    );
});