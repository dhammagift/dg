<?php

// базовый путь (относительно текущего файла)
$repoDir = realpath(__DIR__ . '/../../offline-data');

// безопасный переход в директорию
if ($repoDir) {
    chdir($repoDir);
}

// git pull
$gitCmd = "cd ../../offline-data; git pull";


// Раздельные команды для опубликованных и неопубликованных
$unpublishedCmd = "find ../offline-data/lbl -name \"*-en-*.json\" -printf '%f\n' | sort -V | awk '{sub(/_translation-en-thanissaro\\.json$/, \"\", $1); print \"<a target=_blank href=\\\"/assets/texts/lbl/\" $1 \"_translation-en-thanissaro.json\\\">\" $1 \"</a>\"}'";
$publishedCmd = "find ../offline-data/dhammagift/en_other -name \"*-en-*.json\" -printf '%f\n' | sort -V | awk '{sub(/_translation-en-thanissaro\\.json$/, \"\", $1); print \"<a target=_blank href=\\\"/multi/?q=\" $1 \"\\\">\" $1 \"</a>\"}'";
//$publishedCmd = "find ../offline-data/dhammagift/en_other -name \"*-en-*.json\" -printf '%f\n' | sort -V | awk '{sub(/_translation-en-thanissaro\\.json$/, \"\", $1); print $1}'";

// Not ready остается как была
$notReadyCmd = "cd ../offline-data/dhammagift/en_other; find /var/www/offline-data/lbl sutta/sn sutta/mn sutta/an -type f | awk -F/ '{print \$NF}' | sed 's/_.*//' | sort -u | grep -Fhxvf - an.txt sn.txt mn.txt | awk '/^sn/{print \"1 \" \$0;next}/^mn/{print \"2 \" \$0;next}/^dn/{print \"3 \" \$0;next}/^an/{print \"4 \" \$0;next}' | sort -k1,1n -k2,2V | cut -d' ' -f2-";

// Выполнение
$gitOutput = shell_exec("cd ../../offline-data; git pull 2>&1") ?? '';
$unpublishedOutput = shell_exec($unpublishedCmd . " 2>&1") ?? '';
$publishedOutput = shell_exec($publishedCmd . " 2>&1") ?? '';
$notReadyOutput = shell_exec($notReadyCmd . " 2>&1") ?? '';

$unpublishedLines = array_filter(explode("\n", trim($unpublishedOutput)));
$publishedLines = array_filter(explode("\n", trim($publishedOutput)));
$notReadyLines = array_filter(explode("\n", trim($notReadyOutput)));

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
        body { background: #0f1115; color: #e5e7eb; }
        pre { background: #111827; color: #d1d5db; padding: 12px; border-radius: 8px; overflow-x: auto; max-height: 500px; }
        .accordion-button { background: #1f2937; color: #fff; }
        .accordion-button:not(.collapsed) { background: #374151; color: #fff; }
        .accordion-body { background: #0b1220; }
        table.dataTable { font-family: monospace; color: #d1d5db; }
        table.dataTable tbody tr { background-color: transparent !important; }
        table.dataTable tbody tr:hover { background-color: #1f2937 !important; }
        .dataTables_wrapper .dataTables_filter input { background-color: #111827; color: #fff; border: 1px solid #374151; }
        .dataTables_wrapper .dataTables_info, .dataTables_wrapper .dataTables_filter { color: #d1d5db !important; margin-bottom: 10px; }
        .dt-buttons .btn { background-color: #374151; color: #fff; border: none; }
        .dt-buttons .btn:hover { background-color: #4b5563; }
    </style>
</head>

<body class="p-3">

<div class="mt-3">
    <div class="align-items-center toggle-switch input-group-append">
        <div class="input-group">
            <div style="display: inline-flex;">
                <top-nav-icons type="read"></top-nav-icons>
                <a target=_blank href="https://www.dhammatalks.org/suttas/">DhammaTalks.org </a>
                &nbsp;
                <a target=_blank href="/assets/lbl-en.html">Trn Editor </a>
            </div>
        </div>
    </div>
</div>

<div class="container mt-4">
<div class="accordion" id="repoAccordion">

    <!-- 1. Pending -->
    <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#notready">Texts Pending Completion</button></h2>
        <div id="notready" class="accordion-collapse collapse" data-bs-parent="#repoAccordion">
            <div class="accordion-body">
                <table id="notReadyTable" class="table table-dark table-borderless table-sm">
                    <thead><tr><th>Pending Texts</th></tr></thead>
                    <tbody>
                        <?php foreach ($notReadyLines as $line): ?>
                            <tr><td><a target=_blank href="https://dhammatalks.org/suttas/<?= strtoupper(preg_replace('/[\d.]+/', '', $line)) ?>/<?= strtoupper(preg_replace('/[\d.]+/', '', $line)) ?><?= strtoupper(str_replace('.', '_', preg_replace('/[a-z]+/i', '', $line))) ?>.html" target="_blank"><?= htmlspecialchars($line) ?></a></td></tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 2. Unpublished (LBL) -->
    <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#unpublished">Unpublished</button></h2>
        <div id="unpublished" class="accordion-collapse collapse" data-bs-parent="#repoAccordion">
            <div class="accordion-body">
                <table id="unpublishedTable" class="table table-dark table-borderless table-sm">
                    <thead><tr><th>Unpublished Files</th></tr></thead>
                    <tbody>
                        <?php foreach ($unpublishedLines as $line): ?><tr><td><?= $line ?></td></tr><?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 3. Published -->
    <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#published">Published</button></h2>
        <div id="published" class="accordion-collapse collapse" data-bs-parent="#repoAccordion">
            <div class="accordion-body">
                <table id="publishedTable" class="table table-dark table-borderless table-sm">
                    <thead><tr><th>Published Files</th></tr></thead>
                    <tbody>
                        <?php foreach ($publishedLines as $line): ?><tr><td><?= $line ?></td></tr><?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 4. Git -->
    <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#git">Text Update Status</button></h2>
        <div id="git" class="accordion-collapse collapse" data-bs-parent="#repoAccordion">
            <div class="accordion-body"><pre><?= htmlspecialchars($gitOutput) ?></pre></div>
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

<script>
    $(document).ready(function() {
        var dtOptions = {
            stateSave: true,
            dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rt<"mt-2"i>',
            buttons: [{ extend: 'copyHtml5', text: 'Copy Table', className: 'btn btn-sm btn-secondary' }],
            paging: false, ordering: false,
            language: { search: "Filter:", info: "Total: _TOTAL_", infoEmpty: "No data", zeroRecords: "No matches" }
        };

        $('#notReadyTable').DataTable(dtOptions);
        $('#unpublishedTable').DataTable(dtOptions);
        $('#publishedTable').DataTable(dtOptions);

        var activeTabId = localStorage.getItem('activeAccordionTab');
        if (activeTabId) {
            $('.accordion-collapse').removeClass('show');
            $('.accordion-button').addClass('collapsed');
            $('#' + activeTabId).addClass('show');
            $('[data-bs-target="#' + activeTabId + '"]').removeClass('collapsed');
        }

        $('#repoAccordion').on('shown.bs.collapse', function (e) {
            localStorage.setItem('activeAccordionTab', $(e.target).attr('id'));
        });
    });
</script>
<script src="/assets/js/nav-component.js" defer></script>
<script src="/assets/js/fontawesome.6.6.all.js" defer></script>
<script defer src="/assets/js/themeswitch.js"></script>
<script defer src="/assets/js/settings.js"></script>
</body>
</html>
