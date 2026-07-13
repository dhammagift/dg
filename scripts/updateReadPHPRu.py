import os
import re
from pathlib import Path

def update_read_php_ru():
    sutta_map = {}

    def get_translation_info(filename):
        # 2. Группа Сыркин и SV
        if filename.endswith('sv+edited+o.json'):
            return 2, '$ifRuSvOTrn'
        if filename.endswith('syrkin.json'):
            return 1, '$ifRuAYSTrn'
        if filename.endswith('syrkin+edited+o.json'):
            return 1, '$ifRuAYSOTrn'
        if filename.endswith('sv.json'):
            return 1, '$ifRuSvTrn'
            
        if filename.endswith('-sv.json'):
            return 1, '$ifRuSvTrn'
            
        o_group = [
            '-ru-o.json',
            '-o+experimental.json',
            '-o+todo.json'
        ]
        
        for ext in o_group:
            if filename.endswith(ext):
                return 3, '$ifRuLitTrn'
                
        return 0, None

    search_path = Path('assets/texts/ru/')
    
    if not search_path.exists():
        print(f"Директория {search_path} не найдена!")
        return

    print("--- СКАНИРОВАНИЕ ФАЙЛОВ ПЕРЕВОДОВ ---")
    for p in search_path.rglob('*.json'):
        # Разделяем имя файла по '_'
        parts = p.name.split('_')
        sutta_id = parts[0].lower()
        
        priority, php_var = get_translation_info(p.name)
        
        if priority > 0:
            if sutta_id not in sutta_map:
                sutta_map[sutta_id] = (priority, php_var, p.name)
                print(f"[ДОБАВЛЕНО] ID: {sutta_id: <8} | Приоритет: {priority} | Файл: {p.name}")
            elif priority > sutta_map[sutta_id][0]:
                print(f"[ОБНОВЛЕНО] ID: {sutta_id: <8} | Приоритет: {sutta_map[sutta_id][0]} -> {priority} | Заменен {sutta_map[sutta_id][2]} на {p.name}")
                sutta_map[sutta_id] = (priority, php_var, p.name)
            else:
                print(f"[ПРОПУЩЕНО] ID: {sutta_id: <8} | Приоритет: {priority} <= {sutta_map[sutta_id][0]} | Файл: {p.name} (Оставлен старый)")

    if not sutta_map:
        print("\nНе найдено файлов русских переводов, соответствующих правилам.")
        return

    print(f"\nВсего сутт готово к обновлению: {len(sutta_map)}")

    php_file = 'read.php'
    if not os.path.exists(php_file):
        print(f"Файл {php_file} не найден!")
        return

    with open(php_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    updated_lines = []
    updates_count = 0

    old_tags_pattern = re.compile(r'\s*<\?php\s+echo\s+\$ifRu[A-Za-z]+Trn;\?>')

    print("\n--- ВНЕСЕНИЕ ИЗМЕНЕНИЙ В READ.PHP ---")
    for i, line in enumerate(lines):
        if 'class="level5"' in line:
            # Ищем ID напрямую в id="..." тега span
            match = re.search(r'id="([^"]+)"', line)
            if match:
                s_id = match.group(1).lower()
                
                if s_id in sutta_map:
                    php_var = sutta_map[s_id][1]
                    
                    line = old_tags_pattern.sub('', line)
                    new_tag = f' <?php echo {php_var};?>'
                    line = line.replace('</span>', f'{new_tag}</span>', 1)
                    
                    updates_count += 1
                    print(f"[ЗАМЕНА] ID {s_id: <8} получает тег {php_var}")
            else:
                print(f"[ОШИБКА HTML] Не найден id в строке {i+1}: {line.strip()}")

        updated_lines.append(line)

    with open(php_file, 'w', encoding='utf-8') as f:
        f.writelines(updated_lines)

    print(f"\nГотово. Обновлено русских текстов в {php_file}: {updates_count}")

if __name__ == "__main__":
    update_read_php_ru()
