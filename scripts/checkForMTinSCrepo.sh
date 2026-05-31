

if uname -a | grep -qi "android"; then
    base="/data/data/com.termux/files/usr/share/apache2/default-site/htdocs"
else
    base="/var/www/html"
fi

dest=$base/assets/texts/ru_other/
src=$base/suttacentral.net/sc-data/sc_bilara_data/translation/ru

echo updating SC repo
git -C $src "pull" 


DIFF=$(comm -13 \
<(find $dest \
    -name '*.json' | awk -F/ '{print $NF}' | sort -u) \
<(find $src \
    \( -path '*/blurb/*' -o -path '*/site/*' -o -path '*/o/*' \) -prune -o \
    -type f -name '*.json' -print |
    awk -F/ '{print $NF}' | sort -u))



echo $DIFF | xargs -n1 
echo
echo "Any key to copy. Ctrl+C to cancel"
read x
echo -n "cp " 
for i in $DIFF
do 
    find "$src" -name "$i" | while read -r file; do
        rel_path="sutta/${file#*sutta/}"
        target="$dest/$rel_path"
        mkdir -p "$(dirname "$target")"
        echo -n "$i "
        cp "$file" "$target"
    done
done
    echo
    echo "done"
