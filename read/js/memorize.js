
const style = document.createElement('style');
style.textContent = `
  .pli-lang {
    font-size: 1.4em !important;
  }

  .copyLink {
    font-size: 0.8em !important;
  }

  .copyLink:not(.copyLink-start) {
    bottom: 0em !important;
    right: -0.6em !important;
  }
`;
document.head.appendChild(style);


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

citation.focus();
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
  let html = `<div class="button-area"><button title="Switch language (Atl+Z or Alt+Space)" id="language-button" class="hide-button">Pāḷi Рус</button></div>`;
  
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
} else {
//var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/${pathLang}/${translator}/${texttype}/${slugReady}_translation-${pathLang}-${translator}.json`;
  var engtrnpath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/${texttype}/${slugReady}_translation-en-sujato.json`;
}
console.log('engtrnpath line108', engtrnpath);

var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;

const mlUrl  = window.location.href;

const ruUrl = mlUrl.replace("/memorize/", "/r/");
const enUrl = mlUrl.replace("/memorize/", "/read/");
//let ifRus = `<a target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" href="${enUrl}">En</a>&nbsp;`;

let scLink = `<p class="sc-link"><a title="Russian (Alt+1)" target="" href="${ruUrl}">Ru</a>&nbsp;<a target="" title="English (Alt+1)" href="${enUrl}">En</a>&nbsp;`;

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
 
 
 //   var rootpath = `/assets/texts/${texttype}/${slug}_root-pli-ms.json`;
 
  if (( script === "devanagari" ) || ( savedScript === "Devanagari" ) ) {
//	     var rootpath = `/assets/texts/${texttype}/${slug}_root-pli-ms.json`;
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

  //  console.log(rootpath, trnpath, htmlpath);
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
    
Promise.all([rootResponse, htmlResponse, varResponse]).then(responses => {
    const [paliData, htmlData, varData] = responses;

    const segments = Object.keys(htmlData);

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      if (paliData[segment] === undefined) {
        paliData[segment] = "";
      }

      // === НАЧАЛО: Логика объединения Гатх ===
      let nextSegment = segments[i + 1];

      if (htmlData[segment] && htmlData[segment].includes('verse-line') &&
          nextSegment && htmlData[nextSegment] && htmlData[nextSegment].includes('verse-line')) {
          
          let [nextOpen, nextClose] = htmlData[nextSegment].split(/{}/);
          
          // Объединяем, если следующая строка НЕ начинает новый параграф
          if (!nextOpen.includes('<p>')) {
              
              const toLower = (str) => {
                  if (!str) return "";
                  return str.charAt(0).toLowerCase() + str.slice(1);
              };

              // 1. Объединяем Пали
              if (paliData[nextSegment]) {
                  paliData[segment] = (paliData[segment] || "").trim() + " " + toLower(paliData[nextSegment].trim());
              }
              // 2. Объединяем Варианты
              if (varData[nextSegment]) {
                  varData[segment] = (varData[segment] || "").trim() + " " + toLower(varData[nextSegment].trim());
              }

              // 3. Склеиваем HTML: начало от текущего, конец от следующего
              let [currOpen, currClose] = htmlData[segment].split(/{}/);
              htmlData[segment] = (currOpen || '') + "{}" + (nextClose || '');
              
              // 4. Пропускаем следующий сегмент
              i++; 
          }
      }
      // === КОНЕЦ: Логика объединения Гатх ===

      let [openHtml, closeHtml] = htmlData[segment].split(/{}/);

      let startIndex = segment.indexOf(':') + 1;
      let anchor = segment.substring(startIndex);

      if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) {
        anchor = segment;
      }

      var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;

      let params = new URLSearchParams(document.location.search);

      if (localStorage.getItem("removePunct") === "true" && paliData[segment] !== undefined) {
          paliData[segment] = paliData[segment].replace(/[-—–]/g, ' ');  
          paliData[segment] = paliData[segment].replace(/[:;“”‘’,"']/g, '');  
          paliData[segment] = paliData[segment].replace(/[.?!]/g, ' | '); 
      }

      // Создаем копию уже объединенного текста для функции преобразования
      let paliModDataSegment = paliData[segment].slice();  

      function преобразоватьТекст() {
          let входнойТекст = paliModDataSegment; 

          let строкиСКавычками = входнойТекст.split('\n');

          const строки = строкиСКавычками.map(строка => {
              return строка.replace(/"/g, ' " ').replace(/—/g, ' — ').replace(/“/g, ' “ ').replace(/‘/g, " ‘ " ).replace(/\?/g, " ? " ).replace(/,/g, " , " ).replace(/\./g, " . " ).replace(/:/g, " : " ).replace(/;/g, " ; " );
          });

          let результат = строки.map(строка => {
              let слова = строка.split(/\s+/);
              
              let преобразованныеСлова = слова.map(word => {
                  let перваяБуква = word.match(/^\p{L}/u); 
                  
                  if (перваяБуква) {
                      let cleanWord = word.replace(/['"“‘]/g, ""); 
                      return `<span class="mem-trigger" lang="pi" 
                                    data-word="${cleanWord}" 
                                    onclick="showBubble(this, event)" 
                                    onmouseenter="handleBubbleHover(this, event)" 
                                    onmouseleave="handleBubbleLeave(this, event)">${перваяБуква[0]}</span>`;
                  } else {
                      let диакритическиеСимволы = word.match(/^[\p{M}\p{N}\p{S}\p{P}]/u);
                      return диакритическиеСимволы ? диакритическиеСимволы[0] : '';
                  }
              });
              return преобразованныеСлова.join(' ').replace(/ \?/g, "?" ).replace(/“ /g, '').replace(/ ,/g, ", " ).replace(/ \. /g, ". " ).replace(/ : /g, ": " ).replace(/ ; /g, "; " ).replace(/ ‘ /g, " " );
          }).join('\n'); 

          return результат;
      }

      if (paliData[segment] !== undefined) {
        paliData[segment] = paliData[segment].replace(/[—–—]/, ' — ');
      }

      let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");

      if (finder && finder.trim() !== "") {
        let regex = new RegExp(finder, 'gi'); 
        try {
          paliData[segment] = paliData[segment]?.replace(regex, match => `<b class='match finder'>${match}</b>`);
        } catch (error) {
          console.error("Ошибка при выделении совпадений в paliData:", error);
        }
         if (varData[segment] !== undefined) {  
          try {
            varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
          } catch (error) {
            console.error("Ошибка при выделении совпадений в varData:", error);
          }
        }
      }

      let linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
      let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
      let linkWithDataSet = `<a class="text-decoration-none copyLink" style="cursor: pointer;" data-copy-text="${fullUrlWithAnchor}">&nbsp;</a>`;

      if (paliData[segment] !== paliData[segment] && varData[segment] !== undefined) {
          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang dict-ignore inputscript-ISOPali" lang="pi">${linkToCopyStart}${преобразоватьТекст().trim()}${linkToCopy}</span>
              <span class="greyedout rus-lang" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}
                  <font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>
              </span>
          </span>${closeHtml}\n\n`;

      } else if (paliData[segment] !== paliData[segment]) {
          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang dict-ignore inputscript-ISOPali" lang="pi">${linkToCopyStart}${преобразоватьТекст().trim()}${linkToCopy}</span>
              <span class="greyedout rus-lang" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
          </span>${closeHtml}\n\n`;

      } else {
          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang dict-ignore inputscript-ISOPali" lang="pi">${linkToCopyStart}${преобразоватьТекст().trim()}${linkToCopy}</span>
              <span class="greyedout rus-lang" lang="pi">${linkToCopyStart}${paliData[segment].trim()}${linkToCopy}</span>
          </span>${closeHtml}\n\n`;
      }
    } // Конец цикла for

if (translator === "o") {
  translatorforuser = '<a href=/assets/common/o.html>o</a>';
} else if (translator === "sv") {
  translatorforuser = 'SV theravada.ru';
} else if ((translator === "" && texttype === "sutta" ) || (translator === "sujato" )) {
  translatorforuser = 'Bhikkhu Sujato';
} else if ((translator === "" && texttype === "vinaya") || (translator === "brahmali" ))  {
  translatorforuser = 'Bhikkhu Brahmali';
} else if (translator === "syrkin" ) {
  translatorforuser = 'А.Я. Сыркин';
} else if (translator === "syrkin+edited+o" ) {
  translatorforuser = 'А.Я. Сыркин, ред. <a href=/assets/common/o.html>o</a>';
} else if (translator === "sv+edited+o" ) {
  translatorforuser = 'SV theravada.ru, ред. <a href=/assets/common/o.html>o</a>';
} else if (translator === "o+in+progress" ) {
  translatorforuser = '<a href=/assets/common/o.html>o</a>, в процессе';
} else {
	translatorforuser = translator ;
}


//const translatorCapitalized = translator.charAt(0).toUpperCase() + translator.slice(1);

     const translatorByline = `<div id="trn" class="byline">
     <p>
    <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">Mahāsaṅgīti</a> </span>
     </p>
     </div>`;
    
     
      const scButton = `<a href="https://suttacentral.net/${slug}/en/${translator}">Читать на SC</a>`;
      
      $.ajax({
      url: "/read/php/extralinks.php?fromjs=" +slug
    }).done(function(data) {
      const linksArray = data.split(",");

// --- DPR START: ---
function getDprUrl(slug) {
    // Проверяем, загружен ли массив данных из файла linksdprmapping.js
    // (В вашем файле переменная называется dprLinksData)
    if (typeof dprLinksData === 'undefined') {
        return null;
    }

    // Очищаем slug от параметров (все, что после &) и приводим к нижнему регистру
    let cleanSlug = slug.split('&')[0].toLowerCase();

    // Ищем совпадение: item[0] - это slug (например, dn1), item[1] - это код локации
    let dprItem = dprLinksData.find(item => item[0] === cleanSlug);

    if (dprItem && dprItem[1]) {
        // Базовый URL для онлайн версии DPR.
        // Если вы используете локальную версию или другое зеркало, измените эту строку.
        const dprBaseUrl = "https://www.digitalpalireader.online/_dprhtml/index.html?loc=";
        
        return dprBaseUrl + dprItem[1];
    }
    
    return null;
}

// Если нужно сохранить проверку на Vinaya (как было в старом коде), раскомментируйте условие ниже.
// if (typeof texttype === 'undefined' || texttype !== "vinaya") {

    let dprUrl = getDprUrl(slug);

    if (dprUrl) {
        // Добавляем ссылку, сохраняя старый title "Myanmar and Thai Editions at DPR"
        scLink += `<a target="_blank" title="Myanmar and Thai Editions at DPR" href="${dprUrl}">DPR</a>&nbsp;`;
    }

// } 
// --- DPR END ---


// --- BJT START:  ---
function getBjtUrl(slug) {
    // Проверяем, загружен ли массив данных из файла linksbjt.js
    if (typeof bjtLinksData === 'undefined') {
        return null;
    }

    // Очищаем slug от параметров (все, что после &)
    let cleanSlug = slug.split('&')[0].toLowerCase();

    // Ищем совпадение: item[0] - это slug (например, dn1), item[1] - это код для ссылки
    let bjtItem = bjtLinksData.find(item => item[0] === cleanSlug);

    if (bjtItem && bjtItem[1]) {
        return "https://open.tipitaka.lk/latn/" + bjtItem[1];
    }
    
    return null;
}

let bjtUrl = getBjtUrl(slug);

if (bjtUrl) {
    // Добавляем ссылку к переменной scLink, точно так же, как это делает DPR и SC
    scLink += `<a target="_blank" title="Buddha Jayanthi (Sri Lanka Edition at Tipitaka.lk)" href="${bjtUrl}">BJT</a>&nbsp;`;
}
// --- BJT END ---

scLink += getTTSInterfaceHTML(texttype, slugReady, slug);

if ((translator === 'sujato') || (translator === 'brahmali')) {
  scLink += `&nbsp;<a target="_blank" href="https://suttacentral.net/${slug}/en/${translator}">SC</a>`;  
} else {
  scLink += `&nbsp;<a target="_blank" href="https://suttacentral.net/${slug}">SC</a>`;
}

      if (linksArray[0].length >= 4) {
        scLink += linksArray[0];
            console.log("extralinks " + linksArray[0]);
      } 
      scLink += "</p>"; 

const origUrl = window.location.href;
let rvUrl = origUrl.replace("/r/", "/read/");
rvUrl = rvUrl.replace("/memorize/", "");
rvUrl = rvUrl.replace("/read/", "/rev/");

// Настройки
const SHOW_CLOSE_AFTER = 5;  // Показывать кнопку закрытия после 10 просмотров

// Получаем или инициализируем счетчик просмотров
let viewCount = parseInt(localStorage.getItem('goodViewCount')) || 0;
viewCount++;
localStorage.setItem('goodViewCount', viewCount);

// Проверяем, можно ли показывать кнопку закрытия
const canShowClose = viewCount >= SHOW_CLOSE_AFTER;

// Проверяем, был ли warning уже закрыт
const isWarningClosed = localStorage.getItem('goodClosed');

const warning = `<div style="max-width: 550px; margin: 0 auto; text-align: center;" class="warning-container">
    <p class='pli-lang' lang='pi' style='color:green;'>
      Bahussuto hoti sutadharo sutasannicayo...
           ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''}
           </p>
  </div>
`;

suttaArea.innerHTML = scLink + '<br>' + (!isWarningClosed ? warning : '') + html + warning + scLink;

// Добавляем обработчик события для кнопки закрытия (если она есть)
if (canShowClose && !isWarningClosed) {
  document.querySelector('.close-warning')?.addEventListener('click', function() {
    localStorage.setItem('goodClosed', 'true');
    document.querySelector('.warning-container')?.remove();
  });
}

//конец вывода информации

const pageTitleElement = document.querySelector("h1.sutta-title");
let pageTitle = '';

if (pageTitleElement) {
  // Получаем весь текст из элемента, включая вложенные теги
  let text = pageTitleElement.textContent;
  const paliLettersRegex = /[a-zāīūṭḍñṃṁṅṇśṣ\s]/gi;

  // Извлечь только эти символы и собрать обратно в строку
  const filtered = text.match(paliLettersRegex);
  if (filtered) {
    pageTitle = filtered.join('');
  }
}

slug = slug.replace(/pli-tv-|vb-/g, '');
document.title = `${slug} ${pageTitle}`;
    


var metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = document.title;
document.head.appendChild(metaDescription);

var ogDescriptionMeta = document.createElement('meta');
ogDescriptionMeta.property = 'og:description';
ogDescriptionMeta.content = document.title;
document.head.appendChild(ogDescriptionMeta);


      toggleThePali();
      
      $.ajax({
      url: "/read/php/api.php?fromjs=" +texttype +"/" +slugReady +"&type=A"
    }).done(function(data) {
      const nextArray = data.split(" ");
      let nextSlug = nextArray[0];
let nextSlugPrint = nextSlug.replace(/pli-tv-|b[ui]-vb-/g, "");

let nextName = nextArray.slice(1).join(" ");
nextName = nextName.replace(/[0-9.]/g, '');

      if (nextName === undefined) {
      var nextPrint = nextSlugPrint;
      } else {
     var nextPrint = nextSlugPrint +' ' +nextName;
     }     
    let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");
         next.innerHTML = nextSlug
          ? `<a href="?q=${nextSlug}${params.has("s") ? `&s=${finder}` : ""}">${nextPrint.trim()}
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

      <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
        <g>
              <path d="M202.1 450C 196.03278 449.9987 190.56381 446.34256 188.24348 440.73654C 185.92316 435.13055 187.20845 428.67883 191.5 424.39L191.5 424.39L365.79 250.1L191.5 75.81C 185.81535 69.92433 185.89662 60.568687 191.68266 54.782654C 197.46869 48.996624 206.82434 48.91536 212.71 54.6L212.71 54.6L397.61 239.5C 403.4657 245.3575 403.4657 254.8525 397.61 260.71L397.61 260.71L212.70999 445.61C 209.89557 448.4226 206.07895 450.0018 202.1 450z" stroke="none" fill="#8f8f8f" fill-rule="nonzero" />
        </g>
      </g>
      </svg></a>`
        : "";
        next2.innerHTML = next.innerHTML;
    }
    );
  
  $.ajax({
      url: "/read/php/api.php?fromjs=" +texttype +"/" +slugReady +"&type=B"
    }).done(function(data) {
      const prevArray = data.split(" ");
      let prevSlug = prevArray[0];
      let prevSlugPrint = prevSlug.replace(/pli-tv-|b[ui]-vb-/g, "");
let prevName = prevArray.slice(1).join(" ");
prevName = prevName.replace(/[0-9.]/g, '');

        if (prevName === undefined) {
    var prevPrint = prevSlugPrint;
      } else {
        var prevPrint = prevSlugPrint +' ' +prevName;
     }
        let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");

    previous.innerHTML = prevSlug
  ? `<a href="?q=${prevSlug}${finder ? `&s=${finder}` : ""}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">
      <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
        <g>
          <path d="M353 450C 349.02106 450.0018 345.20444 448.4226 342.39 445.61L342.39 445.61L157.5 260.71C 151.64429 254.8525 151.64429 245.3575 157.5 239.5L157.5 239.5L342.39 54.6C 346.1788 50.809414 351.70206 49.328068 356.8792 50.713974C 362.05634 52.099876 366.10086 56.14248 367.4892 61.318974C 368.87753 66.49547 367.3988 72.01941 363.61002 75.81L363.61002 75.81L189.32 250.1L363.61 424.39C 367.90283 428.6801 369.18747 435.13425 366.8646 440.74118C 364.5417 446.34808 359.06903 450.00275 353 450z" stroke="none" fill="#8f8f8f" fill-rule="nonzero" />
        </g>
      </g>
      </svg>${prevPrint.trim()}</a>`
  : "";
        previous2.innerHTML = previous.innerHTML;
      }
      );

    }
    );
     
    })
.catch(error => {
  console.log('error:not found');
  console.log(rootpath);
  console.log('eng ', engtrnpath);
  console.log('rus', rustrnpath);
  console.log(htmlpath);

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
  <a href="/ru/read.php"> <h2>Основные Сутты</h2></a> <br>
  <ul>
     <li><span class="abbr">dn</span> <a href="/ru/assets/texts/dn.php"> Dīgha-nikāya</a></li></li>
     <li><span class="abbr">mn</span> <a href="/ru/assets/texts/mn.php"> Majjhima-nikāya</a></li></li>
      <li><span class="abbr">sn</span> <a href="/ru/assets/texts/sn.php"> Saṁyutta-nikāya</a></li>
      <li><span class="abbr">an</span> <a href="/ru/assets/texts/an.php"> Aṅguttara-nikāya</a></li>
      <li><span class="abbr">snp</span> Sutta-nipāta</li>
  </ul>
  </div>

  <div>
  <h2>Часть KN</h2><br>
  <ul>
      <li><span class="abbr">ud</span> Udāna</li>
      <li><span class="abbr">iti</span> Itivuttaka (1–112)</li>
      <li><span class="abbr">dhp</span> Dhammapada</li>
      <li><span class="abbr">thag</span> Theragāthā</li>
      <li><span class="abbr">thig</span> Therīgāthā</li>
   <!--	     <li><span class="abbr">snp</span> Sutta-nipāta</li>
 <li><span class="abbr">kp</span> Khuddakapāṭha</li>-->
  </ul>
  </div>  
  
  <div>
 <!-- <h2>Виная</h2> -->
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
  } else if (language === "2nd") {
    showPaliEnglish();
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
  console.log("showing pali ");
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-english");
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove('column-view'); // Отключаем двухколоночный режим
}

function toggleThePali() {
  const languageButton = document.getElementById("language-button");

  // Инициализация
  if (!localStorage.paliToggleSpecialSpecial) {
    localStorage.paliToggleSpecial = "pli-2nd";
  }

  const newButton = languageButton.cloneNode(true);
  languageButton.parentNode.replaceChild(newButton, languageButton);

  newButton.addEventListener("click", () => {
    
    // 1. ИЩЕМ "ГЛАВНУЮ ПЕРВУЮ СТРОКУ"
    // Логика: ищем первую строку, НАЧАЛО которой видно ниже шапки (например, > 70px)
    const segments = document.querySelectorAll("#sutta span[id]");
    const headerOffset = 70; // Высота шапки + небольшой отступ
    let anchorData = null;

    for (let segment of segments) {
      const rect = segment.getBoundingClientRect();
      // ИЗМЕНЕНИЕ: Ищем элемент, у которого ВЕРХ (top) ниже шапки.
      // Это значит, мы берем именно НАЧАЛО строки, а не хвост предыдущей.
      if (rect.top > headerOffset) {
        anchorData = {
          element: segment,
          topOffset: rect.top 
        };
        break; // Нашли первую — останавливаемся
      }
    }

    // 2. МГНОВЕННОЕ ПЕРЕКЛЮЧЕНИЕ
    if (language === "pli") {
      showPaliAll();
      language = "pli-2nd";
      localStorage.paliToggleSpecial = "pli-2nd";
    } else if (language === "pli-2nd") {
      showPali();
      language = "pli";
      localStorage.paliToggleSpecial = "pli";
    }

    // 3. ЖЕСТКАЯ ФИКСАЦИЯ
    if (anchorData && anchorData.element) {
         setTimeout(() => {
             const currentRect = anchorData.element.getBoundingClientRect();
             const currentAbsoluteTop = window.scrollY + currentRect.top;
             const targetPos = currentAbsoluteTop - anchorData.topOffset;

             // Отключаем плавность
             const html = document.documentElement;
             const savedBehavior = html.style.scrollBehavior;
             html.style.cssText += "scroll-behavior: auto !important;";
             
             // ПРЫЖОК: Ставим верх найденной строки ровно туда, где он был
             window.scrollTo(0, targetPos);

             // Возвращаем настройки
             setTimeout(() => {
                html.style.scrollBehavior = savedBehavior;
                html.style.removeProperty('scroll-behavior');
             }, 50);
         }, 0);
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



// --- ЛОГИКА ДЛЯ ВСПЛЫВАЮЩИХ ПОДСКАЗОК (BUBBLES) — ФИНАЛЬНАЯ ВЕРСИЯ ---
// (Включает: Hover, Клик-пин, Умное позиционирование, Перенос длинных слов)

// 1. Добавляем CSS стили программно
const memStyle = document.createElement('style');
memStyle.innerHTML = `
    /* === ОБЩИЕ СТИЛИ === */
    .mem-trigger {
        cursor: pointer;
        position: relative;
        transition: color 0.2s, text-shadow 0.2s, border-bottom-color 0.2s;
        border-bottom: 1px solid transparent;
    }
    
    .mem-trigger:hover,
    .mem-trigger.mem-active { 
        color: var(--bs-primary, #0d6efd); 
        border-bottom-color: var(--bs-primary, #0d6efd);
    }

    .mem-bubble {
        position: absolute;
        background-color: #ffffff;
        color: #333333;
        border: 1px solid #ccc;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        padding: 6px 12px; /* Чуть больше паддинг для многострочного текста */
        border-radius: 6px;
        font-size: 18px; 
        font-family: sans-serif;
        z-index: 10000;
        
        /* === ИЗМЕНЕНИЯ ДЛЯ ПЕРЕНОСА СЛОВ === */
        white-space: normal;       /* Разрешаем перенос */
        overflow-wrap: break-word; /* Ломаем длинные слова */
        word-break: break-word;    /* Совместимость */
        text-align: center;        /* Центрируем текст */
        line-height: 1.3;          /* Межстрочный интервал */
        
        /* Ограничиваем ширину */
        width: max-content;        /* Стремимся к ширине контента */
        max-width: 300px;          /* Но не шире 300px на десктопе */
        
        /* На мобильных не шире экрана */
        @media (max-width: 400px) {
            max-width: 85vw;
        }

        pointer-events: auto; 
        cursor: pointer; 
        
        transform: translateY(-100%); 
        margin-top: -8px;
        opacity: 0; 
        transition: opacity 0.2s ease-out; 
    }
    
    .mem-bubble.visible {
        opacity: 1;
    }

    /* Стрелочка вниз */
    .mem-bubble::after {
        content: "";
        position: absolute;
        top: 100%;
        left: var(--arrow-x, 50%); 
        margin-left: -6px;
        border-width: 6px;
        border-style: solid;
        border-color: #ffffff transparent transparent transparent; 
    }
    /* Обводка стрелочки */
    .mem-bubble::before {
        content: "";
        position: absolute;
        top: 100%;
        left: var(--arrow-x, 50%);
        margin-left: -7px;
        border-width: 7px;
        border-style: solid;
        border-color: #ccc transparent transparent transparent; 
    }

    /* === ТЕМНАЯ ТЕМА === */
    body.dark .mem-trigger:hover,
    body.dark .mem-trigger.mem-active {
        color: var(--bs-primary, #0d6efd); 
        text-shadow: 0 0 8px rgba(13, 110, 253, 0.6); 
    }
    body.dark .mem-bubble {
        background-color: #2b2b2b;
        color: #e0e0e0;
        border: 1px solid #555;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
    }
    body.dark .mem-bubble::after {
        border-color: #2b2b2b transparent transparent transparent;
    }
    body.dark .mem-bubble::before {
        border-color: #555 transparent transparent transparent;
    }
`;
document.head.appendChild(memStyle);

// Переменная для таймера закрытия
let hoverTimeout;

// 2. Глобальная функция показа
window.showBubble = function(element, event, isHover = false) {
    if (event) event.stopPropagation();

    // Проверка активности: если уже активно, обновляем таймеры или пиним
    if (element.classList.contains('mem-active')) {
        if (isHover) {
            clearTimeout(hoverTimeout);
            return; 
        } else {
            const existingBubble = document.querySelector('.mem-bubble');
            if (existingBubble) {
                existingBubble.dataset.pinned = "true";
                return; 
            }
        }
    }

    // Удаляем старые баблы
    window.removeBubbles(); 

    const word = element.getAttribute('data-word');
    if (!word) return;

    element.classList.add('mem-active');

    const bubble = document.createElement('div');
    // Добавляем класс tts-ignore, чтобы voice.js игнорировал клики по баблу
    bubble.className = 'mem-bubble tts-ignore';
    bubble.dataset.pinned = isHover ? "false" : "true";
    bubble.setAttribute('lang', 'pi');
    bubble.classList.add('pli-lang');

    // Находим ID родительской строки и сохраняем его в атрибут (скрыто)
    const parentSegment = element.closest('[id]');
    if (parentSegment) {
        bubble.dataset.segmentId = parentSegment.id;
    }

    // Внутри только текст
    bubble.innerText = word;

    // Обработчики на самом бабле
    bubble.addEventListener('mouseenter', () => { clearTimeout(hoverTimeout); });
    bubble.addEventListener('mouseleave', () => {
        if (bubble.dataset.pinned === "false") {
            window.removeBubbles();
        }
    });

    // Добавляем в DOM
    document.body.appendChild(bubble);

    // --- УМНОЕ ПОЗИЦИОНИРОВАНИЕ ---
    const rect = element.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect(); 
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const windowWidth = window.innerWidth;
    
    // Центр буквы относительно страницы
    const triggerCenter = rect.left + (rect.width / 2);
    
    // Идеальная позиция левого края бабла
    let leftPos = triggerCenter - (bubbleRect.width / 2);
    
    const padding = 10; // Минимальный отступ от края экрана

    // Проверка левого края
    if (leftPos < padding) {
        leftPos = padding;
    }
    
    // Проверка правого края
    if (leftPos + bubbleRect.width > windowWidth - padding) {
        leftPos = windowWidth - bubbleRect.width - padding;
    }

    // Применяем позицию
    bubble.style.left = (leftPos + scrollX) + 'px';
    bubble.style.top = (rect.top + scrollY) + 'px';

    // Расчет позиции стрелки
    const arrowX = triggerCenter - leftPos;
    bubble.style.setProperty('--arrow-x', arrowX + 'px');

    // Показываем бабл
    requestAnimationFrame(() => {
        bubble.classList.add('visible');
    });
};


// 3. Обработчики Hover для букв
window.handleBubbleHover = function(element, event) {
    if (!window.matchMedia('(hover: hover)').matches) return;
    clearTimeout(hoverTimeout);
    if (element.classList.contains('mem-active')) return;
    window.showBubble(element, event, true);
};

window.handleBubbleLeave = function(element, event) {
    if (!window.matchMedia('(hover: hover)').matches) return;
    hoverTimeout = setTimeout(() => {
        const bubble = document.querySelector('.mem-bubble');
        if (bubble && bubble.dataset.pinned === "true") return;
        window.removeBubbles();
    }, 200); 
};


// 4. Глобальная функция удаления
window.removeBubbles = function() {
    const bubbles = document.querySelectorAll('.mem-bubble');
    bubbles.forEach(el => el.remove());

    const activeTriggers = document.querySelectorAll('.mem-trigger.mem-active');
    activeTriggers.forEach(el => el.classList.remove('mem-active'));
}

// 5. Закрытие при клике мимо
document.addEventListener('click', function(event) {
    if (event.target.closest('.mem-bubble')) {
        return; 
    }
    window.removeBubbles();
});

// 6. Закрытие при скролле
document.addEventListener('scroll', function() {
    window.removeBubbles();
}, true);