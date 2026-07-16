

function toggleViewMode() {
    viewMode = viewMode === 'cols' ? 'rows' : 'cols';
    
    // Сохраняем состояние
    localStorage.setItem('4ntReadView', viewMode);
    
    const btn = document.getElementById('viewModeBtn');
    if (btn) btn.classList.toggle('on', viewMode === 'rows');
    
    document.documentElement.setAttribute('data-view-mode', viewMode);
    
    // Вызываем renderAll вместо renderMain, чтобы восстановить observer для оглавления
    if (typeof renderAll === 'function') {
        renderAll();
    } else if (typeof renderMain === 'function') {
        renderMain();
    }
    
    // Защищаем вызов TTS от ReferenceError, если voice.js не загружен
    setTimeout(() => {
        if (typeof initTtsMarkup === 'function') {
            initTtsMarkup();
        }
    }, 100);
}

document.addEventListener("keydown", function(event) {
    if (event.altKey && event.code === "KeyC") {
        event.preventDefault();
        toggleViewMode();
    }
    if (event.altKey && event.code === "KeyW") {
        event.preventDefault();
        toggleSidebar();
    }
    if (event.altKey && event.code === "KeyZ") {
        event.preventDefault();
        toggleDots();
    }
});

function getSlug(slug = null) {
    if (slug) return slug.trim().toLowerCase();

    return (
        document.querySelector('#jumpInput')?.value.trim() ||
        document.querySelector('input[name="q"]')?.value.trim() ||
        new URLSearchParams(location.search).get('q')?.trim() ||
        null
    )?.toLowerCase();
}

// ── THEME ──
let dgTheme = localStorage.getItem('theme');

// Убираем 'let', просто переназначаем значение существующей глобальной переменной
currentTheme = (dgTheme === 'light') ? 'light' : 'dark';

function themeLabel() { 
  return currentTheme === 'dark' ? '☾ Dark' : '☀ Light'; 
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = themeLabel();
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Применяем локально
  applyTheme();
  
  // Обновляем глобальную переменную сайта
  localStorage.setItem('theme', currentTheme);
  
  if (typeof saveSettings === 'function') {
    saveSettings();
  }
}



// Инициализация из localStorage или значение по умолчанию
let viewMode = localStorage.getItem('4ntReadView') || 'cols';

// Установка начального состояния при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById('viewModeBtn');
    if (btn) btn.classList.toggle('on', viewMode === 'rows');
    document.documentElement.setAttribute('data-view-mode', viewMode);

    // Применяем тему при загрузке
    applyTheme();

    // Автоматическое сворачивание боковой панели (TOC) на мобильных устройствах
    const isMobileDevice = window.matchMedia("(max-width: 900px)").matches;

    if (isMobileDevice && sidebarVisible) {
        if (typeof toggleSidebar === 'function') {
            toggleSidebar();
        }
    }
});


// Переключение точек
function toggleDots() {
    const main = document.getElementById('main');
    const isHidden = main.classList.toggle('dots-hidden');
    
    // Физическая замена точек для корректного поиска (Ctrl+F)
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (isHidden) {
            if (!node.dataset.original) node.dataset.original = node.textContent;
            node.textContent = node.textContent.replace(/·/g, '');
        } else {
            if (node.dataset.original) {
                node.textContent = node.dataset.original;
            }
        }
    }
    localStorage.setItem('4ntHideDots', isHidden);
    document.getElementById('dotsBtn').classList.toggle('on', isHidden);
}



document.addEventListener("DOMContentLoaded", function() {

    // logo
    document.documentElement.style.setProperty('--logo-w', '16px');

document.querySelectorAll("img").forEach(img => {
    if (img.src.includes("debabel-logo-1k.jpg")) {
        img.src = img.src.replace(
            "debabel-logo-1k.jpg",
            "headerlogo.png"
        );
    }
});

document.querySelectorAll("style").forEach(style => {
    style.textContent = style.textContent.replaceAll("#1a1612", "#000");
});


    // Android search fix
    const jumpInput = document.getElementById('jumpInput');
    if (jumpInput) {
        jumpInput.type = 'search';
    }


    // CSS
    [
        "/assets/css/paliLookup.css",
        "/assets/css/extrastyles.css",
        "/read/css/voice.css",
        "/4nt/extra/extra.css"
    ].forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        }
    });


    // JS
    [
        "/assets/js/settings.js",
        "/read/js/voice.js"
    ].forEach(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement("script");
            script.src = src;
            script.defer = true;
            document.body.appendChild(script);
        }
    });

});

// Добавляем кнопку в панель при загрузке
document.addEventListener("DOMContentLoaded", function() {
    const settingsPop = document.getElementById('settingsPop'); // Или ваш контейнер кнопок
    if (settingsPop) {
        const btn = document.createElement('a');
        btn.id = 'dotsBtn';
        btn.href = 'javascript:void(0)';
        btn.className = 'icon-btn';
        btn.textContent = '·';
        btn.title = 'Скрыть/Показать точки в Pāli';
        btn.onclick = toggleDots;
        btn.style.fontSize = '18px';
        
        // Восстановление состояния
        if (localStorage.getItem('4ntHideDots') === 'true') {
            toggleDots();
        }
        
        settingsPop.insertBefore(btn, settingsPop.firstChild);
    }
});

 
 document.addEventListener("DOMContentLoaded", function () {

    let container = document.getElementById('extra-buttons');

    // Если контейнера нет - создаём
    if (!container) {
        container = document.createElement('div');
        container.id = 'extra-buttons';
        container.className = 'extra-btns-wrap';

        const settingsWrap = document.getElementById('settingsWrap');

        if (settingsWrap) {
            settingsWrap.insertAdjacentElement('beforebegin', container);
        } else {
            return;
        }
    }

    // Slug берем один раз
    const slug = getSlug();

    const buttons = [
        { html: '🔊', title: 'Слушать (TTS)', class: 'voice-link icon-btn', attr: { 'data-slug': slug }, style: 'font-size:14px; margin-right:4px;' },
        { html: '📜', title: 'View: Columns / Scroll', id: 'viewModeBtn', onclick: 'toggleViewMode()' },
        { html: '·', title: 'Скрыть/Показать точки в Pāli', id: 'dotsBtn', onclick: 'toggleDots()' },
        { html: '<img src="/assets/img/gray-white.png" alt="Поиск" style="width:18px; display:block;">', title: 'Искать в Суттах (Ctrl+1)', href: '/?q=' + slug, id: 'fdg-button' },
        { html: '<img src="/assets/svg/comment.svg" alt="Словарь" style="width:18px; height:18px; display:block;">', title: 'Всплывающий по клику словарь (Alt+A)', class: 'icon-btn toggle-dict-btn' },
        { html: '🌐', title: 'Оригинальный сайт s.4nt.org', id: 'orig-site-btn', style: 'font-size:12px; display:flex; align-items:center; justify-content:center;', onclick: "this.href='https://s.4nt.org'+location.pathname.replace('/4nt', '')+location.search+location.hash" }
    ];

    // защита от повторной вставки
    if (!container.dataset.loaded) {
        buttons.forEach(b => {
            const a = document.createElement(b.href ? 'a' : 'button');

            a.className = b.class || 'icon-btn';

            if (b.id) a.id = b.id;
            if (b.href) a.href = b.href;

            a.innerHTML = b.html;
            a.title = b.title;

            if (b.style) a.style = b.style;
            if (b.onclick) a.setAttribute('onclick', b.onclick);

            if (b.attr) {
                for (let key in b.attr) {
                    a.setAttribute(key, b.attr[key]);
                }
            }

            container.appendChild(a);
        });

        container.dataset.loaded = "true";
    }

});


document.addEventListener("DOMContentLoaded", function () {

    // Основной текст
    document.querySelectorAll(".ct").forEach(el => {
        const lang = el.getAttribute("data-lang");

        if (
            lang === "pali" ||
            lang === "san" ||
            lang === "lzh" ||
            lang === "zh" ||
            lang === "pali_royal_iast"
        ) {
            el.classList.add("pli-lang");
            el.setAttribute("lang", "pi");
        } else {
            el.classList.add("eng-lang");
        }
    });


    // Оглавление
    document.querySelectorAll(".tr-pali").forEach(el => {
        el.classList.add("pli-lang");
        el.setAttribute("lang", "pi");
    });

});
