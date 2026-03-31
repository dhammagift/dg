const Sccopy = "/suttacentral.net";
const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
const fdgButton = document.getElementById("fdg-button");
const bodyTag = document.querySelector("body");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const previous2 = document.getElementById("previous2");
const next2 = document.getElementById("next2");
const form = document.getElementById("form");
const citation = document.getElementById("paliauto");
const pathLang = "ru";

let language = "pli-2nd";

homeButton.addEventListener("click", () => {
  document.location.search = "";
});

async function buildSutta(slug) {
  let texttype = "sutta";
  let slugArray = slug.split("&");
  slug = slugArray[0].toLowerCase();

  if ((!slug.match("bu-pm")) && (!slug.match("bi-pm")) && (slug.match(/bu-|bi-|kd|pvr/))) {
    texttype = "vinaya";
    slug = slug.replace(/bu([psan])/, "bu-$1");
    slug = slug.replace(/bi([psan])/, "bi-$1");
    if (!slug.match("pli-tv-")) slug = "pli-tv-" + slug;
    if (!slug.match("vb-")) slug = slug.replace("bu-", "bu-vb-");
    if (!slug.match("vb-")) slug = slug.replace("bi-", "bi-vb-");
  }

  if (slug.match(/bu-pm|bi-pm/)) {
    texttype = "vinaya";
    slug = slug.replace(/bu([psan])/, "bu-$1");
    slug = slug.replace(/bi([psn])/, "bi-$1");
    if (!slug.match("pli-tv-")) slug = "pli-tv-" + slug;
  }
  
  let html = `<div class="button-area"><button title="Switch language (Atl+Z or Alt+Space)" id="language-button" class="hide-button">पाळि Pāḷi</button></div>`;
  const slugReady = parseSlug(slug);

  let params = new URLSearchParams(document.location.search);
  let script = params.get("script");
  const savedScript = localStorage.getItem('selectedScript');

  // Определяем пути к файлам (только Root-пали, Devanagari/Thai-пали, HTML и Variants)
  let rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  let rootDevanagaripath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`;
  let htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

  if (script === "thai" || savedScript === "Thai") {
      rootDevanagaripath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`;
  } 

  if (slug.match(/bu-pm|bi-pm/)) {
      rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slug}_root-pli-ms.json`;
      rootDevanagaripath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slug}_rootd-pli-ms.json`;
      if (script === "thai" || savedScript === "Thai") {
          rootDevanagaripath = `/assets/texts/th/root/pli/ms/${texttype}/${slug}_rootth-pli-ms.json`;
      }
      htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
  }

  let varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`;
  let varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`;

  const mlUrl  = window.location.href;
  const ruUrl = mlUrl.replace("/d/", "/r/");
  const enUrl = mlUrl.replace("/d/", "/read/");

  let scLink = `<p class="sc-link"><a title="Russian (Alt+1)" target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" title="English (Alt+1)" href="${enUrl}">En</a>&nbsp;`;

  // Параллельная загрузка только нужных файлов
  const rootResponse = fetch(rootpath).then(res => res.ok ? res.json() : {});
  const rootDevResponse = fetch(rootDevanagaripath).then(res => res.ok ? res.json() : {});
  const htmlResponse = fetch(htmlpath).then(res => res.ok ? res.json() : {});
  const varResponse = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  Promise.all([rootResponse, rootDevResponse, htmlResponse, varResponse]).then(responses => {
      const [paliData, paliDevanagariData, htmlData, varData] = responses;

    // Проверка на отсутствие сутты
    if (!htmlData || Object.keys(htmlData).length === 0) {
        throw new Error("Text not found - triggering catch block");
    }
      // Объединяем Гатхи, используя Devanagari как transData
      const segments = (typeof window.mergeGathas === 'function') ? 
          window.mergeGathas(htmlData, paliData, paliDevanagariData, varData) : Object.keys(htmlData);

      for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];

        if (paliData[segment] === undefined) paliData[segment] = "";
        if (paliDevanagariData[segment] === undefined) paliDevanagariData[segment] = "";

        let [openHtml, closeHtml] = (htmlData[segment] || "").split(/{}/);
        openHtml = openHtml || '';
        closeHtml = closeHtml || '';

        let startIndex = segment.indexOf(':') + 1;
        let anchor = segment.substring(startIndex);

        if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) {
          anchor = segment;
        }

        var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;

        if (localStorage.getItem("removePunct") === "true") {
            if (paliData[segment]) {
                paliData[segment] = paliData[segment].replace(/[-—–]/g, ' ').replace(/[:;“”‘’,"']/g, '').replace(/[.?!]/g, ' | '); 
            }
            if (paliDevanagariData[segment]) {
                paliDevanagariData[segment] = paliDevanagariData[segment].replace(/[-—–]/g, ' ').replace(/[:;“”‘’,"']/g, '').replace(/[.?!]/g, ' | '); 
            }
        }

        let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
        if (finder && finder.trim() !== "") {
          let regex = new RegExp(finder, 'gi'); 
          try { if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, match => `<b class='match finder'>${match}</b>`); } catch (e) {}
          try { if (varData[segment]) varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`); } catch (e) {}
        }

        if (paliData[segment]) {
          paliData[segment] = paliData[segment].replace(/[—–—]/g, ' — ');
        }

        let linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
        let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

        if (varData[segment] !== undefined) {
            html += `${openHtml}<span id="${anchor}">
                <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliDevanagariData[segment].trim()}${linkToCopy}</span>
                <span class="greyedout rus-lang" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
                    <font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>
                </span>
            </span>${closeHtml}\n\n`;
        } else {
            html += `${openHtml}<span id="${anchor}">
                <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliDevanagariData[segment].trim()}${linkToCopy}</span>
                <span class="greyedout rus-lang" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
            </span>${closeHtml}\n\n`;
        }
      } 

      const translatorByline = `<div id="trn" class="byline">
       <p>
      <span class="pli-lang" lang="pi">पाळि <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">महासङ्गीति</a> </span>
       </p>
       </div>`;
      
      const origUrl = window.location.href;
      let rvUrl = origUrl.replace("/r/", "/read/").replace("/memorize/", "").replace("/d/", "").replace("/read/", "/rev/");

      const SHOW_CLOSE_AFTER = 5;  
      let viewCount = parseInt(localStorage.getItem('goodViewCount')) || 0;
      viewCount++;
      localStorage.setItem('goodViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('goodClosed');

      const warning = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;" class="warning-container">
          <p id="0.0" class='pli-lang' lang='pi' style='color:green;'>बहुस्सुतो होति सुतधरो सुतसन्निचयो... 
      <a class='text-decoration-none' target='' href='${rvUrl}'>&nbsp;</a>
                 ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''} 
          </p>
        </div>
      `;

      suttaArea.innerHTML = 
          `<div id="top-links-container" style="min-height: 24px;"></div><br>` + 
          (!isWarningClosed ? warning : '') + 
          html + 
          translatorByline + 
          (!isWarningClosed ? warning : '') + 
          `<div id="bottom-links-container" style="min-height: 24px;"></div>`;
window.dispatchEvent(new Event('suttaLoaded'));
      if (typeof window.setupVariantVisibility === 'function') {
          window.setupVariantVisibility();
      }

      if (canShowClose && !isWarningClosed) {
        document.querySelectorAll('.close-warning').forEach(btn => {
          btn.addEventListener('click', function() {
            localStorage.setItem('goodClosed', 'true');
            document.querySelectorAll('.warning-container').forEach(el => el.remove());
          });
        });
      }

      const pageTitleElement = document.querySelector("h1.sutta-title");
      let pageTitle = '';

      if (pageTitleElement) {
        let text = pageTitleElement.textContent;
        const paliLettersRegex = /[a-zāīūṭḍñṃṁṅṇśṣ\s]/gi;
        const filtered = text.match(paliLettersRegex);
        if (filtered) {
          pageTitle = filtered.join('');
        }
      }

      let cleanSlug = slug.replace(/pli-tv-|vb-/g, '');
      document.title = `${cleanSlug} ${pageTitle}`.trim();
          
      var metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = document.title;
      document.head.appendChild(metaDescription);

      var ogDescriptionMeta = document.createElement('meta');
      ogDescriptionMeta.property = 'og:description';
      ogDescriptionMeta.content = document.title;
      document.head.appendChild(ogDescriptionMeta);

      toggleThePali();

      if (typeof generateThirdPartyLinks === 'function') {
          scLink += generateThirdPartyLinks(slug, slugReady, texttype, "");
      }
      scLink += "</p>";

      const topContainer = document.getElementById('top-links-container');
      const bottomContainer = document.getElementById('bottom-links-container');
      if (topContainer) topContainer.innerHTML = scLink;
      if (bottomContainer) bottomContainer.innerHTML = scLink;

      if (typeof renderNavigation === 'function') renderNavigation(slug, slugReady);
      if (typeof addToSearchHistory === 'function') addToSearchHistory();

  }).catch(error => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/?p=-kn&q=" + encodeURIComponent(slug), true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            if (!xhr.responseText.includes("Page not found") && !xhr.responseText.includes("404") && xhr.responseText.trim().length > 0) {
              window.location.href = "/?q=" + encodeURIComponent(slug);
            }
          }
        }
      };
      
      suttaArea.innerHTML = `<p>Идёт Поиск "${decodeURIComponent(slug)}". Пожалуйста, Ожидайте.</p>
                          <div class="spinner-border" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                      </div>
    <p>    Подсказка: <br>
        С главной страницы доступно больше настроек поиска.
    <br></p>`;
  });
}

if (document.location.search) {
  let params = new URLSearchParams(document.location.search);
  let slug = params.get("q");
  let lang = params.get("lang");
  citation.value = slug;
  buildSutta(slug);

  if (lang) {
    language = lang;
    setLanguage(lang);
  } else if  (localStorage.paliToggleSpecial) {
    language = localStorage.paliToggleSpecial; 
    setLanguage(language);
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

function setLanguage(language) {
  if (language === "pli-2nd" || language === "2nd") {
    showPaliRussian();
  } else if (language === "pli") {
    showPali();
  }
}

function showPaliAll() {
  suttaArea.classList.remove("hide-pali", "hide-english", "hide-russian");
  const savedMode = localStorage.getItem('viewMode') || 'alternate';
  if (savedMode === 'columns') suttaArea.classList.add('column-view');
}
function showPaliRussian() {
  suttaArea.classList.remove("hide-pali", "hide-russian");
  suttaArea.classList.add("hide-english");
  const savedMode = localStorage.getItem('viewMode') || 'alternate';
  if (savedMode === 'columns') suttaArea.classList.add('column-view');
}
function showEnglish() {
  suttaArea.classList.add("hide-pali", "hide-russian");
  suttaArea.classList.remove("hide-english", "column-view");
}
function showRussian() {
  suttaArea.classList.add("hide-pali", "hide-english");
  suttaArea.classList.remove("hide-russian", "column-view");
}
function showPali() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english", "hide-russian");
  suttaArea.classList.remove('column-view');
}

function toggleThePali() {
  const languageButton = document.getElementById("language-button");

  if (!localStorage.paliToggleSpecial) {
    localStorage.paliToggleSpecial = "pli-2nd";
  }

  const newButton = languageButton.cloneNode(true);
  languageButton.parentNode.replaceChild(newButton, languageButton);

  newButton.addEventListener("click", () => {
    
    const segments = document.querySelectorAll("#sutta span[id]");
    const headerOffset = 70; 
    let anchorData = null;

    for (let segment of segments) {
      const rect = segment.getBoundingClientRect();
      if (rect.top > headerOffset) {
        anchorData = { element: segment, topOffset: rect.top };
        break; 
      }
    }

    if (language === "pli") {
      showPaliAll();
      language = "pli-2nd";
      localStorage.paliToggleSpecial = "pli-2nd";
    } else if (language === "pli-2nd") {
      showPali();
      language = "pli";
      localStorage.paliToggleSpecial = "pli";
    }

    if (anchorData && anchorData.element) {
         setTimeout(() => {
             const currentRect = anchorData.element.getBoundingClientRect();
             const currentAbsoluteTop = window.scrollY + currentRect.top;
             const targetPos = currentAbsoluteTop - anchorData.topOffset;

             const html = document.documentElement;
             const savedBehavior = html.style.scrollBehavior;
             html.style.cssText += "scroll-behavior: auto !important;";
             
             window.scrollTo(0, targetPos);

             setTimeout(() => {
                html.style.scrollBehavior = savedBehavior;
                html.style.removeProperty('scroll-behavior');
             }, 50);
         }, 0);
    }
  });
}

const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    citation.focus();
  });
});
