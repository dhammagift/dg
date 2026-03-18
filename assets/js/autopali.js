function uniCoder(textInput) {
    if (!textInput || textInput === "") return textInput;
    return textInput
        .replace(/aa/g, "ā")
        .replace(/ii/g, "ī")
        .replace(/uu/g, "ū")
        .replace(/\"n/g, "ṅ")
        .replace(/\~n/g, "ñ")
        .replace(/\.t/g, "ṭ")
        .replace(/\.d/g, "ḍ")
        .replace(/\.n/g, "ṇ")
        .replace(/\.m/g, "ṃ")
        .replace(/\.l/g, "ḷ")
        .replace(/\.h/g, "ḥ");
}

// Кэшируем словарь, чтобы не качать его дважды при открытии окна
let suttaWordsCache = null;

// Выносим словарь раскладки наружу для лучшей производительности
const ruToEn = {
    'а': 'f', 'в': 'd', 'е': 't', 'к': 'r', 'м': 'v',
    'н': 'y', 'о': 'j', 'п': 'g', 'р': 'h', 'с': 'c',
    'т': 'n', 'у': 'e', 'х': '[', 'ъ': ']', 'ы': 's',
    'ь': 'm', 'э': "'", 'ё': '`', 'я': 'z', 'ж': ';',
    'з': 'p', 'и': 'b', 'й': 'q', 'л': 'k', 'д': 'l',
    'г': 'u', 'ф': 'a', 'ц': 'w', 'ч': 'x', 'ш': 'i',
    'щ': 'o', 'б': ',', 'ю': '.', ' ': ' '
};

// Делаем функцию доступной для вызова из модального окна
window.initPaliAutocomplete = function(selector) {
    let inputEl = document.querySelector(selector);
    if (!inputEl) return;

    // Защита от двойного навешивания событий
    if (inputEl.dataset.autopaliBound === "true") return;
    inputEl.dataset.autopaliBound = "true";

    // ФИКС Z-INDEX: Жестко задаем стиль, чтобы подсказки были ПОВЕРХ модального окна
    if (!document.getElementById('autopali-zindex-fix')) {
        let style = document.createElement('style');
        style.id = 'autopali-zindex-fix';
        style.textContent = '.ui-autocomplete { z-index: 10005 !important; }';
        document.head.appendChild(style);
    }

    // Подключаем конвертер Юникода
    inputEl.addEventListener("input", function () {
        let textInput = inputEl.value;
        let convertedText = uniCoder(textInput);
        if (inputEl.value !== convertedText) {
            inputEl.value = convertedText;
        }
    });

    // Показ истории при пустом клике
    inputEl.addEventListener("click", function() {
        if (inputEl.value === "" && $(inputEl).hasClass('ui-autocomplete-input')) {
            $(inputEl).autocomplete("search", "");
        }
    });

    // Загружаем базу слов (с кэшированием)
    if (suttaWordsCache) {
        bindAutocomplete(selector, suttaWordsCache);
    } else {
        $.ajax({
            url: "/assets/texts/sutta_words.txt",
            dataType: "text",
            success: function(data) {
                suttaWordsCache = data.split('\n');
                bindAutocomplete(selector, suttaWordsCache);
            },
            error: function() {
                console.error("Не удалось загрузить словарь sutta_words.txt");
            }
        });
    }
};

function bindAutocomplete(selector, allWords) {
    // Очищенный accentMap (двойные ключи убраны, m с точками приводятся к m)
    var accentMap = {
        "ā": "a", "ī": "i", "ū": "u", 
        "ḍ": "d", "ḷ": "l", 
        "ṃ": "m", "ṁ": "m", 
        "ṅ": "n", "ṇ": "n", "ṭ": "t", "ñ": "n"
    };

    var normalize = function(term) {
        var ret = "";
        term = term.toLowerCase(); 
        for (var i = 0; i < term.length; i++) {
            ret += accentMap[term.charAt(i)] || term.charAt(i);
        }
        return ret;
    };

    $(selector).autocomplete({
        position: {
            my: "left bottom",
            at: "left top",
            collision: "flip"
        },
        minLength: 0,
        multiple: /[\s\*]/,
        source: function(request, response) {
            
            function normalizeTerm(term) {
                return term.trim()
                    .replace(/[а-яё]/g, char => ruToEn[char] || char)
                    .replace(/,/g, ".")
                    .replace(/\b(bu|bi)\s+(pj|ss|ay|np|pc|pd|sk|as|pm)\b/gi, "$1-$2")
                    .replace(/([a-zA-Z]+)\s+(\d+)\s+(\d+)/g, "$1$2.$3")
                    .replace(/([a-zA-Z]+)(\d+)\s+(\d+)/g, "$1$2.$3")
                    .replace(/([a-zA-Z]+)\s+(\d+)\.(\d+)/g, "$1$2.$3")
                    .replace(/([a-zA-Z]+)\s+(\d+)/g, "$1$2");
            }

            var normalizedTerm = normalizeTerm(request.term);
            var terms = normalizedTerm.split(/[\|\s\*]/);
            var lastTerm = terms.pop().trim();
            var minLengthForSearch = 3;

            var history = JSON.parse(localStorage.getItem("localSearchHistory")) || [];
            
            // БЕЗОПАСНОЕ извлечение (защита от ошибок, если в истории лежат старые форматы)
            var historyKeys = history.map(item => Array.isArray(item) ? item[0] : item);

            if (!lastTerm) {
                response(historyKeys);
                return;
            }

            var filteredHistory = historyKeys.filter(key => 
                key && key.toLowerCase().startsWith(lastTerm.toLowerCase())
            );

            if (lastTerm.length < minLengthForSearch) {
                response(filteredHistory);
                return;
            }

            var normLastTerm = normalize(lastTerm);
            var re = $.ui.autocomplete.escapeRegex(normLastTerm);
            
            // 1. Делаем каждую букву опционально двойной (k -> k{1,2})
            var modifiedRe = re.replace(/([a-zA-Z])/g, "$1{1,2}");
            
            // 2. Делаем 'm' и 'n' полностью взаимозаменяемыми для поиска (m -> [mn], n -> [mn])
            modifiedRe = modifiedRe.replace(/m|n/g, "[mn]");

            var matchbeginonly = new RegExp("^" + modifiedRe, "i");
            var matchall = new RegExp(modifiedRe, "i");

            var listBeginOnly = $.grep(allWords, function(value) {
                value = value.label || value.value || value;
                return matchbeginonly.test(normalize(value));
            });

            var listAll = $.grep(allWords, function(value) {
                value = value.label || value.value || value;
                return matchall.test(normalize(value));
            });

            listAll = listAll.filter(function(el) {
                return !listBeginOnly.includes(el);
            });

            var maxRecord = 1000;
            var resultList = listBeginOnly.concat(listAll).slice(0, maxRecord);

            response(resultList);
        },
        focus: function() { return false; },
        select: function(event, ui) {
            var terms = this.value.split(/([\|\s\*])/);
            terms.pop();
            
            var selectedValue = ui.item.value;
            if (/\s+\d+$/.test(selectedValue)) selectedValue = selectedValue.split(/\s+/)[0];
            if (/\d+\s+/.test(selectedValue)) selectedValue = selectedValue.split(/\s+/)[0];
            if (/b[ui]pm|b[ui]-pm|pm/.test(selectedValue)) selectedValue = selectedValue.split(/\s+/)[0];
            
            if (/\d/.test(selectedValue)) {
                this.value = selectedValue.split(/\s+/)[0]; 
                
                // Умный поиск кнопки Submit, чтобы правильно обрабатывать и главную строку, и модалку
                const form = this.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('[type="submit"]');
                    if (submitBtn) submitBtn.click();
                    else form.submit();
                }
                return false;
            } else {
                terms.push(selectedValue);
            }

            for (var i = 1; i < terms.length; i += 2) {
                if (terms[i] === "*") terms[i] = "*";
                else if (terms[i] === "|") terms[i] = "|";
                else terms[i] = " ";
            }

            this.value = terms.join("");
            return false;
        }
    }).autocomplete("widget").addClass("fixed-height");
}

// Запускаем инициализацию для главной строки поиска корректно и вовремя
function setupMainInput() {
    if (document.getElementById("paliauto")) {
        initPaliAutocomplete("#paliauto");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMainInput);
} else {
    setupMainInput();
}
