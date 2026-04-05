class TopNavIcons extends HTMLElement {
    connectedCallback() {
        // Читаем атрибуты: тип главной ссылки и флаг для словаря
        const type = this.getAttribute('type') || 'home';
        const showDict = this.hasAttribute('show-dict');
        
        const isRead = type === 'read';
        const firstIconId = isRead ? 'nav_read_link' : 'nav_home_link';
        const firstIconTitle = isRead ? 'Sutta and Vinaya reading' : 'Home';

        let html = `
            <a href="/read.php" id="${firstIconId}" title="${firstIconTitle}" rel="noreferrer" class="me-1 top-nav-icon-link">
                <svg fill="#979797" version="1.1" viewBox="0 0 547.596 547.596" height="26px" stroke="#979797"><path d="M540.76,254.788L294.506,38.216c-11.475-10.098-30.064-10.098-41.386,0L6.943,254.788 c-11.475,10.098-8.415,18.284,6.885,18.284h75.964v221.773c0,12.087,9.945,22.108,22.108,22.108h92.947V371.067 c0-12.087,9.945-22.108,22.109-22.108h93.865c12.239,0,22.108,9.792,22.108,22.108v145.886h92.947 c12.24,0,22.108-9.945,22.108-22.108v-221.85h75.965C549.021,272.995,552.081,264.886,540.76,254.788z"></path></svg>
            </a>
            <a href="/" id="nav_search_link" title="Sutta and Vinaya search" rel="noreferrer" class="me-1 top-nav-icon-link">
                <img width="24px" alt="dhamma.gift icon" src="/assets/img/gray-white.png">
            </a>
        `;

        // Опциональная кнопка словаря
        if (showDict) {
            html += `
            <a alt="Onclick popup dictionary" title="Onclick popup dictionary (Alt+A)" class="mx-1 toggle-dict-btn top-nav-icon-link cursor-pointer">
                <img src="/assets/svg/comment.svg" class="top-nav-icon dictIcon">
            </a>
            `;
        }

        // Общие кнопки темы и компаса
        html += `
            <a id="theme-button" title="Switch theme (Alt+T)" onclick="switchIcon(this)" class="mx-1 top-nav-icon-link cursor-pointer">
                <img src="/assets/svg/circle-half-stroke.svg" alt="Switch theme" class="top-nav-icon changesvg">
            </a>
            <a onclick="toggleQuickModal()" aria-label="Open Cattāri Ariyasaccāni" title="Compass" class="mx-1 top-nav-icon-link cursor-pointer d-flex align-items-center">
                <img src="/assets/svg/compass.svg" class="compass-icon top-nav-icon">
            </a>
        `;

        this.innerHTML = html;
        
        // Позволяет элементам внутри компонента подчиняться flexbox-правилам родителя
        this.style.display = 'contents';
    }
}

customElements.define('top-nav-icons', TopNavIcons);
