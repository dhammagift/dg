import os
import re
from pathlib import Path

def update_read_php():
    sutta_map = {}

    # 1. Суджато (базовый приоритет)
    for p in Path('suttacentral.net/sc-data/sc_bilara_data/translation/en/sujato').rglob('*en-sujato.json'):
        sutta_id = p.name.split('_')[0]
        sutta_map[sutta_id] = '$ifEnSujTrn'

    # 2. Тханиссаро (второй приоритет, заменяет Суджато при совпадении)
    for p in Path('assets/texts/en_other/sutta/').rglob('*translation-en-thanissaro.json'):
        sutta_id = p.name.split('_')[0]
        sutta_map[sutta_id] = '$ifEnThanTrn'

    # 3. Other (высший приоритет, заменяет Суджато и Тханиссаро)
    for p in Path('assets/texts/en/').rglob('*en-o.json'):
        sutta_id = p.name.split('_')[0]
        sutta_map[sutta_id] = '$ifEnOTrn'

    if not sutta_map:
        print("Не найдено ни одного файла переводов. Проверьте пути.")
        return

    php_file = 'read.php'
    if not os.path.exists(php_file):
        print(f"Файл {php_file} не найден!")
        return

    # Читаем исходный файл
    with open(php_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    updated_lines = []
    updates_count = 0

    # Регулярное выражение для поиска любых старых переменных перевода (чтобы не было дублей)
    old_tags_pattern = re.compile(r'\s*<\?php\s+echo\s+\$ifEn[A-Za-z]+Trn;\?>')

    for line in lines:
        # Ищем строки, где есть класс level5 и id="..."
        if 'class="level5"' in line and 'id="' in line:
            # Извлекаем ID сутты из id="sn1.1"
            match = re.search(r'id="([^"]+)"', line)
            if match:
                s_id = match.group(1)
                
                # Если для этой сутты найден перевод
                if s_id in sutta_map:
                    php_var = sutta_map[s_id]
                    
                    # 1. Полностью очищаем строку от любых старых переменных $ifEn...Trn
                    line = old_tags_pattern.sub('', line)
                    
                    # 2. Вставляем актуальную переменную перед первым закрывающим </span>
                    new_tag = f' <?php echo {php_var};?>'
                    line = line.replace('</span>', f'{new_tag}</span>', 1)
                    
                    updates_count += 1

        updated_lines.append(line)

    # Перезаписываем read.php обновленными данными
    with open(php_file, 'w', encoding='utf-8') as f:
        f.writelines(updated_lines)

    print(f"Готово. Обновлено текстов в {php_file}: {updates_count}")

if __name__ == "__main__":
    update_read_php()
