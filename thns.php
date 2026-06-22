<?php

// базовый путь (относительно текущего файла)
$repoDir = realpath(__DIR__ . '/../offline-data');

// безопасный переход в директорию
if ($repoDir) {
    chdir($repoDir);
}

// git pull (как у тебя — относительный путь через -C)
$gitCmd = "git -C ../offline-data pull";

// tree + sed (как ты просил)
$treeCmd = "tree -v -P \"*.json\" --prune ../offline-data/en_other | sed 's/_translation-en-thanissaro\\.json//'";

// выполнение
$gitOutput = shell_exec($gitCmd . " 2>&1") ?? '';
$treeOutput = shell_exec($treeCmd . " 2>&1") ?? '';

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Thanissaro Bhikkhu Trns Ready</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            background: #0f1115;
            color: #e5e7eb;
        }

        pre {
            background: #111827;
            color: #d1d5db;
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            max-height: 500px;
        }

        .accordion-button {
            background: #1f2937;
            color: #fff;
        }

        .accordion-button:not(.collapsed) {
            background: #374151;
            color: #fff;
        }

        .accordion-body {
            background: #0b1220;
        }
    </style>
</head>

<body class="p-3">

<div class="container">

    <h3 class="mb-3">List Texts that are Ready</h3>

    <div class="accordion" id="repoAccordion">

        <!-- GIT -->
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#git">
                    git pull
                </button>
            </h2>

            <div id="git" class="accordion-collapse collapse show" data-bs-parent="#repoAccordion">
                <div class="accordion-body">
                    <pre><?= htmlspecialchars($gitOutput, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></pre>
                </div>
            </div>
        </div>

        <!-- TREE -->
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#tree">
                  Texts Ready 
                </button>
            </h2>

            <div id="tree" class="accordion-collapse collapse" data-bs-parent="#repoAccordion">
                <div class="accordion-body">
                    <pre><?= htmlspecialchars($treeOutput, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></pre>
                </div>
            </div>
        </div>

    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
