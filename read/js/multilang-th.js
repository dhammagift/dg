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
  let html = `<div class="button-area"><button id="language-button" class="hide-button">Pāḷi ไทย</button></div>`;
  
  const slugReady = parseSlug(slug);
  console.log("slugReady is " + slugReady + " slug is " + slug); 



$.ajax({
       url: "/read/php/translator-lookup.php?fromjs=" +texttype +"/" +slugReady
    }).done(function(data) {
      const trnsResp = data.split(" ");
     // let translator = trnsResp[0];
      let translator = "siamrath";
  if (slug.match(/bu-pm|bi-pm/)) {
   translator = "jayasaro";
 } 

//if (slug.match(/^mn([1-9]|1[0-9]|2[0-1])$/)) {
 
const onlynumber = slug.replace(/[a-zA-Z]/g, '');

let snranges = ['sn12.2', 'sn15.3', 'sn22.59', 'sn35.28', 'sn56.11'];
let dnranges = ['dn22'];
let anranges = ['an3.107', 'an10.46'];
     //  let otrnranges = ['sn56.11', 'sn12.2'];

var rootpath = `/assets/texts/${pathLang}/root/pli/ms/${texttype}/${slugReady}_root${pathLang}-pli-ms.json`;
console.log('thai rootpath ' + rootpath);
//var rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;

var thtrnpath = `/assets/texts/${pathLang}/translation/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;

var theditedtrnpath = `/assets/texts/${pathLang}/translation/${texttype}/${slugReady}_translation-${pathLang}-${translator}+edited+o.json`;
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

const ruUrl = mlUrl.replace("/mlth/", "/r/");
const thUrl = mlUrl.replace("/mlth/", "/th/read/");
const enUrl = mlUrl.replace("/mlth/", "/read/");
//let ifRus = `<a target="" href="${ruUrl}">Ru</a> <a target="" href="${enUrl}">En</a> `;

let scLink = `<p class="sc-link"><a target="" href="${ruUrl}">Ru</a> <a target="" href="${thUrl}">Th</a> <a target="" href="${enUrl}">En</a> `;

const currentURL = window.location.href;
const anchorURL = new URL(currentURL).hash; // Убираем символ "#"




/*if (slug.includes("mn"))  {
 var trnpath = thtrnpath; 
 let language = "pli-2nd";
// scLink += ifRus; 
} else if (slug.includes("sn")) { 
  var trnpath = thtrnpath; 
//  scLink += ifRus; 
} else if (slug.includes("an")) { 
  var trnpath = thtrnpath; 
//  scLink += ifRus; 
} else if (slug.includes("dn")) { 
  var trnpath = thtrnpath; 
 // scLink += ifRus; 
}*/

 if (snranges.indexOf(slug) !== -1) { 
  var trnpath = thtrnpath; 
} else if (anranges.indexOf(slug) !== -1) { 
  var trnpath = thtrnpath; 
} else if (dnranges.indexOf(slug) !== -1) { 
  var trnpath = thtrnpath; 
}
else if (slug.match(/ja/)) {
  let language = "pli";
  let slugNumber = parseInt(slug.replace(/\D/g, ''), 10); // Извлекаем число из slug

  if (slugNumber >= 1 && slugNumber <= 75) {
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/sutta/${slugReady}_translation-en-sujato.json`;
  } else if (slugNumber > 70) {
    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  }
} else if ( texttype === "sutta" ) {
  let translator = "sujato";
  const pathLang = "en";
  var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
} else if (slug.match(/bu-pm|bi-pm/)) {
  
      let translator = "jayasaro";

    var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slug}_translation-${pathLang}-${translator}.json`;
    var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/brahmali/${texttype}/${slug}_translation-en-brahmali.json`;

    var htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
    //console.log(rootpath, trnpath, htmlpath);
} else if ( texttype === "vinaya" ) {
	
  let translator = "brahmali";

  const pathLang = "en";
  var trnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;

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

/*rootResponse.then(data => {
});

const translationResponse = fetch(thtrnpath)
  .then(response => {
    if (!response.ok) {
      throw new Error('note:no translation found');
    }
    return response.json();
  })
  .catch(error => {
    console.log('note: no translation found, trying alternative path');
    // Переключаем на второй путь
    // Делаем новый запрос по второму пути
    return fetch(trnpath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Alternative translation file not found');
        }
        return response.json();
      })
      .catch(error => {
        console.log('note: no alternative translation found either');
        return {}; // Возвращаем пустой объект, если оба пути недоступны
      });
  });

async function fetchTranslation() {
  const paths = [theditedtrnpath, thtrnpath, trnpath];

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
*/
const attemptFetch = (path) => 
  fetch(path)
    .then(response => 
      response.ok 
        ? response.json() 
        : Promise.reject('HTTP error')
    );

const translationResponse = [thtrnpath, theditedtrnpath, trnpath]
  .reduce((chain, path) => chain.catch(() => attemptFetch(path)), 
    Promise.reject())
  .catch(() => {
    console.log('All translation paths failed');
    return {};
  });


  const engtranslationResponse = fetch(engtrnpath).then(response => response.json());
  const htmlResponse = fetch(htmlpath).then(response => response.json());
/*
const varResponse = fetch(varpath).then(response => response.json())    .
  catch(error => {
 console.log('note:no var found');   
// console.log(varpath);   
return {};
  } 
    );
*/    
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
        transData[segment] = "&nbsp;";
      }
      if (transData[segment] === "") {
        transData[segment] = "&nbsp;";
      }    
      let [openHtml, closeHtml] = htmlData[segment].split(/{}/);
      /* openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>"); inputscript-IASTPali 
      Roman (IAST)     	IAST
Roman (IAST: Pāḷi)     	IASTPali
Roman (IPA)            	IPA
Roman (ISO 15919)      	ISO
Roman (ISO 15919: Pāḷi)	ISOPali */
// ISOPali ISO IASTPali IAST


let startIndex = segment.indexOf(':') + 1;
let anchor = segment.substring(startIndex);

if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) {
anchor = segment;
}

var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;

let params = new URLSearchParams(document.location.search);
 let script = params.get("script");
 
   const savedScript = localStorage.getItem('selectedScript');
   const siteLanguage = localStorage.getItem('siteLanguage');

if (script === "isopali" || savedScript === "ISOPali") {
    var rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
} 
else if (script === "devanagari" || savedScript === "Devanagari") {
    var rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`;
} 
else {
    // Для тайского раздела по умолчанию всегда отдаем Thai
    var rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`;
}

  let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
 //  finder = finder.replace(/\\b/g, '');
//  finder = finder.replace(/%08/g, '\\b');
 // console.log(finder);
   // let finder = decodeURIComponent(params.get("s"));

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

if (paliData[segment] === undefined) {
  paliData[segment] = "&nbsp;";
}
if (transData[segment] === undefined) {
  transData[segment] = "&nbsp;";
}
if (engTransData[segment] === undefined) {
  engTransData[segment] = "&nbsp;";
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

const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
let linkWithDataSet = `<a class="text-decoration-none copyLink" style="cursor: pointer;" data-copy-text="${fullUrlWithAnchor}">&nbsp;</a>`;

// console.log(`transData[${segment}]: ${transData[segment]}`);
// console.log(`engTransData[${segment}]: ${engTransData[segment]}`);

if (engTransData[segment] !== transData[segment] && varData[segment] !== undefined) {
    html += `${openHtml}<span id="${anchor}">
        <span class="pli-lang inputscript-ISOPali" lang="pi">
            ${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
            <font class="variant">
			<br>
                ${linkToCopyStart}${varData[segment].trim()}${linkToCopy}
            </font>
        </span>

        <span class="right-column">
            <span class="rus-lang" lang="ru">
                ${linkToCopyStart}${transData[segment].trim()}${linkToCopy}
            </span><br>

            <span class="eng-lang" lang="en">
                <font>${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</font><br>
            </span>
        </span>
    </span>${closeHtml}\n\n`;

} else if (engTransData[segment] !== transData[segment]) {
    html += `${openHtml}<span id="${anchor}">
        <span class="pli-lang inputscript-ISOPali" lang="pi">
            ${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
        </span>
        <span class="right-column">
            <span class="rus-lang" lang="ru">
                ${linkToCopyStart}${transData[segment].trim()}${linkToCopy}
            </span><br>

            <span class="eng-lang" lang="en">
                <font>${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}</font><br>
            </span>
        </span>
    </span>${closeHtml}\n\n`;

} else if (varData[segment] !== undefined) {
    html += `${openHtml}<span id="${anchor}">
        <span class="pli-lang inputscript-ISOPali" lang="pi">
            ${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}<br>
        </span>
        <div class="variant">
            ${linkToCopyStart}${varData[segment].trim()}${linkToCopy}
        </div>
        <span class="right-column">
            <span class="rus-lang" lang="en">
                ${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}
            </span>
        </span>
    </span>${closeHtml}\n\n`;

} else {
    html += `${openHtml}<span id="${anchor}">
        <span class="pli-lang inputscript-ISOPali" lang="pi">
            ${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
        </span>
        <span class="rus-lang" lang="en">
            ${linkToCopyStart}${engTransData[segment].trim()}${linkToCopy}
        </span>
    </span>${closeHtml}\n\n`;
}


    });

if (translator === "o") {
  translatorforuser = '<a href=/assets/common/o-en.html>o</a> from Pali';
} else if (translator === "sv") {
  translatorforuser = 'SV theravada.ru с Англ';
}
else if  (translator === "jayasaro" ) {
  translatorforuser = 'Bhikkhu Brahmali or Jayasaro';
} 
else if (translator === "siamrath" ) {
  translatorforuser = 'ไทย: Siam Rath, eng: Bhikkhu Sujato';
}

else if ((translator === "" && texttype === "sutta" ) || (translator === "sujato" )) {
  translatorforuser = 'ไทย: Siam Rath, eng: Bhikkhu Sujato';
}

else if ((translator === "" && texttype === "sutta" ) || (translator === "sujato" )) {
  translatorforuser = 'ไทย: Siam Rath, eng: Bhikkhu Sujato';
}
else if ((translator === "" && texttype === "vinaya") || (translator === "brahmali" ))  {
    translatorforuser = 'All by Bh Brahmali, patimokkha by A Jayasaro';
} else if (translator === "syrkin" ) {
  translatorforuser = 'А.Я. Сыркин с Пали';
} else if (translator === "syrkin+edited+o" ) {
  translatorforuser = 'А.Я. Сыркин с Пали, ed. by <a href=/assets/common/o-en.html>o</a>';
} else if (translator === "sv+edited+o" ) {
  translatorforuser = 'SV theravada.ru from Eng, ed. by <a href=/assets/common/o-en.html>o</a>';
} else if (translator === "o+in+progress" ) {
  translatorforuser = '<a href=/assets/common/o-en.html>o</a>, in progress';
} else {
	translatorforuser = translator ;
}


//const translatorCapitalized = translator.charAt(0).toUpperCase() + translator.slice(1);

     const translatorByline = `<div id="trn" class="byline">
     <p>
    <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a> </span> <span class="rus-lang" lang="ru">Trn: ${translatorforuser}</span>
     </p>
     </div>`;
     
      // === 1. МГНОВЕННЫЙ ВЫВОД ТЕКСТА НА ЭКРАН ===
      const origUrl = window.location.href;
      let dUrl = origUrl.replace("/mlth/", "/d/");

      const SHOW_CLOSE_AFTER = 10;
      let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
      viewCount++;
      localStorage.setItem('warningViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('warningClosed');

      // Используем мягкое и уважительное тайское предупреждение
      const warning = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;" class="warning-container">
          <p class='warning'>
          <strong>ข้อสังเกตเพื่อการศึกษา:</strong><a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>คำแปล พจนานุกรม และอรรถกถา ไม่ใช่พุทธพจน์โดยตรงจากพระผู้มีพระภาคเจ้า<a style='cursor: pointer;' class='text-decoration-none' target='' href='${dUrl}'>&nbsp;</a>ขอแนะนำให้ท่านเทียบเคียงความหมายกับต้นฉบับพระบาลีใน ๔ นิกายหลัก เพื่อความถูกต้องที่สุด
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
        // Оставляем латиницу для вытаскивания Pali-названия сутты
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
  console.log(rootpath);
  console.log('eng ', engtrnpath);
  console.log('rus', thtrnpath);
  console.log(htmlpath);

// Отправка запроса по адресу http://localhost:8080/ru/?q= с использованием значения slug
var xhr = new XMLHttpRequest();
var targetUrl = "/?s=" + encodeURIComponent(sGetparam) + "&p=-kn&q=" + encodeURIComponent(slug) + "#" + anchorURL;

// Проверяем, не пытаемся ли мы загрузить тот же URL, на котором уже находимся
if (window.location.href.split('#')[0] !== targetUrl.split('#')[0]) {
    xhr.open("GET", targetUrl, true);
    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                // Проверяем, что ответ не пустой и не является страницей ошибки
                if (xhr.responseText && !xhr.responseText.includes("404") && !xhr.responseText.includes("error")) {
                    console.log("Response received, redirecting...");
                    window.location.href = targetUrl;
                } else {
                    console.log("Server returned an error page");
                }
            } else {
                console.log("Error: Request failed with status", xhr.status);
            }
        }
    };
} else {
    console.log("Already on the target URL, skipping request");
}

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

function showPaliAll() {
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
function showPaliRussian() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
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
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove("hide-english");
  suttaArea.classList.remove('column-view'); // Отключаем двухколоночный режим
}
function showRussian() {
  suttaArea.classList.add("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.remove("hide-russian");
  suttaArea.classList.remove('column-view'); // Отключаем двухколоночный режим
}
function showPali() {
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove('column-view'); // Отключаем двухколоночный режим
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
