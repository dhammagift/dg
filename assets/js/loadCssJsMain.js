(function() {
    // Функция показа страницы и установки фокуса
    function revealPageAndFocus() {
        // requestAnimationFrame гарантирует, что браузер готов к отрисовке следующего кадра
        requestAnimationFrame(() => {
            if (document.body) {
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
            }

            // Установка фокуса на инпут (без прыжков страницы)
            const searchInput = document.getElementById('paliauto');
            if (searchInput && document.activeElement !== searchInput) {
                searchInput.focus({ preventScroll: true });
            }
        });
    }

    // Проверяем, может быть DOM уже загрузился
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        revealPageAndFocus();
    } else {
        // Ждем парсинга HTML. К этому моменту CSS из <head> уже применен браузером
        document.addEventListener('DOMContentLoaded', revealPageAndFocus);
        
        // Резервный триггер на случай зависания каких-то скриптов
        window.addEventListener('load', revealPageAndFocus);
    }
})();
