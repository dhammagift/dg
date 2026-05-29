while read -r id; do   file=$(grep -rl $id .);    echo "$id";    [ -n "$file" ] && sed -i "/$id/ s/ там / здесь /" "$file"; done < "$dwnl/tatra.txt"


#!/usr/bin/env bash

list="$1"
rule="$2"

while read -r id; do
  file=$(grep -rl "$id" .)

  echo "$id -> $file"

  [ -z "$file" ] && continue

  sed -i "/\"$id\"/ s${rule}" "$file"

done < "$list"
