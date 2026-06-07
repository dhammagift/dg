/* openDpr.js - Simple DPR Link Resolver */

const DPR_BASE_URL = "https://www.digitalpalireader.online/_dprhtml/index.html?loc=";
let dprCacheMap = null;

// Инициализация при загрузке (если нужно обработать статические ссылки .dprLink в HTML)
document.addEventListener("DOMContentLoaded", function() {
    initDprMap();
    
    const dprLinks = document.querySelectorAll('.dprLink');
    dprLinks.forEach(link => {
        const slug = link.getAttribute('data-slug');
        const url = window.getDprUrl(slug);
        
        if (url) {
            link.href = url;
            link.target = "_blank";
        } else {
            link.style.display = 'none';
        }
    });
});

// Глобальная функция для получения URL
window.getDprUrl = function(slug) {
    initDprMap();
    
    if (!dprCacheMap || !slug) return null;

    // Прямой поиск ключа
    // Предполагается, что slugs в linksdpr.js совпадают с теми, что используются в сайте (напр. "dn1", "sn56.11")
    const loc = dprCacheMap.get(slug);
    
    if (loc) {
        return DPR_BASE_URL + loc;
    }
    
    return null;
};

// Внутренняя функция инициализации Map
function initDprMap() {
    if (dprCacheMap) return;

    if (typeof dprLinksData !== 'undefined') {
        dprCacheMap = new Map(dprLinksData);
    } else {
        console.warn("dprLinksData не найден. Убедитесь, что linksdpr.js загружен перед openDpr.js");
    }
}