// 1. САМОВЫЗЫВАЮЩАЯСЯ ФУНКЦИЯ (Стили и защита от мигания)
(function() {
    const savedScale = localStorage.getItem('uiScale') || 100;
    document.documentElement.style.fontSize = savedScale + '%';

    function getModeFromPath() {
        const path = window.location.pathname.split('/').filter(Boolean);
        return path[0] || "read";
    }

    const assetMap = {
        "d": { js: "./js/devanagari.js", css: "./css/thai.css" },
        "memorize": { js: "./js/memorize.js", css: "./css/rus-multi.css" },
        "multi": { js: "./js/multitran-en.js", css: "./css/rus-multi.css" },
        "nr": { js: "./js/megareader.js", css: "./css/index.css" },      
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

    // Сохраняем нужный JS в window, чтобы вызвать его позже, когда DOM будет готов
    window._assetsToLoad = assets.js;

    function revealBody() {
        if (document.body) {
            document.body.style.visibility = "visible";
            document.body.style.opacity = "1";
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                document.body.style.visibility = "visible";
                document.body.style.opacity = "1";
            });
        }
    }

    // Загружаем CSS моментально в <head>
    if (assets.css) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = assets.css;
        css.onload = revealBody;
        css.onerror = revealBody; 
        document.head.appendChild(css);
    } else {
        revealBody();
    }
})();

// 2. ЛОГИКА ЗАГРУЗКИ СКРИПТОВ (Ждем готовности HTML-каркаса)
document.addEventListener('DOMContentLoaded', function() {
    
    // Вот теперь безопасно загружать JS, так как <div id="sutta"> уже точно существует
    if (window._assetsToLoad) {
        const script = document.createElement("script");
        script.src = window._assetsToLoad;
        document.body.appendChild(script);
    }

    // Умный скролл для реверсивных режимов
    if (window.location.pathname.includes("/rev/") || window.location.pathname.includes("/frev/")) { 
        const suttaDiv = document.getElementById("sutta"); 
        
        if (suttaDiv) { 
            suttaDiv.classList.add("right-text"); 
            
            const observer = new MutationObserver((mutations, obs) => {
                if (suttaDiv.innerHTML.trim().length > 0) {
                    obs.disconnect(); 
                    
                    requestAnimationFrame(() => {
                        window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: 'smooth'
                        });
                    });
                }
            });

            observer.observe(suttaDiv, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), 10000); 
        }
    }
});

