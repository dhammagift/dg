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
  let translator = "";
  let texttype = "sutta";
  let slugArray = slug.split("&");
  slug = slugArray[0];
  if (slugArray[1]) {
    translator = slugArray[1];
  } 
  
  slug = slug.toLowerCase();

  if ((!slug.match("bu-pm")) && (!slug.match("bi-pm")) && (slug.match(/bu-|bi-|kd|pvr/))) {
    texttype = "vinaya";
    slug = slug.replace(/bu([psan])/, "bu-$1");
    slug = slug.replace(/bi([psan])/, "bi-$1");
    if (!slug.match("pli-tv-")) {
      slug = "pli-tv-" + slug;
    }
    if (!slug.match("vb-")) {
      slug = slug.replace("bu-", "bu-vb-");
    }
    if (!slug.match("vb-")) {
      slug = slug.replace("bi-", "bi-vb-");
    }
  }

  if (slug.match(/bu-pm|bi-pm/)) {
    texttype = "vinaya";
    slug = slug.replace(/bu([psan])/, "bu-$1");
    slug = slug.replace(/bi([psan])/, "bi-$1");
    if (!slug.match("pli-tv-")) {
      slug = "pli-tv-" + slug;
    }
  }
  
  let html = `<div class="button-area"><button title="Переключить язык (Atl+Z или Alt+Space)" id="language-button" class="hide-button">Pāḷi Рус</button></div>`;
  const slugReady = parseSlug(slug);

  if (translator === "") {
      translator = await getTranslator(texttype, slugReady, pathLang);
  }

  let params = new URLSearchParams(document.location.search);
  let script = params.get("script");
  const savedScript = localStorage.getItem('selectedScript');

  let rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  if (script === "devanagari" || savedScript === "Devanagari") {
      rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`;
  } else if (script === "thai" || savedScript === "Thai") {
      rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`;
  }

  var rustrnpath = `/assets/texts/ru/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;

  var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

  const mlUrl  = window.location.href;
  const ruUrl = mlUrl.replace("/ml/", "/r/");
  const enUrl = mlUrl.replace("/ml/", "/read/");

  let scLink = `<p class="sc-link"><a title="Русский (Alt+1)" target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" title="Английский (Alt+1)" href="${enUrl}">En</a>&nbsp;`;

  var trnpath = rustrnpath; 

  if (slug.includes("mn") || slug.includes("sn") || slug.includes("an") || slug.includes("dn") || (typeof knranges !== 'undefined' && knranges.indexOf(slug) !== -1)) { 
      trnpath = rustrnpath; 
  } else if (slug.match(/ja/)) {
      let slugNumber = parseInt(slug.replace(/\D/g, ''), 10);
      if (slugNumber >= 1 && slugNumber <= 75) {
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/ru/sv/sutta/${slugReady}_translation-ru-sv.json`;
      }
  } else if (slug.match(/bu-pm|bi-pm/)) {
      translator = slug.match(/bi-pm/) ? "adelina" : "o";
      trnpath = `/assets/texts/ru/${texttype}/${slug}_translation-${pathLang}-${translator}.json`;
      htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
  }

  var varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`;
  var varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`;

  const rootResponse = fetch(rootpath).then(res => res.ok ? res.json() : fetch(`${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`).then(r => r.json())).catch(() => ({}));

  async function fetchTranslation() {
      const paths = [rustrnpath, trnpath];
      for (const path of paths) {
          try {
              const response = await fetch(path);
              if (response.ok) return await response.json();
          } catch (error) {}
      }
      return {}; 
  }

  async function fetchSecondTranslation() {
      let engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/${texttype}/${slugReady}_translation-en-sujato.json`;
      if (texttype === "vinaya") {
          engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/${texttype}/${slugReady}_translation-en-brahmali.json`;
      } else if (typeof otrnranges !== 'undefined' && otrnranges.indexOf(slug) !== -1) { 
          engtrnpath = `/assets/texts/en/o/${texttype}/${slugReady}_translation-en-o.json`;
      }

      var svtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/ru/sv/${texttype}/${slugReady}_translation-ru-sv.json`;
      if (slug.match(/ja/)) {
          let slugNumber = parseInt(slug.replace(/\D/g, ''), 10);
          if (slugNumber >= 1 && slugNumber <= 75) {
              svtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/ru/sv/sutta/${slugReady}_translation-ru-sv.json`;
          }
      }

      let pathsToTry = [];
      if (texttype === "vinaya" || (typeof otrnranges !== 'undefined' && otrnranges.indexOf(slug) !== -1)) {
          pathsToTry = [engtrnpath];
      } else {
          pathsToTry = [svtrnpath, engtrnpath];
      }

      for (const path of pathsToTry) {
          try {
              const response = await fetch(path);
              if (response.ok) {
                  const data = await response.json();
                  if (data && Object.keys(data).length > 0) return data;
              }
          } catch (error) {}
      }
      return {};
  }

  const translationResponse = fetchTranslation(); 
  const engtranslationResponse = fetchSecondTranslation();
  const htmlResponse = fetch(htmlpath).then(res => res.ok ? res.json() : {});
  const varResponse = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  Promise.all([rootResponse, translationResponse, engtranslationResponse, htmlResponse, varResponse]).then(responses => {
      const [paliData, transData, engTransData, htmlData, varData] = responses;

      if (!htmlData || Object.keys(htmlData).length === 0) throw new Error("Text not found");

      // ПОИСК ОКОНЧАТЕЛЬНОГО ПРАВИЛА (Final Ruling)
      let finalRulingAnchor = "";
      if (slug.includes("bu-") || slug.includes("bi-")) {
          for (let seg in htmlData) {
              if (htmlData[seg] && htmlData[seg].includes("patimokkha")) {
                  finalRulingAnchor = seg.substring(seg.indexOf(':') + 1);
                  break;
              }
          }
      }

      const segments = (typeof window.mergeGathas === 'function') ? 
          window.mergeGathas(htmlData, paliData, transData, varData, engTransData) : Object.keys(htmlData);
      
      for (let i = 0; i < segments.length; i++) {
          let segment = segments[i];
          let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
          let anchor = segment.substring(segment.indexOf(':') + 1);
          if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) anchor = segment;

          var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;
          const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
          let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang inputscript-ISOPali" lang="pi">
                  ${linkToCopyStart}${(paliData[segment] || "").trim()}${linkToCopy}
                  ${varData[segment] ? `<font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>` : ''}
              </span>
              <span class="right-column">
                  <span class="rus-lang" lang="ru">${linkToCopyStart}${(transData[segment] || "").trim()}${linkToCopy}</span> 
                  <span class="eng-lang" lang="en"><font>${linkToCopyStart}${(engTransData[segment] || "").trim()}${linkToCopy}</font></span>
              </span>
          </span>${closeHtml}\n\n`;
      }

      let translatorforuser = window.siteTranslators?.[pathLang]?.[translator] || translator;
      const translatorByline = `<div id="trn" class="byline"><p><span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span> <span class="rus-lang" lang="ru"> Пер. ${translatorforuser}</span></p></div>`;
       
      if (typeof generateThirdPartyLinks === 'function') scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);
      
      // Внедрение ссылки Final
      if (finalRulingAnchor) scLink += `&nbsp;<a href="#${finalRulingAnchor}" title="К окончательному правилу">Final</a>`;
      scLink += "</p>";

      suttaArea.innerHTML = `<div id="top-links-container" style="min-height: 24px;"></div><br>` + translatorByline + html + translatorByline + `<div id="bottom-links-container" style="min-height: 24px;"></div>`;
      
      const tContainer = document.getElementById('top-links-container');
      const bContainer = document.getElementById('bottom-links-container');
      if (tContainer) tContainer.innerHTML = scLink;
      if (bContainer) bContainer.innerHTML = scLink;

      // Инициализируем кнопку переключения языка
      toggleThePali();

      window.dispatchEvent(new Event('suttaLoaded'));
      if (typeof window.setupVariantVisibility === 'function') window.setupVariantVisibility();
      if (typeof renderNavigation === 'function') renderNavigation(slug, slugReady);
      if (typeof addToSearchHistory === 'function') addToSearchHistory();

  }).catch(error => { /* логика фолбэка */ });
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
    showPaliAll();
  } else if (language === "pli") {
    showPali();
  }
}

function showPaliAll() {
  suttaArea.classList.remove("hide-pali", "hide-english", "hide-russian");
  const savedMode = localStorage.getItem('viewMode') || 'alternate';
  if (savedMode === 'columns') suttaArea.classList.add('column-view');
}

function showPali() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english", "hide-russian");
  suttaArea.classList.remove('column-view');
}

const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    citation.focus();
  });
});
