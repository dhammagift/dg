#!/bin/bash

# Файл, от которого сравниваем время изменения
REFERENCE_FILE="assets/texts/lastupdate_readPHP_en_file"

# Проверяем, существует ли он
if [ ! -f "$REFERENCE_FILE" ]; then
  newer=""
else
  newer="-newer $REFERENCE_FILE"
fi

error_found=0

# --- Блок обработки текстов Thanissaro ---
result_thanissaro=$(find assets/texts/en_other/sutta/ -name "*translation-en-thanissaro.json" $newer | \
  awk -F'/' '{print $NF}' | \
  awk -F'_' '{print $1}' | \
  sort -V)

for i in $result_thanissaro; do  
  echo $i
  
  # Добавление переменной $ifEnThanTrn в read.php
  sed -i '/class="level5"/ { /q='"$i"'"/ { /<\?php echo \$ifEnThanTrn;\?>/! s/<\/span>/ <?php echo \$ifEnThanTrn;?><\/span>/; } }' read.php

  if [[ $? != 0 ]]; then
    echo "</br>error in $i (Thanissaro)"
    error_found=1
  fi
done

# --- Вывод результатов ---
if [ -n "$result_thanissaro" ]; then
  echo -n "new Thanissaro texts added to read.php: "
  echo "$result_thanissaro"
else
  echo "No new Thanissaro texts found."
fi

# Если не было ошибок, создаем/обновляем state_file
if [[ $error_found -eq 0 ]]; then
  #touch $REFERENCE_FILE
  echo
fi
