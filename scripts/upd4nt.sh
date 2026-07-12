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


git remote add upstream https://github.com/frankksutta/s.4nt.git

git fetch upstream
git branch -a


git checkout main
git merge upstream/main
git push origin main


