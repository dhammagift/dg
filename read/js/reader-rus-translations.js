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

  // === ИЗБАВЛЯЕМСЯ ОТ PHP ===
  // Запрашиваем переводчика напрямую через JS функцию из common.js
  if (translator === "") {
      translator = await getTranslator(texttype, slugReady, pathLang);
  }

  const onlynumber = slug.replace(/[a-zA-Z]/g, '');
  let params = new URLSearchParams(document.location.search);
  let script = params.get("script");
  const savedScript = localStorage.getItem('selectedScript');

  // Пути к Root файлам
  let rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  if (script === "devanagari" || savedScript === "Devanagari") {
      rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`;
  } else if (script === "thai" || savedScript === "Thai") {
      rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`;
  } 

  var rustrnpath = `/assets/texts/ru/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
  var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

  const ruUrl  = window.location.href;
  const mlUrl = ruUrl.replace("/r/", "/ml/");
  let scLink = `<p class="sc-link"><a target="" title='Pali + Русский + Английский (Alt+2)' href="${mlUrl}">R+E</a>&nbsp;`;
  const currentURL = window.location.href;
  const anchorURL = new URL(currentURL).hash; 

  var trnpath = rustrnpath;

  // === ЛОГИКА ПУТЕЙ И ПЕРЕВОДЧИКОВ БЕЗ ОШИБКИ "LET TRANSLATOR" ===
  if (slug.includes("mn"))  {
      trnpath = rustrnpath; 
      language = "pli-2nd";
  } else if (slug.includes("sn")) { 
      trnpath = rustrnpath; 
  } else if (slug.includes("an")) { 
      trnpath = rustrnpath; 
  } else if (slug.includes("dn")) { 
      trnpath = rustrnpath; 
  } else if (typeof knranges !== 'undefined' && knranges.indexOf(slug) !== -1) { 
      trnpath = rustrnpath; 
  } else if (slug.match(/ja/)) {
      language = "pli";
      let slugNumber = parseInt(slug.replace(/\D/g, ''), 10);

      if (slugNumber >= 1 && slugNumber <= 75) {
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/sutta/${slugReady}_translation-en-sujato.json`;
      } else if (slugNumber > 70) {
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
      }
  } else if ( texttype === "sutta" ) {
      translator = "sujato";
      const fallbackLang = "en";
      trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${fallbackLang}/${translator}/${texttype}/${slugReady}_translation-${fallbackLang}-${translator}.json`;
  } else if (slug.match(/bu-pm|bi-pm/)) {
      if (slug.match(/bi-pm/)) {
          if (translator === "o" || translator === "") translator = "adelina";
      } else {
          if (translator === "o" || translator === "") translator = "gemini";
      }
      
      trnpath = `/assets/texts/${pathLang}/${texttype}/${slug}_translation-${pathLang}-${translator}.json`;
      htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
      
      // Корректировка rootpath для Патимоккхи
      if (script === "devanagari" || savedScript === "Devanagari") {
          rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slug}_rootd-pli-ms.json`;
      } else if (script === "thai" || savedScript === "Thai") {
          rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slug}_rootth-pli-ms.json`;
      } else {
          rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slug}_root-pli-ms.json`;
      }
  } else if ( texttype === "vinaya" ) {
      if (typeof vinayaranges !== 'undefined' && vinayaranges.indexOf(slug) !== -1) { 
          trnpath = rustrnpath; 
      } else {
          translator = "brahmali";
          const fallbackLang = "en";
          trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${fallbackLang}/${translator}/${texttype}/${slugReady}_translation-${fallbackLang}-${translator}.json`;
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
      // Переключаем на второй путь
      rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
      return fetch(rootpath).then(res => res.ok ? res.json() : {});
    });

  const translationResponse = fetch(trnpath).then(response => response.json());
  const htmlResponse = fetch(htmlpath).then(response => response.json());
  const varResponse = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  Promise.all([rootResponse, translationResponse, htmlResponse, varResponse]).then(responses => {
      const [paliData, transData, htmlData, varData] = responses;
      
      const segments = (typeof window.mergeGathas === 'function') ? 
          window.mergeGathas(htmlData, paliData, transData, varData) : Object.keys(htmlData);
      
      for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];

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
          try {
            if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, match => `<b class='match finder'>${match}</b>`);
            if (transData[segment]) transData[segment] = transData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
            if (varData[segment]) varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
          } catch (error) {}
        }

        const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
        let linkToCopy = `<a class="text-decoration-none copyLink" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

        if (paliData[segment] !== undefined && transData[segment] !== undefined && varData[segment] !== undefined) {
          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang " lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
        <font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>     
              </span>
              <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
              </span>${closeHtml}\n\n`;
        } else if (paliData[segment] !== undefined && transData[segment] !== undefined) {
          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang " lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
              <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
              </span>${closeHtml}\n\n`;
        } else if (paliData[segment] !== undefined) {
          html += openHtml + '<span id="' + anchor + '"><span class="pli-lang inputscript-ISOPali" lang="pi">' + linkToCopyStart + paliData[segment].trim() + linkToCopy + '</span></span>' + closeHtml + '\n\n';
        } else if (transData[segment] !== undefined) {
          html += openHtml + '<span id="' + anchor + '"><span class="rus-lang" lang="ru">' + linkToCopyStart + transData[segment].trim() + linkToCopy + '</span></span>' + closeHtml + '\n\n';
        }
      }

      // Подготовка красивого имени переводчика
      let translatorforuser = translator;
      if (window.siteTranslators && window.siteTranslators[pathLang] && window.siteTranslators[pathLang][translator]) {
          translatorforuser = window.siteTranslators[pathLang][translator];
      } else if (window.siteTranslators && window.siteTranslators["en"] && window.siteTranslators["en"][translator]) {
          translatorforuser = window.siteTranslators["en"][translator];
      } else {
          // Фолбэк на старые значения, если JSON не прогрузился
          if (translator === "o") translatorforuser = '<a href=/assets/common/o.html>o</a> с Пали';
          else if (translator === "sv") translatorforuser = 'SV theravada.ru с Англ';
          else if (translator === "adelina") translatorforuser = 'Adel NamaRupa с Англ';
          else if (translator === "sujato" || (translator === "" && texttype === "sutta")) translatorforuser = 'Bhikkhu Sujato';
          else if (translator === "brahmali" || (translator === "" && texttype === "vinaya")) translatorforuser = 'Bhikkhu Brahmali';
          else if (translator === "syrkin") translatorforuser = '<a href=/assets/texts/syrkin.html>А.Я. Сыркин</a> с Пали';
          else if (translator === "syrkin+edited+o") translatorforuser = '<a href=/assets/texts/syrkin.html>А.Я. Сыркин</a> с Пали, ред. <a href=/assets/common/o.html>o</a>';
          else if (translator === "sv+edited+o") translatorforuser = 'SV theravada.ru с Англ, ред. <a href=/assets/common/o.html>o</a>';
          else if (translator === "myagkih+edited+tr") translatorforuser = 'К. Мягких с Англ, ред. ТР';
          else if (translator === "o+in+progress") translatorforuser = '<a href=/assets/common/o.html>o</a>, в процессе';
      }

      const translatorByline = `<div id="trn" class="byline">
       <p>
      <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span> <span class="rus-lang" lang="ru"> Пер. ${translatorforuser}</span>
       </p>
       </div>`;
    
      const enUrl = window.location.href.replace("/r/", "/read/");
      scLink += `<a title='Английский (Alt+1)' href="${enUrl}">En</a>&nbsp;`;

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
        if (filtered) pageTitle = filtered.join('');
      }
      let cleanSlug = slug.replace(/pli-tv-|vb-/g, '');
      document.title = `${cleanSlug} ${pageTitle}`;
          
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
      // Фолбэк-поиск, если ничего не найдено
      var xhr = new XMLHttpRequest();
      var urlParams = new URLSearchParams(window.location.search);
      urlParams.set('q', slug);
      xhr.open("GET", '/ru/?p=-kn&' + urlParams.toString(), true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            if (!xhr.responseText.includes("Page not found") && 
                !xhr.responseText.includes("404") &&
                xhr.responseText.trim().length > 0) {
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
  } else if  (localStorage.paliToggle) {
    language = localStorage.paliToggle; 
    setLanguage(language);
  } 
} else {
  suttaArea.innerHTML = `<div class="instructions">
<p>Для перехода тексты должны быть указаны с номерами. Пример: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> или <span class="abbr">bi-pj1</span>.<br>
 Доступны dn, mn, sn, an, некоторые книги kn, обе патимоккхи и виная вибханги.<br>
  </p>
  <div class="lists">

  <div class="suttas">
  <a href="/ru/read.php"> <h2>Основные Сутты</h2></a> <br>
  <ul>
     <li><span class="abbr">dn</span> <a href="/ru/assets/texts/dn.php"> Dīgha-nikāya</a></li></li>
     <li><span class="abbr">mn</span> <a href="/ru/assets/texts/mn.php"> Majjhima-nikāya</a></li></li>
      <li><span class="abbr">sn</span> <a href="/ru/assets/texts/sn.php"> Saṁyutta-nikāya</a></li>
      <li><span class="abbr">an</span> <a href="/ru/assets/texts/an.php"> Aṅguttara-nikāya</a></li>

  </ul>
  </div>

  <div>
  <h2>Часть KN</h2><br>
  <ul>
       <li><span class="abbr">snp</span> Sutta-nipāta</li> 
      <li><span class="abbr">ud</span> Udāna</li>
      <li><span class="abbr">iti</span> Itivuttaka (1–112)</li>
      <li><span class="abbr">dhp</span> Dhammapada</li>
      <li><span class="abbr">thag</span> Theragāthā</li>
      <li><span class="abbr">thig</span> Therīgāthā</li>
   </ul>
  </div>  
  
  <div>
 <div class="vinaya">
  <div>
  <h3>Бхиккху Виная</h3><br>
<ul>
<li><span class="abbr">bu-pm</span> <a href="/ru/assets/texts/pm.php"> Bhikkhupātimokkha</a></li>
<li><span class="abbr">bu-pj</span> <a href="/r/?q=bu-pm#8.0"> Pārājikā</a></li></li>
<li><span class="abbr">bu-ss</span> <a href="/r/?q=bu-pm#14.0"> Saṅghādisesā</a></li></li>
<li><span class="abbr">bu-ay</span> <a href="/r/?q=bu-pm#29.0"> Aniyatā</a></li>
<li><span class="abbr">bu-np</span> <a href="/r/?q=bu-pm#33.0"> Nissaggiyā-pācittiyā</a></li>
<li><span class="abbr">bu-pc</span> <a href="/r/?q=bu-pm#65.0"> Pācittiyā</a></li>
<li><span class="abbr">bu-pd</span> <a href="/r/?q=bu-pm#159.0"> Pāṭidesanīyā</a></li></li>
<li><span class="abbr">bu-sk</span> <a href="/r/?q=bu-pm#165.0"> Sekhiyā</a></li></li>
<li><span class="abbr">bu-as</span> <a href="/r/?q=bu-pm#245.0"> Adhikarana-samatha</a></li></li>
</ul>
</div><div>
<h3>Бхиккхуни Виная</h3><br>
<ul>
<li><span class="abbr">bi-pm</span> <a href="/ru/assets/texts/bipm.php"> Bhikkhunīpātimokkha</a></li>
<li><span class="abbr">bi-pj</span> Pārājikā</li>
<li><span class="abbr">bi-ss</span> Saṅghādisesā</li>
<li><span class="abbr">bi-np</span> Nissaggiyā-pācittiyā</li>
<li><span class="abbr">bi-pc</span> Pācittiyā</li>
<li><span class="abbr">bi-pd</span> Pāṭidesanīyā</li>
<li><span class="abbr">bi-sk</span> Sekhiyā</li>
<li><span class="abbr">bi-as</span> Adhikarana-samatha</li>
</ul>
</div>
<div>
<h3>Khandhaka</h3>
<h3>Mahāvagga</h3><br>
<ul>
<li><span class=abbr>kd1</span> <a href=/r/?q=pli-tv-kd1>Mahākhandhaka</a></li>
<li><span class=abbr>kd2</span> <a href=/r/?q=pli-tv-kd2>Uposathakkhandhaka</a></li>                                 
<li><span class=abbr>kd3</span> <a href=/r/?q=pli-tv-kd3>Vassūpanāyikakkhandhaka</a></li>
<li><span class=abbr>kd4</span> <a href=/r/?q=pli-tv-kd4>Pavāraṇākkhandhaka</a></li>
<li><span class=abbr>kd5</span> <a href=/r/?q=pli-tv-kd5>Cammakkhandhaka</a></li>
<li><span class=abbr>kd6</span> <a href=/r/?q=pli-tv-kd6>Bhesajjakkhandhaka</a></li>
<li><span class=abbr>kd7</span> <a href=/r/?q=pli-tv-kd7>Kathinakkhandhaka</a></li>
<li><span class=abbr>kd8</span> <a href=/r/?q=pli-tv-kd8>Cīvarakkhandhaka</a></li>                                    
<li><span class=abbr>kd9</span> <a href=/r/?q=pli-tv-kd9>Campeyyakkhandhaka</a></li>
<li><span class=abbr>kd10</span> <a href=/r/?q=pli-tv-kd10>Kosambakakkhandhaka</a></li>
</ul>
<h3>Cūḷavagga</h3><br>
<ul>
<li><span class=abbr>kd11</span> <a href=/r/?q=pli-tv-kd11>Kammakkhandhaka</a></li>
<li><span class=abbr>kd12</span> <a href=/r/?q=pli-tv-kd12>Pārivāsikakkhandhaka</a></li>
<li><span class=abbr>kd13</span> <a href=/r/?q=pli-tv-kd13>Samuccayakkhandhaka</a></li>
<li><span class=abbr>kd14</span> <a href=/r/?q=pli-tv-kd14>Samathakkhandhaka</a></li>
<li><span class=abbr>kd15</span> <a href=/r/?q=pli-tv-kd15>Khuddakavatthukkhandhaka</a></li>
<li><span class=abbr>kd16</span> <a href=/r/?q=pli-tv-kd16>Senāsanakkhandhaka</a></li>
<li><span class=abbr>kd17</span> <a href=/r/?q=pli-tv-kd17>Saṅghabhedakakkhandhaka</a></li>
<li><span class=abbr>kd18</span> <a href=/r/?q=pli-tv-kd18>Vattakkhandhaka</a></li>
<li><span class=abbr>kd19</span> <a href=/r/?q=pli-tv-kd19>Pātimokkhaṭṭhapanakkhandhaka</a></li>
<li><span class=abbr>kd20</span> <a href=/r/?q=pli-tv-kd20>Bhikkhunikkhandhaka</a></li>
<li><span class=abbr>kd21</span> <a href=/r/?q=pli-tv-kd21>Pañcasatikakkhandhaka</a></li>
<li><span class=abbr>kd22</span> <a href=/r/?q=pli-tv-kd22>Sattasatikakkhandhaka</a></li>
</ul>
</div>
<div>
<ul>
<li><span class="abbr">pvr</span> Parivāra</li>
</ul>
</div>
  </div></div>
`;
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

function toggleThePali() {
  const languageButton = document.getElementById("language-button");

  if (!localStorage.paliToggle) {
    localStorage.paliToggle = "pli-2nd";
  }

  const newButton = languageButton.cloneNode(true);
  languageButton.parentNode.replaceChild(newButton, languageButton);

  newButton.addEventListener("click", () => {
    if (typeof runWithTransition === 'function') {
        runWithTransition(() => {
            if (language === "pli-2nd") {
              showPali();
              language = "pli";
              localStorage.paliToggle = "pli";
            } else if (language === "2nd") {
              showPaliEnglish();
              language = "pli-2nd";
              localStorage.paliToggle = "pli-2nd";
            } else if (language === "pli") {
              showEnglish();
              language = "2nd";
              localStorage.paliToggle = "2nd";
            }
        });
    } else {
        if (language === "pli-2nd") {
          showPali();
          language = "pli";
          localStorage.paliToggle = "pli";
        } else if (language === "2nd") {
          showPaliEnglish();
          language = "pli-2nd";
          localStorage.paliToggle = "pli-2nd";
        } else if (language === "pli") {
          showEnglish();
          language = "2nd";
          localStorage.paliToggle = "2nd";
        }
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
