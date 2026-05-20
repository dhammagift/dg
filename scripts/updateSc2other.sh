#!/bin/bash

# Запускать из корня веб-сервера (где лежат suttacentral.net и assets)
ROOT_DIR="$PWD"

# Пути относительно корня
SRC_DIR="$ROOT_DIR/suttacentral.net/sc-data/sc_bilara_data/translation/ru"
DEST_DIR="$ROOT_DIR/assets/texts/ru_other"

# Проверяем существование исходной папки
if [ ! -d "$SRC_DIR" ]; then
    echo "Ошибка: Исходная папка не найдена: $SRC_DIR"
    exit 1
fi

# Создаем целевую папку
mkdir -p "$DEST_DIR"

echo "Начинаем копирование файлов во вторую линию перевода..."

# Переходим в исходную директорию
cd "$SRC_DIR" || { echo "Ошибка: не удалось перейти в $SRC_DIR"; exit 1; }

# Ищем все файлы .json, исключая папки o, blurb, site
find . -type f -name "*.json" ! -path "./o/*" ! -path "./blurb/*" ! -path "./site/*" | sort -V  | while read -r file; do
    
    # Извлекаем имя переводчика из пути для красивого вывода (например, "sv" или "khantibalo")
    translator=$(echo "$file" | cut -d'/' -f2)
    
    # Отрезаем имя папки переводчика, оставляя только структуру: sutta/an/an1/...
    rel_path=$(echo "$file" | sed 's|^\./[^/]\+/||')
    
    # Определяем целевую папку для копирования (используем абсолютный DEST_DIR)
    target_dir="$DEST_DIR/$(dirname "$rel_path")"
    
    # Создаем структуру поддиректорий
    mkdir -p "$target_dir"
    
    # Выводим лог операции в консоль
    echo "[$translator] -> assets/texts/ru_other/$rel_path"
    
    # Копируем файл
    cp "$file" "$target_dir/"
    
done
echo "Копирование успешно завершено. Структура в $DEST_DIR обновлена."
