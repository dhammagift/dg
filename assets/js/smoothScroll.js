
/**
 * Умный поиск элемента по ID.
 * Если точный ID не найден (например, 9.12 слился с 9.11), ищет предыдущий.
 */
function findFallbackElement(baseId) {
    // 1. ЖЕЛЕЗНАЯ ЗАЩИТА: Если ID пустой или некорректный, тихо выходим
    if (!baseId) return null;

    // 2. Превращаем в строку (защита от краша при вызове .match)
    const idStr = String(baseId);

    // 3. Сначала ищем точное совпадение
    let el = document.getElementById(idStr);
    if (el) return el;

    // 4. Если не нашли, отрезаем цифры с конца
    const match = idStr.match(/(.*?)(\d+)$/);
    if (!match) return null;

    let prefix = match[1];
    let num = parseInt(match[2], 10);

    // 5. Проверяем предыдущий ID (шаг назад)
    if (num - 1 >= 0) {
        return document.getElementById(prefix + (num - 1));
    }
    
    return null;
}


/**
 * Подсвечивает элемент по его ID.
 * Сначала активирует TTS, затем запускает анимацию.
 * Использует безопасный метод наложения (Overlay), чтобы не ломать структуру DOM.
 * @param {string} elementId - ID элемента для подсветки
 */
function highlightAllById(elementId) {
    const element = findFallbackElement(elementId);
    if (!element) {
        console.log(`[Highlight] Элемент с ID "${elementId}" (или его сосед) не найден.`);
        return;
    }

    // --- 1. СНАЧАЛА ВКЛЮЧАЕМ TTS (UX ПРИОРИТЕТ) ---
    // Это сразу добавит класс .active-word и покажет кнопку Play
    if (typeof window.activateSegmentForTTS === 'function') {
        // Если это контейнер строки, пытаемся найти внутри языковой блок, 
        // чтобы кнопка Play встала красиво.
        if (element.matches('.pli-lang, .rus-lang, .eng-lang')) {
             window.activateSegmentForTTS(element);
        } else {
            const childLang = element.querySelector('.pli-lang, .rus-lang, .eng-lang');
            window.activateSegmentForTTS(childLang || element);
        }
    } else {
        element.classList.add('active-word');
    }

    // --- 2. ЗАПУСКАЕМ АНИМАЦИЮ (МИГАНИЕ) ПОВЕРХ ---
    
    // Сохраняем позиционирование, чтобы absolute overlay работал корректно
    const originalPosition = element.style.position;
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }

    // Создаем слой-накладку (Overlay)
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none'; // Пропускаем клики сквозь подсветку
    overlay.style.zIndex = '10'; // Поверх текста
    overlay.style.borderRadius = getComputedStyle(element).borderRadius; // Копируем скругление
    overlay.style.transition = 'background-color 0.45s ease-in-out';
    overlay.style.backgroundColor = 'transparent';

    // Добавляем накладку внутрь элемента
    element.appendChild(overlay);

    let blinkCount = 0;
    const maxBlinks = 3; 
    const intervalDuration = 450;

    // Запускаем цикл мигания на Overlay
    const blinkInterval = setInterval(() => {
        // Мигаем бирюзовым
        overlay.style.backgroundColor = blinkCount % 2 === 0 
            ? 'rgba(26, 188, 156, 0.25)' // Бирюзовый, полупрозрачный
            : 'transparent';
        
        blinkCount++;

        // Остановка
        if (blinkCount >= maxBlinks * 2) { 
            clearInterval(blinkInterval);
            
            // Даем доиграть последнюю анимацию затухания
            setTimeout(() => {
                // Удаляем накладку
                if (overlay.parentNode === element) {
                    element.removeChild(overlay);
                }
                
                // Восстанавливаем original position (если меняли)
                if (!originalPosition) {
                    element.style.removeProperty('position');
                } else {
                    element.style.position = originalPosition;
                }
            }, intervalDuration);
        }
    }, intervalDuration);
}

// Функция для выделения элемента по ID (упрощенная)
function highlightById(elementId) {
    const element = findFallbackElement(elementId);
    if (!element) return;

    // --- 1. СНАЧАЛА TTS ---
    if (typeof window.activateSegmentForTTS === 'function') {
        window.activateSegmentForTTS(element);
    } else {
        element.classList.add('active-word');
    }

    // --- 2. ЗАТЕМ АНИМАЦИЯ (Box Shadow) ---
    const originalTransition = element.style.transition;
    const originalBoxShadow = element.style.boxShadow;
    const originalBorderRadius = element.style.borderRadius;

    // Настройки анимации
    element.style.borderRadius = '6px';
    element.style.transition = 'box-shadow 0.3s ease-in-out';
    
    let blinkCount = 0;
    const maxBlinks = 3; 
    let isWide = false;

    const blinkInterval = setInterval(function() {
        // Пульсация рамкой
        element.style.boxShadow = isWide ? '0 0 0 2px grey' : '0 0 0 5px rgba(128,128,128, 0.5)';
        isWide = !isWide;
        blinkCount++;

        if (blinkCount >= maxBlinks * 2) {
            clearInterval(blinkInterval);
            
            setTimeout(() => {
                // Чистим стили анимации
                element.style.removeProperty('box-shadow');
                element.style.removeProperty('transition');
                element.style.removeProperty('border-radius');
                
                // Если были старые стили - вернем их
                if (originalBoxShadow) element.style.boxShadow = originalBoxShadow;
                if (originalTransition) element.style.transition = originalTransition;
                if (originalBorderRadius) element.style.borderRadius = originalBorderRadius;
            }, 300);
        }
    }, 400);
}

function highlightMultipleById(ids) {
    ids.forEach(highlightById);
}

// Умный скролл при загрузке/изменении хеша
function intelligentScrollToHash() {
    const hash = window.location.hash;
    if (!hash) return; 

    const hashContent = hash.substring(1);
    
    // Проверяем параметр из URL
    const urlParams = new URLSearchParams(window.location.search);
    const isInstant = urlParams.get('scroll') === 'instant' || hashContent.includes('scroll=instant');

    // Очищаем ID от параметров
    const cleanId = hashContent.split('&')[0].split('?')[0];

    // Функция для жесткого (мгновенного) прыжка, обходящая CSS
    function executeScroll(y) {
        if (isInstant) {
            const html = document.documentElement;
            const prevBehavior = html.style.scrollBehavior;
            
            // Жестко отключаем плавность в CSS
            html.style.scrollBehavior = 'auto'; 
            
            // Делаем мгновенный прыжок
            window.scrollTo({ top: y, behavior: 'auto' });
            
            // Возвращаем настройки CSS как было (через requestAnimationFrame, чтобы браузер успел отрисовать прыжок)
            requestAnimationFrame(() => {
                html.style.scrollBehavior = prevBehavior;
            });
        } else {
            // Обычный плавный скролл
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    // Сценарий 1: Список ID (запятая)
    if (cleanId.includes(',')) {
        const ids = cleanId.split(','); 
        highlightMultipleById(ids); 
        
        const firstElement = findFallbackElement(ids[0]);
        if (firstElement) {
            const yOffset = -window.innerHeight * 0.20; 
            const y = firstElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            executeScroll(y);
        }

    // Сценарий 2: Одиночный ID
    } else {
        const elementId = cleanId;
        
        const checkInterval = 250; 
        const totalWaitTime = 10000; 
        let timeElapsed = 0;
        
        const pollingInterval = setInterval(() => {
            const element = findFallbackElement(elementId);

            // 1. Элемент найден
            if (element) {
                clearInterval(pollingInterval); 
                
                const yOffset = -window.innerHeight * 0.20; 
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                
                // Вызываем нашу бронебойную функцию скролла
                executeScroll(y);
                
                highlightAllById(elementId); 
                return;
            }

            // 2. Ждем дальше
            timeElapsed += checkInterval;
            
            // 3. Тайм-аут
            if (timeElapsed >= totalWaitTime) {
                console.log(`[Scroll] Элемент #${elementId} не найден за ${totalWaitTime / 1000} секунд.`);
                clearInterval(pollingInterval); 
            }
        }, checkInterval);
    }
}


// Запуски
if (!localStorage.getItem('exactScrollAnchor')) {
    window.addEventListener('DOMContentLoaded', intelligentScrollToHash);
    window.addEventListener('hashchange', intelligentScrollToHash);
}

// Кнопка "Наверх"
document.addEventListener('DOMContentLoaded', function() {
    var scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.id = 'scrollToTopBtn';
    scrollToTopBtn.className = 'btn btn-secondary rounded-pill hide-button';
    scrollToTopBtn.style.display = 'none';

    var img = document.createElement('img');
    img.id = 'arrowImg';
    img.alt = 'To top';
    img.src = '/assets/svg/arrow-up-dark.svg';
    scrollToTopBtn.appendChild(img);
    
    document.body.appendChild(scrollToTopBtn);

    function checkScrollPosition() {
        if (window.scrollY > 600) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    }

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition);

    scrollToTopBtn.addEventListener('click', function(event) {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

/**
 * Восстанавливает точную визуальную позицию текста.
 * Алгоритм:
 * 1. Ждем появления элемента по ID.
 * 2. Считаем его текущую абсолютную позицию в документе.
 * 3. Отнимаем сохраненный offset (смещение от верха экрана).
 * Результат: Элемент встает ровно на то же место экрана, где был.
 */

// === АВТОСОХРАНЕНИЕ ПРОГРЕССА ЧТЕНИЯ (DEBOUNCE) ===
let scrollSaveTimeout;
const MAX_HISTORY_ITEMS = 20; // Лимит: храним позицию для последних 20 сутт

function saveReadingProgress() {
    // Получаем текущий слаг из URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('q');
    if (!slug) return;

    const suttaContainer = document.getElementById('sutta');
    if (!suttaContainer) return;

    // Ищем все элементы с ID внутри контейнера текста
    const elements = suttaContainer.querySelectorAll('[id]');
    if (elements.length === 0) return;

    const eyeLevel = 120; // Точка фокуса от верха экрана
    let bestElement = null;
    let minDistance = Infinity;

    for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - eyeLevel);

        if (distance < minDistance) {
            minDistance = distance;
            bestElement = el;
        }
    }

    if (bestElement) {
        let progressData = {};
        try {
            const stored = localStorage.getItem('suttaProgress');
            if (stored) progressData = JSON.parse(stored);
        } catch (e) {
            progressData = {};
        }

        // Записываем текущую позицию
        progressData[slug] = {
            id: bestElement.id,
            offset: bestElement.getBoundingClientRect().top,
            time: Date.now() // Метка времени для удаления старых записей
        };

        // Очистка старых записей, если превышен лимит
        const keys = Object.keys(progressData);
        if (keys.length > MAX_HISTORY_ITEMS) {
            keys.sort((a, b) => progressData[b].time - progressData[a].time); // От новых к старым
            const newProgressData = {};
            for (let i = 0; i < MAX_HISTORY_ITEMS; i++) {
                newProgressData[keys[i]] = progressData[keys[i]];
            }
            progressData = newProgressData;
        }

        localStorage.setItem('suttaProgress', JSON.stringify(progressData));
    }
}

// Слушаем скролл с задержкой 1 сек (чтобы не перегружать браузер во время прокрутки)
window.addEventListener('scroll', () => {
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(saveReadingProgress, 1000); 
}, { passive: true });


// === ОБНОВЛЕННАЯ ФУНКЦИЯ ВОССТАНОВЛЕНИЯ ПОЗИЦИИ ===
(function restoreExactPositionJump() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    let anchor = null;

    // 1. Высший приоритет: Точный якорь от настроек (одноразовый)
    const rawSettingsData = localStorage.getItem('exactScrollAnchor');
    if (rawSettingsData) {
        try {
            anchor = JSON.parse(rawSettingsData);
            localStorage.removeItem('exactScrollAnchor'); 
        } catch(e) {}
    }

    // 2. Второй приоритет: Автосохраненный прогресс
    // Восстанавливаем, ТОЛЬКО если в URL нет прямого хэша (мы не перебиваем прямые ссылки на цитаты)
    if (!anchor && !window.location.hash) {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('q');
        if (slug) {
            try {
                const progressData = JSON.parse(localStorage.getItem('suttaProgress') || '{}');
                if (progressData[slug]) {
                    anchor = progressData[slug];
                }
            } catch(e) {}
        }
    }

    // Если ничего не нашли, выходим
    if (!anchor || !anchor.id) {
        html.style.scrollBehavior = prevScrollBehavior;
        return;
    }

    const maxWait = 7000;
    const checkInterval = 50;
    let elapsed = 0;

    const intervalId = setInterval(() => {
        const element = findFallbackElement(anchor.id);

        if (element) {
            clearInterval(intervalId);

            // Абсолютная позиция
            const absoluteY = window.pageYOffset + element.getBoundingClientRect().top;
            const targetY = absoluteY - anchor.offset;

            // Жесткий прыжок
            window.scrollTo(0, targetY);

            // Контрольный добив
            requestAnimationFrame(() => {
                const correctedY = window.pageYOffset + element.getBoundingClientRect().top - anchor.offset;
                window.scrollTo(0, correctedY);
                html.style.scrollBehavior = prevScrollBehavior;
            });
        }

        elapsed += checkInterval;
        if (elapsed >= maxWait) {
            clearInterval(intervalId);
            html.style.scrollBehavior = prevScrollBehavior;
        }
    }, checkInterval);
})();

