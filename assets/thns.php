<?php

// базовый путь (относительно текущего файла)
$repoDir = realpath(__DIR__ . '/../../offline-data');

// безопасный переход в директорию
if ($repoDir) {
    chdir($repoDir);
}

// git pull
$gitCmd = "cd ../../offline-data; git pull";

// tree + sed 
$treeCmd = "tree -v -P \"*.json\" --prune ../offline-data/lbl ../offline-data/en_other | sed 's/_translation-en-thanissaro\\.json//'";

// выполнение
$gitOutput = shell_exec($gitCmd . " 2>&1") ?? '';
$treeOutput = shell_exec($treeCmd . " 2>&1") ?? '';

// Разбиваем вывод tree на массив строк
$treeLines = explode("\n", rtrim($treeOutput));

// Удаляем первую строку с названием корневой директории (../offline-data/en_other)
if (!empty($treeLines)) {
    array_shift($treeLines);
}

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanissaro Bhikkhu Trns Ready</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css" rel="stylesheet">

    <link href="/assets/css/styles.css" rel="stylesheet" />
    <link href="/assets/css/extrastyles.css" rel="stylesheet" />
    <link href="/assets/css/lbl.css" rel="stylesheet" />
    <link rel="icon" type="image/png" href="/assets/img/favico-noglass.png" />

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

        /* DataTables Custom Styles */
        table.dataTable {
            font-family: monospace;
            color: #d1d5db;
        }
        table.dataTable tbody tr {
            background-color: transparent !important;
        }
        table.dataTable tbody tr:hover {
            background-color: #1f2937 !important;
        }
        .dataTables_wrapper .dataTables_filter input {
            background-color: #111827;
            color: #fff;
            border: 1px solid #374151;
        }
        .dataTables_wrapper .dataTables_info, 
        .dataTables_wrapper .dataTables_filter {
            color: #d1d5db !important;
            margin-bottom: 10px;
        }
        .dt-buttons .btn {
            background-color: #374151;
            color: #fff;
            border: none;
        }
        .dt-buttons .btn:hover {
            background-color: #4b5563;
        }
    </style>
</head>

<body class="p-3">

<div class="mt-3">
    <div class="align-items-center toggle-switch input-group-append">
        <div class="input-group">
            <div style="display: inline-flex;">
                <top-nav-icons type="read"></top-nav-icons>
                <a href="https://www.dhammatalks.org/suttas/">DhammaTalks.org </a>
                &nbsp;
                <a href="/assets/lbl-en.html">Trn Editor </a>
            </div>
        </div>
    </div>
</div>

<div class="container mt-4">

    <h3 class="mb-3"></h3>

    <div class="accordion" id="repoAccordion">

        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#tree">
                  List of the Texts that are Ready. If you can find it here it's Done.
                </button>
            </h2>

            <div id="tree" class="accordion-collapse collapse show" data-bs-parent="#repoAccordion">
                <div class="accordion-body">
                    <table id="treeTable" class="table table-dark table-borderless table-sm w-100">
                        <thead>
                            <tr>
                                <th>Unpublished texts (if available) are listed before the main "Sutta" folder </th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($treeLines as $line): ?>
                                <tr>
                                    <td><?= htmlspecialchars($line, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#git">
                    Text Update Status
                </button>
            </h2>

            <div id="git" class="accordion-collapse collapse" data-bs-parent="#repoAccordion">
                <div class="accordion-body">
                    <pre><?= htmlspecialchars($gitOutput, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></pre>
                </div>
            </div>
        </div>

    </div>

</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>

<script src="/assets/js/nav-component.js" defer></script>
<script src="/assets/js/fontawesome.6.6.all.js" defer></script>
<script src="/assets/js/themeswitch.js" defer></script>

<script>
    $(document).ready(function() {
        $('#treeTable').DataTable({
            dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rt<"mt-2"i>',
            buttons: [
                {
                    extend: 'copyHtml5',
                    text: 'Copy Table',
                    className: 'btn btn-sm btn-secondary'
                }
            ],
            paging: false,
            ordering: false,
            language: {
                search: "Filter:",
                info: "Total rows: _TOTAL_",
                infoEmpty: "No data available",
                zeroRecords: "No matching records found"
            }
        });
    });
</script>
<script defer src="/assets/js/themeswitch.js"></script>
<script defer src="/assets/js/settings.js"></script>


</body>
</html>
