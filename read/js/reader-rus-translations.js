const Sccopy = "/suttacentral.net";
const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
const fdgButton = document.getElementById("fdg-button");
const citation = document.getElementById("paliauto");
const form = document.getElementById("form");
const pathLang = "ru";

let language = "pli-2nd";

if (homeButton) {
    homeButton.addEventListener("click", () => {
      document.location.search = "";
    });
}

// ==========================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ЯЗЫКА И ИНТЕРФЕЙСА
// ==========================================

window.showPaliEnglish = function() {
    if (suttaArea) {
        suttaArea.classList.remove("hide-pali", "hide-english", "hide-russian");
        const savedMode = localStorage.getItem('viewMode') || 'alternate';
        if (savedMode === 'columns') suttaArea.classList.add('column-view');
    }
};

window.showEnglish = function() {
    if (suttaArea) {
        suttaArea.classList.add("hide-pali");
        suttaArea.classList.remove("hide-english", "hide-russian", "column-view");
    }
};

window.showPali = function() {
    if (suttaArea) {
        suttaArea.classList.remove("hide-pali");
        suttaArea.classList.add("hide-english", "hide-russian");
        suttaArea.classList.remove('column-view');
    }
};

window.setLanguage = function(lang) {
    if (lang === "pli-2nd") window.showPaliEnglish();
    else if (lang === "pli") window.showPali();
    else if (lang === "2nd") window.showEnglish();
};

window.toggleThePali = function() {
    const storageKey = "paliToggle";
    const modes = ["pli-2nd", "pli", "2nd"];
    const defaultMode = "pli-2nd";
    const languageButton = document.getElementById("language-button");
    if (!languageButton) return;

    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, defaultMode);
    }
    window.language = localStorage.getItem(storageKey); 

    const newButton = languageButton.cloneNode(true);
    languageButton.parentNode.replaceChild(newButton, languageButton);

    newButton.addEventListener("click", () => {
        let currentMode = localStorage.getItem(storageKey) || defaultMode;
        let nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
        let nextMode = modes[nextIndex];

        const applyChange = () => {
            localStorage.setItem(storageKey, nextMode);
            window.language = nextMode;
            localStorage.setItem("dg_localSettingsTimestamp", Date.now().toString());

            if (nextMode === "pli") window.showPali();
            else if (nextMode === "2nd") window.showEnglish();
            else if (nextMode === "pli-2nd") window.showPaliEnglish();

            if (typeof window.syncSettingsToCloud === "function") {
                window.syncSettingsToCloud().then(() => {
                    if (typeof window.dg_settingsChanged !== 'undefined') {
                        window.dg_settingsChanged = false;
                    }
                });
            }
        };

        if (typeof window.runWithTransition === "function") window.runWithTransition(applyChange);
        else applyChange();
    });
};

window.setupVariantVisibility = function() {
    const toggleButton = document.getElementById("toggle-variants");
    if (!toggleButton) return; 

    let storedState = localStorage.getItem("variantVisibility") || "hidden";
    const eyeIcon = "/assets/svg/eye.svg";
    const eyeSlashIcon = "/assets/svg/eye-slash.svg";

    function applyState(state) {
        const variantElements = document.querySelectorAll(".variant");
        const currentBtn = document.getElementById("toggle-variants");
        const iconImage = currentBtn ? currentBtn.querySelector("img") : null;

        variantElements.forEach((el) => {
            if (state === "hidden") el.classList.add("hidden-variant");
            else el.classList.remove("hidden-variant");
        });

        if (iconImage) {
            if (state === "hidden") {
                iconImage.setAttribute("src", eyeSlashIcon);
                iconImage.classList.remove("fa-eye");
                iconImage.classList.add("fa-eye-slash");
            } else {
                iconImage.setAttribute("src", eyeIcon);
                iconImage.classList.remove("fa-eye-slash");
                iconImage.classList.add("fa-eye");
            }
        }
    }

    applyState(storedState);

    toggleButton.onclick = function(e) {
        if (e) e.preventDefault();
        storedState = storedState === "hidden" ? "visible" : "hidden";
        localStorage.setItem("variantVisibility", storedState);
        applyState(storedState);
        if (typeof showBubbleNotification === "function") {
            showBubbleNotification(storedState === "hidden" ? "Variants Off" : "Variants On");
        }
    };

    if (!window._variantHotkeySetup) {
        document.addEventListener("keydown", (event) => {
            if (event.altKey && event.code === "KeyV") {
                const currentBtn = document.getElementById("toggle-variants");
                if (currentBtn) currentBtn.click();
            }
        });
        window._variantHotkeySetup = true;
    }
};

window.mergeGathas = function(htmlData, paliData, transData, varData, engTransData = null) {
    const originalSegments = Object.keys(htmlData);
    if (localStorage.getItem("mergeGathas") === "false") return originalSegments; 
    
    const processedSegments = [];
    for (let i = 0; i < originalSegments.length; i++) {
        let segment = originalSegments[i];

        if (transData && transData[segment] === undefined) transData[segment] = "";
        if (engTransData && engTransData[segment] === undefined) engTransData[segment] = "";
        if (paliData && paliData[segment] === undefined) paliData[segment] = "";

        let nextSegment = originalSegments[i + 1];

        if (htmlData[segment] && htmlData[segment].includes('verse-line') &&
            nextSegment && htmlData[nextSegment] && htmlData[nextSegment].includes('verse-line')) {

            let [nextOpen, nextClose] = htmlData[nextSegment].split(/{}/);
            if (!nextOpen.includes('<p>')) {
                const toLower = (str) => {
                    if (!str) return "";
                    if (str.match(/^["“'‘]?(I\b|I'|O\b|О\b)/)) return str;
                    return str.charAt(0).toLowerCase() + str.slice(1);
                };

                if (paliData && paliData[nextSegment]) paliData[segment] = (paliData[segment] || "").trim() + " " + toLower(paliData[nextSegment].trim());
                if (transData && transData[nextSegment]) transData[segment] = (transData[segment] || "").trim() + " " + toLower(transData[nextSegment].trim());
                if (engTransData && engTransData[nextSegment]) engTransData[segment] = (engTransData[segment] || "").trim() + " " + toLower(engTransData[nextSegment].trim());
                if (varData && varData[nextSegment]) varData[segment] = (varData[segment] || "").trim() + " " + toLower(varData[nextSegment].trim());

                let [currOpen, currClose] = htmlData[segment].split(/{}/);
                htmlData[segment] = (currOpen || '') + "{}" + (nextClose || '');

                processedSegments.push(segment);
                i++; 
                continue;
            }
        }
        processedSegments.push(segment);
    }
    return processedSegments;
};

window.applyRemovePunct = function(dataObj, segment) {
    if (localStorage.getItem("removePunct") === "true" && dataObj && dataObj[segment] !== undefined) {
        dataObj[segment] = dataObj[segment].replace(/[-—–]/g, ' ')
                                           .replace(/[:;“”‘’,"']/g, '')
                                           .replace(/[.?!]/g, ' | ');
    }
};

window.generateThirdPartyLinks = function(slug, slugReady, texttype, translator) {
    let scLink = "";
    
    let dprUrl = null;
    if (typeof dprLinksData !== 'undefined') {
        let dprItem = dprLinksData.find(item => item[0] === slug.split('&')[0].toLowerCase());
        if (dprItem && dprItem[1]) dprUrl = "https://d.dhamma.gift/_dprhtml/index.html?loc=" + dprItem[1];
    }
    if (dprUrl) scLink += `<a target="_blank" title="Myanmar and Thai Editions at DPR" href="${dprUrl}">DPR</a>&nbsp;`;

    let bjtUrl = null;
    if (typeof bjtLinksData !== 'undefined') {
        let bjtItem = bjtLinksData.find(item => item[0] === slug.split('&')[0].toLowerCase());
        if (bjtItem && bjtItem[1]) bjtUrl = "https://open.tipitaka.lk/latn/" + bjtItem[1];
    }
    if (bjtUrl) scLink += `<a target="_blank" title="Buddha Jayanthi" href="${bjtUrl}">BJT</a>&nbsp;`;

    scLink += `<a data-slug="${texttype}/${slugReady}" href="javascript:void(0)" title="Text-to-Speech (Alt+R)" class="voice-link">Voice</a>`;
    scLink += `&nbsp;<a target="_blank" title='SuttaCentral.net' href="https://suttacentral.net/${slug}">SC</a>`;
    
    const isLocal = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1');
    
    if (typeof tbwLinksData !== 'undefined') {
        const hasTbw = tbwLinksData.find(item => Array.isArray(item) ? item[0] === slug : item === slug);
        if (hasTbw) {
            if (!window.location.pathname.startsWith('/b/') && isLocal) {
                scLink += `&nbsp;<a target="" title="BB and Other translations" href="/b/?q=${slug}">BB</a>`;
            }
            const book = (slug.match(/^[a-z]+/) || [""])[0];
            scLink += `&nbsp;<a target="_blank" title="TheBuddhasWords.net" href="${isLocal ? `/bw/${book}/${slug}.html` : `https://theBuddhasWords.net/${book}/${slug}.html`}">TBW</a>`;
        }
    }

    if (typeof thruLinksData !== 'undefined') {
        const ruItem = thruLinksData.find(item => item[0] === slug);
        if (ruItem) scLink += `&nbsp;<a title="Theravada.ru" target="_blank" href="/theravada.ru/Teaching/Canon/Suttanta/Texts/${ruItem[1]}">Th.ru</a>`;
    }

    if (isLocal && typeof thsuLinksDataoffl !== 'undefined') {
        const suItem = thsuLinksDataoffl.find(item => item[0] === slug);
        if (suItem) scLink += `&nbsp;<a title="Theravada.su" target="_blank" href="/tipitaka.theravada.su/dn/${suItem[1]}">Th.su</a>`;
    } else if (!isLocal && typeof thsuLinksData !== 'undefined') {
        const suItem = thsuLinksData.find(item => item[0] === slug);
        if (suItem) scLink += `&nbsp;<a title="Theravada.su" target="_blank" href="https://tipitaka.theravada.su/${suItem[1]}">Th.su</a>`;
    }
    return scLink;
};

// ==========================================
// ЛОГИКА НАВИГАЦИИ (JS-Парсинг textinfo)
// ==========================================

window.renderNavigation = function(slug, slugReady) {
    let params = new URLSearchParams(document.location.search);
    let sQuery = params.has("s") ? `&s=${params.get("s").replace(/ṃ/g, "ṁ")}` : "";

    fetch("/assets/js/textinfo.json")
        .then(response => response.text())
        .then(text => {
            let textInfo;
            try { 
                textInfo = JSON.parse(text); 
            } catch(e) { 
                // Безопасный парсинг JS объекта, если это не чистый JSON
                textInfo = new Function("return " + text.replace(/^(export default |const \\w+ = |let \\w+ = |var \\w+ = )/, '').replace(/;$/, ''))(); 
            }
            
            let currentItem = textInfo[slug] || textInfo[slugReady];
            let cleanSlug = slug.replace(/pli-tv-|b[ui]-vb-/g, "");
            let newTitle = cleanSlug;

            if (currentItem && currentItem.pi && currentItem.pi.trim() !== "~" && currentItem.pi.trim() !== "") {
                let cleanPaliName = currentItem.pi.replace(/[0-9.-]/g, '').trim();
                if (cleanPaliName) {
                    let translatedName = (currentItem.ru && currentItem.ru.trim() !== "~") ? currentItem.ru.replace(/[0-9.-]/g, '').trim() : "";
                    newTitle = translatedName ? `${cleanPaliName} ${translatedName} ${cleanSlug}` : `${cleanPaliName} ${cleanSlug}`;
                }
            }
            
            document.title = newTitle;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = newTitle;
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = newTitle;

            const keys = Object.keys(textInfo);
            let currentIndex = keys.indexOf(slug);
            if (currentIndex === -1) currentIndex = keys.indexOf(slugReady);
            if (currentIndex === -1) return;

            const formatLink = (targetSlug) => {
                let info = textInfo[targetSlug] || {};
                let name = (info.pi || info.ru || info.en || "").replace(/[0-9.-]/g, '').trim();
                let outSlug = targetSlug.replace(/pli-tv-|b[ui]-vb-/g, "");
                return name === "" ? outSlug : `${outSlug} <span class="sutta-name"> ${name}</span>`;
            };

            const next = document.getElementById("next");
            const next2 = document.getElementById("next2");
            if (currentIndex < keys.length - 1) {
                let nextSlug = keys[currentIndex + 1];
                let htmlNext = `<a href="?q=${nextSlug}${sQuery}">${formatLink(nextSlug)}
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11">
                        <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)"><path d="M202.1 450C 196.03278 449.9987 190.56381 446.34256 188.24348 440.73654C 185.92316 435.13055 187.20845 428.67883 191.5 424.39L191.5 424.39L365.79 250.1L191.5 75.81C 185.81535 69.92433 185.89662 60.568687 191.68266 54.782654C 197.46869 48.996624 206.82434 48.91536 212.71 54.6L212.71 54.6L397.61 239.5C 403.4657 245.3575 403.4657 254.8525 397.61 260.71L397.61 260.71L212.70999 445.61C 209.89557 448.4226 206.07895 450.0018 202.1 450z" fill="#8f8f8f"/></g>
                    </svg></a>`;
                if (next) next.innerHTML = htmlNext;
                if (next2) next2.innerHTML = htmlNext.replace(/class="sutta-name"/g, '');
            } else {
                if (next) next.innerHTML = "";
                if (next2) next2.innerHTML = "";
            }

            const previous = document.getElementById("previous");
            const previous2 = document.getElementById("previous2");
            if (currentIndex > 0) {
                let prevSlug = keys[currentIndex - 1];
                let htmlPrev = `<a href="?q=${prevSlug}${sQuery}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11">
                        <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)"><path d="M353 450C 349.02106 450.0018 345.20444 448.4226 342.39 445.61L342.39 445.61L157.5 260.71C 151.64429 254.8525 151.64429 245.3575 157.5 239.5L157.5 239.5L342.39 54.6C 346.1788 50.809414 351.70206 49.328068 356.8792 50.713974C 362.05634 52.099876 366.10086 56.14248 367.4892 61.318974C 368.87753 66.49547 367.3988 72.01941 363.61002 75.81L363.61002 75.81L189.32 250.1L363.61 424.39C 367.90283 428.6801 369.18747 435.13425 366.8646 440.74118C 364.5417 446.34808 359.06903 450.00275 353 450z" fill="#8f8f8f"/></g>
                    </svg>${formatLink(prevSlug)}</a>`;
                if (previous) previous.innerHTML = htmlPrev;
                if (previous2) previous2.innerHTML = htmlPrev.replace(/class="sutta-name"/g, '');
            } else {
                if (previous) previous.innerHTML = "";
                if (previous2) previous2.innerHTML = "";
            }
        })
        .catch(err => console.error("Error generating navigation:", err));
};

// ==========================================
// ОСНОВНАЯ ФУНКЦИЯ СБОРКИ СУТТЫ
// ==========================================

async function buildSutta(slug) {
    let params = new URLSearchParams(document.location.search);
    let scriptParam = params.get("script") || localStorage.getItem('selectedScript') || "";
    
    let apiResponse;
    try {
        apiResponse = await fetch(`/read/php/get_paths.php?slug=${encodeURIComponent(slug)}&script=${scriptParam}`);
        if (!apiResponse.ok) throw new Error("API error");
    } catch (error) {
        if (typeof window.handleFetchError === 'function') window.handleFetchError(slug, true);
        return;
    }

    const apiData = await apiResponse.json();
    const actualSlug = apiData.slug;
    const texttype = apiData.texttype;
    
    let htmlPath = apiData.html;
    let rootPath = apiData.pali_main;

    // Подстановка альтернативного скрипта пали
    const scriptKey = scriptParam.toLowerCase();
    if (scriptKey && scriptKey !== "isopali" && apiData.pali_alt && apiData.pali_alt[scriptKey]) {
        rootPath = apiData.pali_alt[scriptKey];
    }

    let transPath = null;
    let activeTranslatorId = "Неизвестно";
    let activeLang = "ru";

    if (apiData.translations.ru && apiData.translations.ru.length > 0) {
        transPath = apiData.translations.ru[0];
        activeLang = "ru";
    } else if (apiData.translations.en && apiData.translations.en.length > 0) {
        transPath = apiData.translations.en[0];
        activeLang = "en";
    }
    
    if (transPath) {
        const match = transPath.match(/_translation-[a-z]+-(.+)\.json$/);
        if (match) activeTranslatorId = match[1];
    }

    let varPath = (apiData.variants && apiData.variants.length > 0) ? apiData.variants[0] : null;

    if (!htmlPath || !rootPath) {
        if (typeof window.handleFetchError === 'function') window.handleFetchError(actualSlug, true);
        return;
    }

    const fetchJson = async (url) => {
        if (!url) return {};
        try { let res = await fetch(url); return res.ok ? await res.json() : {}; } 
        catch(e) { return {}; }
    };

    const [htmlData, paliData, transData, varData] = await Promise.all([
        fetchJson(htmlPath), fetchJson(rootPath), fetchJson(transPath), fetchJson(varPath)
    ]);

    let html = `<div class="button-area"><button title="Переключить язык (Atl+Z или Alt+Space)" id="language-button" class="hide-button">Pāḷi Рус</button></div>`;
    
    let finalRulingAnchor = "";
    if (actualSlug.includes("bu-") || actualSlug.includes("bi-")) {
        for (let seg in htmlData) {
            if (htmlData[seg] && htmlData[seg].includes("patimokkha")) {
                finalRulingAnchor = seg.substring(seg.indexOf(':') + 1);
                break;
            }
        }
    }

    const segments = window.mergeGathas(htmlData, paliData, transData, varData);
    
    // КРИТИЧНО для autopali.js: Оставляем класс inputscript-ISOPali
    const pliClass = "pli-lang inputscript-ISOPali";

    for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];

        let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
        openHtml = openHtml || ''; closeHtml = closeHtml || ''; 

        let startIndex = segment.indexOf(':') + 1;
        let anchor = segment.substring(startIndex);
        if (actualSlug.includes('-') && (actualSlug.includes('an') || actualSlug.includes('sn') || actualSlug.includes('dhp'))) {
            anchor = segment;
        }

        var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;

        window.applyRemovePunct(paliData, segment);

        let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
        if (finder && finder.trim() !== "") {
            let regex = new RegExp(finder, 'gi');
            try {
                if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, match => `<b class='match finder'>${match}</b>`);
                if (transData[segment]) transData[segment] = transData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
                if (varData[segment]) varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
            } catch (error) {}
        }

        const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
        let linkToCopy = `<a class="text-decoration-none copyLink" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

        if (paliData[segment] !== undefined && transData[segment] !== undefined && varData[segment] !== undefined && Object.keys(varData).length > 0) {
            html += `${openHtml}<span id="${anchor}">
                <span class="${pliClass}" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
                <font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>     
                </span>
                <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
                </span>${closeHtml}\n\n`;
        } else if (paliData[segment] !== undefined && transData[segment] !== undefined) {
            html += `${openHtml}<span id="${anchor}">
                <span class="${pliClass}" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
                <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
                </span>${closeHtml}\n\n`;
        } else if (paliData[segment] !== undefined) {
            html += openHtml + '<span id="' + anchor + '"><span class="' + pliClass + '" lang="pi">' + linkToCopyStart + paliData[segment].trim() + linkToCopy + '</span></span>' + closeHtml + '\n\n';
        } else if (transData[segment] !== undefined) {
            html += openHtml + '<span id="' + anchor + '"><span class="rus-lang" lang="ru">' + linkToCopyStart + transData[segment].trim() + linkToCopy + '</span></span>' + closeHtml + '\n\n';
        }
    }

    let translatorforuser = activeTranslatorId;
    if (apiData.translator_info && apiData.translator_info[activeLang] && apiData.translator_info[activeLang][activeTranslatorId]) {
        translatorforuser = apiData.translator_info[activeLang][activeTranslatorId];
    } else {
        translatorforuser = translatorforuser.charAt(0).toUpperCase() + translatorforuser.slice(1);
    }

    const translatorByline = `<div id="trn" class="byline">
    <p><span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span> <span class="rus-lang" lang="ru"> Пер. ${translatorforuser}</span></p>
    </div>`;

    const ruUrl  = window.location.href;
    const mlUrl = ruUrl.replace("/r/", "/ml/");
    const mtUrl = ruUrl.replace("/r/", "/mt/");
    const enUrl = ruUrl.replace("/r/", "/read/");
    
    let cleanSlugReady = htmlPath.split('/').pop().replace('_html.json', '');
    
    let scLink = `<p class="sc-link">
    <a target="" title='Pali + Русский + Русский' href="${mtUrl}">R+R</a>
    <a target="" title='Pali + Русский + Английский (Alt+2)' href="${mlUrl}">R+E</a>
    <a title='Английский (Alt+1)' href="${enUrl}">En</a>&nbsp;`;

    scLink += window.generateThirdPartyLinks(actualSlug, cleanSlugReady, texttype, activeTranslatorId);
    
    if (finalRulingAnchor) {
        scLink += `&nbsp;<a href="#${finalRulingAnchor}" title="К окончательному правилу">Final</a>`;
    }
    scLink += "</p>";

    const origUrl = window.location.href;
    let dUrl = origUrl.replace("/r/", "/d/");
    let thUrl = origUrl.replace("/r/", "/th/read/");

    const SHOW_CLOSE_AFTER = 10;
    let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
    viewCount++;
    localStorage.setItem('warningViewCount', viewCount);
    const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
    const isWarningClosed = localStorage.getItem('warningClosed');

    const warning = `
        <div class="warning-container warning-box">
        <p class='warning'>
            <strong>Заметка:</strong><a class='text-decoration-none cursor-pointer' target='' href='${dUrl}'>&nbsp;</a>Переводы, словари и комментарии сделаны не Благословенным.<a class='text-decoration-none cursor-pointer' target='' href='${thUrl}'>&nbsp;</a>Сверяйтесь с Пали в 4 основных никаях.
                ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''} 
        </p>
        </div>
    `;

    suttaArea.innerHTML = 
        `<div id="top-links-container" class="min-h-24"></div><br>` + 
        (!isWarningClosed ? warning : '') + 
        translatorByline + 
        html + 
        translatorByline + 
        (!isWarningClosed ? warning : '') + 
        `<div id="bottom-links-container" class="min-h-24"></div>`;
    
    const topContainer = document.getElementById('top-links-container');
    const bottomContainer = document.getElementById('bottom-links-container');
    if (topContainer) topContainer.innerHTML = scLink;
    if (bottomContainer) bottomContainer.innerHTML = scLink;

    window.renderNavigation(actualSlug, cleanSlugReady);

    window.dispatchEvent(new Event('suttaLoaded'));
    
    window.setupVariantVisibility();
    
    if (canShowClose && !isWarningClosed) {
        document.querySelectorAll('.close-warning').forEach(btn => {
        btn.addEventListener('click', function() {
            localStorage.setItem('warningClosed', 'true');
            document.querySelectorAll('.warning-container').forEach(el => el.remove());
        });
        });
    }

    window.toggleThePali();
    if (typeof window.addToSearchHistory === 'function') window.addToSearchHistory();
}

// Инициализация при старте
if (document.location.search) {
    let params = new URLSearchParams(document.location.search);
    let slug = params.get("q");
    let lang = params.get("lang");

    if (slug) {
        if(citation) citation.value = slug;
        buildSutta(slug);
    }
    
    if (lang) {
        window.setLanguage(lang);
    } else if (localStorage.paliToggle) {
        window.setLanguage(localStorage.paliToggle);
    } 
} else {
    if (typeof window.getInstructionHTML === 'function') {
        suttaArea.innerHTML = window.getInstructionHTML(pathLang);
        
        const abbreviations = document.querySelectorAll("span.abbr");
        abbreviations.forEach(book => {
            book.addEventListener("click", e => {
                citation.value = e.target.innerHTML;
                citation.focus();
            });
        });
    } else {
        suttaArea.innerHTML = `<p>Инструкции загружаются...</p>`;
    }
}
