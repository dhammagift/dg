comm -13 \
<(find /data/data/com.termux/files/usr/share/apache2/default-site/htdocs/assets/texts/ru_other/ \
    -name '*.json' | awk -F/ '{print $NF}' | sort -u) \
<(find /data/data/com.termux/files/usr/share/apache2/default-site/htdocs/suttacentral.net/sc-data/sc_bilara_data/translation/ru \
    \( -path '*/blurb/*' -o -path '*/site/*' -o -path '*/o/*' \) -prune -o \
    -type f -name '*.json' -print |
    awk -F/ '{print $NF}' | sort -u)
