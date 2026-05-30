#!/usr/bin/env bash

echo "script file.txt /text to replace/replace with this/"

list="$1"
rule="$2"

# Извлекаем искомую строку из правила (текст между первым и вторым слэшем)
search_text=$(echo "$rule" | cut -d'/' -f2)

while read -r raw_id; do
  # 1. Очищаем ID: удаляем кавычки, \r, висящие в конце двоеточия/запятые и лишние пробелы
  # Внутреннее двоеточие в ID (например, sn45.30:1.9) при этом сохраняется
  id=$(echo "$raw_id" | tr -d '"\r' | sed 's/[:,]*$//; s/^[[:space:]]*//; s/[[:space:]]*$//')
  [ -z "$id" ] && continue

  # 2. Ищем файлы, содержащие этот ID
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    
    # 3. Получаем конкретную строку с ID из файла
    target_line=$(grep "\"$id\"" "$file")
    
    # 4. Проверяем, содержится ли искомый текст в этой строке
    if echo "$target_line" | grep -Fq "$search_text"; then
        # Текст совпал, производим замену
        sed -i "/\"$id\"/ s${rule}" "$file"
        echo "[DONE] $id in $file"
    else
        # Текст не совпал (разные пробелы, тире, опечатки или текст уже заменен)
        echo "[SKIP] not found $id in $file"
    fi
    
  done < <(grep -rl "\"$id\"" assets/texts/ru/ || true)

done < "$list"



exit 0


#!/usr/bin/env bash
echo "script file.txt \"/text to replace/replace with this/\""


list="$1"
rule="$2"

while read -r id; do
  file=$(grep -rl "$id" assets/texts/ru/)

  echo "$id -> $file"

  [ -z "$file" ] && continue

  sed -i "/\"$id\"/ s${rule}" "$file"

done < "$list"


#while read -r id; do   file=$(grep -rl $id .);    echo "$id";    [ -n "$file" ] && sed -i "/$id/ s/ там / здесь /" "$file"; done < "$dwnl/id.txt"
