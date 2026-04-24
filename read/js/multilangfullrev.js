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

// pressing enter will "submit" the citation and load
form.addEventListener("submit", e => {
  e.preventDefault();
  if (citation.value) {
    buildSutta(citation.value.replace(/\s+/g, " "));
history.pushState({ page: citation.value.replace(/\s+/g, " ") }, "", `?q=${citation.value.replace(/\s+/g, " ")}`);
  }
});

function buildSutta(slug) {
  let translator = "";
  let texttype = "sutta";
  let slugArray = slug.split("&");
  slug = slugArray[0];
  if (slugArray[1]) {
    translator = slugArray[1];
  } 
  /*else {
    translator = "sv";
  }*/
  slug = slug.toLowerCase();

  if ((!slug.match("bu-pm")) && (!slug.match("bi-pm")) && (slug.match(/bu-|bi-|kd|pvr/))) {
    translator = "brahmali";
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
    slug = slug.replace(/bi([psn])/, "bi-$1");
    if (!slug.match("pli-tv-")) {
      slug = "pli-tv-" + slug;
    }
  }
  let html = `<div class="button-area"><button id="language-button" class="hide-button">Pāḷi Рус</button></div>`;
  
  const slugReady = parseSlug(slug);
  console.log("slugReady is " + slugReady + " slug is " + slug); 



$.ajax({
       url: "/read/php/translator-lookup.php?fromjs=" +texttype +"/" +slugReady
    }).done(function(data) {
      const trnsResp = data.split(" ");
      let translator = trnsResp[0];
      console.log('inside', translator);

//if (slug.match(/^mn([1-9]|1[0-9]|2[0-1])$/)) {
 
const onlynumber = slug.replace(/[a-zA-Z]/g, '');

    //  let otrnranges = ['sn56.11', 'sn12.2'];

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
var rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`
 }

var rustrnpath = `/assets/texts/ru/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;



if ( texttype === "vinaya")
{
  var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/vinaya/${slugReady}_translation-en-brahmali.json`;
} 

else if (otrnranges.indexOf(slug) !== -1) { 
    var engtrnpath = `/assets/texts/en/o/${texttype}/${slugReady}_translation-en-o.json`;
        translator = "o";
}


else {
//var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
  var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/${texttype}/${slugReady}_translation-en-sujato.json`;
}

var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

const mlUrl  = window.location.href;

const ruUrl = mlUrl.replace("/frev/", "/r/");
const enUrl = mlUrl.replace("/frev/", "/read/");
//let ifRus = `<a target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" href="${enUrl}">En</a>&nbsp;`;

let scLink = `<p class="sc-link"><a target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" href="${enUrl}">En</a>&nbsp;`;

const currentURL = window.location.href;
const anchorURL = new URL(currentURL).hash; // Убираем символ "#"




if (slug.includes("mn"))  {
 var trnpath = rustrnpath; 
 let language = "pli-2nd";
// scLink += ifRus; 
  console.log(trnpath);
} else if (slug.includes("sn")) { 
  var trnpath = rustrnpath; 
  console.log(trnpath);
//  scLink += ifRus; 
} else if (slug.includes("an")) { 
  var trnpath = rustrnpath; 
  console.log(trnpath);
//  scLink += ifRus; 
} else if (slug.includes("dn")) { 
  var trnpath = rustrnpath; 
 // scLink += ifRus; 
  console.log(trnpath);
} else if (knranges.indexOf(slug) !== -1) { 
  var trnpath = rustrnpath; 
 // scLink += ifRus; 
  console.log(trnpath);
} else if (slug.match(/ja/)) {
  let language = "pli";
  let slugNumber = parseInt(slug.replace(/\D/g, ''), 10); // Извлекаем число из slug

  if (slugNumber >= 1 && slugNumber <= 75) {
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/sutta/${slugReady}_translation-en-sujato.json`;
  } else if (slugNumber > 70) {
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  }
  // console.log('ja case ', rootpath, trnpath, htmlpath);
} else if ( texttype === "sutta" ) {
  let translator = "sujato";
  const pathLang = "en";
  // console.log(`${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`);
  var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
} else if (slug.match(/bu-pm|bi-pm/)) {
  let translator = "o";
  
  
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
    
    var trnpath = `/assets/texts/ru/${texttype}/${slug}_translation-${pathLang}-${translator}.json`;
    var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/${texttype}/${slug}_translation-en-brahmali.json`;
    var htmlpath = `/assets/html/${texttype}/${slug}_html.json`;

} else if ( texttype === "vinaya" ) {
  
if (vinayaranges.indexOf(slug) !== -1) { 
  var trnpath = rustrnpath; 
 // scLink += ifRus; 
} else {
  let translator = "brahmali";

  const pathLang = "en";
  var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
}
  console.log('vinaya case');
  console.log(trnpath);
  console.log(engtrnpath);

}  

var varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`
var varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`
  const rootResponse = fetch(rootpath).then(response => response.json());
 
    async function fetchTranslation() {
  const paths = [rustrnpath, trnpath];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
      console.log(`note: no translation found at ${path}`);
    } catch (error) {
      console.log(`note: error fetching ${path}`);
    }
  }

  console.log('note: no translation found in any path');
  return {}; // Если все пути недоступны
}

const translationResponse = fetchTranslation(); 
 
 
  const engtranslationResponse = fetch(engtrnpath).then(response => response.json());
  const htmlResponse = fetch(htmlpath).then(response => response.json());

async function fetchVariant() {
  const paths = [varpath, varpathLocal];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
      console.log(`note: no var found at ${path}`);
    } catch (error) {
      console.log(`note: error fetching var ${path}`);
    }
  }

  console.log('note: no var found in any path');
  return {}; // Если все пути недоступны
}

const varResponse = fetchVariant();    
    
  Promise.all([rootResponse, translationResponse, engtranslationResponse, htmlResponse, varResponse]).then(responses => {
    const [paliData, transData, engTransData, htmlData, varData] = responses;

    Object.keys(htmlData).forEach(segment => {
      if (transData[segment] === undefined) {
        transData[segment] = "";
      }
      let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
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

if (paliData[segment] === undefined) {
  paliData[segment] = "";
}
if (transData[segment] === undefined) {
  transData[segment] = "";
}
if (engTransData[segment] === undefined) {
  engTransData[segment] = "";
}

paliData[segment] = paliData[segment].split('').reverse().join('');
transData[segment] = transData[segment].split('').reverse().join('');
engTransData[segment] = engTransData[segment].split('').reverse().join('');

let params = new URLSearchParams(document.location.search);
  let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
 // finder = finder.replace(/\\b/g, '');
if (finder && finder.trim() !== "") {
  let regex = new RegExp(finder, 'gi'); // 'gi' - игнорировать регистр

  try {
    paliData[segment] = paliData[segment]?.replace(regex, match => `<b class='match finder'>${match}</b>`);
  } catch (error) {
    console.error("Ошибка при выделении совпадений в paliData:", error);
  }

  try {
    transData[segment] = transData[segment]?.replace(regex, match => `<b class="match finder">${match}</b>`);
  } catch (error) {
    console.error("Ошибка при выделении совпадений в transData:", error);
  }

  if (varData[segment] !== undefined) {  
    try {
      varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
    } catch (error) {
      console.error("Ошибка при выделении совпадений в varData:", error);
    }
  }
}

if (localStorage.getItem("removePunct") === "true" && paliData[segment] !== undefined) {
    paliData[segment] = paliData[segment].replace(/[-—–]/g, ' ');  
    paliData[segment] = paliData[segment].replace(/[:;“”‘’,"']/g, '');  
    paliData[segment] = paliData[segment].replace(/[.?!]/g, ' | '); 
    
    //।   ॥  
}
if (paliData[segment] !== undefined) {
paliData[segment] = paliData[segment].replace(/[—–—]/, ' — ');
}
//   console.log(`transData[${segment}]: ${transData[segment]}`);
  //  console.log(`engTransData[${segment}]: ${engTransData[segment]}`);
  
 let linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
let linkWithDataSet = `<a class="text-decoration-none copyLink" style="cursor: pointer;" data-copy-text="${fullUrlWithAnchor}">&nbsp;</a>`;

if (engTransData[segment] !== transData[segment]) {
    html += `<p><span id="${anchor}">
        <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
        <span class="rus-lang" lang="ru">${linkToCopyStart}${transData[segment].trim()}${linkToCopy}</span>
        <span class="eng-lang" lang="en">${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</span>
    </span></p>\n\n`;
} else {
    html += `<p><span id="${anchor}">
        <span class="pli-lang inputscript-ISOPali" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
        <span class="rus-lang" lang="en">${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</span>
    </span></p>\n\n`;
}

    });

if (translator === "o") {
  translatorforuser = '<a href=/assets/common/o.html>o</a> с Пали';
} else if (translator === "sv") {
  translatorforuser = 'SV theravada.ru с Англ';
} else if ((translator === "" && texttype === "sutta" ) || (translator === "sujato" )) {
  translatorforuser = 'Bhikkhu Sujato';
} else if ((translator === "" && texttype === "vinaya") || (translator === "brahmali" ))  {
  translatorforuser = 'Bhikkhu Brahmali';
} else if (translator === "syrkin" ) {
  translatorforuser = 'А.Я. Сыркин с Пали';
} else if (translator === "syrkin+edited+o" ) {
  translatorforuser = 'А.Я. Сыркин с Пали, ред. <a href=/assets/common/o.html>o</a>';
} else if (translator === "sv+edited+o" ) {
  translatorforuser = 'SV theravada.ru с Англ, ред. <a href=/assets/common/o.html>o</a>';
} else if (translator === "o+in+progress" ) {
  translatorforuser = '<a href=/assets/common/o.html>o</a>, в процессе';
} else {
  translatorforuser = translator ;
}


//const translatorCapitalized = translator.charAt(0).toUpperCase() + translator.slice(1);

     const translatorByline = `<div id="trn" class="byline">
     <p>
    <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span> <span class="rus-lang" lang="ru"> Trans. by ${translatorforuser}</span>
     </p>
     </div>`;
        // === 1. МГНОВЕННЫЙ ВЫВОД ТЕКСТА НА ЭКРАН ===
      const origUrl = window.location.href;
      let dUrl = origUrl.replace("/frev/", "/d");
      let rvorigUrl = origUrl.replace("/frev/", "/rev/");

      // Скрытые ссылки-пасхалки для режима заучивания
      const rvfr = `<a class='text-decoration-none' target='' href='${rvorigUrl}'>&nbsp;</a>`;
      const scrollLink = `<a class='text-decoration-none' target='' href='javascript:void(0);' onclick='window.scrollTo(0, document.body.scrollHeight)'>&nbsp;</a>`;

      var lineBreak = "\n\n";
      let revhtml = html.split(lineBreak).reverse().join(lineBreak);

      const SHOW_CLOSE_AFTER = 10;
      let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
      viewCount++;
      localStorage.setItem('warningViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('warningClosed');

      const warning = `
        <div style="max-width: 550px; margin: 0 auto; text-align: center;" class="warning-container">
          <p class='warning'>
            <strong>Note:</strong>${rvfr}Translations, dictionaries and commentaries were not made by the Blessed One.<a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>Cross-check with Pali in 4 main nikayas.${scrollLink}
                 ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''} 
          </p>
        </div>
      `;

      // Выводим текст СРАЗУ (используем перевернутый revhtml)
      suttaArea.innerHTML = 
          `<div id="top-links-container" style="min-height: 24px;"></div><br>` + 
          (!isWarningClosed ? warning : '') + 
          translatorByline + 
          revhtml + 
          translatorByline + 
          (!isWarningClosed ? warning : '') + 
          `<div id="bottom-links-container" style="min-height: 24px;"></div>`;


            window.dispatchEvent(new Event('suttaLoaded'));


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

      // === ГЕНЕРАЦИЯ ССЫЛОК ИЗ COMMON.JS ===
      scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);
      scLink += "</p>";

      const topContainer = document.getElementById('top-links-container');
      const bottomContainer = document.getElementById('bottom-links-container');
      if (topContainer) topContainer.innerHTML = scLink;
      if (bottomContainer) bottomContainer.innerHTML = scLink;

      // === ПОИСК ПРЕДЫДУЩЕЙ И СЛЕДУЮЩЕЙ СУТТЫ ===
      renderNavigation(slug, slugReady);

      if (typeof addToSearchHistory === 'function') {
         addToSearchHistory();
      }
   

    })
.catch(error => {
  console.log('error:not found');

  // Отправка запроса по адресу http://localhost:8080/ru/?q= с использованием значения slug
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
        window.location.href = "/?q=" + encodeURIComponent(slug);
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


  // Обновление сообщения об ошибке на странице
  
  suttaArea.innerHTML = `<p>Идёт Поиск "${decodeURIComponent(slug)}". Пожалуйста, Ожидайте.</p>
  
                      <div class="spinner-border" role="status">
                <span class="visually-hidden">Загрузка...</span>
                  </div>
<p>    Подсказка: <br>
    С главной страницы доступно больше настроек поиска.
<br></p>`;
});
    }

    );

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
    console.log("in the initializing " + lang);
    setLanguage(lang);
  } else if  (localStorage.paliToggleSpecial) {
      language = localStorage.paliToggleSpecial; 
      console.log('read from ls ' + language);
setLanguage(language);
  }
} else {
  suttaArea.innerHTML = `<div class="instructions">
<p>Для перехода тексты должны быть указаны с номерами. Пример: <span class="abbr">sn35.28</span> <span class="abbr">an1.1-10</span> <span class="abbr">bu-as1-7</span> или <span class="abbr">bi-pj1</span>.<br>
 Доступны dn, mn, sn, an, некоторые книги kn, обе патимоккхи и виная вибханги.<br>
  </p>
  <div class="lists">

  <div class="suttas">
  <a href="/ru/read.php"> <h2>Основные Сутты</h2></a> 
  <ul>
     <li><span class="abbr">dn</span> <a href="/ru/assets/texts/dn.php"> Dīgha-nikāya</a></li></li>
     <li><span class="abbr">mn</span> <a href="/ru/assets/texts/mn.php"> Majjhima-nikāya</a></li></li>
      <li><span class="abbr">sn</span> <a href="/ru/assets/texts/sn.php"> Saṁyutta-nikāya</a></li>
      <li><span class="abbr">an</span> <a href="/ru/assets/texts/an.php"> Aṅguttara-nikāya</a></li>
      <li><span class="abbr">snp</span> Sutta-nipāta</li>
  </ul>
  </div><div>
 <!-- <h2>Виная</h2> -->
  <div class="vinaya">
  <div>
  <h3>Бхиккху Виная</h3>
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
<h3>Бхиккхуни Виная</h3>
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
<ul>
<li><span class="abbr">kd</span> Khandhakas</li>
<li><span class="abbr">pvr</span> Parivāra</li>
</ul>
</div>
  </div></div>
  <h2>Другие тексты</h2>
  <ul>
      <li><span class="abbr">ud</span> Udāna</li>
      <li><span class="abbr">iti</span> Itivuttaka (1–112)</li>
      <li><span class="abbr">dhp</span> Dhammapada</li>
      <li><span class="abbr">snp</span> Sutta-nipāta</li>
      <li><span class="abbr">thag</span> Theragāthā</li>
      <li><span class="abbr">thig</span> Therīgāthā</li>
    <li><span class="abbr">kp</span> Khuddakapāṭha</li>
  </ul>
  </div><div>
</div>
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

function showPaliAll() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove("hide-russian");
}
function showPaliRussian() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.remove("hide-russian");
}
function showEnglish() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove("hide-english");
}
function showRussian() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.remove("hide-russian");
}
function showPali() {
  console.log("showing pali ");
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.add("hide-russian");
}

function toggleThePali() {
  const languageButton = document.getElementById("language-button");

  // Инициализация (исправлена опечатка)
  if (!localStorage.paliToggleSpecial) {
    localStorage.paliToggleSpecial = "pli-2nd";
  }   

  // Клонируем кнопку, чтобы сбросить старые слушатели
  const newButton = languageButton.cloneNode(true);
  languageButton.parentNode.replaceChild(newButton, languageButton);

  newButton.addEventListener("click", () => {
    // Используем плавную обертку из common.js
    if (typeof runWithTransition === 'function') {
        runWithTransition(() => {
            if (language === "pli") {
              showPaliAll();
              language = "pli-2nd";    
              localStorage.paliToggleSpecial = "pli-2nd";
            } else if (language === "pli-2nd") {
              showPali();
              language = "pli";
              localStorage.paliToggleSpecial = "pli";
            }
        });
    } else {
        // Фолбэк, если common.js еще не подгрузился
        if (language === "pli") {
          showPaliAll();
          language = "pli-2nd";    
          localStorage.paliToggleSpecial = "pli-2nd";
        } else if (language === "pli-2nd") {
          showPali();
          language = "pli";
          localStorage.paliToggleSpecial = "pli";
        }
    }
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
