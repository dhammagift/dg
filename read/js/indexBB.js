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
const pathLang = "en";

let language = "pli-2nd";

homeButton.addEventListener("click", () => {
  document.location.search = "";
});


function buildSutta(slug) {
  let translator = "";
  let texttype = "sutta";
  let slugArray = slug.split("&");
  slug = slugArray[0];
  if (slugArray[1]) {
    translator = slugArray[1];
  } else {
    translator = "bodhi";
  }
  slug = slug.toLowerCase();

  if ((!slug.match("bu-pm")) && (!slug.match("bi-pm")) && (slug.match(/bu-|bi-|kd|pvr/))) {
    translator = "brahmali";
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

// console.log('texttype ' + texttype + ' translator ' + translator);

  let html = `<div class="button-area"><button title="Switch language (Atl+Z or Alt+Space)" id="language-button" class="hide-button">Pāḷi Eng</button></div>`;
  
  const slugReady = parseSlug(slug);
  // console.log("slugReady is " + slugReady + " slug is " + slug); 

let params = new URLSearchParams(document.location.search);
 let script = params.get("script");
 
   const savedScript = localStorage.getItem('selectedScript');

 if (( script === "devanagari" ) || ( savedScript === "Devanagari" ) ) {
var rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`
 } 
 else if (( script === "thai" ) || ( savedScript === "Thai" ) ) {
var rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`
 } 
else {
var rootpath = `/assets/texts/en/${texttype}/${slugReady}_root-pli-ms.json`
 }

   var htmlpath = `/assets/texts/en/${texttype}/${slugReady}_html.json`;
 
   //  //  let otrnranges = ['sn56.11', 'sn12.2'];
  
  if (slug.match(/ja/)) {
  let language = "pli";
  let slugNumber = parseInt(slug.replace(/\D/g, ''), 10); // Извлекаем число из slug

  if (slugNumber >= 1 && slugNumber <= 75) {
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/${translator}/${texttype}/${slugReady}_translation-en-sujato.json`;
  } else if (slugNumber > 70) {
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  }
  // console.log('ja case ', rootpath, trnpath, htmlpath);
} else if (slug.match(/bu-pm|bi-pm/)) {
    //let translator = "thanissaro+o";
   // let translator = "thanissaro";
    let translator = "brahmali";
    texttype === "vinaya";
      let language = "pli";

 if (( script === "devanagari" ) || ( savedScript === "Devanagari" ) ) {
//       var rootpath = `/assets/texts/${texttype}/${slug}_root-pli-ms.json`;
var rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slug}_rootd-pli-ms.json`
 } 
 else if (( script === "thai" ) || ( savedScript === "Thai" ) ) {
var rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slug}_rootth-pli-ms.json`
 } 
else {
var rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slug}_root-pli-ms.json`
 }
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/${texttype}/${slug}_translation-en-brahmali.json`;
    var htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
  //  console.log(rootpath, trnpath, htmlpath);
} 

else if (otrnranges.indexOf(slug) !== -1) { 
    var trnpath = `/assets/texts/en/o/${texttype}/${slugReady}_translation-en-o.json`;
        translator = "o";
}
else {
  var trnpath = `/assets/texts/en/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
}

var varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`
var varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`

const rootResponse = fetch(rootpath)
  .then(response => {
    if (!response.ok) {
      throw new Error('Root file not found');
    }
    return response.json();
  })
  .catch(error => {
  console.log('note: no root found, trying alternative path');
    // Переключаем на второй путь
    rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
    // Делаем новый запрос по второму пути
    return fetch(rootpath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Alternative root file not found');
        }
        return response.json();
      })
      .catch(error => {
       console.log('note: no alternative root found either');
        return {}; // Возвращаем пустой объект, если оба пути недоступны
      });
  });

// Add this function to handle fetching translations with fallback translators
async function fetchTranslationWithFallback(slugReady, texttype, pathLang, initialTranslator) {
  const translators = [
    initialTranslator, // Try the original translator first
    "bodhi",
    "nyanamoli+bodhi",
    "anandajoti",
    "sujato+walton",
    "walshe",
    "buddharakkhita",
    "thanissaro",
    "kelly",
    "sujato"
  ];

  for (const translator of translators) {
    const trnpath = `/assets/texts/en/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
    try {
      const response = await fetch(trnpath);
      if (response.ok) {
        const data = await response.json();
        return { data, translator }; // Return both the data and the translator that worked
      }
    } catch (error) {
      console.log(`Note: translation not found for ${translator}`);
    }
  }

  console.log('Note: no translation found in any fallback path');
  return { data: {}, translator: initialTranslator }; // Return empty object if all paths fail
}

// Then modify the Promise.all section to use this new function
// Replace:
// const translationResponse = fetch(trnpath).then(response => response.json());
// With:
const translationResponse = fetchTranslationWithFallback(slugReady, texttype, pathLang, translator)
  .then(({ data, translator: usedTranslator }) => {
    translator = usedTranslator; // Update the translator variable with the one that worked
    return data;
  });


const htmlResponse = fetch(htmlpath).then(response => {
  if (!response.ok) {
    // Если файл не найден или другая ошибка, возвращаем пустой объект,
    // чтобы Promise.all не завершился с ошибкой.
    return {};
  }
  return response.json();
}).catch(error => {
  // На случай других проблем, например, с сетью
  console.log('HTML response fetch failed:', error);
  return {};
});

//  const htmlResponse = fetch(htmlpath).then(response => response.json());

async function fetchVariant() {
  const paths = [varpath, varpathLocal];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
   //   console.log(`note: no var found at ${path}`);
    } catch (error) {
  //    console.log(`note: error fetching var ${path}`);
    }
  }

//  console.log('note: no var found in any path');
  return {}; // Если все пути недоступны
}

const varResponse = fetchVariant();    


  Promise.all([rootResponse, translationResponse, htmlResponse, varResponse]).then(responses => {
    const [paliData, transData, htmlData, varData] = responses;

    Object.keys(htmlData).forEach(segment => {
      if (transData[segment] === undefined) {
        transData[segment] = "";
      }
      if (transData[segment] === "") {
        transData[segment] = "";
      }    
      let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
   openHtml = openHtml || ''; // Запасное значение
   closeHtml = closeHtml || ''; // Запасное значение
      
      
      /* openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>"); inputscript-IASTPali 
      Roman (IAST)      IAST
Roman (IAST: Pāḷi)      IASTPali
Roman (IPA)             IPA
Roman (ISO 15919)       ISO
Roman (ISO 15919: Pāḷi) ISOPali */
// ISOPali ISO IASTPali IAST

let startIndex = segment.indexOf(':') + 1;
let anchor = segment.substring(startIndex);

if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) {
anchor = segment;
}

var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;

// Получаем параметры из текущего URL
let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");

// Если параметр 's' не найден в текущем URL, проверяем referer
if (!finder) {
  try {
    if (document.referrer) {
      const refererUrl = new URL(document.referrer);
      const refererParams = new URLSearchParams(refererUrl.search);
      const refererFinder = refererParams.get("s");
      
      if (refererFinder) {
        finder = refererFinder;
        // Можно также добавить параметр в текущий URL без перезагрузки
        history.replaceState(null, '', `?q=${params.get("q")}&s=${encodeURIComponent(finder)}`);
      }
    }
  } catch (e) {
    console.log("Could not parse referer URL:", e);
  }
}



 //  finder = finder.replace(/\\b/g, '');
//  finder = finder.replace(/%08/g, '\\b');
 // console.log(finder);
   // let finder = decodeURIComponent(params.get("s"));


if (localStorage.getItem("removePunct") === "true" && paliData[segment] !== undefined) {
    paliData[segment] = paliData[segment].replace(/[-—–]/g, ' ');  
    paliData[segment] = paliData[segment].replace(/[:;“”‘’,"']/g, '');  
    paliData[segment] = paliData[segment].replace(/[.?!]/g, ' | '); 
}

if (finder && finder.trim() !== "") {
  let regex = new RegExp(finder, 'gi'); // 'gi' - игнорировать регистр

  try {
    paliData[segment] = paliData[segment]?.replace(regex, match => `<b class='match finder'>${match}</b>`);
  } catch (error) {
 //   console.log("Ошибка при выделении совпадений в paliData:", info);
  }

  try {
    transData[segment] = transData[segment]?.replace(regex, match => `<b class="match finder">${match}</b>`);
  } catch (error) {
  //  console.log("Ошибка при выделении совпадений в transData:", info);
  }

  if (varData[segment] !== undefined) {  
    try {
      varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
    } catch (error) {
      console.info("Ошибка при выделении совпадений в varData:", info);
    }
  }
}


const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`
let linkWithDataSet = `<a class="text-decoration-none copyLink" style="cursor: pointer;" data-copy-text="${fullUrlWithAnchor}">&nbsp;</a>`

if (paliData[segment] !== undefined && transData[segment] !== undefined && varData[segment] !== undefined) {
              html += `${openHtml}<span id="${anchor}">
            <span class="pli-lang " lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
      <font class="variant">
	  <br>
      ${linkToCopyStart}${varData[segment].trim()}${linkToCopy}   
      </font>     
            </span>
            <span class="eng-lang" lang="en">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}
      </span>
            </span>${closeHtml}\n\n`;
      } else if (paliData[segment] !== undefined && transData[segment] !== undefined ) {
              html += `${openHtml}<span id="${anchor}">
            <span class="pli-lang " lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
            <span class="eng-lang" lang="en">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
            </span>${closeHtml}\n\n`;
      } else if (paliData[segment] !== undefined) {
        html += openHtml + '<span id="' + anchor + '"><span class="pli-lang inputscript-ISOPali" lang="pi">' + linkToCopyStart + paliData[segment].trim() + linkToCopy + '</span></span>' + closeHtml + '\n\n';
      } else if (transData[segment] !== undefined) {
        html += openHtml + '<span id="' + anchor + '"><span class="eng-lang" lang="en">' + linkToCopyStart + transData[segment].trim() + linkToCopy + '</span></span>' + closeHtml + '\n\n';
      }
});

//console.log('texttype ' + texttype + ' translator ' + translator);
if (translator === "o") {
  translatorforuser = '<a href=/assets/common/o-en.html>o</a> from Pali';
} else if (translator === "sv") {
  translatorforuser = 'SV theravada.ru from Eng';
} else if (translator === "anandajoti") {
  translatorforuser = "Ānandajoti Bhikkhu";
} else if (translator === "bodhi") {
  translatorforuser = "Bhikkhu Bodhi";
} else if (translator === "nyanamoli+bodhi") {
  translatorforuser = "Bhikkhu Ñāṇamoli & Bhikkhu Bodhi";
} else if (translator === "thanissaro") {
  translatorforuser = "Thaissaro Bhikkhu";
} else if (translator === "walshe") {
  translatorforuser = "Maurice Walshe";
} else if (translator === "kelly") {
  translatorforuser = "John Kelly, Sue Sawyer & Victoria Yareham";
} else if (translator === "buddharakkhita") {
  translatorforuser = "Acharya Buddharakkhita";
} else if (translator === "sujato+walton") {
  translatorforuser = "Bhikkhu Sujato, Jessica Walton";
} else if ((translator === "" && texttype === "sutta" ) || (translator === "sujato" )) {
  translatorforuser = 'Bhikkhu Sujato';
} else if ((translator === "" && texttype === "vinaya") || (translator === "brahmali" ))  {
  translatorforuser = 'Bhikkhu Brahmali';
} else if (translator === "syrkin" ) {
  translatorforuser = 'A.Y. Syrkin from Pali';
} else if (translator === "syrkin+edited+o" ) {
  translatorforuser = 'A.Y. Syrkin from Pali, edited by <a href=/assets/common/o-en.html>o</a>';
} else if (translator === "sv+edited+o" ) {
  translatorforuser = 'SV theravada.ru from Eng, ed. <a href=/assets/common/o-en.html>o</a>';
} else if (translator === "o+in+progress" ) {
  translatorforuser = '<a href=/assets/common/o-en.html>o</a>, in progress';
} else {
  translatorforuser = translator ;
}

//console.log('texttype ' + texttype + ' translator ' + translator);

//const translatorCapitalized = translator.charAt(0).toUpperCase() + translator.slice(1);

     const translatorByline = `<div id="trn" class="byline">
     <p>
    <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a> </span> <span class="eng-lang" lang="en">Trn: ${translatorforuser}</span>
     </p>
     </div>`;
     
      const enUrl = window.location.href;
      let ruUrl = enUrl.replace("/read/", "/r/");
      ruUrl = enUrl.replace("/b/", "/r/");
      let altTrn = enUrl.replace("/b/", "/read/");

      let scLink = `<p class="sc-link"><a title="English translation from SuttaCentral.net (Alt+1)" href="${altTrn}">En</a>&nbsp;<a title="Russian (Alt+1)" href="${ruUrl}">Ru</a>&nbsp;`;

      // === 1. МГНОВЕННЫЙ ВЫВОД ТЕКСТА НА ЭКРАН ===
      const origUrl = window.location.href;
      let rvUrl = origUrl.replace("/r/", "/read/");
      rvUrl = rvUrl.replace("/ml/", "");
      rvUrl = rvUrl.replace("/read/", "/rev/");
      let thUrl = origUrl.replace("/read/", "/th/read/");
      let dUrl = origUrl.replace("/read/", "/d/");

      const SHOW_CLOSE_AFTER = 10;
      let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
      viewCount++;
      localStorage.setItem('warningViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('warningClosed');

      const warning = `
        <div style="max-width: 550px; margin: 0 auto; text-align: center;" class="warning-container">
          <p class='warning'>
            <strong>Note:</strong><a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>Translations, dictionaries and commentaries were not made by the Blessed One.<a style='cursor: pointer;' class='text-decoration-none' target='' href='${thUrl}'>&nbsp;</a>Cross-check with Pali in 4 main nikayas.
                 ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''} 
          </p>
        </div>
      `;

      // Выводим текст СРАЗУ, оставив пустые <div> для верхних и нижних ссылок
      suttaArea.innerHTML = 
          `<div id="top-links-container" style="min-height: 24px;"></div><br>` + 
          (!isWarningClosed ? warning : '') + 
          translatorByline + 
          html + 
          translatorByline + 
          (!isWarningClosed ? warning : '') + 
          `<div id="bottom-links-container" style="min-height: 24px;"></div>`;

      // === 2. НАСТРОЙКА ИНТЕРФЕЙСА (ПОКА ТЕКСТ УЖЕ МОЖНО ЧИТАТЬ) ===
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
        if (filtered) pageTitle = filtered.join('');
      }

      if (typeof slug === 'string') {
        let cleanSlug = slug.replace(/pli-tv-|vb-/g, '');
        document.title = `${cleanSlug} ${pageTitle}`.trim();
      }
          
      var metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = document.title;
      document.head.appendChild(metaDescription);

      var ogDescriptionMeta = document.createElement('meta');
      ogDescriptionMeta.property = 'og:description';
      ogDescriptionMeta.content = document.title;
      document.head.appendChild(ogDescriptionMeta);

      toggleThePali();

      // === ГЕНЕРАЦИЯ ССЫЛОК (DPR, BJT, SC, BB, TBW, Th.ru, Th.su) ИЗ COMMON.JS ===
      scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);
      scLink += "</p>";

      // Вставляем сгенерированные ссылки в контейнеры
      const topContainer = document.getElementById('top-links-container');
      const bottomContainer = document.getElementById('bottom-links-container');
      if (topContainer) topContainer.innerHTML = scLink;
      if (bottomContainer) bottomContainer.innerHTML = scLink;

      // === ПОИСК ПРЕДЫДУЩЕЙ И СЛЕДУЮЩЕЙ СУТТЫ (ИЗ COMMON.JS) ===
      renderNavigation(slug, slugReady);

      addToSearchHistory();

    })
.catch(error => {
  console.log('error: not found');
  console.log('Slug:', slug, 'SlugReady:', slugReady);
  console.log(`Paths:
root: ${rootpath}
trn : ${trnpath}
html: ${htmlpath}
var : ${varpath}`);

  // Проверяем, не было ли уже слишком много попыток
  const redirectKey = `redirect_${slug}`;
  const redirectCount = localStorage.getItem(redirectKey) || 0;
  
  if (redirectCount >= 3) {
    
    console.error('Превышено максимальное количество редиректов для slug:', slug);
      // Обновление сообщения об ошибке на странице
        suttaArea.innerHTML = `<p>Search for "${decodeURIComponent(slug)}" failed. Please try another slug.</p>
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
                  </div>
    <br><br>
  <p>  Note: <br>
More search options available from the main page.</p>`;
    
    localStorage.removeItem(redirectKey);
    return;
  }

  // Увеличиваем счетчик и сохраняем
  localStorage.setItem(redirectKey, parseInt(redirectCount) + 1);


// Отправка запроса по адресу http://localhost:8080/ru/?q= с использованием значения slug
var xhr = new XMLHttpRequest();
var xhr = new XMLHttpRequest();
xhr.open("GET", "/?p=-kn&q=" + encodeURIComponent(slug), true);
xhr.send();

xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    if (xhr.status == 200) {
      // Проверяем, что ответ не является страницей 404 или другой ошибкой
      // Например, можно проверить наличие определенного текста или структуры ответа
      if (!xhr.responseText.includes("Page not found") && 
          !xhr.responseText.includes("404") &&
          xhr.responseText.trim().length > 0) {
        console.log(xhr.responseText);
        window.location.href = "/?p=-kn&q=" + encodeURIComponent(slug);
      } else {
        console.log('Page not found or empty response');
      }
    } else if (xhr.status == 404) {
      console.log('Error 404: Page not found');
    } else {
      console.log('Error sending request. Status:', xhr.status);
    }
  }
};

});
}

// initialize the whole app
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
    //  console.log('read from ls ' + language);
setLanguage(language);
  }
} else {
  suttaArea.innerHTML = `<div class="instructions">
  <p>Use text indexes for navigation.<br>E.g.: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> or <span class="abbr">bu-pj1</span>.<br>
  Dn, mn, sn, an, some kn books, both patimokkhas and vinaya vibhanga are available. </p>
  <div class="lists">

  <div class="suttas">
  <h2>Main Suttas</h2>
  <ul>
      <li><span class="abbr">dn</span> Dīgha-nikāya</li>
      <li><span class="abbr">mn</span> Majjhima-nikāya</li>
      <li><span class="abbr">sn</span> Saṁyutta-nikāya</li>
      <li><span class="abbr">an</span> Aṅguttara-nikāya</li>

  </ul>
  </div>
    <h2>Other Texts</h2><br>
  <ul>
      <li><span class="abbr">snp</span> Sutta-nipāta</li>  
      <li><span class="abbr">ud</span> Udāna</li>
      <li><span class="abbr">iti</span> Itivuttaka (1–112)</li>
      <li><span class="abbr">dhp</span> Dhammapada</li>
      <li><span class="abbr">thag</span> Theragāthā</li>
      <li><span class="abbr">thig</span> Therīgāthā</li>
    <li><span class="abbr">kp</span> Khuddakapāṭha</li>
  </ul>
  </div>
  
  
  <div>
  <!-- <h2>Vinaya</h2> -->
  <div class="vinaya">
  <div>
  <h3>Bhikkhu Vinaya</h3>
<ul>
<li><span class="abbr">bu-pm</span> <a href="/assets/texts/pm.php"> Bhikkhunīpātimokkha</a></li>
<li><span class="abbr">bu-pj</span> Pārājikā</li>
<li><span class="abbr">bu-ss</span> Saṅghādisesā</li>
<li><span class="abbr">bu-ay</span> Aniyatā</li>
<li><span class="abbr">bu-np</span> Nissaggiyā-pācittiyā</li>
<li><span class="abbr">bu-pc</span> Pācittiyā</li>
<li><span class="abbr">bu-pd</span> Pāṭidesanīyā</li>
<li><span class="abbr">bu-sk</span> Sekhiyā</li>
<li><span class="abbr">bu-as</span> Adhikarana-samatha</li>
</ul>
</div><div>
<h3>Bhikkhuni Vinaya</h3>
<ul>
<li><span class="abbr">bi-pm</span> <a href="/assets/texts/bipm.php"> Bhikkhunīpātimokkha</a></li>
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
<li><span class=abbr>kd1</span> <a href=/read/?q=pli-tv-kd1>Mahākhandhaka</a></li>
<li><span class=abbr>kd2</span> <a href=/read/?q=pli-tv-kd2>Uposathakkhandhaka</a></li>                                 
<li><span class=abbr>kd3</span> <a href=/read/?q=pli-tv-kd3>Vassūpanāyikakkhandhaka</a></li>
<li><span class=abbr>kd4</span> <a href=/read/?q=pli-tv-kd4>Pavāraṇākkhandhaka</a></li>
<li><span class=abbr>kd5</span> <a href=/read/?q=pli-tv-kd5>Cammakkhandhaka</a></li>
<li><span class=abbr>kd6</span> <a href=/read/?q=pli-tv-kd6>Bhesajjakkhandhaka</a></li>
<li><span class=abbr>kd7</span> <a href=/read/?q=pli-tv-kd7>Kathinakkhandhaka</a></li>
<li><span class=abbr>kd8</span> <a href=/read/?q=pli-tv-kd8>Cīvarakkhandhaka</a></li>                                    
<li><span class=abbr>kd9</span> <a href=/read/?q=pli-tv-kd9>Campeyyakkhandhaka</a></li>
<li><span class=abbr>kd10</span> <a href=/read/?q=pli-tv-kd10>Kosambakakkhandhaka</a></li>
</ul>
<h3>Cūḷavagga</h3><br>
<ul>
<li><span class=abbr>kd11</span> <a href=/read/?q=pli-tv-kd11>Kammakkhandhaka</a></li>
<li><span class=abbr>kd12</span> <a href=/read/?q=pli-tv-kd12>Pārivāsikakkhandhaka</a></li>
<li><span class=abbr>kd13</span> <a href=/read/?q=pli-tv-kd13>Samuccayakkhandhaka</a></li>
<li><span class=abbr>kd14</span> <a href=/read/?q=pli-tv-kd14>Samathakkhandhaka</a></li>
<li><span class=abbr>kd15</span> <a href=/read/?q=pli-tv-kd15>Khuddakavatthukkhandhaka</a></li>
<li><span class=abbr>kd16</span> <a href=/read/?q=pli-tv-kd16>Senāsanakkhandhaka</a></li>
<li><span class=abbr>kd17</span> <a href=/read/?q=pli-tv-kd17>Saṅghabhedakakkhandhaka</a></li>
<li><span class=abbr>kd18</span> <a href=/read/?q=pli-tv-kd18>Vattakkhandhaka</a></li>
<li><span class=abbr>kd19</span> <a href=/read/?q=pli-tv-kd19>Pātimokkhaṭṭhapanakkhandhaka</a></li>
<li><span class=abbr>kd20</span> <a href=/read/?q=pli-tv-kd20>Bhikkhunikkhandhaka</a></li>
<li><span class=abbr>kd21</span> <a href=/read/?q=pli-tv-kd21>Pañcasatikakkhandhaka</a></li>
<li><span class=abbr>kd22</span> <a href=/read/?q=pli-tv-kd22>Sattasatikakkhandhaka</a></li>
</ul>
</div>
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
    const savedMode = localStorage.getItem('viewMode') || 'alternate'; // Получаем сохранённое значение или 'alternate' по умолчанию
  const isColumnView = (savedMode === 'columns');

  // Применяем сохранённый режим
  if (isColumnView) {
    suttaArea.classList.add('column-view');
  }
}
function showEnglish() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove("hide-russian");
  suttaArea.classList.remove('column-view'); // Отключаем двухколоночный режим
}
function showPali() {
  suttaArea.classList.add("hide-english");
    suttaArea.classList.remove("hide-pali");
      suttaArea.classList.add("hide-russian");
      suttaArea.classList.remove('column-view'); // Отключаем двухколоночный режим
  
}

function toggleThePali() {
  const languageButton = document.getElementById("language-button");

  if (!localStorage.paliToggle) localStorage.paliToggle = "pli-2nd";

  const newButton = languageButton.cloneNode(true);
  languageButton.parentNode.replaceChild(newButton, languageButton);

  newButton.addEventListener("click", () => {
    // Та же обертка, но логика внутри своя (английская)
    runWithTransition(() => {
        if (language === "pli") {
          showPaliEnglish();
          language = "pli-2nd";
          localStorage.paliToggle = "pli-2nd";
        } else if (language === "pli-2nd") {
          showEnglish();
          language = "2nd";
          localStorage.paliToggle = "2nd";
        } else if (language === "2nd") {
          showPali();
          language = "pli";
          localStorage.paliToggle = "pli";
        }
    });
  });
}


// clicking an abbreviation on the home page will replace the input field with that abbreviation
const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    // form.input.setSelectionRange(10, 10);
    citation.focus();
  });
});



/*
for f in *_translation-en-bodhi.json; do
  mv "$f" "${f/-bodhi/-nanamoli+bodhi}"
done


*/
