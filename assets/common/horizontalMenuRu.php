<?php
echo '<div class="d-md-inline-block">	';

if ((($_SERVER['SERVER_ADDR'] === '127.0.0.1') || ($_SERVER['SERVER_NAME'] === 'localhost')) && (!preg_match('/(new)(\?.*)?$/', basename($_SERVER['REQUEST_URI'])))) {
/*echo '<a class="text-decoration-none mx-1" href="/ru/new">
<figure class="figure text-decoration-none">
  <i class="menu-icon icon-item fa-solid fa-magnifying-glass fa-flip-horizontal"></i>
  <figcaption class="horiz-menu-item figure-caption text-center">Fdg New!!!</figcaption>
</figure>
</a>';*/
}

 if (preg_match('/(read\.php|new)(\?.*)?$/', basename($_SERVER['REQUEST_URI']))) {
    
echo '<a title="Поиск (Ctrl+1)" id="Search" class="dropup text-decoration-none mx-1 d-md-inline-block" href="' . $mainpage . '">
<figure class="figure text-decoration-none">
  <i class="menu-icon icon-item fa-solid fa-magnifying-glass fa-flip-horizontal"></i>
  <figcaption class="horiz-menu-item figure-caption text-center">' . $searchcaption . '</figcaption>
</figure>
</a>';
} 

if (strpos($_SERVER['REQUEST_URI'], "read.php") === false) {
echo '
<a title="Чтение (Ctrl+2)" class="dropup text-decoration-none mx-1 d-md-inline-block" id="MenuRead"  href="' . $mainreadlink . '">

<figure class="figure text-decoration-none">
  <i class="menu-icon icon-item fa-solid fa-book-bookmark"></i>
  <figcaption class="horiz-menu-item figure-caption text-center">Читать Pāḷi</figcaption>
</figure>
</a>';
} /* else {
 echo ' <a class="text-decoration-none mx-1" href="' . $readerPage . '">
<figure class="figure text-decoration-none">
  <i class="menu-icon icon-item fa-solid fa-bolt"></i>
  <figcaption class="horiz-menu-item figure-caption text-center">Pāḷi Индекс</figcaption>
</figure>
</a>' ;
} */ 

echo '<!--
<a class="dropup text-decoration-none mx-1 d-md-inline-block"  data-bs-toggle="dropdown" aria-expanded="false" href="#">

<figure class="figure dropup">
  <i class="menu-icon icon-item fa-solid fa-book-bookmark"></i>
<figcaption class="horiz-menu-item figure-caption text-center">Pāḷi Тексты</figcaption>   
</figure>	  
</a>
  <ul class="dropdown-menu" aria-labelledby="MenuRussian">
    <li><a class="dropdown-item" target="_blank"  href="' . $mainreadlink . '">Содержание</a></li>
    <li><a class="dropdown-item" target="" href="' . $readerPage . '">SC Light</a></li>
  </ul>
-->


<a title="Пали Тексты и Зарубежные Ресурсы" class="dropup text-decoration-none mx-1 d-md-inline-block" id="MenuEnglish" data-bs-toggle="dropdown" aria-expanded="false" href="#">
<figure class="figure dropup d-md-inline-block">
    <i class="menu-icon icon-item fa-solid fa-book"></i>
<figcaption class="horiz-menu-item figure-caption text-center">Иностран.</figcaption>   
</figure>	  
</a>
  <ul class="dropdown-menu" aria-labelledby="MenuEnglish">

<li>
  <div class="dropdown-item">Типитака:
    <a class="text-reset" target="_blank"  href="https://open.tipitaka.lk/" title="Редакция Шри Ланки Buddha Jhayanti">BJT</a>
    <a class="text-reset" target="_blank"  href="https://84000.org/" title="Тайская Типитака на 84000.org">Thai</a>
    <a class="text-reset" target="_blank"  href="https://tipitaka.org/romn" title="Типитака VRI на Tipitaka.org">VRI</a>  
    <a class="text-reset" target="_blank"  href="https://gretil.sub.uni-goettingen.de/gretil.html#Suttapit" title="Типитака PTS на GRETIL">PTS</a>  
    <a class="text-reset" target="_blank"  href="https://suttacentral.net/pitaka/sutta?lang=en" title="Типитака Mahāsaṅgīti на SuttaCentral.net">MS</a>
  </div>
</li>

<li>
  <div class="dropdown-item">Типитака CST:
    <a class="text-reset" target="_blank"  href="https://apply.paauksociety.org/tipitaka/index.php" title="Paauksociety.org">PA</a>
    <a class="text-reset" target="_blank"  href="https://tipitaka.app" title="Tipitaka.app">Tp.app</a>
    <a class="text-reset" target="_blank"  href="https://tipitakapali.org/" title="Tipitaka Pali Online">TPO</a>
    <a class="text-reset" target="_blank"  href="https://americanmonk.org/tipitaka-pali-reader/" title="Tipitaka Pali Reader App">TPR</a>
  </div>
</li>
    


    <li><a class="dropdown-item" target="_blank" href="https://www.digitalpalireader.online/_dprhtml/index.html">Digital Pali Reader</a></li>
    
    
    <li><a class="dropdown-item" target="_blank" href="https://simsapa.github.io/">Simsapa Pali Reader <u>PC</u> <u>Mac</u> <u>Linux</u></a></li>

         
                <li>
         <div class="dropdown-item ">
         <a class="text-reset" target="_blank"  href="https://suttacentral.net/pitaka/sutta?lang=en" >SuttaCentral</a> 
                <a class="text-reset" target="_blank"  href="https://suttacentral.net/pitaka/vinaya?lang=ru">Виная</a>
         <a class="text-reset" target="_blank"  href="https://www.sc-voice.net/">Voice</a>
        <a class="text-reset" target="_blank"  href="' . $linksclegacy . '">Legacy</a>
         </div>
         </li>
        <li><a class="dropdown-item" target="_blank" href="' . $linktbwOnMain . '">

          <i class="' . $iconimportant . '"></i>

        The Buddha\'s Words</a></li>  
	  
	               <li>
         <div class="dropdown-item ">Patimokkha 
         <a class="text-reset" target="_blank"   href="' . $linkati . '">ATI</a>
       <a class="text-reset" target="_blank"  href="/assets/dhammatalks.org/vinaya/bmc/Section0000.html">BMC</a>
          <a class="text-reset" target="" href="/assets/materials/bupm_trn_by_nanatusita.pdf">Nanatusita</a>  
       </div>
         </li>
    
    

           <li><a class="dropdown-item" target="_blank" href="/assets/materials/bipm_trn_by_chatsumarn_kabilsingh.pdf">Patimokkha Bi пер. Ch Kabilsingh</a></li>
   
	           <li>
         <div class="dropdown-item ">    
  <a class="text-reset" href="/san/d/mg.php" >Prātimokṣa</a>
    <a class="text-reset" href="/san/sarv.php" >sarv</a>
    <a class="text-reset" href="/san/mg.php" >mg</a>
    <a class="text-reset" href="/san/lo.php" >lo</a>
    <a class="text-reset" href="/san/mu2.php" >mu2</a>
    <a class="text-reset" href="/san/mu3.php" >mu3</a>
         </div>
         </li>

      <li><a class="dropdown-item" target="_blank" href="https://ancient-buddhist-texts.net/index.htm">Ancient Buddhist Texts</a></li>
	  
      <li><a class="dropdown-item" target="_blank" href="' . $linkmolds . '">Переводы Майкла Олдса</a></li>

        <li><a class="dropdown-item" target="_blank" href="' . $linknoblasc . '">Статьи на Dhammadana.org</a></li>

  </ul>
  

<a title="Ресурсы на Русском" class="dropup text-decoration-none mx-1 d-md-inline-block" id="MenuRussian" data-bs-toggle="dropdown" aria-expanded="false" href="#">
<figure class="figure dropup">
  <i class="menu-icon icon-item fa-solid fa-book"></i>
<figcaption class="horiz-menu-item figure-caption text-center">Русские</figcaption>   
</figure>	  
</a>
  <ul class="dropdown-menu" aria-labelledby="MenuRussian">
       
  
  <li><a class="dropdown-item" href="/ru/read.php#dhamma">Dhamma.gift Сутты</a></li>

<li><a class="dropdown-item" href="/ru/read.php#vinaya">Dhamma.gift Патимоккха</a></li>
     <!--            <li>
         <div class="dropdown-item ">
DG
      <a class="text-reset" target="" href="/ru/pm.php?expand=true">Бхиккху Патимоккха</a>        
      <a class="text-reset" target="" href="/ru/bipm.php?expand=true">Бхиккхуни</a> 
         </div>
         </li>
         
    href="?rp=true&tts=true&sacca=true"-->     
<li>
         <div class="dropdown-item ">Dhamma.gift
 <a class="text-reset" target="_blank"   href="/assets/common/o.html">Принципы</a>
   <a class="text-reset" target="" href="/assets/common/rationale.html">Проблематика</a>  
       </div>
         </li> 

<li><a class="dropdown-item" href="/assets/audio/documents/dn_Syrkin_2020_ed_2025.pdf">ДН пер. А.Я. Сыркина "2025"</a></li>
    <li><a class="dropdown-item" target="_blank" href="' . $mainpagethrflink . '">Тхеравада.рф Сутты</a></li>
    <li><a class="dropdown-item" target="_blank" href="' . $mainpagethrfvinayalink . '">Тхеравада.рф Патимоккха</a></li>
  <li><a class="dropdown-item" target="_blank" href="/dhamma.ru/index-sutta.html">Dhamma.ru Сутты</a></li>
    <li><a class="dropdown-item" target="_blank" href="assets/materials/prat.html">Dhamma.ru Патимоккха</a></li>
    <li><a class="dropdown-item" target="_blank" href="' . $mainpagethrulink . '">Theravada.ru</a></li>
    <li><a class="dropdown-item" target="_blank" href="' . $mainpagethsulink . '">Theravada.su</a></li>

  </ul>
<!-- </div> -->

<!--

<a class="dropdown text-decoration-none mx-1 d-md-inline-block" data-bs-toggle="dropdown" aria-expanded="false" href="#">
<figure class="figure d-md-inline-block">
  <i class="menu-icon icon-item fa-brands fa-google"></i>
<figcaption class="horiz-menu-item figure-caption text-center">CSE</figcaption>   
</figure>	  
</a>
  <ul class="dropdown-menu text-center" style="width:90% " aria-labelledby="dropdownMenuCSE">
   <li  >
      <script async src="https://cse.google.com/cse.js?cx=c184c71e0fe5d4c93"></script>
<div class="gcse-searchbox-only" data-newWindow="true" data-resultsUrl="/cse.php"></div>   
     </li>
</ul>

 <a class="text-decoration-none mx-1" href="/cse.php">
<figure class="figure">
<i class="menu-icon icon-item fa-brands fa-google"></i>
<figcaption class="horiz-menu-item figure-caption text-center">CSE</figcaption>   
</figure>	  
</a> 
  
    -->

<a title="ИИ-помощники, Словари Пали и Санскрит. Смотреть слово из строки поиска (Alt + N). Много словарей (Alt + Q)"  class="dropdown text-decoration-none mx-1 d-md-inline-block" id="MenuDict" data-bs-toggle="dropdown" aria-expanded="false" href="#">
  <figure class="figure d-md-inline-block">
    <i class="menu-icon fa-solid fa-book-atlas"></i>
    <figcaption class="horiz-menu-item figure-caption text-center">ИИ, Словари</figcaption>   
  </figure>	  
</a>

<ul class="dropdown-menu" aria-labelledby="MenuDict">

<li>
  <div class="dropdown-item">
    <i class="' . $iconimportant . '"></i>
    <a class="text-reset" target="_blank" title="открыть Dict.Dhamma.Gift в новом окне (Alt + N)" href="javascript:void(0)" onclick="openWithQuery(event, \'https://dict.dhamma.gift/ru/?theme={{theme}}&source=pwa&q={{q}}\')">Digital Pāḷi Dict</a>

    <a class="text-reset" target="_blank" title="Скачать DPD для использования оффлайн" href="https://digitalpalidictionary.github.io/">Оффлайн</a>
    <a class="text-reset" target="" title="Расширения для браузеров" href="#links">Расширения</a>
  </div>
</li>
          <li>
         <div class="dropdown-item ">
         ✨ <a class="text-reset" target="_blank" href="https://chatgpt.com">ChatGPT</a>
             <a class="text-reset" target="_blank" href="https://gemini.google/">Gemini</a>
         <a class="text-reset" target="_blank" href="https://chat.deepseek.com">DeepSeek</a>
      <a class="text-reset" target="_blank" href="https://norbu-ai.org/">Norbu AI</a>
           </div>
         </li>

    <li>
         <div class="dropdown-item ">
         <i class="' . $iconimportant . '"></i>
         <a class="text-reset" target="_blank" href="javascript:void(0)" onclick="openWithQuery(event, \'https://dharmamitra.org/translate?input_sentence={{q}}\')">Mitra Translator</a>
         + <a class="text-reset" target="_blank" href="https://dharmamitra.org/nexus/db/pa
">Nexus</a>
           </div>
         </li>

<li>
   <a class="dropdown-item" href="#" title="Открыть слово в словарях PTS/Cone/DPD/DPR/CPD/Skr+/Wisdomlib (Alt + Q)" onclick="openDictionaries(event)"><i class="' . $iconimportant . '"></i> Открыть PTS/Cone/DPD/CPD/Skr+/Wisdoml</a>
   <script src="/assets/js/openDicts.js" defer></script>

</li>  


<li>
  <a class="dropdown-item" title="PTS Pali Dictionary + Gandhari Dictionary + Digital Pali Dictionary + Critical Pali Dictionary " href="javascript:void(0)" onclick="return openWithQueryMulti(event, [
    \'https://dsal.uchicago.edu/cgi-bin/app/pali_query.py?matchtype=default&qs=\',
    \'https://gandhari.org/dictionary?section=dop&search=\',
    \'https://dict.dhamma.gift/?silent&source=pwa&q=\',
    \'https://www.digitalpalireader.online/_dprhtml/index.html?frombox=1&analysis=\',
    \'https://cpd.uni-koeln.de/search?query=\'
  ])">Pali PTS, Cone, DPD, DPR, CPD</a>
</li>

<li>
  <a class="dropdown-item" target="_blank" href="javascript:void(0)"
     onclick="return openWithQuery(event, \'https://cpd.uni-koeln.de/search?query={{q}}\')">
    Critical Pali Dict (CPD)
  </a>
</li>
<li><a class="dropdown-item" href="javascript:void(0)" target="_blank" onclick="openWithQuery(event, \'https://gandhari.org/dictionary?section=dop&search={{q}}\')">Cловарь M. Cone Gandhari.org</a></li>
<li><a class="dropdown-item" href="javascript:void(0)" target="_blank" onclick="openWithQuery(event, \'https://www.digitalpalireader.online/_dprhtml/index.html?frombox=1&analysis={{q}}\')">DPR Analysis</a></li>
<li><a class="dropdown-item" target="_blank" href="javascript:void(0)" onclick="openWithQuery(event, \'https://dsal.uchicago.edu/cgi-bin/app/pali_query.py?matchtype=default&qs={{q}}\')">Cловарь R. Davids, W. Stede PTS</a></li>

   <li>
         <div class="dropdown-item "> Skr
<a class="text-reset" target="_blank" title="Monier-Williams Sanskrit-English Dictionary, 1899" href="javascript:void(0)" onclick="openWithQuery(event, \'https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2020/web/webtc/indexcaller.php?transLit=roman&key={{q}}\');">MW</a>
<a class="text-reset" title="Monier-Williams + Shabda-Sagara + Apte Practical + Macdonell" href="javascript:void(0)" onclick="return openWithQueryMulti(event, [
  \'https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2020/web/webtc/indexcaller.php?transLit=roman&key=\',
  \'https://www.sanskrit-lexicon.uni-koeln.de/scans/SHSScan/2020/web/webtc/indexcaller.php?transLit=roman&key=\',
  \'https://www.sanskrit-lexicon.uni-koeln.de/scans/APScan/2020/web/webtc/indexcaller.php?transLit=roman&key=\',
  \'https://www.sanskrit-lexicon.uni-koeln.de/scans/MDScan/2020/web/webtc/indexcaller.php?transLit=roman&key=\'
])">+</a>

 <a class="text-reset" target="_blank" title="Все доступные Скр словари на сайте Cologne University"  href="https://www.sanskrit-lexicon.uni-koeln.de/">Много Словарей</a>
    <a class="text-reset" target="_blank" href="javascript:void(0)" onclick="openWithQuery(event, \'https://sanskritdictionary.com/?iencoding=iast&q={{q}}&lang=sans&action=Search\')">SkrDict</a>

<a class="text-reset" target="_blank" href="javascript:void(0)" onclick="openWithQuery(event, \'https://www.learnsanskrit.cc/translate?dir=au&search={{q}}\')">Learnskr</a>
       </div>
         </li> 
     <li>
         <div class="dropdown-item "> Pali-Skr
        <a class="text-reset" href="javascript:void(0)" target="_blank" onclick="openWithQuery(event, \'https://glosbe.com/pi/sa/{{q}}\')">Glosbe</a>
        <a class="text-reset" target="_blank"   href="https://sambhasha.ksu.ac.in/CompLing/pcl_1/html/Application%20home.html">Sambhasha</a>
        <a class="text-reset" target="_blank" href="https://rephrasely.com/translate/translate-pali-to-sanskrit">Pl to SA AI</a>
       </div>
         </li>




         <li>
         <div class="dropdown-item ">
         <a class="text-reset" target="_blank" href="https://dictionary.sutta.org/">Sutta.org</a>
         <a class="text-reset" target="_blank" href="  https://buddhistuniversity.net/content/reference/pali-thai-english-sanskrit-dictionary
">Buddhist University</a>
        <a class="text-reset"  target="_blank" href="http://dictionary.tamilcube.com/pali-dictionary.aspx">Англ-Пали</a>
           </div>
         </li>

<li>
  <a class="dropdown-item" href="javascript:void(0)" onclick="openWithQuery(event, \'https://www.wisdomlib.org/index.php?type=search&division=glossary&item=&mode=text&input={{q}}\')" target="_blank">
    Wisdomlib.org
  </a>
</li>
<li>
  <a class="dropdown-item" href="javascript:void(0)" onclick="openWithQuery(event, \'/cse.php?q={{q}}\')" target="_blank">
    Google Custom Search
  </a>
</li>

</ul>    
    

<a title="Общая История Поиска" class="dropup text-decoration-none mx-1 d-md-inline-block" id="history" href="/ru/history.php">
<figure class="figure">
  <i class="menu-icon icon-item fa-solid fa-clock-rotate-left"></i>
<figcaption class="horiz-menu-item figure-caption text-center">' . $anamehist . '</figcaption>   
</figure>   
</a>
    
<a title="Материалы для обучения и сайты" class="dropdown text-decoration-none mx-1 d-md-inline-block" id="materials" data-bs-toggle="dropdown" aria-expanded="false" href="#">
<figure class="figure d-md-inline-block">
  <i class="menu-icon icon-item fa-solid fa-graduation-cap"></i>
<figcaption class="horiz-menu-item figure-caption text-center">Обучение</figcaption>   
</figure>	  
</a>
  <ul class="dropdown-menu" aria-labelledby="Materials">
   
                         <li>
<div class="dropdown-item ">
         <i class="' . $iconimportant . '"></i> Падежи <a class="text-reset" href="' . $linkcasesru . '"> таблица</a>
         <a class="text-reset" target=""  href="/assets/materials/pali_declensions_ru.pdf">примеры</a> 
       </div>
         </li>     
                         <li>
<div class="dropdown-item ">
         <i class="' . $iconimportant . '"></i> Спряжения          <a class="text-reset" target=""  href="/assets/materials/pali_conjugations_ru.pdf"> рус</a> 
         <a class="text-reset" href="' . $linkconj . '"> англ</a>
       </div>
         </li>        
  
   <li><a class="dropdown-item" href="' . $linktextbookru . '">
     <i class="' . $iconimportant . '"></i>
    Дж. Гейр. – Курс по Пали</a></li>
   <li><a class="dropdown-item" href="/assets/materials/yelizarenkova_toporov_pali.pdf">
     <i class="' . $iconimportant . '"></i>
    Елизаренкова, Топопов – Язык Пали</a></li>
    
    
   <li><a class="dropdown-item" href="' . $linkwarder . '">
    Вардер – Введение в Пали. Англ</a></li>    
    
   <li><a class="dropdown-item" href="' . $linkmagadhabhasa . '">
    Тхануттамо Бх – Пали. Англ</a></li>    
    
   <!-- https://drive.google.com/file/d/1H_mhKNgrBYevOOnax-FUBgxkfSuwHItu/view?usp=sharing -->
   
               <li>
         <div class="dropdown-item ">Материалы
         <a class="text-reset" target=""  href="https://drive.google.com/drive/folders/1UU-y5idRNpfcVTripRUtyTVcOgdwjMGN">Gdrive</a>
                   <a class="text-reset" target="" href="https://www.ancient-buddhist-texts.net/Textual-Studies/index.htm">ABT.net</a>
        <a class="text-reset" target="_blank"  href="https://sasanarakkha.github.io/study-tools/">SBS</a>  
       </div>
         </li>     
  
                         
              <li><a class="dropdown-item" target="_blank" href="' . $linklearnpali . '">' . $anamemlearnpali . '</a></li> 

<li>

<div class="dropdown-item ">
<a target="_blank" class="text-reset" href="https://www.thebuddhistsociety.org/page/sanskrit-and-pali-study-resources-guide-by-james-whelan">' . $anamelearnsanskrit . '</a> <a class="text-reset" target="_blank" href="https://drive.google.com/drive/folders/1jAy_xD6qkrnIkmXO9e4KtI_--nDMySSn">gd</a> <a class="text-reset" target="_blank" href="https://www.youtube.com/@jameswhelan2381">yt</a>


       </div>
</li>          
       
                      <li>
<div class="dropdown-item ">
         <i class="' . $iconimportant . '"></i><a class="text-reset" href="/ru/memo/"> Мнемотехника</a>
         <a class="text-reset" target=""  href="/memorize/?q=sn56.11">sn56.11</a> 
         <a class="text-reset" target=""  href="/memorize/?q=dn22">dn22</a> 
         <a class="text-reset" target=""  href="/memorize/?q=sn12.2">sn12.2</a>
       </div>
         </li>     
         
<li><a class="dropdown-item" target="_blank" href="https://docs.google.com/document/d/12A4jNFrSQywZubM7bL2pgQK0fOtr6LEBJMjGb7nTNlw/edit?usp=drivesdk">Советы-Секреты "Как запоминать легче" </a></li> 
           
       
                  <li>
         <div class="dropdown-item ">Тренажёры: 
         <a class="text-reset" target=""  href="/ru/assets/grammar/nouns.html">Грамматика</a>,         
                   <a class="text-reset" target="" href="/ru/assets/rr.html">Патимоккха</a>
       </div>
         </li>     
                <li><a class="dropdown-item" target="_blank" href="https://www.dhammabytes.org/pali-practice/">Pali Practice App</a></li>    
              
    <!--        <li><a class="dropdown-item" href="#research">Исследование</a></li>
       <li><a class="dropdown-item" href="#read">Чтение</a></li>
    <li><a class="dropdown-item" href="#study">Учебные Материалы</a></li> -->
  
  </ul>
  
<div class="d-inline-flex align-items-center gap-1">

<a title="Конвертеры и др полезные инструменты" class="dropdown text-decoration-none mx-1 d-md-inline-block" id="tools" data-bs-toggle="dropdown" aria-expanded="false" href="#">

<figure class="figure d-md-inline-block">

<i class="menu-icon icon-item fa-solid fa-screwdriver-wrench"></i>
<figcaption class="horiz-menu-item figure-caption text-center">' . $anametools . '</figcaption>   
</figure>	  
</a>
  <ul class="dropdown-menu" aria-labelledby="tools">
  
  
         <li>
         <div class="dropdown-item ">
          <a class="text-reset" target="" onclick="localStorage.setItem(\'siteLanguage\', \'th\');" href="/th/?q=">DG</a> 
         <a class="text-reset" target=""  href="/old.php">old</a> 
        <a class="text-reset" target="" target="TTS Текст-в-речь" href="/ru/tts.php" onclick="return openWithQuery(event, \'/ru/tts.php?q={{q}}\')" >TTS</a>  

<!--  <a href="/ru/r.php" id="chapter-button" class="text-reset" target="Читать Книгами или Главами" >Read+</a>  
	  <script src="/read/js/urlForLbl.js" defer></script> -->

<a href="/ru/r.php" class="text-reset" target="Читать Книгами или Главами"
   onclick="
       (function(e){
           let q = document.getElementById(\'paliauto\')?.value.trim().toLowerCase()|| \'\';
           let match = q.match(/^([a-z]+[0-9]+)/i);
           let base = match ? match[1] : q;
           return openWithQuery(e, \'/ru/r.php?q=\' + encodeURIComponent(base) + \'#\' + encodeURIComponent(q));
       })(event)
   ">Read+</a>

       <!--  <a class="text-reset" target=""  href="/new/">new</a>                
	   <a class="text-reset" target="" href="' . $readerPage . '"> индекс</a>   
  -->   
      <a class="text-reset" target="" href="/ru/pm.php?expand=true">bupm</a>        
      <a class="text-reset" target="" href="/ru/bipm.php?expand=true">bipm</a> 

         </div>
         </li>



   <li><a class="dropdown-item" target="_blank" href="/assets/common/lunarRu.html"> <i class="' . $iconimportant . '"></i> Дни Упосаттхи по Суттам</a></li>
<li>
  <a class="dropdown-item" href="javascript:void(0)" target="_blank" onclick="openWithQuery(event)">
    <i class="' . $iconimportant . '"></i> Aksharamukha текстовый конвертер
  </a>
</li>



              <li>
         <div class="dropdown-item ">PTS Конвертер
         <a class="text-reset" target="_blank"   href="https://palistudies.blogspot.com/2020/02/sutta-number-to-pts-reference-converter.html">#1</a>
                   <a class="text-reset" target="" href="https://benmneb.github.io/pts-converter/">#2</a>  
       </div>
         </li>   
     
              <li>
         <div class="dropdown-item "> 
         <a class="text-reset" target="_blank"   href="https://readingfaithfully.org/">ReadingFaithfully.org</a>
                   <a class="text-reset" target="" href="/assets/br/">Кратко</a>  
       <a class="text-reset" target="_blank"  href="https://index.readingfaithfully.org/">Темы</a>
       </div>
         </li>   
     
         <li>
         <div class="dropdown-item "> 
         <a class="text-reset" target="_blank" href="/assets/repeat-timer/">Loop Timer</a>
         <a class="text-reset" target="_blank" href="/assets/pomodoro-timer/">Pomodoro Timer</a>  
       </div>
    </li>  
         
   <li><a class="dropdown-item" href="javascript:void(0)" target="_blank"  onclick="openWithQuery(event, \'/ru/assets/linebyline.html?q={{q}}\')">Редактировать Перевод</a></li>
  
  
  
   <li><a class="dropdown-item" href="javascript:void(0)" target="_blank"  onclick="openWithQuery(event, \'/ru/assets/diff/?lang=pl&one={{q}}&two={{q}}\')">' . $anamesdiff . '</a></li>
  

  <li><a class="dropdown-item" href="/assets/listdiff.html">Сравнить Два Списка</a></li>

 <li><a class="dropdown-item" href="/ru/assets/makelist.html">
   <i class="' . $iconimportant . '"></i>
 ' . $head5makelist . '</a></li>   

</ul>

 <a  id="multi-tool-help"  title="Помощь по Dhamma.Gift Multi-Tool"
     href="/assets/common/multiToolRu.html"
     class="text-muted text-decoration-none"
     style="font-size: 0.75rem; line-height: 1; position: relative; top: 0.4em;">
    *
  </a>
</div>



</div>'
?>