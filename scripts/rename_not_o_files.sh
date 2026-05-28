#!/bin/bash

echo "Вставьте список 'modified: ...'. Когда закончите — нажмите Ctrl+D:"

# Считываем весь ввод в переменную
input=$(cat)

# Папка для сохранения оригиналов
backup_dir="assets/texts/svEtc/automatic"

# Создаем папку для оригиналов, если её вдруг нет
mkdir -p "$backup_dir"

# Извлекаем все пути к файлам .json, игнорируя лишние пробелы и 'modified:'
echo "$input" | grep -oE 'assets/texts/ru/sutta/[^[:space:]]+\.json' | while read -r filepath; do

  # Пропускаем файлы, которые уже переименованы
  if [[ "$filepath" =~ [+-]o\.json$ ]]; then
    continue
  fi

  dir=$(dirname "$filepath")
  base=$(basename "$filepath" .json)
  target="$dir/${base}+edited+o.json"

  if [[ -f "$target" ]]; then
    echo "Skip: already exists → $target"
    continue
  fi

  if [[ -f "$filepath" ]]; then
    echo "Processing: $filepath"
    
    # Копируем оригинальный файл в папку automatic
    cp "$filepath" "$backup_dir/"
    echo "  → Original saved to: $backup_dir/"
    
    # Переименовываем исходный файл
    mv "$filepath" "$target"
    echo "  → Renamed to: $target"
  else
    echo "Skip: source file missing → '$filepath'"
  fi
done

echo
echo "✅ Обработка завершена. Нажмите Enter для выхода или Ctrl+C."


