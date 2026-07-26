document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById('paliauto');

    // Всегда актуальное значение q
    let q = "";

    // Функция обновления q
    const updateQ = () => {
        q = input?.value.trim().toLowerCase().replace(/ṁ/g, 'ṃ') || '';
    };

    updateQ(); // Первичное заполнение

    // Слушаем изменения инпута
    input?.addEventListener("input", updateQ);


    // -------- Обработчик для .q-link --------
    document.querySelectorAll(".q-link").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            updateQ();

            const baseUrl = el.getAttribute("data-href");
            if (!baseUrl) return;

            let finalUrl = baseUrl;
            if (q) {
                finalUrl += (baseUrl.includes("?") ? "&" : "?") + "q=" + encodeURIComponent(q);
            }

            window.open(finalUrl, "_blank", "noopener,noreferrer");
        });
    });


    // -------- Обработчик /assets/diff --------
    const diffLink = document.querySelector('a[href="/assets/diff"]');
    if (diffLink) {
        diffLink.addEventListener("click", (e) => {
            e.preventDefault();
            updateQ();

            const finalUrl = `/assets/diff/?one=${encodeURIComponent(q)}&two=${encodeURIComponent(q)}`;
            window.location.href = finalUrl;
        });
    }


    // -------- Кнопка "Читать главами" (#chapter-button) --------
    const chapterBtn = document.querySelector('#chapter-button a');

    if (chapterBtn) {
        chapterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            updateQ();

            if (!q) return;

            // base = sn12.55 → sn12 / an1.1-10 → an1 / mn1 → mn1
            const match = q.match(/^([a-z]+[0-9]+)/i);
            const base = match ? match[1] : q;

            const href = chapterBtn.getAttribute("href"); // /ru/r.php или /r.php

            const finalUrl =
                `${href}?q=${encodeURIComponent(base)}#${encodeURIComponent(q)}`;

            window.location.href = finalUrl;
        });
    }
});
