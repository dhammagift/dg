
/**
 * Подсвечивает элемент по его ID.
 * Сначала активирует TTS, затем запускает анимацию.
 * Использует безопасный метод наложения (Overlay), чтобы не ломать структуру DOM.
 * @param {string} elementId - ID элемента для подсветки
 */
function highlightAllById(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.log(`[Highlight] Элемент с ID "${elementId}" не найден.`);
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
    const element = document.getElementById(elementId);
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

    // Сценарий 1: Список ID (запятая)
    if (hashContent.includes(',')) {
        const ids = hashContent.split(','); 
        highlightMultipleById(ids); 
        
        const firstElement = document.getElementById(ids[0]);
if (firstElement) {
    const yOffset = -window.innerHeight * 0.20; // Смещение на 1/4 экрана вверх
    const y = firstElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
}


    // Сценарий 2: Одиночный ID (Красивая анимация)
    } else {
        const elementId = hashContent;
        
        const checkInterval = 250; 
        const totalWaitTime = 10000; 
        let timeElapsed = 0;
        
        const pollingInterval = setInterval(() => {
            const element = document.getElementById(elementId);

            // 1. Элемент найден
if (element) {
    clearInterval(pollingInterval); 
    
    // Вместо element.scrollIntoView...
    const yOffset = -window.innerHeight * 0.20; 
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    
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

(function restoreExactPositionJump() {
    // 1. Жёстко отключаем браузерное восстановление
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // 2. Принудительно отключаем smooth-scroll из CSS
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const rawData = localStorage.getItem('exactScrollAnchor');
    if (!rawData) {
        html.style.scrollBehavior = prevScrollBehavior;
        return;
    }

    const anchor = JSON.parse(rawData);
    localStorage.removeItem('exactScrollAnchor'); // одноразово

    const maxWait = 7000;
    const checkInterval = 50;
    let elapsed = 0;

    const intervalId = setInterval(() => {
        const element = document.getElementById(anchor.id);

        if (element) {
            clearInterval(intervalId);

            // Абсолютная позиция элемента в документе
            const absoluteY =
                window.pageYOffset + element.getBoundingClientRect().top;

            const targetY = absoluteY - anchor.offset;

            // 3. МГНОВЕННЫЙ ПРЫЖОК (самый надёжный вариант)
            window.scrollTo(0, targetY);

            // 4. Контрольный добив после layout-перерисовки
            requestAnimationFrame(() => {
                const correctedY =
                    window.pageYOffset + element.getBoundingClientRect().top - anchor.offset;
                window.scrollTo(0, correctedY);

                // возвращаем scroll-behavior
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
