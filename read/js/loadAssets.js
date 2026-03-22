// 1. САМОВЫЗЫВАЮЩАЯСЯ ФУНКЦИЯ (выполняется мгновенно при чтении <head>)
(function() {
    // Применяем масштаб сразу к <html>
    const savedScale = localStorage.getItem('uiScale') || 100;
    document.documentElement.style.fontSize = savedScale + '%';

    function getModeFromPath() {
        const path = window.location.pathname.split('/').filter(Boolean);
        return path[0] || "read";
    }

    const assetMap = {
        "d": { js: "./js/devanagari.js", css: "./css/thai.css" },
        "memorize": { js: "./js/memorize.js", css: "./css/rus-multi.css" },
        "mt": { js: "./js/multitran.js", css: "./css/rus-multi.css" },      
        "ml": { js: "./js/multilang.js", css: "./css/rus-multi.css" },      
        "rev": { js: "./js/multilangrev.js", css: "./css/rus-multi.css" },      
        "frev": { js: "./js/multilangfullrev.js", css: "./css/rus-multi.css" },      
        "mlth": { js: "./js/multilang-th.js", css: "./css/thai-multi.css" },
        "r": { js: "./js/reader-rus-translations.js", css: "./css/index.css" },
        "th": { js: "./js/reader-th.js", css: "./css/thai.css" },
        "b": { js: "./js/indexBB.js", css: "./css/index.css" },
        "read": { js: "./js/index.js", css: "./css/index.css" }
    };

    const mode = getModeFromPath();
    const assets = assetMap[mode] || assetMap["read"];

    // Функция снятия "завесы" (показ страницы)
    function revealBody() {
        if (document.body) {
            document.body.style.visibility = "visible";
            document.body.style.opacity = "1";
        } else {
            // Если body еще не распарсился, ждем DOMContentLoaded
            window.addEventListener('DOMContentLoaded', () => {
                document.body.style.visibility = "visible";
                document.body.style.opacity = "1";
            });
        }
    }

    // Загружаем CSS и вешаем слушатель на его готовность
    if (assets.css) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = assets.css;
        
        // Как только стили загрузились - показываем контент
        css.onload = revealBody;
        css.onerror = revealBody; // Защита от вечного скрытия при ошибке сети
        
        document.head.appendChild(css);
    } else {
        revealBody();
    }

    // JS-файлы подгружаем асинхронно (defer), чтобы они не тормозили отрисовку
    if (assets.js) {
        const script = document.createElement("script");
        script.src = assets.js;
        script.defer = true;
        document.head.appendChild(script);
    }
})();

// 2. ЛОГИКА СКРОЛЛА (ждет готовности DOM)
document.addEventListener('DOMContentLoaded', function() {
    
    // Умный скролл для реверсивных режимов (когда текст грузится целиком)
    if (window.location.pathname.includes("/rev/") || window.location.pathname.includes("/frev/")) { 
        const suttaDiv = document.getElementById("sutta"); 
        
        if (suttaDiv) { 
            suttaDiv.classList.add("right-text"); 
            
            const observer = new MutationObserver((mutations, obs) => {
                // Как только внутри контейнера появился контент
                if (suttaDiv.innerHTML.trim().length > 0) {
                    obs.disconnect(); // Сразу выключаем наблюдателя
                    
                    // requestAnimationFrame ждет ровно 1 кадр, чтобы браузер 
                    // отрисует текст и посчитал scrollHeight, после чего прыгаем
                    requestAnimationFrame(() => {
                        window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: 'smooth'
                        });
                    });
                }
            });

            // Начинаем следить за добавлением текста
            observer.observe(suttaDiv, { childList: true, subtree: true });
            
            // Предохранитель (10 секунд на случай, если сервер не ответил)
            setTimeout(() => observer.disconnect(), 10000); 
        }
    }
});
