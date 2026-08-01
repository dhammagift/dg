source ./config/script_config.sh --source-only

basedir=$apachesitepath

ck() {
    local n="45"
    local sort_by_name=false

    # Разбор аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            -o) sort_by_name=true; shift ;;
            *) n=$1; shift ;;
        esac
    done

    local basedir_path="$basedir/../offline-data/dhammagift"
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

        last_sutta=$(
            echo "$sorted_output" |
            tail -n1 |
            awk '{print $NF}' |
            awk -F'/' '{print $NF}' |
            cut -d'_' -f1
        )
    fi

    done_count=$((total_ai - remaining_count))

    echo
    echo "Всего: $total_ai | Готово: $done_count | Осталось: $remaining_count"

    if [[ -n "$last_sutta" ]]; then
        echo
        echo "f.dhamma.gift/assets/lbl.html?q=$last_sutta"
    fi

    cd - >/dev/null
}

ck "$@"

exit 0

for i in {1..56} ; do echo $i ;  ck $i | grep Всег ; done