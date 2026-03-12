function parseSlug(slug) {
if (
    slug === 'bu-pm' ||
    slug === 'bi-pm' ||
    slug === 'pli-tv-bu-pm' ||
    slug === 'pli-tv-bi-pm' ||
    slug === 'bupm' ||
    slug === 'bipm'
  ) {
    // Проверяем, есть ли 'bi' в строке, чтобы понять пол (Bhikkhuni/Bhikkhu)
    const gender = slug.includes('bi') ? 'bi' : 'bu';
    return `pli-tv-${gender}-pm`;
  }

if (
  slug === 'bu-as' ||
  slug === 'bu-vb-as1-7' ||
  slug === 'pli-tv-bu-vb-as1-7' ||
  slug === 'bi-as' ||
  slug === 'bi-vb-as1-7' ||
  slug === 'pli-tv-bi-vb-as1-7'
) {
  const slugParts = slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/);
  const fixforbivb = slug.replace(/(\d+)-(\d+)/g, '');
  const bookWithoutNumber = fixforbivb.replace(/(\d+)/g, '');
  const fixforbivb2 = slug.replace(/-([a-z]+)\d+/g, '');
  const bookWithoutNumberAndRule = fixforbivb2.replace(/-\d+$/g, '');
  const firstNum = slugParts[6];
  
  return `${bookWithoutNumberAndRule}/${bookWithoutNumber}1-7`;
} else if ( slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/)) {
    const slugParts = slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/);
  const fixforbivb = slug.replace(/(\d+)-(\d+)/g, '');
  const bookWithoutNumber = fixforbivb.replace(/(\d+)/g, '');
  const fixforbivb2 = slug.replace(/-([a-z]+)\d+/g, '');
  const bookWithoutNumberAndRule = fixforbivb2.replace(/-\d+$/g, '');
  const firstNum = slugParts[6];
  return `${bookWithoutNumberAndRule}/${bookWithoutNumber}/${slug}`;
}
else if  (slug.match(/^([a-z]+)-([a-z]+)-([a-z]+)*(\d*)/)){
  const bookWithoutNumber = slug.replace(/(\d+|\.)/g, '');
  return `${bookWithoutNumber}/${slug}`;
}

const slugParts = slug.match(/^([a-z]+)(\d*)\.*(\d*)/);
const book = slugParts ? slugParts[1] : slug;
const firstNum = slugParts ? slugParts[2] : '';

  if (book === "dn" || book === "mn") {
    return `${book}/${slug}`;
  } else if (book === "sn" || book === "an") {
    return `${book}/${book}${firstNum}/${slug}`;
  } else if (book === "kp") {
    return `kn/kp/${slug}`;
  } else if (book === "dhp") {
    return `kn/dhp/${slug}`;
  } else if (book === "ud") {
    return `kn/ud/vagga${firstNum}/${slug}`;
  } else if (book === "iti") {
    return `kn/iti/vagga${findItiVagga(firstNum)}/${slug}`;
  } else if (book === "snp") {
    return `kn/snp/vagga${firstNum}/${slug}`;
  } else if (book === "thag" || book === "thig") {
    return `kn/${book}/${slug}`;
  } else if (book === "ja") {
    return `kn/ja/${slug}`;
  }
}

function findItiVagga(suttaNumber) {
  if (suttaNumber >= 1 && suttaNumber <= 10) {
    return "1";
  } else if (suttaNumber >= 11 && suttaNumber <= 20) {
    return "2";
  } else if (suttaNumber >= 21 && suttaNumber <= 27) {
    return "3";
  } else if (suttaNumber >= 28 && suttaNumber <= 37) {
    return "4";
  } else if (suttaNumber >= 38 && suttaNumber <= 49) {
    return "5";
  } else if (suttaNumber >= 50 && suttaNumber <= 59) {
    return "6";
  } else if (suttaNumber >= 60 && suttaNumber <= 69) {
    return "7";
  } else if (suttaNumber >= 70 && suttaNumber <= 79) {
    return "8";
  } else if (suttaNumber >= 80 && suttaNumber <= 89) {
    return "9";
  } else if (suttaNumber >= 90 && suttaNumber <= 99) {
    return "10";
  } else if (suttaNumber >= 100 && suttaNumber <= 112) {
    return "11";
  }
}

function getTopVisibleSegment() {
  const segments = document.querySelectorAll("#sutta span[id]"); 
  const targetLine = window.innerHeight * 0.3; 

  if (segments.length === 0) return null;

  for (let segment of segments) {
    const rect = segment.getBoundingClientRect();
    if (rect.bottom > targetLine) {
      return { element: segment, topOffset: rect.top };
    }
  }
  return null;
}

function runWithTransition(stateChangeCallback) {
  const suttaContainer = document.getElementById("sutta");
  
  const anchorData = getTopVisibleSegment();

  if (suttaContainer) suttaContainer.classList.add("text-hidden");

  setTimeout(() => {
      stateChangeCallback();

      if (anchorData && anchorData.element) {
           const currentRect = anchorData.element.getBoundingClientRect();
           const currentAbsoluteTop = window.scrollY + currentRect.top;
           const targetPos = currentAbsoluteTop - anchorData.topOffset;

           const html = document.documentElement;
           const savedBehavior = html.style.scrollBehavior;
           html.style.cssText += "scroll-behavior: auto !important;";
           
           window.scrollTo(0, targetPos);

           setTimeout(() => {
              html.style.scrollBehavior = savedBehavior;
              html.style.removeProperty('scroll-behavior');
           }, 50);
      }

      requestAnimationFrame(() => {
          if (suttaContainer) suttaContainer.classList.remove("text-hidden");
      });

  }, 150);
}

// Делаем функцию доступной глобально, чтобы словарь мог её вызывать!
window.syncSmartIcons = function() {
    const smartButtons = document.querySelectorAll('.smart-btn');
    smartButtons.forEach(btn => {
        const targetSelector = btn.getAttribute('data-target');
        if (!targetSelector) return;
        
        const originalEl = document.querySelector(targetSelector);
        const smartImg = btn.querySelector('img');

        if (originalEl && smartImg) {
            let sourceImg = originalEl.tagName === 'IMG' ? originalEl : originalEl.querySelector('img');
            if (sourceImg && sourceImg.src) {
                // Копируем только путь картинки. Никаких классов и жестких размеров!
                smartImg.src = sourceImg.src;
            }
        }
    });
};

document.addEventListener("DOMContentLoaded", function() {
    
    let lastScrollTop = 0;
    let gearTimer;
    let ignoreScroll = false; 
    
    const gearBtn = document.getElementById('smart-gear-btn');
    const smartPanel = document.getElementById('smart-panel');
    const headerHeight = 90; 

    function keepGearAlive() {
        gearBtn.classList.add('visible');
        clearTimeout(gearTimer);
        gearTimer = setTimeout(() => {
            if (!smartPanel.classList.contains('active')) {
                gearBtn.classList.remove('visible');
            }
        }, 2000);
    }

    window.addEventListener('scroll', function() {
        if (ignoreScroll) return; 

        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st < 0) return; 

        if (st < headerHeight) {
            gearBtn.classList.remove('visible');
            smartPanel.classList.remove('active');
            return;
        }

        if (st < lastScrollTop) {
            keepGearAlive(); 
        } else if (st > lastScrollTop) {
            if (!smartPanel.classList.contains('active')) {
                gearBtn.classList.remove('visible');
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    gearBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!smartPanel.classList.contains('active')) window.syncSmartIcons();
        
        smartPanel.classList.toggle('active');
        
        if (smartPanel.classList.contains('active')) {
            clearTimeout(gearTimer);
        } else {
            keepGearAlive();
        }
    });

    const proxyButtons = document.querySelectorAll('.smart-btn');
    
    proxyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSelector = this.getAttribute('data-target');
            const originalElement = document.querySelector(targetSelector);
            
            if (originalElement) {
                ignoreScroll = true;
                setTimeout(() => { ignoreScroll = false; }, 1000);

                if (originalElement.getAttribute('data-bs-toggle') === 'modal') {
                    
                    const modalId = originalElement.getAttribute('data-bs-target') || originalElement.getAttribute('href');
                    const modalEl = document.querySelector(modalId);
                    
                    if (modalEl && typeof bootstrap !== 'undefined') {
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.show(this);
                        
                        const onHidden = () => {
                            if (gearBtn) {
                                gearBtn.focus({ preventScroll: true });
                            }
                            modalEl.removeEventListener('hidden.bs.modal', onHidden);
                        };
                        modalEl.addEventListener('hidden.bs.modal', onHidden);

                    } else {
                        originalElement.click(); 
                    }
                } else {
                    // ПРОГРАММНЫЙ КЛИК ПО ГЛАВНОЙ КНОПКЕ
                    originalElement.click();
                }
                
                smartPanel.classList.remove('active');
                keepGearAlive();
                setTimeout(window.syncSmartIcons, 50); 
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!smartPanel.contains(e.target) && !gearBtn.contains(e.target)) {
            smartPanel.classList.remove('active');
            gearBtn.classList.remove('visible');
        }
    });
});



document.addEventListener('click', function(event) {
    // Ищем, был ли клик по элементу с нужным классом (или внутри него)
    const button = event.target.closest('.btn-language');

    // Если кликнули не по кнопке языка — просто игнорируем и выходим
    if (!button) return;

    event.preventDefault(); // Отменяем стандартный переход href="#"

    // Получаем язык из атрибута data-lang
    const targetLang = button.getAttribute('data-lang');
    if (!targetLang) return;

    const url = new URL(window.location.href);
    let newPath = '';

    // Определяем нужный путь
    if (targetLang === 'en') {
        newPath = '/read/';
    } else if (targetLang === 'ru') {
        newPath = '/r/';
    } else if (targetLang === 'th') {
        newPath = '/th/read/';
    } else {
        return;
    }

    // Собираем и применяем новый URL
    window.location.href = url.origin + newPath + url.search + url.hash;
});
