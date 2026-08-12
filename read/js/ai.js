const Sccopy = "/suttacentral.net";
const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
constfdgButton = document.getElementById("fdg-button");
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

// Делаем функцию асинхронной, чтобы использовать await вместо PHP
async function buildSutta(slug) {
  let translator = "";
  let texttype = "sutta";
  let slugArray = slug.split("&");
  slug = slugArray[0];
  if (slugArray[1]) {
    translator = slugArray[1];
  } 
  
  slug = slug.toLowerCase();

  // Определение типа текста
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
      if (!translator) translator = "o"; 
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

  var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

  const mtUrl  = window.location.href;
  const ruUrl = mtUrl.replace("/mt/", "/r/").replace("/ml/", "/r/");
  const mlUrl = mtUrl.replace("/mt/", "/ml/").replace("/r/", "/ml/");
  const enUrl = mtUrl.replace("/mt/", "/read/").replace("/ml/", "/read/").replace("/r/", "/read/");

  let scLink = `<p class="sc-link">
  <a title="Русский (Alt+1)" target="" href="${ruUrl}">Ru</a>
  <a title="Русский + Английский (Alt+2)" target="" href="${mlUrl}">R+E</a>
  <a target="" title="Английский (Alt+3)" href="${enUrl}">En</a>
  `;

  var varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`;
  var varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`;

  const rootResponse = fetch(rootpath).then(res => res.ok ? res.json() : fetch(`${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`).then(r => r.json())).catch(() => ({}));

  async function fetchTranslation() {
      const enFallbackTranslator = texttype === "vinaya" ? "brahmali" : "sujato";
      
      const sources = [
          { path: `/assets/texts/ai/${texttype}/${slugReady}_translation-ru-ai.json`, author: "ai" },
          { path: `/assets/texts/ru/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`, author: translator }, 
          { path: `${Sccopy}/sc-data/sc_bilara_data/translation/ru/${translator}/${texttype}/${slugReady}_translation-ru-${translator}.json`, author: translator },
          { path: `${Sccopy}/sc-data/sc_bilara_data/translation/en/${enFallbackTranslator}/${texttype}/${slugReady}_translation-en-${enFallbackTranslator}.json`, author: enFallbackTranslator }
      ];

      for (const source of sources) {
          try {
              const response = await fetch(source.path);
              if (response.ok) {
                  const data = await response.json();
                  if (data && Object.keys(data).length > 0) {
                      translator = source.author; 
                      return data;
                  }
              }
          } catch (error) {
              console.error(`Ошибка при разборе JSON из ${source.path}:`, error);
          }
      }
      return {}; 
  }

  async function fetchSecondTranslation() {
      const mainRuPath = "/assets/texts/ru";
      const otherRuPath = "/assets/texts/ru_other";
      const scRuPath = `${Sccopy}/sc-data/sc_bilara_data/translation/ru`;
      
      const prioritySources = [
          { path: `${mainRuPath}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`, author: translator },
          { path: `${otherRuPath}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`, author: translator },
          { path: `${scRuPath}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`, author: translator }
      ];

      for (const source of prioritySources) {
          try {
              const response = await fetch(source.path);
              if (response.ok) {
                  const data = await response.json();
                  if (data && Object.keys(data).length > 0) {
                      data._authorId = source.author;
                      return data;
                  }
              }
          } catch (error) {
              console.error(`Ошибка при разборе JSON из ${source.path}:`, error);
          }
      }

      const fallbackAuthors = ["o","sv+edited+o", "sv", "khantibalo", "syrkin+edited+o", "syrkin", "narinyanievmenenko"];
      const authorsToTry = fallbackAuthors.filter(a => a !== translator); 

      for (const author of authorsToTry) {
          const fallbackSources = [
              { path: `${mainRuPath}/${texttype}/${slugReady}_translation-${pathLang}-${author}.json`, author: author },
              { path: `${otherRuPath}/${texttype}/${slugReady}_translation-${pathLang}-${author}.json`, author: author },
              { path: `${scRuPath}/${author}/${texttype}/${slugReady}_translation-${pathLang}-${author}.json`, author: author }
          ];

          for (const source of fallbackSources) {
              try {
                  const response = await fetch(source.path);
                  if (response.ok) {
                      const data = await response.json();
                      if (data && Object.keys(data).length > 0) {
                          data._authorId = source.author;
                          return data;
                      }
                  }
              } catch (error) {
                  console.error(`Ошибка при разборе JSON из ${source.path}:`, error);
              }
          }
      }
      
      return null;
  }

  // Решаем состояние гонки: дожидаемся первый перевод, чтобы обновилась переменная translator
  const transData = await fetchTranslation(); 
  
  // Теперь второй переводчик гарантированно использует актуальное значение translator
  const engTransData = await (typeof fetchSecondTranslation === 'function' ? fetchSecondTranslation() : Promise.resolve({}));
  
  const htmlResponse = fetch(htmlpath).then(res => res.ok ? res.json() : {});
  const varResponse = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  Promise.all([rootResponse, htmlResponse, varResponse]).then(responses => {
      const [paliData, htmlData, varData] = responses;

      if (!htmlData || Object.keys(htmlData).length === 0) throw new Error("Text not found");

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
          
          let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
          if (finder && finder.trim() !== "") {
            let regex = new RegExp(finder, 'gi'); 
            const highlight = match => `<b class='match finder'>${match}</b>`;
            if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, highlight);
            if (transData[segment]) transData[segment] = transData[segment].replace(regex, highlight);
            if (engTransData && engTransData[segment]) engTransData[segment] = engTransData[segment].replace(regex, highlight);
            if (varData[segment]) varData[segment] = varData[segment].replace(regex, highlight);
          }
      
          window.applyRemovePunct(paliData, segment);

          let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
          let anchor = segment.substring(segment.indexOf(':') + 1);
          if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) anchor = segment;

          var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;
          const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
          let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

          const hasSecondTrn = engTransData && engTransData[segment];
          const secondTrnStyle = hasSecondTrn ? "display: block; margin-top: 4px; color: #666;" : "display: none;";

          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang inputscript-ISOPali" lang="pi">
                  ${linkToCopyStart}${(paliData[segment] || "").trim()}${linkToCopy}
                  ${varData[segment] ? `<font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>` : ''}
              </span>
              <span class="right-column">
                  <span class="rus-lang" lang="ru">${linkToCopyStart}${(transData[segment] || "").trim()}${linkToCopy}</span> 
                  <span class="eng-lang second-translation-row" lang="ru" style="${secondTrnStyle}">
                      <font>${linkToCopyStart}${(hasSecondTrn ? engTransData[segment].trim() : "")}${linkToCopy}</font>
                  </span>
              </span>
          </span>${closeHtml}\n\n`;
      }
      
      let translatorforuser = window.siteTranslators?.[pathLang]?.[translator] || translator;
      
      let secondTranslatorByline = "";
      if (engTransData && engTransData._authorId) {
          let secondTrName = window.siteTranslators?.[pathLang]?.[engTransData._authorId] || engTransData._authorId;
          secondTranslatorByline = `<span class="eng-lang second-translation-row"> Перевод 2: ${secondTrName}</span>`;
      }

      const translatorByline = `<div id="trn" class="byline"><p>
          <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span>
          <span class="right-column">
              <span class="rus-lang" lang="ru"> Пер. ${translatorforuser}</span><br>
              ${secondTranslatorByline}
          </span>
      </p></div>`;

      if (typeof generateThirdPartyLinks === 'function') scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);
      if (finalRulingAnchor) scLink += `&nbsp;<a href="#${finalRulingAnchor}" title="К окончательному правилу">Final</a>`;
      scLink += "</p>";

      suttaArea.innerHTML = `<div id="top-links-container" style="min-height: 24px;"></div><br>` + translatorByline + html + translatorByline + `<div id="bottom-links-container" style="min-height: 24px;"></div>`;
      
      const tContainer = document.getElementById('top-links-container');
      const bContainer = document.getElementById('bottom-links-container');
      if (tContainer) tContainer.innerHTML = scLink;
      if (bContainer) bContainer.innerHTML = scLink;

      toggleThePali();

      window.dispatchEvent(new Event('suttaLoaded'));
      if (typeof window.setupVariantVisibility === 'function') window.setupVariantVisibility();
      if (typeof renderNavigation === 'function') renderNavigation(slug, slugReady);
      if (typeof addToSearchHistory === 'function') addToSearchHistory();

  }).catch(error => {
      console.log('Error fetching sutta data:', error);
      if (typeof window.handleFetchError === 'function') {
          window.handleFetchError(slug, true); 
      }
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
  } else if  (localStorage.paliToggle) {
    language = localStorage.paliToggle; 
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
  if (language === "pli-2nd") {
    showPaliEnglish();
  } else if (language === "pli") {
    showPali();
  } else if (language === "2nd") {
    showEnglish();
  }
}

function showPaliEnglish() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove("hide-russian");
  
  const savedMode = localStorage.getItem('viewMode') || 'alternate';
  if (savedMode === 'columns') {
    suttaArea.classList.add('column-view');
  }
}

function showEnglish() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove("hide-russian");
  suttaArea.classList.remove('column-view');
}

function showPali() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove('column-view');
}



const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    citation.focus();
  });
});
