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

  // Получаем переводчика через новую функцию из common.js
  if (translator === "") {
      translator = await getTranslator(texttype, slugReady, pathLang);
  }

  const onlynumber = slug.replace(/[a-zA-Z]/g, '');
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
  var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/${texttype}/${slugReady}_translation-en-sujato.json`;

  if (texttype === "vinaya") {
      engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/${texttype}/${slugReady}_translation-en-brahmali.json`;
  } else if (typeof otrnranges !== 'undefined' && otrnranges.indexOf(slug) !== -1) { 
      engtrnpath = `/assets/texts/en/o/${texttype}/${slugReady}_translation-en-o.json`;
  }

  var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

  const mlUrl  = window.location.href;
  const ruUrl = mlUrl.replace("/ml/", "/r/");
  const enUrl = mlUrl.replace("/ml/", "/read/");

  let scLink = `<p class="sc-link"><a title="Русский (Alt+1)" target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" title="Английский (Alt+1)" href="${enUrl}">En</a>&nbsp;`;

  const currentURL = window.location.href;
  const anchorURL = new URL(currentURL).hash; 

  var trnpath = rustrnpath; 

  if (slug.includes("mn") || slug.includes("sn") || slug.includes("an") || slug.includes("dn") || (typeof knranges !== 'undefined' && knranges.indexOf(slug) !== -1)) { 
      trnpath = rustrnpath; 
      if(slug.includes("mn")) language = "pli-2nd";
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
      translator = slug.match(/bi-pm/) ? "adelina" : "o";
      
      if (script === "devanagari" || savedScript === "Devanagari") {
          rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slug}_rootd-pli-ms.json`;
      } else if (script === "thai" || savedScript === "Thai") {
          rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slug}_rootth-pli-ms.json`;
      } else {
          rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slug}_root-pli-ms.json`;
      }
     
      trnpath = `/assets/texts/ru/${texttype}/${slug}_translation-${pathLang}-${translator}.json`;
      engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/${texttype}/${slug}_translation-en-brahmali.json`;
      htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
  } else if (texttype === "vinaya") {
      if (typeof vinayaranges !== 'undefined' && vinayaranges.indexOf(slug) !== -1) { 
          trnpath = rustrnpath; 
      } else {
          translator = "brahmali";
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/${translator}/${texttype}/${slugReady}_translation-en-${translator}.json`;
      }
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
      const paths = [rustrnpath, trnpath];
      for (const path of paths) {
          try {
              const response = await fetch(path);
              if (response.ok) return await response.json();
          } catch (error) {}
      }
      return {}; 
  }

  const translationResponse = fetchTranslation(); 
  const engtranslationResponse = fetch(engtrnpath)
      .then(response => response.json())
      .catch(error => { return {}; });
      
  const htmlResponse = fetch(htmlpath).then(response => response.json());
  const varResponse = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  Promise.all([rootResponse, translationResponse, engtranslationResponse, htmlResponse, varResponse]).then(responses => {
      const [paliData, transData, engTransData, htmlData, varData] = responses;

    // Проверка на отсутствие сутты
    if (!htmlData || Object.keys(htmlData).length === 0) {
        throw new Error("Text not found - triggering catch block");
    }

      // Объединяем Гатхи с помощью новой функции из common.js (с поддержкой engTransData)
      const segments = (typeof window.mergeGathas === 'function') ? 
          window.mergeGathas(htmlData, paliData, transData, varData, engTransData) : Object.keys(htmlData);
      
      for (let i = 0; i < segments.length; i++) {
          let segment = segments[i];

          if (transData[segment] === undefined) transData[segment] = "";
          if (engTransData[segment] === undefined) engTransData[segment] = "";
          if (paliData[segment] === undefined) paliData[segment] = "";
        
          let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
          openHtml = openHtml || ''; 
          closeHtml = closeHtml || ''; 

          let startIndex = segment.indexOf(':') + 1;
          let anchor = segment.substring(startIndex);

          if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) {
              anchor = segment;
          }

          var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;
          let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");

          if (localStorage.getItem("removePunct") === "true" && paliData[segment] !== undefined) {
              paliData[segment] = paliData[segment].replace(/[-—–]/g, ' ');  
              paliData[segment] = paliData[segment].replace(/[:;“”‘’,"']/g, '');  
              paliData[segment] = paliData[segment].replace(/[.?!]/g, ' | '); 
          }

          if (finder && finder.trim() !== "") {
              let regex = new RegExp(finder, 'gi'); 
              try { if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, match => `<b class='match finder'>${match}</b>`); } catch (e) {}
              try { if (transData[segment]) transData[segment] = transData[segment].replace(regex, match => `<b class="match finder">${match}</b>`); } catch (e) {}
              try { if (varData[segment]) varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`); } catch (e) {}
          }

          const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
          let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

          // Структура HTML для мультиязычного режима
          if (engTransData[segment] !== transData[segment] && varData[segment] !== undefined) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang inputscript-ISOPali" lang="pi">
                      ${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
                      <font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>
                  </span>
                  <span class="right-column">
                      <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span> 
                      <span class="eng-lang" lang="en"><font>${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</font></span>
                  </span>
              </span>${closeHtml}\n\n`;
          } else if (engTransData[segment] !== transData[segment]) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
                  <span class="right-column">
                      <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span> 
                      <span class="eng-lang" lang="en"><font>${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</font></span>
                  </span>
              </span>${closeHtml}\n\n`;
          } else if (varData[segment] !== undefined) {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
                  <div class="variant">${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</div>
                  <span class="right-column">
                      <span class="rus-lang" lang="en">${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</span>
                  </span>
              </span>${closeHtml}\n\n`;
          } else {
              html += `${openHtml}<span id="${anchor}">
                  <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
                  <span class="rus-lang" lang="en">${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</span>
              </span>${closeHtml}\n\n`;
          }
      }

      // Подготовка красивого имени переводчика
      let translatorforuser = translator;
      if (window.siteTranslators && window.siteTranslators[pathLang] && window.siteTranslators[pathLang][translator]) {
          translatorforuser = window.siteTranslators[pathLang][translator];
      } else if (window.siteTranslators && window.siteTranslators["en"] && window.siteTranslators["en"][translator]) {
          translatorforuser = window.siteTranslators["en"][translator];
      } else if (translator === "sv+edited+o") {
          translatorforuser = 'SV theravada.ru с Англ, ред. <a href=/assets/common/o.html>o</a>';
      }

      const translatorByline = `<div id="trn" class="byline">
       <p>
      <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span> <span class="rus-lang" lang="ru"> Пер. ${translatorforuser}</span>
       </p>
       </div>`;
       
      const origUrl = window.location.href;
      let dUrl = origUrl.replace("/ml/", "/d/");
      let thUrl = origUrl.replace("/ml/", "/mlth/");

      const SHOW_CLOSE_AFTER = 10;
      let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
      viewCount++;
      localStorage.setItem('warningViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('warningClosed');

      const warning = `
        <div style="max-width: 550px; margin: 0 auto; text-align: center;" class="warning-container">
          <p class='warning'>
            <strong>Заметка:</strong><a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>Переводы, словари и комментарии сделаны не Благословенным.<a style='cursor: pointer;' class='text-decoration-none' target='' href='${thUrl}'>&nbsp;</a>Сверяйтесь с Пали в 4 основных никаях.
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
        const paliLettersRegex = /[а-яa-zāīūṭḍñṃṁṅṇśṣ\s]/gi;
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
      var xhr = new XMLHttpRequest();
      var urlParams = new URLSearchParams(window.location.search);
      urlParams.set('q', slug);
      xhr.open("GET", '/ru/?p=-kn&' + urlParams.toString(), true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            if (!xhr.responseText.includes("Page not found") && !xhr.responseText.includes("404") && xhr.responseText.trim().length > 0) {
              window.location.href = "/ru/?p=-kn&q=" + encodeURIComponent(slug);
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
  // Используем глобальную функцию для вывода инструкций
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
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove("hide-russian");
  const savedMode = localStorage.getItem('viewMode') || 'alternate';
  if (savedMode === 'columns') suttaArea.classList.add('column-view');
}

function showPaliRussian() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.remove("hide-russian");
  const savedMode = localStorage.getItem('viewMode') || 'alternate';
  if (savedMode === 'columns') suttaArea.classList.add('column-view');
}

function showEnglish() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove('column-view');
}

function showRussian() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.add("hide-english");
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
