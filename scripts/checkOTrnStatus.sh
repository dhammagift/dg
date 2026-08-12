source ./config/script_config.sh --source-only

basedir=$apachesitepath
basedir_path="$basedir/../offline-data/dhammagift"

make_sutta_link() {
    local output="$1"

    local last_sutta
    last_sutta=$(
        echo "$output" |
        tail -n1 |
        awk '{print $NF}' |
        awk -F'/' '{print $NF}' |
        cut -d'_' -f1
    )

    if [[ -n "$last_sutta" ]]; then
        echo
        echo "f.dhamma.gift/assets/lbl.html?q=$last_sutta"
    fi
}

ck() {
    local n="48"
    local sort_by_name=false

    # Разбор аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            -o) sort_by_name=true; shift ;;
            *) n=$1; shift ;;
        esac
    done

    cd "$basedir_path" || return 1

    local ru_dir="ru/sutta/sn/sn$n"
    local ai_dir="ai/sutta/sn/sn$n"
    local lbl_dir="../lbl"

    if [[ ! -d "$ai_dir" ]]; then
        echo "Папка $ai_dir не найдена."
        return 1
    fi

    local total_ai
    total_ai=$(find "$ai_dir" -maxdepth 1 -name '*.json' 2>/dev/null | wc -l)

    local ai_files
    ai_files=$(find "$ai_dir" -maxdepth 1 -name '*.json' -printf '%f\n' 2>/dev/null |
        sed 's/-ru-ai\.json$//' |
        sort)

    local ru_files
    ru_files=$(find "$ru_dir" -maxdepth 1 -name '*ru-o.json' -printf '%f\n' 2>/dev/null |
        sed 's/-ru-o\.json$//' |
        sort)

    local lbl_files
    lbl_files=$(find "$lbl_dir" -maxdepth 1 -name '*ru-o.json' -printf '%f\n' 2>/dev/null |
        sed 's/-ru-o\.json$//' |
        sort)

    local ready_files
    ready_files=$(echo -e "${ru_files}\n${lbl_files}" | sed '/^$/d' | sort -u)

    local diff_files
    diff_files=$(comm -13 <(echo "$ready_files") <(echo "$ai_files"))

    local remaining_count=0
    local done_count=0
    local last_sutta=""

    if [[ -n "$diff_files" ]]; then
        remaining_count=$(echo "$diff_files" | wc -l)

        local sorted_output
        sorted_output=$(
            while read -r f; do
                [[ -z "$f" ]] && continue

                local file_path="$ai_dir/$f-ru-ai.json"

                if [[ -f "$file_path" ]]; then
                    local lines
                    lines=$(wc -l < "$file_path")
                    printf "%6d  %s\n" "$lines" "$file_path"
                fi
            done <<< "$diff_files" |
            if [[ "$sort_by_name" == true ]]; then
                sort -k2,2V | tac
            else
                sort -k1,1n -k2,2V | tac
            fi
        )

        echo "$sorted_output"
    fi
    done_count=$((total_ai - remaining_count))

    echo
    echo "Всего: $total_ai | Готово: $done_count | Осталось: $remaining_count"

  make_sutta_link "$sorted_output"

    cd - >/dev/null
}



if [[ "$1" == "-a" ]]; then
    cd "$basedir_path/ru" || exit 1

    output=$(
        find . -type f |
        grep -v 'ru-o.json' |
        grep -E "sn(46|47|48|49|50|51|52|53|54|55)" |
        xargs wc -l |
        sort -n | 
        head -n10 |
        tac
    )

    echo "$output"
    make_sutta_link "$output"

    exit 0
fi



if [[ "$1" == "-g" ]]; then
    shift
    for i in 13 15 20 21 23 24 28 29 30 31 32 33 36 38 40 41 42 43 44 45 46 47 48 49 50 52 53 54; do
        echo -n "sn$i "
        ck "$i" | grep Всег
    done | sort -k9,9n
    exit 0
fi

ck "$@"

exit 0

for i in {1..56} ; do echo -n "sn$i " ;  ck $i | grep Всег ; done


for i in 13 15 20 21 23 24 28 29 30 31 32 33 36 38 40 41 42 43 44 45 46 47 48 49 50 52 53 54 ; do echo -n "sn$i " ;  ck $i | grep Всег ; done | sort -k9,9n



sn49 Всего: 5 | Готово: 0 | Осталось: 5
sn53 Всего: 5 | Готово: 0 | Осталось: 5
sn30 Всего: 6 | Готово: 0 | Осталось: 6
sn31 Всего: 6 | Готово: 0 | Осталось: 6
sn50 Всего: 10 | Готово: 3 | Осталось: 7
sn32 Всего: 9 | Готово: 0 | Осталось: 9
sn15 Всего: 20 | Готово: 10 | Осталось: 10
sn28 Всего: 10 | Готово: 0 | Осталось: 10
sn38 Всего: 16 | Готово: 6 | Осталось: 10
sn41 Всего: 10 | Готово: 0 | Осталось: 10                                                   
sn48 Всего: 80 | Готово: 70 | Осталось: 10
sn13 Всего: 11 | Готово: 0 | Осталось: 11
sn40 Всего: 11 | Готово: 0 | Осталось: 11                                                   
sn44 Всего: 11 | Готово: 0 | Осталось: 11
sn20 Всего: 12 | Готово: 0 | Осталось: 12
sn21 Всего: 12 | Готово: 0 | Осталось: 12
sn29 Всего: 12 | Готово: 0 | Осталось: 12                                                   
sn42 Всего: 13 | Готово: 0 | Осталось: 13
sn54 Всего: 20 | Готово: 6 | Осталось: 14
sn43 Всего: 15 | Готово: 0 | Осталось: 15
sn33 Всего: 16 | Готово: 0 | Осталось: 16
sn52 Всего: 24 | Готово: 8 | Осталось: 16
sn23 Всего: 26 | Готово: 8 | Осталось: 18
sn36 Всего: 31 | Готово: 10 | Осталось: 21
sn45 Всего: 114 | Готово: 83 | Осталось: 31
sn24 Всего: 35 | Готово: 0 | Осталось: 35
sn47 Всего: 55 | Готово: 7 | Осталось: 48
sn46 Всего: 87 | Готово: 32 | Осталось: 55
