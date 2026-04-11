#!/bin/bash

# Очищаем или создаем файл и записываем начало массива
echo "var dprLinksData = [" > linksdpr.js

# Парсим TSV со 2-й строки, берем только строки с заполненным sc_code
awk -F'\t' 'NR>1 && $21 != "" {
    # Разбиваем ссылку dpr_link по строке "loc="
    split($20, arr, "loc=")
    # arr[2] содержит итоговый идентификатор
    printf "[\"%s\", \"%s\"],\n", tolower($21), arr[2]
}' sutta_info.tsv >> linksdpr.js

# Закрываем JS-массив
echo "];" >> linksdpr.js
