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

  let html = `<div class="button-area"><button title="Switch language (Atl+Z or Alt+Space)" id="language-button" class="hide-button">Pāḷi Eng</button></div>`;
  const slugReady = parseSlug(slug);

  let params = new URLSearchParams(document.location.search);
  let script = params.get("script");
  const savedScript = localStorage.getItem('selectedScript');

  let rootpath = `${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`;
  if (script === "devanagari" || savedScript === "Devanagari") {
      rootpath = `/assets/texts/devanagari/root/pli/ms/${texttype}/${slugReady}_rootd-pli-ms.json`;
  } else if (script === "thai" || savedScript === "Thai") {
      rootpath = `/assets/texts/th/root/pli/ms/${texttype}/${slugReady}_rootth-pli-ms.json`;
  }

  let htmlpath = `${Sccopy}/sc-data/sc_bilara_data/html/pli/ms/${texttype}/${slugReady}_html.json`;
  if (slug.match(/bu-pm|bi-pm/)) {
      htmlpath = `/assets/html/${texttype}/${slug}_html.json`;
  }

  const currentUrl = window.location.href;
  const ruUrl = currentUrl.replace("/multi/", "/r/");
  const enUrl = currentUrl.replace("/multi/", "/read/");
  const eeUrl = currentUrl;

  let scLink = `<p class="sc-link">
  <a title="Russian (Alt+1)" href="${ruUrl}">Ru</a>
  <a title="English (Alt+1)" href="${enUrl}">En</a>
  <a title="English Multi (Alt+1)" href="${eeUrl}">E+E</a>
  `;

  var varpath = `${Sccopy}/sc-data/sc_bilara_data/variant/pli/ms/${texttype}/${slugReady}_variant-pli-ms.json`;
  var varpathLocal = `/assets/texts/variant/${texttype}/${slugReady}_variant-pli-ms.json`;

  const scDefaultAuthor = texttype === "vinaya" ? "brahmali" : "sujato";

  const oPath = `/assets/texts/en/o/${texttype}/${slugReady}_translation-en-o.json`;
  const tPath = `/assets/texts/en_other/${texttype}/${slugReady}_translation-en-thanissaro.json`;
  let scPath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/${scDefaultAuthor}/${texttype}/${slugReady}_translation-en-${scDefaultAuthor}.json`;

  if (slug.match(/ja/)) {
      let slugNumber = parseInt(slug.replace(/\D/g, ''), 10);
      if (slugNumber >= 1 && slugNumber <= 75) {
          scPath = `${Sccopy}/sc-data/sc_bilara_data/translation/en/sujato/${texttype}/${slugReady}_translation-en-sujato.json`;
      }
  }

  async function fetchJSON(url, authorId) {
      try {
          const res = await fetch(url);
          if (res.ok) {
              const data = await res.json();
              if (data && Object.keys(data).length > 0) {
                  data._authorId = authorId;
                  return data;
              }
          }
      } catch (e) {}
      return null;
  }

  const rootPromise = fetch(rootpath).then(res => res.ok ? res.json() : fetch(`${Sccopy}/sc-data/sc_bilara_data/root/pli/ms/${texttype}/${slugReady}_root-pli-ms.json`).then(r => r.json())).catch(() => ({}));
  const htmlPromise = fetch(htmlpath).then(res => res.ok ? res.json() : {});
  const varPromise = window.fetchVariantData ? window.fetchVariantData(varpathLocal, varpath) : Promise.resolve({});

  const oPromise = fetchJSON(oPath, "o");
  const tPromise = fetchJSON(tPath, "thanissaro");
  const scPromise = fetchJSON(scPath, scDefaultAuthor);

  Promise.all([rootPromise, htmlPromise, varPromise, oPromise, tPromise, scPromise]).then(responses => {
      const [paliData, htmlData, varData, oData, tData, scData] = responses;

      if (!htmlData || Object.keys(htmlData).length === 0) throw new Error("Text not found");

      let transData = null;
      let secondTransData = null;

      if (oData && tData) {
          transData = oData;
          secondTransData = tData;
      } else if (oData && !tData) {
          transData = oData;
          secondTransData = scData;
      } else if (!oData && tData) {
          transData = tData;
          secondTransData = scData;
      } else {
          transData = scData;
          secondTransData = null;
      }

      if (translator === "") {
          translator = transData ? transData._authorId : scDefaultAuthor;
      }

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
          window.mergeGathas(htmlData, paliData, transData || {}, varData, secondTransData || {}) : Object.keys(htmlData);

      for (let i = 0; i < segments.length; i++) {
          let segment = segments[i];

          let finder = (params.get("s") || "").replace(/ṃ/g, "ṁ");

          if (finder && finder.trim() !== "") {
              let regex = new RegExp(finder, 'gi');
              const highlight = match => `<b class='match finder'>${match}</b>`;
              if (paliData[segment]) paliData[segment] = paliData[segment].replace(regex, highlight);
              if (transData && transData[segment]) transData[segment] = transData[segment].replace(regex, highlight);
              if (secondTransData && secondTransData[segment]) secondTransData[segment] = secondTransData[segment].replace(regex, highlight);
              if (varData[segment]) varData[segment] = varData[segment].replace(regex, highlight);
          }

          if (typeof window.applyRemovePunct === 'function') window.applyRemovePunct(paliData, segment);

          let [openHtml, closeHtml] = htmlData[segment] ? htmlData[segment].split(/{}/) : ["", ""];
          let anchor = segment.substring(segment.indexOf(':') + 1);
          if (slug.includes('-') && (slug.includes('an') || slug.includes('sn') || slug.includes('dhp'))) anchor = segment;

          var fullUrlWithAnchor = window.location.href.split('#')[0] + '#' + anchor;
          const linkToCopyStart = `<a class="text-decoration-none copyLink copyLink-start" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;
          let linkToCopy = `<a class="text-decoration-none copyLink" style="cursor: pointer;" onclick="copyToClipboard('${fullUrlWithAnchor}')"></a>`;

          const hasSecondTrn = secondTransData && secondTransData[segment];
          const secondTrnStyle = hasSecondTrn ? "display: block; margin-top: 4px; color: #666;" : "display: none;";

          html += `${openHtml}<span id="${anchor}">
              <span class="pli-lang inputscript-ISOPali" lang="pi">
                  ${linkToCopyStart}${(paliData[segment] || "").trim()}${linkToCopy}
                  ${varData[segment] ? `<font class="variant"><br>${linkToCopyStart}${varData[segment].trim()}${linkToCopy}</font>` : ''}
              </span>
              <span class="right-column">
                  <span class="eng-lang" lang="en">${linkToCopyStart}${transData && transData[segment] ? transData[segment].trim() : ""}${linkToCopy}</span>
                  <span class="eng-lang second-translation-row" lang="en" style="${secondTrnStyle}">
                      <font>${linkToCopyStart}${(hasSecondTrn ? secondTransData[segment].trim() : "")}${linkToCopy}</font>
                  </span>
              </span>
          </span>${closeHtml}\n\n`;
      }

      function getAuthorName(id) {
          if (id === "o") return '<a href="/assets/common/o-en.html">o</a> from Pali';
          if (id === "sujato") return 'Bhikkhu Sujato';
          if (id === "brahmali") return 'Bhikkhu Brahmali';
          if (id === "thanissaro") return 'Thanissaro Bhikkhu';
          return id;
      }

      let translatorforuser = transData ? getAuthorName(transData._authorId) : "";
      let secondTranslatorByline = "";
      if (secondTransData && secondTransData._authorId) {
          let secondTrName = getAuthorName(secondTransData._authorId);
          secondTranslatorByline = ` <span class="eng-lang second-translation-row" style="color: #666;"> Trn 2: ${secondTrName}</span>`;
      }

      const translatorByline = `<div id="trn" class="byline"><p><span class="pli-lang" lang="pi">Pāḷi <a class="text-decoration-none text-reset" href="/assets/texts/abbr.html?s=ms" title="Mahāsaṅgīti Pāḷi">MS</a></span> <span class="eng-lang" lang="en"> Trn: ${translatorforuser}</span><br>
      ${secondTranslatorByline}</p></div>`;

      if (typeof generateThirdPartyLinks === 'function') scLink += generateThirdPartyLinks(slug, slugReady, texttype, translator);

      if (finalRulingAnchor) scLink += `&nbsp;<a href="#${finalRulingAnchor}" title="To final rule">Final</a>`;
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
          window.handleFetchError(slug, false); 
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
  } else if  (localStorage.paliToggleSpecial) {
    language = localStorage.paliToggleSpecial; 
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

