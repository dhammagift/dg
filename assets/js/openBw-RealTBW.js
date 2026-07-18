function checkForceLocalFlag() {
    const urlParams = new URLSearchParams(window.location.search);
    let changed = false;
    let isSet = false;

    if (urlParams.has('force_local')) {
        localStorage.setItem('forceLocal', 'true');
        changed = true;
        isSet = true;
      //  alert("Флаг forceLocal установлен и готовится к отправке в облако!");
    } else if (urlParams.has('clear_local')) {
        localStorage.removeItem('forceLocal');
        changed = true;
        isSet = false;
      //  alert("Флаг forceLocal удален локально и в облаке!");
    }

    // Если флаг изменился — регистрируем это для облака вручную
    if (changed) {
        // Создаем объекты на случай, если common.js еще не успел их инициализировать
        window.dg_pendingSettingsUpdates = window.dg_pendingSettingsUpdates || {};
        window.dg_deletedKeys = window.dg_deletedKeys || new Set();
        window.dg_settingsChanged = true;

        if (isSet) {
            window.dg_pendingSettingsUpdates['forceLocal'] = 'true';
            window.dg_deletedKeys.delete('forceLocal');
        } else {
            window.dg_deletedKeys.add('forceLocal');
            delete window.dg_pendingSettingsUpdates['forceLocal'];
        }

        // Пытаемся отправить сразу, если Firebase и скрипты синхронизации уже загружены
        if (typeof window.syncSettingsToCloud === 'function') {
            window.syncSettingsToCloud();
        }
    }
}

// Запускаем сразу при чтении скрипта
checkForceLocalFlag();
// console.log("Статус при запуске скрипта: forceLocal =", localStorage.getItem('forceLocal'));

document.addEventListener("DOMContentLoaded", function() {
    checkForceLocalFlag();
  //  console.log("DOM загружен. Текущий статус forceLocal =", localStorage.getItem('forceLocal'));

    const searchValue = getSearchValue();
    const bwLinks = document.querySelectorAll('.bwLink');
    bwLinks.forEach(link => {
        const slug = link.getAttribute('data-slug');
        const textUrl = findBwTextUrl(slug, searchValue);
        if (!textUrl) {
            link.style.display = 'none';
        } else {
            link.href = textUrl;
            link.target = "_blank";
        }
    });
});

function getSearchValue() {
    const urlParams = new URLSearchParams(window.location.search);
    const sParam = urlParams.get('s');
    let keyword = "";
    const keywordElement = document.querySelector('.keyword');
    if (keywordElement) {
        keyword = keywordElement.textContent.trim();
    }
    return sParam && sParam.trim() !== "" ? sParam : keyword;
}

function openBw(slug) {
    checkForceLocalFlag();
    const searchValue = getSearchValue();
    const textUrl = findBwTextUrl(slug, searchValue);
    if (textUrl) {
        window.open(textUrl, "_blank");
    } else {
        console.log("Link not found for slug:", slug);
    }
}

function findBwTextUrl(slug, searchValue) {
    checkForceLocalFlag();

    const datasetBw = typeof tbwLinksData !== 'undefined' ? tbwLinksData : [];
    if (!datasetBw || !datasetBw.length) return null;

    const item = datasetBw.find(item => Array.isArray(item) ? item[0] === slug : item === slug);
    if (!item) return null;

    const isForceLocal = localStorage.getItem('forceLocal') === 'true';
    const isLocalHost = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1');
    const isLocal = isLocalHost || isForceLocal;

    const isBbPath = window.location.pathname.startsWith('/b/');

 //   console.log(`Слуг [${slug}]: isLocal=${isLocal} (isLocalHost=${isLocalHost}, isForceLocal=${isForceLocal}), isBbPath=${isBbPath}`);

    if (isLocal) {
        if (isBbPath) {
            // Прямая ссылка для локального/секретного режима
            const match = slug.match(/^[a-z]+/);
            if (!match) return null;
            const folder = match[0];
            let url = "/bw/" + folder + "/" + slug + ".html";
            if (searchValue) {
                url += "?s=" + encodeURIComponent(searchValue);
            }
            return url;
        } else {
            // Стандартное поведение ссылки b
            let url = "/b/?q=" + encodeURIComponent(item[1]);
            if (searchValue) {
                url += "&s=" + encodeURIComponent(searchValue);
            }
            return url;
        }
    } else {
        // Обычный онлайн без флага
        const match = slug.match(/^[a-z]+/);
        if (!match) return null;
        const folder = match[0];
        let url = "https://thebuddhaswords.net/" + folder + "/" + slug + ".html";
        if (searchValue) {
            url += "?s=" + encodeURIComponent(searchValue);
        }
        return url;
    }
}

function findBwTextUrlOld(slug, searchValue) {
    let datasetBw;
    let tbwRootUrl;
    let base;

    if (window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1')) {
        base = "/";
        tbwRootUrl = "b/?q=";
    } else {
        base = "/";
        tbwRootUrl = "b/?q=";
    }

    // Assumes tbwLinksData is available in the global scope
    datasetBw = typeof tbwLinksData !== 'undefined' ? tbwLinksData : [];

    if (datasetBw && datasetBw.length) {
        const item = datasetBw.find(item => Array.isArray(item) ? item[0] === slug : item === slug);
        if (item) {
            let finalUrl = base + tbwRootUrl + item[1];
            // If a searchValue exists, append it as the 's' parameter
            if (searchValue) {
                finalUrl += '&s=' + encodeURIComponent(searchValue);
            }
            return finalUrl;
        }
    }
    return null;
}