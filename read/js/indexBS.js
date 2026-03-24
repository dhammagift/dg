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
    translator = "sujato";
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
var rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`
 }

   var htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;
 
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
//	     var rootpath = `/assets/texts/${texttype}/${slug}_root-pli-ms.json`;
var rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slug}_rootd-pli-ms.json`
 } 
 else if (( script === "thai" ) || ( savedScript === "Thai" ) ) {
var rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`
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

  const translationResponse = fetch(trnpath).then(response => response.json());
  const htmlResponse = fetch(htmlpath).then(response => response.json());

const varResponse = window.fetchVariantData(varpathLocal, varpath);

  Promise.all([rootResponse, translationResponse, htmlResponse, varResponse]).then(responses => {
    const [paliData, transData, htmlData, varData] = responses;

	
// === НАЧАЛО ИЗМЕНЕНИЙ: Логика объединения Гатх ===
    const segments = Object.keys(htmlData);
    
    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      // Проверки на undefined (как в оригинале)
      if (transData[segment] === undefined) transData[segment] = "";
      if (transData[segment] === "") transData[segment] = "";

      // ЛОГИКА ОБЪЕДИНЕНИЯ (MERGE):
      // Проверяем, является ли текущий сегмент частью стиха (verse-line)
      // и есть ли следующий сегмент, который тоже часть стиха.
      let nextSegment = segments[i + 1];
      
      if (htmlData[segment] && htmlData[segment].includes('verse-line') &&
          nextSegment && htmlData[nextSegment] && htmlData[nextSegment].includes('verse-line')) {
          
          
          let [nextOpen, nextClose] = htmlData[nextSegment].split(/{}/);
          
          // Проверяем, что следующий сегмент не начинает новый абзац
          if (!nextOpen.includes('<p>')) {
              
              const toLower = (str) => {
                  if (!str) return "";
                  
                  // Если строка начинается с I, I' (I'm, I'll) или O (возможно после кавычки) — не трогаем
                  if (str.match(/^["“'‘]?(I\b|I'|O\b)/)) return str;
                  
                  // В остальных случаях просто делаем маленьким первый символ 
                  return str.charAt(0).toLowerCase() + str.slice(1);
              };

    

              // 1. Объединяем ПАЛИ
              if (paliData[nextSegment]) {
                  paliData[segment] = (paliData[segment] || "").trim() + " " + toLower(paliData[nextSegment].trim());
              }

              // 2. Объединяем ПЕРЕВОД (Английский)
              if (transData[nextSegment]) {
                  transData[segment] = (transData[segment] || "").trim() + " " + toLower(transData[nextSegment].trim());
              }

              // 3. Объединяем ВАРИАНТЫ (если есть)
              if (varData[nextSegment]) {
                  varData[segment] = (varData[segment] || "").trim() + " " + toLower(varData[nextSegment].trim());
              }

              // 4. Склеиваем HTML (оставляем обертку)
              let [currOpen, currClose] = htmlData[segment].split(/{}/);
              
              // Переписываем htmlData текущего сегмента: начало от первого, конец от второго
              htmlData[segment] = (currOpen || '') + "{}" + (nextClose || '');
              
              // 5. Пропускаем следующий сегмент (мы его только что приклеили)
              i++; 
          }
      }
      // === КОНЕЦ ЛОГИКИ ОБЪЕДИНЕНИЯ ===

      
      
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
    paliData[segment] = paliData[segment]?.replace(regex, match => `<b class='match finder'>${match}</b>`);
  } catch (error) {}

  try {
    transData[segment] = transData[segment]?.replace(regex, match => `<b class="match finder">${match}</b>`);
  } catch (error) {}

  if (varData[segment] !== undefined) {  
    try {
      varData[segment] = varData[segment].replace(regex, match => `<b class="match finder">${match}</b>`);
    } catch (error) {}
  }
}

const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
let linkToCopy = `<a class="text-decoration-none copyLink" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`

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
}


if (translator === "o") {
  translatorforuser = '<a href=/assets/common/o-en.html>o</a> from Pali';
} else if (translator === "sv") {
  translatorforuser = 'SV theravada.ru from Eng';
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


     const translatorByline = `<div id="trn" class="byline">
     <p>
    <span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a> </span> <span class="eng-lang" lang="en">Trn: ${translatorforuser}</span>
     </p>
     </div>`;
     
         const enUrl = window.location.href;
      const ruUrl = enUrl.replace("/read/", "/r/");

      let scLink = `<p class="sc-link"><a title="Russian (Alt+1)" href="${ruUrl}">Ru</a>&nbsp;`;

      // === 1. МГНОВЕННЫЙ ВЫВОД ТЕКСТА НА ЭКРАН ===
      const origUrl = window.location.href;
      let rvUrl = origUrl.replace("/r/", "/read/");
      rvUrl = rvUrl.replace("/ml/", "");
      rvUrl = rvUrl.replace("/read/", "/memorize/");
      let thUrl = origUrl.replace("/read/", "/th/read/");
      let dUrl = origUrl.replace("/read/", "/d/");

      const SHOW_CLOSE_AFTER = 10;
      let viewCount = parseInt(localStorage.getItem('warningViewCount')) || 0;
      viewCount++;
      localStorage.setItem('warningViewCount', viewCount);
      const canShowClose = viewCount >= SHOW_CLOSE_AFTER;
      const isWarningClosed = localStorage.getItem('warningClosed');

      const warning = `
        <div class="warning-container warning-box">
          <p class='warning'>
            <strong>Note:</strong><a class='text-decoration-none cursor-pointer' target='' href='${dUrl}'>&nbsp;</a>Translations, dictionaries and commentaries were not made by the Blessed One.<a class='text-decoration-none cursor-pointer' target='' href='${thUrl}'>&nbsp;</a>Cross-check with Pali in 4 main nikayas.
                 ${canShowClose && !isWarningClosed ? `<span class="close-warning">×</span>` : ''} 
          </p>
        </div>
      `;

      // Выводим текст СРАЗУ
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

      // === 2. НАСТРОЙКА ИНТЕРФЕЙСА ===
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

      scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);
      scLink += "</p>";

      const topContainer = document.getElementById('top-links-container');
      const bottomContainer = document.getElementById('bottom-links-container');
      if (topContainer) topContainer.innerHTML = scLink;
      if (bottomContainer) bottomContainer.innerHTML = scLink;

      renderNavigation(slug, slugReady);
   
	     addToSearchHistory(); 

    })
.catch(error => {
  console.log('error: not found');
  const redirectKey = `redirect_${slug}`;
  const redirectCount = localStorage.getItem(redirectKey) || 0;
  
  if (redirectCount >= 3) {
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

  localStorage.setItem(redirectKey, parseInt(redirectCount) + 1);

var xhr = new XMLHttpRequest();
xhr.open("GET", "/?p=-kn&q=" + encodeURIComponent(slug), true);
xhr.send();

xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    if (xhr.status == 200) {
      if (!xhr.responseText.includes("Page not found") && 
          !xhr.responseText.includes("404") &&
          xhr.responseText.trim().length > 0) {
        window.location.href = "/?p=-kn&q=" + encodeURIComponent(slug);
      }
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
  suttaArea.classList.add("hide-english");
  suttaArea.classList.remove("hide-pali");
  suttaArea.classList.add("hide-russian");
  suttaArea.classList.remove('column-view'); 
}

function toggleThePali() {
  const languageButton = document.getElementById("language-button");

  if (!localStorage.paliToggle) localStorage.paliToggle = "pli-2nd";

  const newButton = languageButton.cloneNode(true);
  languageButton.parentNode.replaceChild(newButton, languageButton);

  newButton.addEventListener("click", () => {
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

const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    citation.focus();
  });
});
