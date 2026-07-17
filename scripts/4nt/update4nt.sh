#!/bin/bash
TARGET_DIR="${1:-.}"
find "$TARGET_DIR" -type f -name "*.html" -print0 | while IFS= read -r -d '' file; do
    
    # 1. Извлекаем slug для voice.js (например, "mn125" из пути /mn/mn125/index.html)
    SLUG=$(basename "$(dirname "$file")")
    if [ "$SLUG" == "." ]; then SLUG=$(basename "$file" .html); fi


    # 7. Подключаем продакшен voice.js и voice.css
    if ! grep -q "extra.js" "$file"; then
        sed -i 's|</body>|<script src="/4nt/extra/extra.js">\n</script>\n</body>|g' "$file"
    fi

done

exit 0

#!/bin/bash

echo -n adding buttons
TARGET_DIR="${1:-.}"

find "$TARGET_DIR" -type f -name "*.html" -print0 | while IFS= read -r -d '' file; do
    
    # 1. Извлекаем slug для voice.js (например, "mn125" из пути /mn/mn125/index.html)
    SLUG=$(basename "$(dirname "$file")")
    if [ "$SLUG" == "." ]; then SLUG=$(basename "$file" .html); fi


    # 2. Формируем кнопки, добавляем класс voice-link и data-slug для инициализации voice.js
    BUTTONS="<a href=\"javascript:void(0)\" class=\"voice-link icon-btn\" data-slug=\"$SLUG\" title=\"Слушать (TTS)\" style=\"font-size:14px; margin-right:4px;\">🔊</a> <a class=\"icon-btn\" id=\"viewModeBtn\" href=\"javascript:void(0)\" title=\"View: Columns / Scroll\" onclick=\"toggleViewMode()\">📜</a> <a href=\"/?q=$SLUG\" id=\"fdg-button\" class=\"icon-btn\" title=\"Искать в Суттах (Ctrl+1)\" rel=\"noreferrer\"><img src=\"/assets/img/gray-white.png\" alt=\"Поиск\" style=\"width:18px; display:block;\"></a><a title=\"Всплывающий по клику словарь (Alt+A)\" class=\"icon-btn toggle-dict-btn\"><img src=\"/assets/svg/comment.svg\" alt=\"Словарь\" style=\"width:18px; height:18px; display:block;\"></a><a id=\"orig-site-btn\" href=\"#\" title=\"Оригинальный сайт s.4nt.org\" class=\"icon-btn\" onclick=\"this.href='https://s.4nt.org'+location.pathname.replace('/4nt', '')+location.search+location.hash\" target=\"_blank\" style=\"font-size:12px; display:flex; align-items:center; justify-content:center;\">🌐</a>"

    # 3. Патчим основной текст: добавляем .pli-lang для Пали и .eng-lang для всех переводов, чтобы voice.js их прочитал
    sed -i "s/const ct=mk('span','ct grw');/const ct=mk('span','ct grw' + (key==='pali' || key==='san' || key==='lzh' || key==='zh' || key==='pali_royal_iast' ? ' pli-lang' : ' eng-lang')); if(key==='pali' || key==='san' || key==='lzh' || key==='zh' || key==='pali_royal_iast') ct.setAttribute('lang', 'pi');/g" "$file"


    # 4. Патчим оглавление
    sed -i "s/const snippet=mk('span','tr-pali');/const snippet=mk('span','tr-pali pli-lang'); snippet.setAttribute('lang', 'pi');/g" "$file"

    # 5. Вставляем или обновляем блок с кнопками
    if ! grep -q "voice-link" "$file"; then
        if grep -q "orig-site-btn" "$file"; then
            sed -i "s|<button id=\"tts-btn\".*orig-site-btn.*🌐</a>|$BUTTONS|g" "$file"
            sed -i "s|<a href=\"/ru\" id=\"fdg-button\".*orig-site-btn.*🌐</a>|$BUTTONS|g" "$file"
        else
            sed -i "s|<div class=\"settings-wrap\" id=\"settingsWrap\">|$BUTTONS<div class=\"settings-wrap\" id=\"settingsWrap\">|g" "$file"
            sed -i "s|<div class=\"settings-wrap\" id=\"siteSettingsWrap\">|$BUTTONS<div class=\"settings-wrap\" id=\"siteSettingsWrap\">|g" "$file"
        fi
    fi

    # 6. Внедряем стили и скрипты словаря
    if ! grep -q "paliLookup.css" "$file"; then
        sed -i 's|</body>|<link rel="stylesheet" href="/assets/css/paliLookup.css">\n<script src="/assets/js/settings.js"></script>\n</body>|g' "$file"
    fi

    # 7. Подключаем продакшен voice.js и voice.css
    if ! grep -q "voice.js" "$file"; then
        sed -i 's|</body>|<script src="/4nt/extra/extra.js">\n</script>\n<script src="/read/js/voice.js"></script>\n</body>|g' "$file"
    fi

    # 8. Внедряем стили и скрипты словаря
    if ! grep -q "voice.css" "$file"; then
        sed -i 's|</head>|<link rel="stylesheet" href="/assets/css/extrastyles.css">\n<link rel="stylesheet" href="/read/css/voice.css">\n<link rel="stylesheet" href="/4nt/extra/extra.css">\n</head>|g' "$file"
    fi

    if grep -q -- '--logo-w:56px;' "$file"; then
        sed -i 's|--logo-w:56px;|--logo-w:16px;|' "$file"
    fi
    
    if grep -qE -- 'home-logo.*width:56px' "$file"; then
        sed -i '/home-logo/s|width:56px|width:16px|' "$file"
    fi
    
    # 9. Fix the password autosugg from android 
    if grep -q 'id="jumpInput"' "$file"; then
        sed -i 's|id="jumpInput"| type="search" id="jumpInput"|g' "$file"
    fi

done
echo -n " done"

echo
echo -n editing styles

grep -ril debabel-logo-1k.jpg * | grep html | xargs sed -i 's/debabel-logo-1k.jpg/headerlogo.png/g'  
grep -ril "#1a1612" *.html | grep html | xargs sed -i 's/#1a1612/#000/g'
cp headerlogo.png favicon.png

echo " done"

exit 0

# git clone git@github.com:dhammagift/4nt.git . 
# git clone https://github.com/dhammagift/4nt.git .

git remote add upstream https://github.com/frankksutta/s.4nt.git

git fetch upstream
git branch -a


git checkout main
git merge upstream/main
git push origin main




#delete latest commit
cd /var/www/offline-data/4nt
git reset --hard HEAD~1
git push origin HEAD --force







#!/bin/bash

echo -n adding buttons
# Директория с HTML файлами (по умолчанию текущая)
TARGET_DIR="${1:-.}"

# HTML код кнопок. Использована строковая замена .replace('/4nt', '')
BUTTONS="<a href=\"/ru\" id=\"fdg-button\" class=\"icon-btn\" title=\"Искать в Суттах (Ctrl+1)\" rel=\"noreferrer\"><img src=\"/assets/img/gray-white.png\" alt=\"Поиск\" style=\"width:18px; display:block;\"></a><a title=\"Всплывающий по клику словарь (Alt+A)\" class=\"icon-btn toggle-dict-btn\"><img src=\"/assets/svg/comment.svg\" alt=\"Словарь\" style=\"width:18px; height:18px; display:block;\"></a><a id=\"orig-site-btn\" href=\"#\" title=\"Оригинальный сайт s.4nt.org\" class=\"icon-btn\" onclick=\"this.href='https://s.4nt.org'+location.pathname.replace('/4nt', '')+location.search+location.hash\" target=\"_blank\" style=\"font-size:12px; display:flex; align-items:center; justify-content:center;\">🌐</a>"

find "$TARGET_DIR" -type f -name "*.html" -print0 | while IFS= read -r -d '' file; do
    
    # 1. Патчим основной текст для работы словаря (добавлен санскрит и китайский)
    sed -i "s/const ct=mk('span','ct grw');/const ct=mk('span','ct grw' + (key==='pali' || key==='san' || key==='lzh' || key==='zh' ? ' pli-lang' : '')); if(key==='pali' || key==='san' || key==='lzh' || key==='zh') ct.setAttribute('lang', 'pi');/g" "$file"

    # 2. Патчим оглавление для работы словаря
    sed -i "s/const snippet=mk('span','tr-pali');/const snippet=mk('span','tr-pali pli-lang'); snippet.setAttribute('lang', 'pi');/g" "$file"

    # 3. Добавляем блок кнопок перед блоком настроек (защита от дублирования по id кнопки сайта)
    if ! grep -q "orig-site-btn" "$file"; then
        sed -i "s|<div class=\"settings-wrap\" id=\"settingsWrap\">|$BUTTONS<div class=\"settings-wrap\" id=\"settingsWrap\">|g" "$file"
    fi

    # 4. Внедряем стили и скрипты словаря перед </body>
    if ! grep -q "paliLookup.css" "$file"; then
        sed -i 's|</body>|<link rel="stylesheet" href="/assets/css/paliLookup.css">\n<script src="/assets/js/settings.js"></script>\n</body>|g' "$file"
    fi

done
echo -n " done"

echo
 echo -n editing styles

grep  -ril debabel-logo-1k.jpg  * | grep html | xargs sed -i 's/debabel-logo-1k.jpg/headerlogo.png/g'  
grep -ril "#1a1612" *.html | grep html | xargs sed -i 's/#1a1612/#000/g'

echo " done"

exit 0

# git clone git@github.com:dhammagift/4nt.git . 
# git clone https://github.com/dhammagift/4nt.git .

git remote add upstream https://github.com/frankksutta/s.4nt.git

git fetch upstream
git branch -a


git checkout main
git merge upstream/main
git push origin main




#delete latest commit
cd /var/www/offline-data/4nt
git reset --hard HEAD~1
git push origin HEAD --force



git checkout add -- extra/extra.css extra/extra.js


#create new local
git checkout -b mod 


#remote repo
git push origin --delete mod
git push --set-upstream origin mod
