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
const pathLang = "th";

let language = "pli-2nd";

homeButton.addEventListener("click", () => {
  document.location.search = "";
});

form.addEventListener("submit", e => {
  e.preventDefault();
  if (citation.value) {
    buildSutta(citation.value.replace(/\s+/g, " "));
    history.pushState({ page: citation.value.replace(/\s+/g, " ") }, "", `?q=${citation.value.replace(/\s+/g, " ")}`);
  }
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
    slug = slug.replace(/bi([psn])/, "bi-$1");
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
  
  let html = `<div class="button-area"><button id="language-button" class="hide-button">Pāḷi ไทย</button></div>`;
  const slugReady = parseSlug(slug);

  if (translator === "") {
      if (typeof getTranslator === 'function') {
          translator = await getTranslator(texttype, slugReady, pathLang);
      } else {
          translator = "siamrath";
      }
  }
  
  if (slug.match(/bu-pm|bi-pm/)) {
      translator = "jayasaro";
  }

  const onlynumber = slug.replace(/[a-zA-Z]/g, '');
  let params = new URLSearchParams(document.location.search);
  let script = params.get("script");
  const savedScript = localStorage.getItem('selectedScript');

  let rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  if (script === "isopali" || savedScript === "ISOPali") {
      rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  } else if (script === "devanagari" || savedScript === "Devanagari") {
      rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`;
  } else {
      rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`;
  }

  var thtrnpath = `/assets/texts/${pathLang}/translation/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
  var theditedtrnpath = `/assets/texts/${pathLang}/translation/${texttype}/${slugReady}_translation-${pathLang}-${translator}+edited+o.json`;

  var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

  let ruUrl  = window.location.href;
  let rusUrl = ruUrl.replace("/th/read/", "/r/");
  let mlUrl = ruUrl.replace("/th/read/", "/ml/");
  let mlthUrl = ruUrl.replace("/th/read/", "/mlth/");
  
  let scLink = `<p class="sc-link"><a target="" href="${rusUrl}">Ru</a> <a target="" href="${mlUrl}">R+E</a> <a target="" href="${mlthUrl}">T+E</a> `;

  const currentURL = window.location.href;
  const anchorURL = new URL(currentURL).hash; 

  var trnpath = thtrnpath; 

  if (slug.includes("mn") || slug.includes("sn") || slug.includes("an") || slug.includes("dn") || (typeof knranges !== 'undefined' && knranges.indexOf(slug) !== -1)) { 
      trnpath = thtrnpath; 
  } else if (slug.match(/ja/)) {
      language = "pli";
      let slugNumber = parseInt(slug.replace(/\D/g, ''), 10);
      if (slugNumber >= 1 && slugNumber <= 75) {
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/sutta/${slugReady}_translation-en-sujato.json`;
      } else if (slugNumber > 70) {
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
      }
  } else if (texttype === "sutta") {
      translator = "sujato";
      trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/${translator}/${texttype}/${slugReady}_translation-en-${translator}.json`;
  } else if (slug.match(/bu-pm|bi-pm/)) {
      translator = "jayasaro";
      trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slug}_translation-${pathLang}-${translator}.json`;
      htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
  } else if (texttype === "vinaya") {
      translator = "brahmali";
      trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/${translator}/${texttype}/${slugReady}_translation-en-${translator}.json`;
  }  

  var varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`;
  var varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`;

  const rootResponse = fetch(rootpath)
    .then(response => {
      if (!response.ok) throw new Error('Root file not found');
      return response.json();
    })
    .catch(error => {
      rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
      return fetch(rootpath).then(res => res.ok ? res.json() : {});
    });

  async function fetchTranslation() {
      const paths = [theditedtrnpath, thtrnpath, trnpath];
      for (const path of paths) {
          try {
              const response = await fetch(path);
              if (response.ok) return await response.json();
          } catch (error) {}
      }
      return {}; 
  }

  const translationResponse = fetchTranslation(); 
  const htmlResponse = fetch(htmlpath).then(response => response.json());
  const varResponse = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  Promise.all([rootResponse, translationResponse, htmlResponse, varResponse]).then(responses => {
      const [paliData, transData, htmlData, varData] = responses;

      if (!htmlData || Object.keys(htmlData).length === 0) {
          throw new Error("Text not found");
      }

      const segments = (typeof window.mergeGathas === 'function') ? 
          window.mergeGathas(htmlData, paliData, transData, varData) : Object.keys(htmlData);
      
      for (let i = 0; i < segments.length; i++) {
          let segment = segments[i];

          if (transData[segment] === undefined) transData[segment] = "&nbsp;";
          if (paliData[segment] === undefined) paliData[segment] = "&nbsp;";
        
          let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
          openHtml = openHtml || ''; 
          closeHtml = closeHtml || ''; 

          let startIndex = segment.indexOf(':') + 1;
          let anchor = segment.substring(startIndex);

          if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) {
              anchor = segment;
          }

          var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;
  
         window.applyRemovePunct(paliData, segment);
  
          let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
          if (finder && finder.trim() !== "") {
              let regex = new RegExp(finder, 'gi'); 
              try { if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, match => `<b class='match finder'>${match}</b>`); } catch (e) {}
              try { if (transData[segment]) transData[segment] = transData[segment].replace(regex, match => `<b class="match finder">${match}</b>`); } catch (e) {}
              try { if (varData[segment]) varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`); } catch (e) {}
          }

          const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
          let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

          if (paliData[segment] !== undefined && transData[segment] !== undefined && varData[segment] !== undefined) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang " lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
                      <font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>     
                  </span>
                  <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}<br></span>
              </span>${closeHtml}\n\n`;
          } else if (paliData[segment] !== undefined && transData[segment] !== undefined ) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang " lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
                  <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}<br></span>
              </span>${closeHtml}\n\n`;
          } else if (paliData[segment] !== undefined) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
              </span>${closeHtml}\n\n`;
          } else if (transData[segment] !== undefined) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
              </span>${closeHtml}\n\n`;
          }
      }

      let translatorforuser = translator;
      if (translator === "o") {
        translatorforuser = '<a href=/assets/common/o.html>o</a> с Пали';
      } else if (translator === "sv") {
        translatorforuser = 'SV theravada.ru с Англ';
      } else if  (translator === "siamrath" ) {
        translatorforuser = 'ไทย: Siam Rath, eng: Bhikkhu Sujato';
      } else if  (translator === "jayasaro" ) {
          translatorforuser = 'All by Bh Brahmali, patimokkha by A Jayasaro';
      } else if ((translator === "" && texttype === "sutta" ) || (translator === "sujato" )) {
        translatorforuser = 'ไทย: Siam Rath, eng: Bhikkhu Sujato';
      } else if ((translator === "" && texttype === "vinaya") || (translator === "brahmali" ))  {
        translatorforuser = 'All by Bh Brahmali, patimokkha by A Jayasaro';
      } else {
          translatorforuser = translator ;
      }

      const translatorByline = `<div id="trn" class="byline">
       <p>
      <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a> </span> <span class="rus-lang" lang="ru">Trn: ${translatorforuser}</span>
       </p>
       </div>`;
       
      let enUrl = ruUrl.replace("/th/read/", "/read/");
      scLink += `<a href="${enUrl}">En</a> `;

      const origUrl = window.location.href;
      let dUrl = origUrl.replace("/th/read/", "/d/");

      const SHOW_CLOSE_AFTER = 10;
      let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
      viewCount++;
      localStorage.setItem('warningViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('warningClosed');

      const warning = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;" class="warning-container">
          <p class='warning'>
          <strong>Note:</strong><a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>Translations, dictionaries and commentaries were not made by the Blessed One.<a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>Cross-check with Pali in 4 main nikayas.
                 ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''} 
          </p>
        </div>
      `;

      suttaArea.innerHTML = 
          `<div id="top-links-container" style="min-height: 24px;"></div><br>` + 
          (!isWarningClosed ? warning : '') + 
          translatorByline + 
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
            localStorage.setItem('warningClosed', 'true');
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
          scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);
      }
      scLink += "</p>";

      const topContainer = document.getElementById('top-links-container');
      const bottomContainer = document.getElementById('bottom-links-container');
      if (topContainer) topContainer.innerHTML = scLink;
      if (bottomContainer) bottomContainer.innerHTML = scLink;

      if (typeof renderNavigation === 'function') {
          renderNavigation(slug, slugReady);
      }
      if (typeof addToSearchHistory === 'function') {
          addToSearchHistory();
      }

  }).catch(error => {
      console.log('Error fetching sutta data:', error);
      if (typeof window.handleFetchError === 'function') {
          window.handleFetchError(slug, false); // true = русский интерфейс
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
  } else {
      suttaArea.innerHTML = `<div class="instructions"><p>Use text indexes for navigation.</p></div>`;
  }
  const abbreviations = document.querySelectorAll("span.abbr");
  abbreviations.forEach(book => {
    book.addEventListener("click", e => {
      citation.value = e.target.innerHTML;
      citation.focus();
    });
  });
}

function setLanguage(language) {
  if (language === "pli-2nd") {
    showPaliEnglish();
  } else if (language === "2nd") {
    showEnglish();
  } else if (language === "pli") {
    showPali();
  }
}

function showPaliEnglish() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove("hide-russian");
  const savedMode = localStorage.getItem('viewMode') || 'alternate'; 
  const isColumnView = (savedMode === 'columns');

  if (isColumnView) {
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

function handleVariantVisibility() {
  const toggleButton = document.getElementById("toggle-variants");
  const variantElements = document.querySelectorAll(".variant");

  if (!toggleButton || variantElements.length === 0) return;

  const storedState = localStorage.getItem("variantVisibility");

  if (storedState === "hidden") {
    variantElements.forEach((el) => el.classList.add("hidden-variant"));
  }

  toggleButton.addEventListener("click", function () {
    const isHidden = variantElements[0].classList.contains("hidden-variant");
    variantElements.forEach((el) => el.classList.toggle("hidden-variant"));
    localStorage.setItem("variantVisibility", isHidden ? "visible" : "hidden");
  });
}
