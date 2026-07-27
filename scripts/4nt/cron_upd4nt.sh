#!/bin/bash

# Определяем базовую директорию в зависимости от среды
if [ -d "/data/data/com.termux/files/usr/share/apache2/default-site/htdocs" ]; then
    WORK_DIR="/data/data/com.termux/files/usr/share/apache2/default-site/htdocs"
elif [ -d "/var/www/html" ]; then
    WORK_DIR="/var/www/html"
else
    echo "Ошибка: базовая веб-директория не найдена ни для Termux, ни для стандартного сервера."
    exit 1
fi

# Настройки путей и репозитория
REPO_URL="https://github.com/dhammagift/4nt-clean.git"
BRANCH="main"
DIR_NAME="4nt"

# Полные пути
TARGET_DIR="$WORK_DIR/$DIR_NAME"
SHA_FILE="$WORK_DIR/.current_sha_4nt"

# Получаем актуальный хеш из удаленной ветки
REMOTE_SHA=$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | awk '{print $1}')

# Проверка, что удалось получить хеш
if [ -z "$REMOTE_SHA" ]; then
    echo "Ошибка: не удалось получить данные из удаленного репозитория."
    exit 1
fi

# Читаем локальный хеш, если файл существует
LOCAL_SHA=""
if [ -f "$SHA_FILE" ]; then
    LOCAL_SHA=$(cat "$SHA_FILE")
fi

# Сравниваем хеши
if [ "$REMOTE_SHA" != "$LOCAL_SHA" ]; then
    echo "Обнаружены обновления. Выполняем чистое скачивание в $TARGET_DIR..."
    
    # Полностью удаляем старую папку, если она существует
    if [ -d "$TARGET_DIR" ]; then
        rm -rf "$TARGET_DIR"
    fi
    
    # Скачиваем заново без истории
    git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$TARGET_DIR"
    
    # Записываем новый хеш для следующих проверок
    echo "$REMOTE_SHA" > "$SHA_FILE"
    echo "Обновление завершено."
else
    echo "Изменений нет. Обновление не требуется."
fi

