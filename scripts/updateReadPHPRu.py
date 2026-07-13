import os
import re
from pathlib import Path

def update_read_php_ru():
    sutta_map = {}

    def get_translation_info(filename):
        # 2. Средний приоритет
        if filename.endswith('sv+edited+o.json'):
            return 2, '$ifRuSvOTrn'
            
        # 1. Низший приоритет
        if filename.endswith('sv.json'):
            return 1, '$ifRuSvTrn'
            
        # 3. Высший приоритет (группа "О")
        o_group = [
            '-ru-o.json',
            '_o.json',
            '-o.json',
            'o+experimental.json',
            'o+todo.json',
            'pannavaro+edited+o.json',
            'shapovalov+edited+o.json',
            'syrkin+edited+o.json'
        ]
        
        for ext in o_group:
            if filename.endswith(ext):
                return 3, '$ifRuLitTrn'
                
        # Все остальные файлы (включая чистый syrkin.json) пропускаются
        return 0, None

    search_path = Path('assets/texts/ru/')
    
    if not search_path.exists():
        print(f"Директория {search_path} не найдена!")
        return

    # Шаги 1-4: Сканирование и приоритизация
    for p in search_path.rglob('*.json'):
        # Разделяем имя файла по '_' и берем первую часть
        sutta_id = p.name.split('_')[0].lower()
        priority, php_var = get_translation_info(p.name)
        
        if priority > 0:
            # Сохраняем, если для сутты еще нет перевода, или найденный имеет более высокий приоритет
            if sutta_id not in sutta_map or priority > sutta_map[sutta_id][0]:
                sutta_map[sutta_id] = (priority, php_var)

    if not sutta_map:
        print("Не найдено файлов русских переводов, соответствующих правилам.")
        return

    php_file = 'read.php'
    if not os.path.exists(php_file):
        print(f"Файл {php_file} не найден!")
        return

    with open(php_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    updated_lines = []
    updates_count = 0

    # Регулярное выражение для очистки старых переменных русских переводов
    old_tags_pattern = re.compile(r'\s*<\?php\s+echo\s+\$ifRu[A-Za-z]+Trn;\?>')

    # Шаги 5-6: Обновление файла read.php
    for line in lines:
        if 'class="level5"' in line and 'q="' in line:
            # Ищем ID внутри атрибута q="<ID>"
            match = re.search(r'q="([^"]+)"', line)
            if match:
                s_id = match.group(1).lower()
                
                if s_id in sutta_map:
                    php_var = sutta_map[s_id][1]
                    
                    # Удаляем все старые метки $ifRu...
                    line = old_tags_pattern.sub('', line)
                    
                    # Вставляем актуальную метку перед </span>
                    new_tag = f' <?php echo {php_var};?>'
                    line = line.replace('</span>', f'{new_tag}</span>', 1)
                    
                    updates_count += 1

        updated_lines.append(line)

    with open(php_file, 'w', encoding='utf-8') as f:
        f.writelines(updated_lines)

    print(f"Готово. Обновлено русских текстов в {php_file}: {updates_count}")

if __name__ == "__main__":
    update_read_php_ru()
