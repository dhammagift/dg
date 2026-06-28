#!/bin/bash

# 1. Подготовка и переход в папку
## Если запускаете скрипт не из корня, где лежит папка theravada.ru, раскомментируйте cd:
# cd theravada.ru || exit
wget -r --no-check-certificate -P ./ --no-parent https://theravada.ru/Teaching/canon.htm
 
cd theravada.ru
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

cd Teaching/ 
rm -rf  Lectures/ Works/ Books/

echo "--- Этап 2: Внедрение ссылок, CSS и JS ---"
cd Canon/ 


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
  


#to refresh theravada.ru run
mkdir theravada.ru && cd theravada.ru
wget -r --no-check-certificate -P ./ --no-parent https://theravada.ru/Teaching/canon.htm
cd theravada.ru/Teaching/Canon/Suttanta   
for i in `find . -name  "*htm*" -type f | sort -V`; do  
    echo $i; 
    iconv -f windows-1251 $i > ../tmp
    mv -f ../tmp $i
    sed -i 's@windows-1251@utf-8@g' $i
    done

apa
diff -qr theravada.ruold theravada.ru | grep -i suttanta

for i in `find . -type f | sort -V | grep -lri "&#1645;</span>" theravada.ru/Teaching/Canon/Suttanta/Texts/`
do 
#echo $i
textindex=`echo $i | awk -F'/' '{print $NF}' | awk -F'-' '{print $1}'  | sed 's/.htm.*//g' | sed 's@_@.@g' | sed 's@dhm@dhp@g' | sed 's@\.volovsky@@g' | sed 's@\.sv@@g'`

echo $textindex
sed -i \
    '/&#1645;<\/span>/s|<\/span>|<\/span> <a href="/ru/?q='"$textindex"'">DG<\/a> <a href="https://suttacentral.net/'"$textindex"'">SC<\/a> <a href="https://'"$i"'">Th.ru<\/a>|' \
    "$i"
done 


#fix links 

cd /data/data/com.termux/files/usr/share/apache2/default-site/htdocs/theravada.ru/Teaching/Canon/Suttanta/Texts 

sed -i 's@href="../AN/anguttara-@href="/theravada.ru/Teaching/Canon/Suttanta/AN/anguttara-@g; s@href="../SN/samyutta-@href="/theravada.ru/Teaching/Canon/Suttanta/SN/samyutta-@g' *

#fix favico and img
cd /data/data/com.termux/files/usr/share/apache2/default-site/htdocs/theravada.ru/

find . -type f -name "*.htm"| xargs sed -E -i 's@(\.\./)*Index/Navigate/nav12b.gif@/assets/img/th.ru/nav12b.gif@g; s@href="/favicon.ico"@href="/assets/img/th.ru/favicon.ico"@g; s@(\.\./)*Index/Navigate/nav12a.gif@/assets/img/th.ru/nav12b.gif@g; s@(\.\./)*Index/Navigate/nav1a.gif@/assets/img/th.ru/nav1b.gif@g;  s@(\.\./)*Index/head_left_[0-9]*.gif@/assets/img/headerlogo.png@g; s@(\.\./)*Index/Razdel_img/head_right[0-9]*.jpg@/assets/img/headerlogo.png@g; s@(\.\./)*Index/menu_background_fade.jpg@/assets/img/headerlogo.png@g'

#доделать $textindex
for i in `grep -lri ';">.</' theravada.ru/Teaching/Canon/`
do 
echo $i
textindex=`echo $i | awk -F'/' '{print $NF}'  | sed 's/.html//g'`
sed -i '/>.<\/font>/s/.<\/font>/.<\/font> <a href="\/ru\/sc\/?q='$textindex'">fdg<\/a> <a href="https:\/\/suttacentral.net\/'$textindex'">sc<\/a>/' $i
done 