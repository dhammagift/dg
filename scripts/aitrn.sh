#!/bin/bash

mkdir -p todo

while IFS= read -r i; do
    # Очищаем строку от возможных невидимых символов переноса каретки
    clean_i=$(echo "$i" | tr -d '\r')
    
    # Пропускаем пустые строки
    if [ -z "$clean_i" ]; then
        continue
    fi

    # Переводим строку в верхний регистр (sn1.20 -> SN1.20)
    upper_i="${clean_i^^}"
    
    # Заменяем точки на подчеркивания (SN1.20 -> SN1_20)
    file_mask="${upper_i//./_}"
    
    # Ищем HTML-файлы по новой маске в нужной директории
    find ../offline-data/dhammatalks.org/suttas/ \
        -type f -name "${file_mask}*.html" \
        -exec cp {} todo/ \;
        
done < ../offline-data/todo.txt



exit 

#list
while IFS= read -r i; do     find suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/         -type f -name "*${i}_*"         -exec cp {} todo/ \;; done < ~/offline-data/todo.txt


#copy
mkdir -p todo

while IFS= read -r i; do
    find suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/ suttacentral.net/sc-data/sc_bilara_data/translation/en/ \
        -type f -name "*${i}_*" \
        -exec cp -t todo {} +
done < ~/offline-data/todo.txt


$notReadyCmd = "cd ../offline-data/en_other; find ../lbl sutta/sn sutta/mn sutta/dn sutta/an -type f | awk -F/ '{print \$NF}' | sed 's/_.*//' | sort -u | grep -Fhxvf - an.txt sn.txt mn.txt dn.txt | awk '/^sn/{print \"1 \" \$0;next}/^mn/{print \"2 \" \$0;next}/^dn/{print \"3 \" \$0;next}/^an/{print \"4 \" \$0;next}' | sort -k1,1n -k2,2V | cut -d' ' -f2-";

