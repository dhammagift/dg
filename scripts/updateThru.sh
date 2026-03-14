#!/bin/bash

# 1. Подготовка и переход в папку
## Если запускаете скрипт не из корня, где лежит папка theravada.ru, раскомментируйте cd:
# cd theravada.ru || exit

# Если нужно скачать заново, раскомментируй:
# wget -r --no-check-certificate -P ./ --no-parent https://theravada.ru/Teaching/canon.htm

#

# Переходим к текстам (Важно: скрипт предполагает, что мы внутри структуры папок)
# cd theravada.ru/Teaching/Canon/ 

echo "--- Этап 2: Внедрение ссылок, CSS и JS ---"

# Ищем файлы с текстами сутт
grep -lri "&#1645;</span>" . | sort -V | while read -r i; do
    
    # Вычисляем slug
    textindex=$(echo "$i" | awk -F'/' '{print $NF}' | awk -F'-' '{print $1}' | sed 's/.htm.*//g' | sed 's@_@.@g' | sed 's@dhm@dhp@g' | sed 's@\.volovsky@@g' | sed 's@\.sv@@g')

    # Формируем правильную ссылку на оригинал
    clean_path="${i#./}"
    real_url="https://theravada.ru/Teaching/Canon/$clean_path"

    echo "Processing: ($textindex) $i"

    # --- КОМАНДА 1: Ссылки (DG, SC, Th.ru) и Кнопка Voice ---
sed -i \
  '/&#1645;<\/span>/s|&#1645;<\/span>|</span> <span class="ext-links">\
<a href="/ru/?q='"$textindex"'">🔎 DG</a> \
<a href="javascript:void(0)" class="voice-link" data-slug="'"$textindex"'" title="Слушать">🔊 Voice</a> \
<a href="https://suttacentral.net/'"$textindex"'">SC</a> \
<a href="'"$real_url"'">Th.ru</a></span>|' \
  "$i"
  
    # --- КОМАНДА 2: Подключение JS перед </body> ---
    if ! grep -q "voice.js" "$i"; then
        sed -i 's|</body>|<script src="/read/js/voice.js"></script></body>|' "$i"
    fi

    # --- КОМАНДА 3: Подключение CSS перед </head> ---
    if ! grep -q "voice.css" "$i"; then
        sed -i 's|</head>|<link rel="stylesheet" href="/read/css/voice.css"></head>|' "$i"
    fi
    
    sed -i 's|size="7">Тхеравада.ру|size="3"><a href="/ru/read.php">@Dhamma.gift</a>|g' "$i"
    sed -i 's|<b>Буддизм<br>|<b>Копия<br>|g' "$i"
    sed -i 's|Учение Старцев </b>|Тхеравада.ру </b>|g' "$i"
    sed -i 's|Учение Старцев</b>|Тхеравада.ру</b>|g' "$i"
    sed -i 's|href="/index.htm"|href="/ru/"|g' "$i"
    sed -i 's|</head>|<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>|i' "$i"

    # --- КОМАНДА 4: Правка ширины таблицы (1000 -> 100%) ---
    sed -i 's/table width="1000"/table width="100%" style="max-width: 1000px;"/g' "$i"
    sed -i 's/table width="1009"/table width="100%" style="max-width: 1000px;"/g' "$i"
    sed -i 's/height="2" width="36%"/height="2" width="86%"/g' "$i"
    sed -i 's/height="2" width="44%"/height="2" width="4%"/g' "$i"
    

    # --- КОМАНДА 5: Правка логики шрифтов в старом скрипте ---
   sed -i 's/setAttribute("size", "5")/setAttribute("size", "4")/g' "$i"
    sed -i 's/setAttribute("size", "8")/setAttribute("size", "5")/g' "$i"
    sed -i 's/setAttribute("size", "6")/setAttribute("size", "4")/g' "$i"

done

find . -type f -exec sed -i 's|</head>|<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>|i' {} +

find . -type f -exec sed -i 's|../AN|../../AN|g' {} +
find . -type f -exec sed -i 's|../SN|../../SN|g' {} +
find . -type f -name "*htm" -exec sed -i 's|</body>|<script src="/assets/js/legacy-theme.js"></script></body>|' {} +




echo "--- Готово! Ссылки исправлены, скрипты подключены. ---"


exit 0


добавмть в uiexta css

.ext-links {
  font-size: 0.85em;      /* общий размер */
  white-space: nowrap;   /* чтобы не ломалось в переносах */
}

.ext-links a {
  margin-left: 0.3em;
}

.ext-links {
font-size:1.5em;
}


#wget

wget -r -np -nH --no-check-certificate \
  --domains=theravada.ru \
  --accept-regex '/Teaching/Canon/' \
  -P ./ \
  https://theravada.ru/Teaching/canon.htm
  
  
  
  echo "--- Этап 1: Конвертация кодировки (Windows-1251 -> UTF-8) ---"

find . -name "*.htm" -type f | sort -V | while read -r i; do
    echo $i
    iconv -f windows-1251 -t utf-8 "$i" > "${i}.tmp" 2>/dev/null
    if [ $? -eq 0 ]; then
        mv -f "${i}.tmp" "$i"
        sed -i 's@windows-1251@utf-8@g' "$i"
    else
        rm -f "${i}.tmp"
    fi
done