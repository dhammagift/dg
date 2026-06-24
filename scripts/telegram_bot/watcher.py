import asyncio
import os
import sys
import json
import logging
from telegram.ext import Application

# === Загрузка конфига ===
config_path = sys.argv[1] if len(sys.argv) > 1 else "config.json"
try:
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)
except Exception as e:
    print(f"Ошибка загрузки конфигурации: {e}")
    exit(1)

TOKEN = config.get("TOKEN", "")
WATCH_DIR = "/var/www/html/assets/texts/lbl/"

# Обработка ADMIN_ID (поддержка одного числа или списка чисел)
raw_admin_ids = config.get("ADMIN_ID", [])
if isinstance(raw_admin_ids, int):
    ADMIN_IDS = [raw_admin_ids]
elif isinstance(raw_admin_ids, list):
    ADMIN_IDS = raw_admin_ids
else:
    ADMIN_IDS = []

# === Логирование ===
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    filename='watcher.log'
)
logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())

# === Фоновая задача: Наблюдатель за папкой ===
async def watch_directory(app: Application):
    seen_files = {}
    
    # При старте запоминаем все существующие файлы и время их последнего изменения
    if os.path.exists(WATCH_DIR):
        for file_name in os.listdir(WATCH_DIR):
            file_path = os.path.join(WATCH_DIR, file_name)
            if os.path.isfile(file_path):
                seen_files[file_name] = os.path.getmtime(file_path)
        logger.info(f"Наблюдение за папкой начато. Существующих файлов: {len(seen_files)}")
    else:
        logger.warning(f"Директория {WATCH_DIR} пока не существует. Жду...")

    while True:
        await asyncio.sleep(5)  # Проверка каждые 5 секунд
        
        if not os.path.exists(WATCH_DIR):
            continue
            
        current_files = os.listdir(WATCH_DIR)
        
        for file_name in current_files:
            file_path = os.path.join(WATCH_DIR, file_name)
            
            if os.path.isfile(file_path):
                try:
                    # Получаем текущее время изменения файла
                    current_mtime = os.path.getmtime(file_path)
                except Exception:
                    # Файл мог быть удален в процессе проверки
                    continue
                    
                is_new = file_name not in seen_files
                is_modified = not is_new and current_mtime > seen_files[file_name]
                
                # Если файл новый или был изменен
                if is_new or is_modified:
                    action_text = "Новый файл" if is_new else "Обновлен файл"
                    
                    # Отправка каждому админу из списка
                    for admin_id in ADMIN_IDS:
                        try:
                            with open(file_path, 'rb') as f:
                                await app.bot.send_document(
                                    chat_id=admin_id,
                                    document=f,
                                    caption=f"📄 {action_text} в lbl: {file_name}"
                                )
                            logger.info(f"Успешно отправлен {file_name} ({action_text}) админу {admin_id}")
                        except Exception as e:
                            logger.error(f"Ошибка при отправке файла {file_name} админу {admin_id}: {e}")
                    
                    # Обновляем запись о времени изменения файла в словаре
                    seen_files[file_name] = current_mtime

async def post_init(app: Application):
    asyncio.create_task(watch_directory(app))

def main():
    if not TOKEN or not ADMIN_IDS:
        logger.error("Ошибка: Укажите TOKEN и корректный ADMIN_ID в config.json.")
        return

    app = Application.builder().token(TOKEN).post_init(post_init).build()
    
    logger.info(f"Бот-наблюдатель запущен. Админов в списке: {len(ADMIN_IDS)}. Нажмите Ctrl+C для остановки.")
    app.run_polling()

if __name__ == "__main__":
    main()







