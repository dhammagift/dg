const ScrollManager = {
    config: {
        eyeLevel: 120, // Линия глаз для сохранения прогресса
        maxWait: 8000, // Ждем загрузки AJAX до 8 секунд
    },

    scrollSaveTimeout: null,

    init() {
        this.setupScrollToTop();
        
        // Автосохранение прогресса (debounced)
        window.addEventListener('scroll', () => {
            clearTimeout(this.scrollSaveTimeout);
            this.scrollSaveTimeout = setTimeout(() => this.saveReadingProgress(), 1000); 
        }, { passive: true });

        // Ловим готовность DOM и запускаем умный скролл
        document.addEventListener('DOMContentLoaded', () => {
            this.handleInitialScroll();
        });

        // Слушаем переходы по якорям
        window.addEventListener('hashchange', () => {
            if (window.isRestoringProgress) return;
            this.scrollToHash();
        });
    },

    // 1. УМНОЕ ОЖИДАНИЕ АСИНХРОННОГО ЭЛЕМЕНТА (Без setInterval!)
    waitForElement(id) {
        return new Promise((resolve) => {
            let el = this.findFallbackElement(id);
            if (el) return resolve(el);

            // MutationObserver тихо ждет, пока в документ добавят новые теги (наша сутта)
            const observer = new MutationObserver((mutations, obs) => {
                el = this.findFallbackElement(id);
                if (el) {
                    obs.disconnect(); // Нашли! Отключаем слежку
                    resolve(el);
                }
            });

            // Слушаем изменения в DOM
            observer.observe(document.body, { childList: true, subtree: true });

            // Резервный тайм-аут, чтобы обещание не висело вечно
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, this.config.maxWait);
        });
    },

    // 2. ОПРЕДЕЛЕНИЕ КУДА ПРЫГАТЬ ПРИ СТАРТЕ
    async handleInitialScroll() {
        let anchorId = null;
        let offset = this.config.eyeLevel;

        // Приоритет 1: Одноразовый прыжок из настроек
        const rawSettingsData = localStorage.getItem('exactScrollAnchor');
        if (rawSettingsData) {
            try {
                const anchor = JSON.parse(rawSettingsData);
                anchorId = anchor.id;
                offset = anchor.offset;
                localStorage.removeItem('exactScrollAnchor');
            } catch(e) {}
        }

        // Проверка: перезагрузил ли пользователь страницу?
        let isReloadOrHistory = false;
        if (window.performance) {
            const navEntries = performance.getEntriesByType("navigation");
            if (navEntries.length > 0) {
                isReloadOrHistory = (navEntries[0].type === 'reload' || navEntries[0].type === 'back_forward');
            } else if (performance.navigation) { 
                isReloadOrHistory = (performance.navigation.type === 1 || performance.navigation.type === 2);
            }
        }

        // Приоритет 2: Автосохраненный прогресс
        const hasHash = !!window.location.hash;
        if (!anchorId && (!hasHash || isReloadOrHistory)) {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('q');
            if (slug) {
                try {
                    const progressData = JSON.parse(localStorage.getItem('suttaProgress') || '{}');
                    if (progressData[slug]) {
                        anchorId = progressData[slug].id;
                        offset = progressData[slug].offset || this.config.eyeLevel;
                        window.isRestoringProgress = true; 
                    }
                } catch(e) {}
            }
        }

        if (anchorId) {
            // Ждем асинхронную загрузку элемента и прыгаем
            const el = await this.waitForElement(anchorId);
            if (el) this.executeScroll(el, offset, true); 
        } else {
            // Приоритет 3: Обычный хеш в URL
            this.scrollToHash();
        }
    },

    // 3. СКРОЛЛ К ЯКОРЮ
    async scrollToHash() {
        const hash = window.location.hash;
        if (!hash) return;
        
        const hashContent = hash.substring(1);
        const urlParams = new URLSearchParams(window.location.search);
        const isInstant = urlParams.get('scroll') === 'instant' || hashContent.includes('scroll=instant');
        const cleanId = hashContent.split('&')[0].split('?')[0];

        if (cleanId.includes(',')) {
            // Несколько ID через запятую
            const ids = cleanId.split(','); 
            const firstElement = await this.waitForElement(ids[0]);
            if (firstElement) {
                this.executeScroll(firstElement, window.innerHeight * 0.20, isInstant);
                ids.forEach(id => this.highlightById(id)); 
            }
        } else {
            // Одиночный ID
            const element = await this.waitForElement(cleanId);
            if (element) {
                this.executeScroll(element, window.innerHeight * 0.20, isInstant);
                this.highlightAllById(cleanId);
            }
        }
    },

    // 4. НЕПОСРЕДСТВЕННЫЙ МЕХАНИЗМ СКРОЛЛА
    executeScroll(element, offsetData, isInstant) {
        const absoluteY = window.pageYOffset + element.getBoundingClientRect().top;
        const targetY = absoluteY - offsetData;

        if (isInstant || window.isRestoringProgress) {
            const html = document.documentElement;
            const prevBehavior = getComputedStyle(html).scrollBehavior;
            html.style.scrollBehavior = 'auto'; // Жесткий прыжок
            
            window.scrollTo({ top: targetY, behavior: 'auto' });
            
            requestAnimationFrame(() => {
                // Точная до-корректировка
                const correctedY = window.pageYOffset + element.getBoundingClientRect().top - offsetData;
                window.scrollTo(0, correctedY);
                html.style.scrollBehavior = prevBehavior;
                
                // Снимаем блокировку хеша через 100мс
                setTimeout(() => window.isRestoringProgress = false, 100);
            });
        } else {
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
    },

    // 5. ОПТИМИЗИРОВАННОЕ СОХРАНЕНИЕ ПРОГРЕССА (Без фризов!)
    saveReadingProgress() {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('q');
        if (!slug) return;

        const suttaContainer = document.getElementById('sutta');
        if (!suttaContainer) return;

        const elements = suttaContainer.querySelectorAll('[id]');
        if (elements.length === 0) return;

        let bestElement = null;
        let minDistance = Infinity;

        // МАГИЯ ЗДЕСЬ: Элементы идут сверху вниз. Нам не нужно проверять тысячи штук.
        for (const el of elements) {
            const rectTop = el.getBoundingClientRect().top;
            const distance = Math.abs(rectTop - this.config.eyeLevel);

            if (distance < minDistance) {
                minDistance = distance;
                bestElement = el;
            } else if (rectTop > this.config.eyeLevel) {
                // Мы перешагнули линию глаз. Дальше дистанция будет только расти.
                // Хватит насиловать процессор, прерываем цикл!
                break;
            }
        }

        if (bestElement) {
            let progressData = {};
            try {
                progressData = JSON.parse(localStorage.getItem('suttaProgress') || '{}');
            } catch (e) {}

            progressData[slug] = {
                id: bestElement.id,
                offset: bestElement.getBoundingClientRect().top,
                time: Date.now()
            };

            const keys = Object.keys(progressData);
            if (keys.length > 20) { // Храним историю для 20 сутт
                keys.sort((a, b) => progressData[b].time - progressData[a].time);
                const newProgressData = {};
                for (let i = 0; i < 20; i++) {
                    newProgressData[keys[i]] = progressData[keys[i]];
                }
                progressData = newProgressData;
            }

            localStorage.setItem('suttaProgress', JSON.stringify(progressData));
        }
    },

    // 6. ПОИСК ЭЛЕМЕНТА С ОТКАТОМ ДО ПРЕДЫДУЩЕГО ID
    findFallbackElement(baseId) {
        if (!baseId) return null;
        const idStr = String(baseId);
        
        let el = document.getElementById(idStr);
        if (el) return el;
        
        const match = idStr.match(/(.*?)(\d+)$/);
        if (!match) return null;
        
        let prefix = match[1];
        let num = parseInt(match[2], 10);
        
        if (num - 1 >= 0) {
            return document.getElementById(prefix + (num - 1));
        }
        return null;
    },

    // 7. АНИМАЦИИ И ПОДСВЕТКА
    highlightAllById(elementId) {
        const element = this.findFallbackElement(elementId);
        if (!element) return;

        // Связь с TTS плеером
        if (typeof window.activateSegmentForTTS === 'function') {
            if (element.matches('.pli-lang, .rus-lang, .eng-lang')) {
                 window.activateSegmentForTTS(element);
            } else {
                const childLang = element.querySelector('.pli-lang, .rus-lang, .eng-lang');
                window.activateSegmentForTTS(childLang || element);
            }
        } else {
            element.classList.add('active-word');
        }

        const originalPosition = element.style.position;
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        // Overlay мигание
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10';
        overlay.style.borderRadius = getComputedStyle(element).borderRadius;
        overlay.style.transition = 'background-color 0.45s ease-in-out';
        overlay.style.backgroundColor = 'transparent';
        element.appendChild(overlay);

        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            overlay.style.backgroundColor = blinkCount % 2 === 0 ? 'rgba(26, 188, 156, 0.25)' : 'transparent';
            blinkCount++;
            if (blinkCount >= 6) { 
                clearInterval(blinkInterval);
                setTimeout(() => {
                    if (overlay.parentNode === element) element.removeChild(overlay);
                    if (!originalPosition) element.style.removeProperty('position');
                    else element.style.position = originalPosition;
                }, 450);
            }
        }, 450);
    },

    highlightById(elementId) {
        const element = this.findFallbackElement(elementId);
        if (!element) return;

        if (typeof window.activateSegmentForTTS === 'function') {
            window.activateSegmentForTTS(element);
        } else {
            element.classList.add('active-word');
        }

        const originalTransition = element.style.transition;
        const originalBoxShadow = element.style.boxShadow;
        const originalBorderRadius = element.style.borderRadius;
        element.style.borderRadius = '6px';
        element.style.transition = 'box-shadow 0.3s ease-in-out';
        
        let blinkCount = 0;
        let isWide = false;
        
        const blinkInterval = setInterval(function() {
            element.style.boxShadow = isWide ? '0 0 0 2px grey' : '0 0 0 5px rgba(128,128,128, 0.5)';
            isWide = !isWide;
            blinkCount++;
            if (blinkCount >= 6) {
                clearInterval(blinkInterval);
                setTimeout(() => {
                    element.style.removeProperty('box-shadow');
                    element.style.removeProperty('transition');
                    element.style.removeProperty('border-radius');
                    if (originalBoxShadow) element.style.boxShadow = originalBoxShadow;
                    if (originalTransition) element.style.transition = originalTransition;
                    if (originalBorderRadius) element.style.borderRadius = originalBorderRadius;
                }, 300);
            }
        }, 400);
    },

    // 8. КНОПКА "НАВЕРХ"
    setupScrollToTop() {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.id = 'scrollToTopBtn';
        scrollToTopBtn.className = 'btn btn-secondary rounded-pill hide-button';
        scrollToTopBtn.style.display = 'none';

        const img = document.createElement('img');
        img.id = 'arrowImg';
        img.alt = 'To top';
        img.src = '/assets/svg/arrow-up-dark.svg';
        scrollToTopBtn.appendChild(img);
        
        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', () => {
            scrollToTopBtn.style.display = window.scrollY > 600 ? 'block' : 'none';
        }, { passive: true });

        scrollToTopBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

// Запуск контроллера
ScrollManager.init();
