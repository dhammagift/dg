#!/usr/bin/env bash

echo "script file.txt /text to replace/replace with this/"

list="$1"
rule="$2"

# Извлекаем искомую строку из правила (текст между первым и вторым слэшем)
search_text=$(echo "$rule" | cut -d'/' -f2)

awk '{print $2}' "$list" | while read -r raw_id; do
    id=$(printf '%s\n' "$raw_id" |
        tr -d '"\r' |
        sed 's/[:,]*$//')

    [ -z "$id" ] && continue

    grep -rl "\"$id\"" assets/texts/ru/ | while read -r file; do
        if grep "\"$id\"" "$file" | grep -Fq "$search_text"; then
            sed -i "/\"$id\"/ s${rule}" "$file"
            echo "[DONE] $id in $file"
        else
            echo "[SKIP] $id in $file"
        fi
    done
done


exit 0

cat $dwnl/id.txt | awk '{print $2}' | grep -rilf - .


#!/usr/bin/env bash
echo "script file.txt \"/text to replace/replace with this/\""


list="$1"
rule="$2"

while read -r id; do
  file=$(grep -rl "$id" assets/texts/ru/)

  echo "$id -> $file"

  [ -z "$file" ] && continue

  sed -i "/\"$id\"/ s${rule}" "$file"

done < <(awk '{print $2}' "$list")
#done < "$list"


#while read -r id; do   file=$(grep -rl $id .);    echo "$id";    [ -n "$file" ] && sed -i "/$id/ s/ там / здесь /" "$file"; done < "$dwnl/id.txt"



exit 0


#сравнить два файла 

awk '
{
    match($0, /"[a-z0-9\.-]+:[0-9\.]+":/)
    if (RSTART > 0) {
        key = substr($0, RSTART, RLENGTH)
        if (NR == FNR) {
            pali[key] = $0
        } else {
            if (key in pali) {
                print pali[key]
                print $0
                print "---"
            }
        }
    }
}' "$dwnl/mograpur" "$dwnl/mograpurRu"
