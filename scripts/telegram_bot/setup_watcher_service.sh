#!/bin/bash

echo "Создание файла службы watcherbot.service..."

# Запись конфигурации в systemd
cat << 'EOF' > /etc/systemd/system/watcherbot.service
[Unit]
Description=Telegram Watcher Bot
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/telegram_bot
ExecStart=/var/www/telegram_bot/telegram/bin/python /var/www/telegram_bot/watcher.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Перезагрузка конфигурации systemd..."
systemctl daemon-reload

echo "Добавление службы в автозагрузку..."
systemctl enable watcherbot

echo "Перезапуск службы..."
systemctl restart watcherbot

echo "Текущий статус службы:"
systemctl status watcherbot --no-pager

