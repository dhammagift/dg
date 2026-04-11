#!/bin/bash

# Очищаем или создаем файл и записываем начало массива
echo "var bjtLinksData = [" > linksbjt.js

# Парсим TSV со 2-й строки, берем только строки с заполненным sc_code
# Функция tolower($21) переводит ключ в нижний регистр
awk -F'\t' 'NR>1 && $21 != "" {
    printf "[\"%s\", \"%s\"],\n", tolower($21), $32
}' sutta_info.tsv >> linksbjt.js

# Закрываем JS-массив
echo "];" >> linksbjt.js
