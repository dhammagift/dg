
## Браузерное тестирование
- Для работы с вебом, проверки страниц и UI-тестов используй `playwright-cli`.
- Основной рабочий цикл:
  1. `playwright-cli open <url>`
  2. `playwright-cli snapshot` (для получения ID элементов)
  3. `playwright-cli click <ref>` / `playwright-cli fill <ref> <text>`
  4. `playwright-cli screenshot`
- Всегда закрывай браузер после завершения сценария: `playwright-cli close`.
    

1. если ты делаешь модификации кода то обязательно делай бекап файла перед работой. ~/claudeBak/filename.ext. пример assets/js/autopali.js -> ~/claudeBak/autopali.js

2. Если ты пишешь код, то комментарии обязательлно делай на английском

3. если нужно свертиться с пали то коренные тексты лежат здесь /var/www/html/suttacentral.net/sc-data/sc_bilara_data/root/pli/ms/ там sutta  vinaya и файлы с такими же индексами и ключами json

