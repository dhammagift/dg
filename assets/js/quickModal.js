// === Файл: /assets/js/quickModal.js ===

// Делаем переменные глобальными для доступа из других скриптов
window.isQuickModalRendered = false; 
window.quickModalIsOpen = false;     
window.quickOverlay = null;
window.quickModal = null;

function buildQuickModalDOM() {
  const currentPath = window.location.pathname;
  let currentUrl = window.location.href;
  let urlWithoutParams = currentUrl.split('?')[0];
  let queryBase = urlWithoutParams.endsWith("/ru/") || urlWithoutParams.endsWith("/r/") 
    ? "/r/?q=" 
    : "/read/?q=";
  
  const formAction = currentPath.match(/\/(ru|r)\//) ? '/ru/' : '/';
  const isRu = currentPath.includes('/ru/') || currentPath.includes('/r/') || currentPath.includes('/ml/');
  const isDark = document.body.classList.contains("dark");
  
  const tabFavText = isRu ? "★ Избранное" : "★ Favorites";
  const favTitleText = isRu ? "Избранное" : "Favorites";
  const tabLinksText = "4 Ariyasaccāni";
  const tabMemoText = isRu ? "Запоминание" : "Memo";
  const memoPath = isRu ? "/ru/memo/" : "/memo/";
  const tabDpdText = isRu ? "Словарь" : "Dict";
  const histTitleText = isRu ? "История поиска" : "Search History";
  const titleClearAll = isRu ? "Очистить историю" : "Clear history";
  const dpdTheme = isDark ? "dark" : "light";
  const dpdUrl = `https://dict.dhamma.gift${isRu ? '/ru/' : '/'}?theme=${dpdTheme}`;

  // Создаем узлы
  quickOverlay = document.createElement("div");
  quickOverlay.className = "quick-overlay-element";
  
  quickModal = document.createElement("div");
  quickModal.className = "quick-modal-container";

  quickModal.innerHTML = `
    <div class="quick-modal-content-wrapper">
      <button id="quickCloseModalBtn" class="quick-close-btn" title="(Esc)">×</button>

      <form id="quickSearchForm" class="quick-search-form" action="${formAction}" method="GET">
          <input type="search" name="q" id="quickSearchInput" class="quick-search-input" placeholder="e.g. Kāyagatā or sn56.11" autocomplete="off">
          <button type="submit" id="quickSearchBtn" class="quick-search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
      </form>

      <div class="quick-tabs-wrapper">
        <div class="quick-tabs">
          <button class="quick-tab-btn active" data-tab="tab-fav">${tabFavText}</button>
          <button class="quick-tab-btn" data-tab="tab-4as">${tabLinksText}</button>
          <button class="quick-tab-btn" data-tab="tab-memo">${tabMemoText}</button>
          <button class="quick-tab-btn" data-tab="tab-dpd">${tabDpdText}</button>
        </div>
        
        <div class="quick-actions-right">
            <span class="action-btn" id="btn-sync-now" title="${isRu ? 'Синхронизировать' : 'Sync Now'}">
               <img src="/assets/svg/rotate-solid-full.svg" width="20" height="20" alt="Login & Sync">
            </span>

            <span class="clear-all-btn action-btn" id="main-trash-icon" title="${titleClearAll}">
               <img src="/assets/svg/trash-can-regular-full.svg" width="25" height="25" alt="Reset">
            </span>
            <span class="action-btn cursor-pointer" id="main-open-window-icon" title="${isRu ? 'Открыть в новом окне' : 'Open in new window'}" style="display: none;">
               <img src="/assets/svg/open-link.svg" width="20" height="20" alt="Open">
            </span>
        </div>
      </div>

  
      <div id="tab-fav" class="quick-tab-content active">
        <h6 id="fav-header" class="sortable-header">
          <span class="header-title" title="Сортировать">${favTitleText}</span>
          <div class="header-actions">
            <span class="sort-icon-fav sort-trigger" title="Сортировать">⇅</span>
          </div>
        </h6>
        <div id="quick-favorites-container"></div>
        
        <h6 id="hist-header" class="sortable-header">
          <span class="header-title" title="Сортировать">${histTitleText}</span>
          <div class="header-actions">
            <span class="sort-icon-hist sort-trigger" title="Сортировать">⇅</span>
          </div>
        </h6>
        <div id="quick-history-container"></div>
        
        <div class="quick-all-history-wrapper">
            <a href="${isRu ? '/ru/history.php' : '/history.php'}" class="quick-all-history-link">
                ${isRu ? "Общая история →" : "Common history →"}
            </a>
        </div>
      </div>

      <div id="tab-4as" class="quick-tab-content">
        <div class="quick-links-container">
          <div class="quick-links-column">
            <p>1st priority:</p>
            <ul>
              <li><a href="${queryBase}sn56.11" target="_blank" class="link-primary">SN 56.11</a></li>
              <li><a href="${queryBase}dn22" target="_blank" class="link-primary">DN 22</a></li>
              <li><a href="${queryBase}sn12.2" target="_blank" class="link-primary">SN 12.2</a></li>
            </ul>
          </div>
          <div class="quick-links-column">
            <p>Clarify 5 khandha:</p>
            <ul>
              <li><a href="${queryBase}sn22.56" target="_blank" class="link-success">SN 22.56</a></li>
              <li><a href="${queryBase}sn22.79" target="_blank" class="link-success">SN 22.79</a></li>
              <li><a href="${queryBase}sn22.85" target="_blank" class="link-success">SN 22.85</a></li>
              <li><a href="${queryBase}sn22" target="_blank" class="link-success">SN 22</a></li>       
            </ul>
          </div>
          <div class="quick-links-column">
            <p>Clarify 6 ajjhattāyatana:</p>
            <ul>
              <li><a href="${queryBase}sn35.228" target="_blank" class="link-warning">SN 35.228</a></li>
              <li><a href="${queryBase}sn35.229" target="_blank" class="link-warning">SN 35.229</a></li>
              <li><a href="${queryBase}sn35.236" target="_blank" class="link-warning">SN 35.236</a></li>
              <li><a href="${queryBase}sn35.238" target="_blank" class="link-warning">SN 35.238</a></li>
              <li><a href="${queryBase}sn35" target="_blank" class="link-warning">SN 35</a></li>
            </ul>
          </div>
          <div class="quick-links-column">
            <p>Clarify 4-6-X Dhātu:</p>
            <ul>
              <li><a href="${queryBase}mn28" target="_blank" class="link-danger">MN 28</a></li>
              <li><a href="${queryBase}mn115" target="_blank" class="link-danger">MN 115</a></li>
              <li><a href="${queryBase}mn140" target="_blank" class="link-danger">MN 140</a></li>
              <li><a href="${queryBase}sn14" target="_blank" class="link-danger">SN 14</a></li>
            </ul>
          </div>
          <div class="quick-links-column">
            <p>Dukkaṁ so abhinandati:</p>
            <ul>
              <li><a href="${queryBase}sn14.35" target="_blank" class="link-primary">SN 14.35</a></li>
              <li><a href="${queryBase}sn22.29" target="_blank" class="link-primary">SN 22.29</a></li>
              <li><a href="${queryBase}sn35.19" target="_blank" class="link-primary">SN 35.19</a></li>
              <li><a href="${queryBase}sn35.20" target="_blank" class="link-primary">SN 35.20</a></li>
            </ul>
          </div>
          <div class="quick-links-column">
            <p>Extra</p>
            <ul>
              <li><a href="${queryBase}an3.70" target="_blank" class="link-danger">AN 3.70</a></li>
              <li><a href="${queryBase}an6.63" target="_blank" class="link-danger">AN 6.63</a></li>
              <li><a href="${queryBase}an8.9" target="_blank" class="link-danger">AN 8.9</a></li>
              <li><a href="${queryBase}an10.46" target="_blank" class="link-primary">AN 10.46</a></li>
              <li><a href="${queryBase}an10.176" target="_blank" class="link-primary">AN 10.176</a></li>
              <li><a href="${queryBase}snp3.2" target="_blank" class="link-primary">Snp 3.2</a></li>
              <li><a href="${queryBase}iti61" target="_blank" class="link-primary">Iti 61</a></li>
              <li><a href="${queryBase}an4.199" target="_blank" class="link-primary">an4.199</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div id="tab-memo" class="quick-tab-content">
        <iframe data-src="${memoPath}" class="quick-iframe"></iframe>
      </div>

      <div id="tab-dpd" class="quick-tab-content">
        <iframe data-src="${dpdUrl}" class="quick-iframe"></iframe>
      </div>

    </div>
  `;

  document.body.appendChild(quickOverlay);
  document.body.appendChild(quickModal);

  // Обработка вкладок
  const tabBtns = quickModal.querySelectorAll('.quick-tab-btn');
  const tabContents = quickModal.querySelectorAll('.quick-tab-content');
  const mainTrashIcon = document.getElementById('main-trash-icon');
  const mainOpenWindowIcon = document.getElementById('main-open-window-icon'); 
  const btnSyncNow = document.getElementById('btn-sync-now');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      
      const targetTab = btn.dataset.tab;
      const targetContent = quickModal.querySelector(`#${targetTab}`);
      targetContent.classList.add('active');
      
      // --- НАЧАЛО: ЛОГИКА ЛЕНИВОЙ ЗАГРУЗКИ ---
      const iframe = targetContent.querySelector('iframe');
      if (iframe && !iframe.getAttribute('src')) {
          iframe.setAttribute('src', iframe.getAttribute('data-src'));
      }
      // --- КОНЕЦ ---

      // Переключаем видимость иконок
      if (mainTrashIcon) {
          mainTrashIcon.style.display = targetTab === 'tab-fav' ? 'block' : 'none';
      }
      // Переключаем видимость кнопки Sync
      if (btnSyncNow) {
          btnSyncNow.style.display = targetTab === 'tab-fav' ? 'block' : 'none';
      }
      if (mainOpenWindowIcon) {
          mainOpenWindowIcon.style.display = (targetTab === 'tab-memo' || targetTab === 'tab-dpd') ? 'block' : 'none';
      }
    });
  });

  // --- ЛОГИКА НАЖАТИЯ КНОПКИ СИНХРОНИЗАЦИИ ---
  if (btnSyncNow) {
      btnSyncNow.addEventListener('click', async (e) => { // <-- Добавили async
          e.preventDefault();
          
          const isLoggedWithPhrase = !!localStorage.getItem('syncPhraseId');
          const isLoggedWithGoogle = typeof auth !== 'undefined' && auth && auth.currentUser;
          
          if (isLoggedWithPhrase || isLoggedWithGoogle) {
              // Делаем иконку полупрозрачной для визуального отклика
              btnSyncNow.style.opacity = '0.5';
              
              if (typeof forceSyncNow === 'function') {
                  await forceSyncNow(); // <-- Ждем окончания облачной синхронизации
              }
              
              // Обновляем локальные списки модального окна
              if (typeof window.refreshQuickModalData === 'function') {
                  window.refreshQuickModalData();
              }
              
              // Возвращаем иконке нормальный вид
              btnSyncNow.style.opacity = '1';
          } else {
              window.location.href = isRu ? '/ru/login' : '/login';
          }
      });
  }


  // Логика закрытия модалки
  const closeQuickModal = () => {
    if(quickModalIsOpen) toggleQuickModal();
  };

  quickOverlay.addEventListener("click", (e) => e.target === quickOverlay && closeQuickModal());
  quickModal.querySelector("#quickCloseModalBtn").addEventListener("click", closeQuickModal);

  if (typeof window.initPaliAutocomplete === 'function') {
      window.initPaliAutocomplete('#quickSearchInput');
  }

  // Прикрепляем функции рендера глобально
  window.refreshQuickModalData = function() {
    renderQuickLists(isRu, queryBase);
  };
  
  // Делегирование событий на клики внутри списков
  const favContainer = quickModal.querySelector('#quick-favorites-container');
  const histContainer = quickModal.querySelector('#quick-history-container');
  
  favContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-fav-btn')) {
          const slug = e.target.dataset.slug;
          if (confirm(isRu ? "Удалить из избранного?" : "Remove from favorites?")) {
              let favData = JSON.parse(localStorage.getItem('dg_favorites')) || [];
              favData = favData.filter(f => f.slug !== slug);
              localStorage.setItem('dg_favorites', JSON.stringify(favData));
              window.refreshQuickModalData();
          }
      }
  });

  histContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggle-fav-btn-hist')) {
          const slug = e.target.dataset.slug;
          const displayKey = e.target.dataset.display;
          const url = e.target.dataset.url;
          let currentFavs = JSON.parse(localStorage.getItem('dg_favorites')) || [];
          const idx = currentFavs.findIndex(f => f.slug === slug);
          
          if (idx !== -1) {
             currentFavs.splice(idx, 1);
          } else {
             const parser = new URL(url, window.location.origin);
             const isSearchPage = parser.pathname === '/' || parser.pathname === '/ru/' || parser.pathname.endsWith('index.php');
             let finalTitle = displayKey;
             if (isSearchPage && !finalTitle.startsWith("")) finalTitle = "🔎 " + finalTitle;

             currentFavs.unshift({
                 slug: slug, id: slug, title: finalTitle, 
                 path: parser.pathname, search: parser.search, timestamp: Date.now()
             });
          }
          localStorage.setItem('dg_favorites', JSON.stringify(currentFavs));
          window.refreshQuickModalData();
      }
  });

  if (mainTrashIcon) {
      mainTrashIcon.addEventListener('click', () => {
          if (confirm(isRu ? "Очистить ВСЮ историю поиска?" : "Clear ALL search history?")) {
              localStorage.setItem('localSearchHistory', JSON.stringify([]));
              window.refreshQuickModalData();
          }
      });
  }

  // --- ЛОГИКА КНОПКИ "ОТКРЫТЬ В НОВОМ ОКНЕ" ---
  if (mainOpenWindowIcon) {
      mainOpenWindowIcon.addEventListener('click', () => {
          const activeTab = quickModal.querySelector('.quick-tab-content.active');
          if (!activeTab) return;

          const iframe = activeTab.querySelector('iframe');
          if (!iframe) return;

          const urlToOpen = iframe.getAttribute('src') || iframe.getAttribute('data-src');
          
          if (urlToOpen) {
              window.open(urlToOpen, '_blank');
          } else {
              console.log("Ссылка не найдена");
          }
      });
  }

  // Обработчики заголовков для сортировки/скрытия
  setupQuickModalHeaders();
}

function renderQuickLists(isRu, queryBase) {
    const favData = JSON.parse(localStorage.getItem('dg_favorites')) || [];
    const histData = JSON.parse(localStorage.getItem('localSearchHistory')) || [];
    
    const favContainer = document.querySelector('#quick-favorites-container');
    const histContainer = document.querySelector('#quick-history-container');
    const favHeader = document.querySelector('#fav-header');
    const histHeader = document.querySelector('#hist-header');
    
    // Сортировка Избранного берется из памяти, а Истории — просто из временной переменной
    let favAlphaSort = localStorage.getItem('dg_favAlphaSort') === 'true';
    let histAlphaSort = window.histAlphaSort || false; 
    let favCollapsed = localStorage.getItem('dg_favCollapsed') === 'true';
    let histCollapsed = localStorage.getItem('dg_histCollapsed') === 'true';

    // Рендер Избранного
    if (favData.length === 0) {
      favContainer.innerHTML = `<p class="quick-empty-msg">${isRu ? "Избранного пока нет." : "No favorites yet."}</p>`;
      favHeader.style.display = 'none';
      favContainer.style.display = 'block';
    } else {
      favHeader.style.display = 'flex';
      favContainer.style.display = favCollapsed ? 'none' : 'block';
      favHeader.querySelector('.header-title').classList.toggle('collapsed', favCollapsed);

      let dataToRender = [...favData];
      if (favAlphaSort) dataToRender.sort((a, b) => (a.title || a.slug || '').localeCompare(b.title || b.slug || '', undefined, { numeric: true }));

      let favHtml = '<ul class="compact-list">';
      dataToRender.forEach(fav => {
        let url = (fav.path && fav.search) ? `${fav.path}${fav.search}` : `${queryBase}${fav.slug}`;
        if (fav.id && fav.id !== fav.slug) url += `#${fav.id}`;
        const dateStr = fav.timestamp ? new Date(fav.timestamp).toLocaleDateString() : "";
        favHtml += `<li><span class="fav-star-icon">★</span><a href="${url}">${fav.title || fav.slug}</a>
        <span class="item-date">${dateStr}</span><span class="action-btn remove-fav-btn" data-slug="${fav.slug}">×</span></li>`;
      });
      favHtml += '</ul>';
      favContainer.innerHTML = favHtml;
      document.querySelector('.sort-icon-fav').textContent = favAlphaSort ? 'A-Z' : '⇅';
    }

    // Рендер Истории
    if (histData.length === 0) {
      histContainer.innerHTML = `<p class="quick-empty-msg">${isRu ? "История пуста." : "History is empty."}</p>`;
      histHeader.style.display = 'none';
      histContainer.style.display = 'block';
    } else {
      histHeader.style.display = 'flex';
      histContainer.style.display = histCollapsed ? 'none' : 'block';
      histHeader.querySelector('.header-title').classList.toggle('collapsed', histCollapsed);

      let dataToRender = [...histData];
      if (histAlphaSort) dataToRender.sort((a, b) => (a[0] || '').localeCompare(b[0] || '', undefined, { numeric: true }));

      let histHtml = '<ul class="compact-list">';
      dataToRender.slice(0, 84).forEach(h => {
        const dateStr = h[2] ? new Date(h[2]).toLocaleDateString() : "";
        let realSlug = h[0];
        try { const p = new URL(h[1], window.location.origin); if(p.searchParams.has('q')) realSlug = p.searchParams.get('q'); } catch(e){}
        const isFav = favData.some(f => f.slug === realSlug);
        
        histHtml += `<li><span class="hist-icon"><img src="/assets/svg/clock-rotate-left.svg" width="14" height="14"></span>
        <a href="${h[1]}">${h[0]}</a><span class="item-date">${dateStr}</span>
        <span class="action-btn toggle-fav-btn-hist" data-slug="${realSlug}" data-display="${h[0]}" data-url="${h[1]}">${isFav ? "★" : "☆"}</span></li>`;
      });
      histHtml += '</ul>';
      histContainer.innerHTML = histHtml;
      document.querySelector('.sort-icon-hist').textContent = histAlphaSort ? 'A-Z' : '⇅';
    }
}

function setupQuickModalHeaders() {
  document.querySelector('#fav-header').addEventListener('click', (e) => {
      if (e.target.classList.contains('sort-trigger')) { 
          // Избранное: сохраняем сортировку в память навсегда
          localStorage.setItem('dg_favAlphaSort', localStorage.getItem('dg_favAlphaSort') !== 'true'); 
          window.refreshQuickModalData(); 
      } 
      else if (e.target.closest('.header-title')) { 
          // Свернутость сохраняем
          localStorage.setItem('dg_favCollapsed', localStorage.getItem('dg_favCollapsed') !== 'true'); 
          window.refreshQuickModalData(); 
      }
  });

  document.querySelector('#hist-header').addEventListener('click', (e) => {
      if (e.target.classList.contains('sort-trigger')) { 
          // История: сохраняем сортировку только во временную переменную
          window.histAlphaSort = !window.histAlphaSort; 
          window.refreshQuickModalData(); 
      } 
      else if (e.target.closest('.header-title')) { 
          // Свернутость сохраняем
          localStorage.setItem('dg_histCollapsed', localStorage.getItem('dg_histCollapsed') !== 'true'); 
          window.refreshQuickModalData(); 
      }
  });
}


window.toggleQuickModal = function() {
  if (!window.isQuickModalRendered) {
    buildQuickModalDOM();
    window.isQuickModalRendered = true;
  }

  if (window.quickModalIsOpen) {
    window.quickOverlay.classList.remove("open");
    window.quickModal.classList.remove("open");
    window.quickModalIsOpen = false;
  } else {
    // 1. Показываем локальные данные мгновенно, чтобы не было задержки
    window.refreshQuickModalData();
    
    window.quickOverlay.classList.add("open");
    window.quickModal.classList.add("open");
    window.quickModalIsOpen = true;

    // 2. Фокус на инпут для быстрого поиска
    setTimeout(() => {
        const searchInput = document.getElementById('quickSearchInput');
        if (searchInput) searchInput.focus();
    }, 100);

    // --- 3. НОВОЕ: ФОНОВАЯ СИНХРОНИЗАЦИЯ ПРИ ОТКРЫТИИ ---
    const isLoggedWithPhrase = !!localStorage.getItem('syncPhraseId');
    const isLoggedWithGoogle = typeof auth !== 'undefined' && auth && auth.currentUser;
    
    if ((isLoggedWithPhrase || isLoggedWithGoogle) && typeof forceSyncNow === 'function') {
        // Запускаем синк асинхронно (без await), чтобы окно не зависало при плохом интернете
        forceSyncNow().then(() => {
            // Когда облако пришлет свежие данные и сольет их, просто перерисовываем списки
            // (проверяем, что окно все еще открыто, чтобы не рендерить впустую)
            if (window.quickModalIsOpen && typeof window.refreshQuickModalData === 'function') {
                window.refreshQuickModalData();
            }
        });
    }
  }
};



// === КРОСС-ВКЛАДОЧНАЯ СИНХРОНИЗАЦИЯ ===
// Слушаем изменения localStorage из соседних вкладок браузера
window.addEventListener('storage', (e) => {
    if ((e.key === 'dg_favorites' || e.key === 'localSearchHistory') && window.quickModalIsOpen) {
        if (typeof window.refreshQuickModalData === 'function') {
            window.refreshQuickModalData();
        }
    }
});
