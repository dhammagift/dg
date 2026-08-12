const fs = require('fs');
const path = require('path');

// По умолчанию HTML убирается; флаг --with-html оставляет теги
const stripHtml = !process.argv.includes('--with-html');

// Функция для рекурсивного поиска всех файлов в директории
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    
    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    
    return arrayOfFiles;
}

async function updateSuttaTranslators() {
    // Определение базовой директории по абсолютным путям
    const termuxDir = '/data/data/com.termux/files/usr/share/apache2/default-site';
    const varWwwDir = '/var/www';
    const baseDir = fs.existsSync(termuxDir) ? termuxDir : (fs.existsSync(varWwwDir) ? varWwwDir : null);

    if (!baseDir) {
        console.error('Базовая директория не найдена.');
        return;
    }

    // Ищем файл translators.json
    const translatorPathHtml = path.join(baseDir, 'html/assets/js/translators.json');
    const translatorPathHtdocs = path.join(baseDir, 'htdocs/assets/js/translators.json');
    const translatorPath = fs.existsSync(translatorPathHtml) ? translatorPathHtml : 
                           (fs.existsSync(translatorPathHtdocs) ? translatorPathHtdocs : null);

    if (!translatorPath) {
        console.error('Файл translators.json не найден.');
        return;
    }

    // Чтение списка переводчиков
    let translatorsData;
    try {
        translatorsData = JSON.parse(fs.readFileSync(translatorPath, 'utf8'));
    } catch (e) {
        console.error('Ошибка при чтении translators.json:', e);
        return;
    }
    
    const ruTranslators = translatorsData.ru;

    // Директория с исходными данными (прод репо)
    const sourceDataDir = path.join(baseDir, 'offline-data/dhammagift/translation/ru');
    
    if (!fs.existsSync(sourceDataDir)) {
        console.error(`Директория с данными не найдена: ${sourceDataDir}`);
        return;
    }

    // Целевая директория (создаем папку ru в текущем рабочем каталоге)
    const targetDataDir = path.join(process.cwd(), 'ru');

    // Чистим целевую директорию перед копированием
    if (fs.existsSync(targetDataDir)) {
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        await new Promise((resolve) => {
            rl.question(`\nВНИМАНИЕ: будет удалена папка "${targetDataDir}"\nПродолжить? (y/N) `, (answer) => {
                rl.close();
                if (answer.toLowerCase() !== 'y') {
                    console.log('Отменено.');
                    process.exit(0);
                }
                resolve();
            });
        });
        fs.rmSync(targetDataDir, { recursive: true, force: true });
    }

    // Получаем все файлы, включая те, что во вложенных папках
    const allFiles = getAllFiles(sourceDataDir);

    for (const filePath of allFiles) {
        if (!filePath.endsWith('.json')) continue;

        // Вычисляем относительный путь для воссоздания структуры
        const relativePath = path.relative(sourceDataDir, filePath);
        const destPath = path.join(targetDataDir, relativePath);

        // Создаем вложенные папки в целевой директории, если их нет
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        const fileName = path.basename(filePath);

        // Извлечение ключа переводчика из имени файла
        const match = fileName.match(/_translation-ru-(.+)\.json$/);
        
        let fileData;
        try {
            fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Ошибка при чтении файла ${filePath}:`, e);
            continue;
        }

        if (!match) {
            // Если файл не подходит по паттерну, просто копируем его без изменений
            fs.writeFileSync(destPath, JSON.stringify(fileData, null, 2), 'utf8');
            continue;
        }

        const translatorId = match[1];
        let translatorName = ruTranslators[translatorId];

        if (!translatorName) {
            // Фолбек: первая буква заглавная, остальное без изменений
            translatorName = translatorId.charAt(0).toUpperCase() + translatorId.slice(1);
            console.log(`Фолбек для файла ${fileName}: используется имя "${translatorName}".`);
        } else {
            // Если передан флаг, очищаем от тегов, иначе преобразуем ссылки
            if (stripHtml) {
                translatorName = translatorName.replace(/<[^>]+>/g, '');
            } else {
                translatorName = translatorName.replace(/href=\//g, 'href=https://f.dhamma.gift/');
            }
        }

        const keys = Object.keys(fileData);
        if (keys.length > 0) {
            // Взятие самого первого значения
            const firstKey = keys[0];
            const originalValue = fileData[firstKey];

            // Проверка на наличие уже добавленной строки
            if (typeof originalValue === 'string' && !originalValue.includes('— пер.') && !originalValue.includes('- переводчик')) {
                fileData[firstKey] = `${originalValue.trim()} — пер. ${translatorName} `;
            }
        }

        // Сохраняем измененный (или проверенный) файл в новую директорию
        fs.writeFileSync(destPath, JSON.stringify(fileData, null, 2), 'utf8');
        console.log(`Сохранен файл: ${destPath}`);
    }
}

updateSuttaTranslators();
