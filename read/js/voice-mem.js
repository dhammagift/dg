/**
 * A-B Loop Repeat Module (Универсальный цикл)
 * Работает поверх window.ttsAPI из voice.js
 */

(function() {
    // --- Локализация ---
    const isRu = window.location.pathname.includes('/r/') || window.location.pathname.includes('/ml/');
    const L = {
        a: isRu ? 'А:' : 'A:',
        b: isRu ? 'Б:' : 'B:',
        notSet: isRu ? 'не выбрана' : 'not set',
        titlePick: isRu ? 'Нажмите для выбора. ПКМ или долгое нажатие для сброса.' : 'Click to select. Right-Click / Long-Press to clear.',
        interval: isRu ? 'мин' : 'min',
        playing: isRu ? 'Проигрывание... (осталось: ' : 'Playing... (left: ',
        paused: isRu ? 'Пауза... Старт через ' : 'Paused... Next in ',
        abLoopTitle: 'AB'
    };

    // --- Состояние модуля ---
    const memState = {
        lineA: null,
        lineB: null,
        snippetA: '', 
        snippetB: '', 
        intervalMinutes: 1,
        repsInput: '10', 
        repsPlayed: 0,   
        repsLeft: 0,     
        isActive: false,
        pickMode: null, 
        countdownId: null,
        pauseStartedAt: null,   
        targetTimestamp: null,  
        justCleared: false,
        currentCountdownTime: null,
        ignoreNextPlayClick: false,
        isPanelOpen: false 
    };

    const getSlug = () => window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
    const STORAGE_KEY = () => `mem_state_${getSlug()}`;

    // --- Инициализация и UI ---
    function init() {
        injectStyles();
        injectUI();
        loadState();
        setupListeners();
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ab-loop-toggle-btn {
                position: absolute;
                right: 20px; 
                top: 34px;   
                background: transparent;
                border: 1px solid #ccc;
                border-radius: 4px;
                color: #777;
                font-size: 9px;
                font-family: sans-serif;
                font-weight: 700;
                padding: 2px 4px;
                cursor: pointer;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 2px;
                z-index: 10;
                line-height: 1;
            }
            .ab-loop-toggle-btn:hover { background: #eee; color: #333; border-color: #bbb; }
            .dark .ab-loop-toggle-btn { border-color: #555; color: #aaa; }
            .dark .ab-loop-toggle-btn:hover { background: #444; color: #fff; border-color: #777; }
            
            .ab-loop-toggle-btn.loop-active {
                color: var(--blue, #3434be);
                border-color: var(--blue, #3434be);
                background: rgba(52, 52, 190, 0.05);
            }
            .dark .ab-loop-toggle-btn.loop-active {
                color: rgb(122, 122, 249);
                border-color: rgb(122, 122, 249);
                background: rgba(122, 122, 249, 0.1);
            }

            #memorize-panel {
                width: 100%;
                box-sizing: border-box;
                max-height: 0; opacity: 0; overflow: hidden;
                transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
                border-top: 1px dashed #555;
                background: transparent;
                padding: 0 5px;
            }
            #memorize-panel.visible {
                max-height: 400px; opacity: 1; margin-top: 10px; padding-top: 8px;
            }
            .mem-row { 
                width: 100%; box-sizing: border-box; 
                display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; 
            }
            
            .mem-btn-wrapper { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
            .mem-btn-label { color: #aaa; font-size: 11px; flex-shrink: 0; font-weight: 600; }

            .mem-pick-btn {
                flex: 1; min-width: 0; 
                background: #eee; border: 1px dashed #ccc; color: #555;
                padding: 4px; border-radius: 4px; font-size: 11px; cursor: pointer;
                transition: all 0.2s; text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
                user-select: none; -webkit-user-select: none; 
            }
            .dark .mem-pick-btn { background: #333; border-color: #555; color: #aaa; }
            
            .mem-pick-btn.picking { border-color: var(--blue, #3434be); background: rgba(52, 52, 190, 0.1); animation: memPulseLight 1.5s infinite; color: #333; }
            .mem-pick-btn.set { border-color: var(--blue, #3434be); border-style: solid; color: #000; }
            .mem-status { font-size: 11px; color: var(--blue, #3434be); text-align: center; margin-top: 2px; min-height: 14px; }

            .dark .mem-pick-btn.picking { border-color: rgb(122, 122, 249); background: rgba(122, 122, 249, 0.15); animation: memPulseDark 1.5s infinite; color: #fff; }
            .dark .mem-pick-btn.set { border-color: rgb(122, 122, 249); color: #fff; }
            .dark .mem-status { color: rgb(122, 122, 249); }

            /* Только линия слева, БЕЗ ФОНА для совместимости с tts-active */
            .memorize-highlight { 
                border-left: 3px solid var(--blue, #3434be) !important; 
                padding-left: 5px !important; 
            }
            .dark .memorize-highlight { 
                border-left: 3px solid rgb(122, 122, 249) !important; 
            }
            
            /* Железобетонная защита синей линии от сброса (border: none !important) во время чтения TTS */
            #sutta span[id]:has(.tts-active) .memorize-highlight.tts-active,
            #sutta span[id]:has(.tts-active) .memorize-highlight.active-word {
                border-left: 3px solid var(--blue, #3434be) !important;
                padding-left: 5px !important;
            }
            .dark #sutta span[id]:has(.tts-active) .memorize-highlight.tts-active,
            .dark #sutta span[id]:has(.tts-active) .memorize-highlight.active-word {
                border-left: 3px solid rgb(122, 122, 249) !important;
            }

            .mem-label { font-size: 11px; color: #aaa; margin: 0; display: flex; align-items: center; gap: 5px; }
            .mem-input { width: 42px; background: #eee; border: 1px solid #ccc; color: #333; border-radius: 4px; padding: 2px; font-size: 11px; text-align: center; transition: background 0.3s, color 0.3s; }
            .dark .mem-input { background: #333; border: 1px solid #555; color: #ccc; }

            .mem-clear-btn {
                background: transparent; border: none; font-size: 14px; cursor: pointer; padding: 2px;
                display: flex; align-items: center; justify-content: center; opacity: 0.7; transition: 0.2s;
            }
            .mem-clear-btn:hover { opacity: 1; transform: scale(1.1); }
            
            @keyframes memPulseLight { 0% { box-shadow: 0 0 0 0 rgba(52, 52, 190, 0.4); } 70% { box-shadow: 0 0 0 4px rgba(52, 52, 190, 0); } 100% { box-shadow: 0 0 0 0 rgba(52, 52, 190, 0); } }
            @keyframes memPulseDark { 0% { box-shadow: 0 0 0 0 rgba(122, 122, 249, 0.4); } 70% { box-shadow: 0 0 0 4px rgba(122, 122, 249, 0); } 100% { box-shadow: 0 0 0 0 rgba(122, 122, 249, 0); } }
        `;
        document.head.appendChild(style);
    }

    function injectUI() {
        setInterval(() => {
            const mainRow = document.querySelector('.tts-main-row');
            if (mainRow && !document.getElementById('ab-loop-toggle-btn')) {
                
                mainRow.style.position = 'relative';

                const abBtn = document.createElement('button');
                abBtn.id = 'ab-loop-toggle-btn';
                abBtn.className = `ab-loop-toggle-btn ${memState.lineA ? 'loop-active' : ''}`;
                abBtn.title = 'A-B Loop Menu';
                abBtn.innerHTML = `
                    ${L.abLoopTitle} 
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
                    <span id="ab-btn-timer" style="display:none; margin-left:2px; font-variant-numeric: tabular-nums;"></span>
                `;
                mainRow.appendChild(abBtn);

                const panel = document.createElement('div');
                panel.id = 'memorize-panel';
                if (memState.isPanelOpen) panel.classList.add('visible');
                
                const repsType = memState.repsInput === '∞' ? 'text' : 'number';

                panel.innerHTML = `
                    <div class="mem-row">
                        <div class="mem-btn-wrapper">
                            <span class="mem-btn-label">${L.a}</span>
                            <button id="mem-btn-a" class="mem-pick-btn" title="${L.titlePick}"><span>${L.notSet}</span></button>
                        </div>
                        <div class="mem-btn-wrapper">
                            <span class="mem-btn-label">${L.b}</span>
                            <button id="mem-btn-b" class="mem-pick-btn" title="${L.titlePick}"><span>${L.notSet}</span></button>
                        </div>
                    </div>
                    
                    <div class="mem-row" style="justify-content: space-around; gap: 5px;">
                        <label class="mem-label">⌛ <input id="mem-interval" class="mem-input" type="number" min="0" step="0.1" value="${memState.intervalMinutes}"> ${L.interval}</label>
                        <label class="mem-label">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg> 
                            <input id="mem-reps" class="mem-input" type="${repsType}" min="0" step="1" value="${memState.repsInput}">
                        </label>
                        <button id="mem-clear-btn" class="mem-clear-btn" title="Сбросить цикл">🗑️</button>
                    </div>
                    <div id="mem-status" class="mem-status"></div>
                `;
                mainRow.parentNode.insertBefore(panel, mainRow.nextSibling);

                updateUI();
                updateABTimerDisplay();
            }
        }, 400); 
    }

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY()));
            if (saved) {
                memState.lineA = saved.lineA;
                memState.lineB = saved.lineB;
                memState.snippetA = saved.snippetA || '';
                memState.snippetB = saved.snippetB || '';
                memState.intervalMinutes = saved.intervalMinutes !== undefined ? saved.intervalMinutes : 1;
                memState.repsInput = saved.repsInput || '10'; 
            }
        } catch(e) {}
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY(), JSON.stringify({
            lineA: memState.lineA,
            lineB: memState.lineB,
            snippetA: memState.snippetA,
            snippetB: memState.snippetB,
            intervalMinutes: memState.intervalMinutes,
            repsInput: memState.repsInput
        }));
    }

    function extractSnippet(el) {
        if (!el) return '';
        let text = (el.innerText || el.textContent || '').trim();
        text = text.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ');
        const words = text.split(' ');
        if (words.length === 0 || words[0] === '') return '';
        return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
    }

    function updateABTimerDisplay() {
        const timerSpan = document.getElementById('ab-btn-timer');
        const panel = document.getElementById('memorize-panel');
        if (!timerSpan) return;
        
        if (memState.isActive && memState.currentCountdownTime && panel && !panel.classList.contains('visible')) {
            timerSpan.style.display = 'inline-block';
            timerSpan.innerText = memState.currentCountdownTime;
        } else {
            timerSpan.style.display = 'none';
        }
    }

    // Динамический пересчет "Осталось раз"
    function updateRepsLeft() {
        if (memState.repsInput === '∞' || memState.repsInput === '' || memState.repsInput === '0') {
            memState.repsLeft = Infinity;
        } else {
            let r = parseInt(memState.repsInput);
            memState.repsLeft = (isNaN(r) ? Infinity : r) - memState.repsPlayed;
            if (memState.repsLeft < 0) memState.repsLeft = 0;
        }
    }

    function armLoopInPlayer() {
        if (!memState.lineA || !window.ttsAPI) return;
        const state = window.ttsAPI.getState();
        if (!state.playlist || !state.playlist.length) return;
        
        const targetB = memState.lineB || memState.lineA;
        let sIdx = state.playlist.findIndex(item => item.id === memState.lineA);
        let eIdx = state.playlist.findIndex(item => item.id === targetB);
        
        if (sIdx === -1) sIdx = 0;
        if (eIdx === -1) eIdx = state.playlist.length - 1;

        state.startIndex = sIdx;
        state.endIndex = eIdx;
        
        if (state.currentIndex < sIdx || state.currentIndex > eIdx) {
            state.currentIndex = sIdx;
        }

        memState.isActive = true;
        memState.repsPlayed = 0; // Сбрасываем счетчик при новом старте
        updateRepsLeft();
        
        memState.currentCountdownTime = null; 
        updateABTimerDisplay();
        
        const statusEl = document.getElementById('mem-status');
        if (statusEl) statusEl.innerText = `${L.playing}${memState.repsLeft === Infinity ? '∞' : memState.repsLeft})`;
        
        updateUI();
    }

    function setupListeners() {
        document.addEventListener('tts-playback-started', () => {
            if (memState.lineA) {
                armLoopInPlayer();
            }
        });

        document.addEventListener('focusin', (e) => {
            if (e.target.id === 'mem-reps') {
                if (e.target.value === '∞') {
                    e.target.type = 'number';
                    e.target.value = '0';
                }
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'mem-interval') {
                let val = parseFloat(e.target.value);
                memState.intervalMinutes = isNaN(val) ? 0 : val;
                
                if (memState.countdownId && memState.pauseStartedAt) {
                    memState.targetTimestamp = memState.pauseStartedAt + (memState.intervalMinutes * 60 * 1000);
                }
            }
            if (e.target.id === 'mem-reps') {
                if (e.target.value === '0') {
                    e.target.type = 'text';
                    e.target.value = '∞';
                    memState.repsInput = '∞';
                    e.target.blur(); 
                } else {
                    memState.repsInput = e.target.value;
                }
                
                // РУЧНОЕ ИЗМЕНЕНИЕ ПОВТОРОВ = СБРОС ПРОИГРАННЫХ РАЗ
                memState.repsPlayed = 0; 
                
                updateRepsLeft();
                if (memState.isActive && !memState.currentCountdownTime) {
                    const statusEl = document.getElementById('mem-status');
                    if (statusEl) statusEl.innerText = `${L.playing}${memState.repsLeft === Infinity ? '∞' : memState.repsLeft})`;
                }
            }
            saveState();
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'mem-interval') {
                if (e.target.value.trim() === '') {
                    e.target.value = '0';
                    memState.intervalMinutes = 0;
                    if (memState.countdownId && memState.pauseStartedAt) {
                        memState.targetTimestamp = memState.pauseStartedAt;
                    }
                    saveState();
                }
            }
            if (e.target.id === 'mem-reps') {
                if (e.target.value.trim() === '' || e.target.value === '0') {
                    e.target.type = 'text';
                    e.target.value = '∞';
                    memState.repsInput = '∞';
                    
                    memState.repsPlayed = 0;
                    updateRepsLeft();
                    saveState();
                }
            }
        });

        document.addEventListener('click', (e) => {
            const mainPlayBtn = e.target.closest('.play-main-button');
            if (mainPlayBtn && memState.lineA) {
                if (memState.ignoreNextPlayClick) {
                    memState.ignoreNextPlayClick = false;
                    return; 
                }
                
                if (memState.countdownId) {
                    clearInterval(memState.countdownId);
                    memState.countdownId = null;
                    memState.pauseStartedAt = null;
                    memState.targetTimestamp = null;
                    memState.currentCountdownTime = null;
                    updateABTimerDisplay();
                }

                if (window.ttsAPI && window.ttsAPI.getState().paused) {
                    armLoopInPlayer();
                }
            }

            if (e.target.closest('#mem-clear-btn')) {
                e.preventDefault();
                clearLineAction('ALL');
                return;
            }

            const closeBtn = e.target.closest('.close-tts-btn');
            if (closeBtn && memState.isActive) {
                stopCycle();
            }
            
            if (e.target.closest('#ab-loop-toggle-btn')) {
                e.preventDefault();
                const panel = document.getElementById('memorize-panel');
                if (!panel) return;
                
                panel.classList.toggle('visible');
                memState.isPanelOpen = panel.classList.contains('visible'); 
                
                updateABTimerDisplay(); 
                
                // --- УМНАЯ АВТОПОДСТАНОВКА (Только active-word) ---
                if (memState.isPanelOpen && !memState.lineA) {
                    const activeWord = document.querySelector('.active-word');

                    if (activeWord) {
                        const id = activeWord.id || activeWord.closest('[id]')?.id;
                        if (id) {
                            setLine('A', id, activeWord);
                            activatePickMode('B'); // Слово выделено -> просим Б
                        } else {
                            activatePickMode('A'); // Защита от ошибок
                        }
                    } else {
                        // Ничего не выделено -> просим выбрать А
                        activatePickMode('A');
                    }
                }
                return;
            }


            const btnA = e.target.closest('#mem-btn-a');
            const btnB = e.target.closest('#mem-btn-b');
            
            if (btnA || btnB) {
                if (memState.justCleared) return; 
                activatePickMode(btnA ? 'A' : 'B');
                return;
            }

            if (memState.pickMode) {
                const textEl = e.target.closest(".pli-lang, .rus-lang, .eng-lang, .tha-lang");
                if (textEl) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    
                    const id = textEl.id || textEl.closest('[id]')?.id;
                    if (id) {
                        setLine(memState.pickMode, id, textEl);
                        if (memState.pickMode === 'A' && !memState.lineB) activatePickMode('B');
                        else {
                            memState.pickMode = null;
                            updateUI();
                        }
                    }
                } else if (!e.target.closest('#memorize-panel') && !e.target.closest('.voice-player')) {
                    memState.pickMode = null;
                    updateUI();
                }
            }
        }, { capture: true });

        document.addEventListener('contextmenu', (e) => {
            const btn = e.target.closest('.mem-pick-btn');
            if (btn) {
                e.preventDefault();
                clearLineAction(btn.id === 'mem-btn-a' ? 'A' : 'B');
            }
        });

        let pressTimer;
        document.addEventListener('touchstart', (e) => {
            const btn = e.target.closest('.mem-pick-btn');
            if (btn) {
                pressTimer = setTimeout(() => {
                    memState.justCleared = true; 
                    clearLineAction(btn.id === 'mem-btn-a' ? 'A' : 'B');
                    if (navigator.vibrate) navigator.vibrate(50);
                    setTimeout(() => memState.justCleared = false, 500); 
                }, 600);
            }
        }, { passive: true });

        document.addEventListener('touchend', () => clearTimeout(pressTimer));
        document.addEventListener('touchmove', () => clearTimeout(pressTimer));

        document.addEventListener('tts-range-finished', handleRangeFinished);
    }

    function clearLineAction(line) {
        if (memState.isActive) stopCycle(); 
        
        if (line === 'ALL') {
            setLine('A', null, null);
            setLine('B', null, null);
            memState.pickMode = null;
            
            memState.isPanelOpen = false;
            const panel = document.getElementById('memorize-panel');
            if (panel) panel.classList.remove('visible');
            
        } else {
            setLine(line, null, null);
            if (memState.pickMode === line) memState.pickMode = null;
        }
        
        if (!memState.lineA && window.ttsAPI) {
            const state = window.ttsAPI.getState();
            state.startIndex = undefined;
            state.endIndex = undefined;
            memState.isActive = false;
        }
        
        updateUI();
        updateABTimerDisplay();
    }

    function activatePickMode(line) {
        if (memState.isActive) {
            stopCycle(); 
        } else if (window.ttsAPI) {
            const state = window.ttsAPI.getState();
            if (state.speaking && !state.paused) {
                memState.ignoreNextPlayClick = true; 
                const playBtn = document.querySelector('.play-main-button');
                if (playBtn) playBtn.click();
            }
        }
        memState.pickMode = line;
        updateUI();
    }

    function setLine(lineType, id, clickedEl) {
        let snippet = '';
        if (id) {
            if (clickedEl) {
                snippet = extractSnippet(clickedEl);
            } else {
                snippet = id.split(':').pop(); 
            }
        }
        
        if (lineType === 'A') { memState.lineA = id; memState.snippetA = snippet; }
        if (lineType === 'B') { memState.lineB = id; memState.snippetB = snippet; }
        
        if (memState.lineA && memState.lineB) {
            const elements = Array.from(document.querySelectorAll('[id]'));
            const idxA = elements.findIndex(el => el.id === memState.lineA);
            const idxB = elements.findIndex(el => el.id === memState.lineB);
            if (idxA !== -1 && idxB !== -1 && idxB < idxA) {
                [memState.lineA, memState.lineB] = [memState.lineB, memState.lineA];
                [memState.snippetA, memState.snippetB] = [memState.snippetB, memState.snippetA];
            }
        }
        saveState();
        highlightRange();
    }

    function highlightRange() {
        document.querySelectorAll('.memorize-highlight').forEach(el => el.classList.remove('memorize-highlight'));
        if (!memState.lineA) return;
        
        let targetB = memState.lineB || memState.lineA; 
        const elements = Array.from(document.querySelectorAll('.pli-lang, .rus-lang, .eng-lang, .tha-lang'));
        let inRange = false;
        
        elements.forEach(el => {
            const id = el.id || el.closest('[id]')?.id;
            if (id === memState.lineA) inRange = true;
            if (inRange) el.classList.add('memorize-highlight');
            if (id === targetB) inRange = false;
        });
    }

    function updateUI() {
        const abToggleBtn = document.getElementById('ab-loop-toggle-btn');
        if (abToggleBtn) {
            if (memState.lineA) abToggleBtn.classList.add('loop-active');
            else abToggleBtn.classList.remove('loop-active');
        }

        const btnA = document.getElementById('mem-btn-a');
        const btnB = document.getElementById('mem-btn-b');
        if (!btnA || !btnB) return;

        const dispA = memState.lineA ? (memState.snippetA || memState.lineA.split(':').pop()) : L.notSet;
        const dispB = memState.lineB ? (memState.snippetB || memState.lineB.split(':').pop()) : L.notSet;

        btnA.innerHTML = `<span>${dispA}</span>`;
        btnB.innerHTML = `<span>${dispB}</span>`;

        btnA.className = `mem-pick-btn ${memState.pickMode === 'A' ? 'picking' : ''} ${memState.lineA ? 'set' : ''}`;
        btnB.className = `mem-pick-btn ${memState.pickMode === 'B' ? 'picking' : ''} ${memState.lineB ? 'set' : ''}`;

        document.getElementById('mem-interval').value = memState.intervalMinutes;
        
        const repsInput = document.getElementById('mem-reps');
        repsInput.type = memState.repsInput === '∞' ? 'text' : 'number';
        repsInput.value = memState.repsInput;

        if (!memState.isActive) {
            const statusEl = document.getElementById('mem-status');
            if (statusEl) statusEl.innerText = '';
        }
        highlightRange();
    }

    function stopCycle() {
        memState.isActive = false;
        clearInterval(memState.countdownId);
        memState.countdownId = null;
        memState.pauseStartedAt = null;
        memState.targetTimestamp = null;
        
        if (window.ttsAPI) {
            const state = window.ttsAPI.getState();
            if (state.speaking && !state.paused) {
                memState.ignoreNextPlayClick = true; 
                const playBtn = document.querySelector('.play-main-button');
                if (playBtn) playBtn.click();
            } else {
                const imgs = document.querySelectorAll('.play-main-button img');
                imgs.forEach(img => img.src = '/assets/svg/play-grey.svg');
            }
        }
        
        memState.currentCountdownTime = null;
        updateABTimerDisplay();
        updateUI();
    }

    function playCurrentRange() {
        if (!memState.isActive || !window.ttsAPI) return;
        
        memState.currentCountdownTime = null; 
        updateABTimerDisplay();
        
        const targetB = memState.lineB || memState.lineA; 
        const statusEl = document.getElementById('mem-status');
        if (statusEl) statusEl.innerText = `${L.playing}${memState.repsLeft === Infinity ? '∞' : memState.repsLeft})`;
        
        const imgs = document.querySelectorAll('.play-main-button img');
        imgs.forEach(img => img.src = '/assets/svg/pause-grey.svg');
            
        window.ttsAPI.playRange(memState.lineA, targetB);
    }

    function handleRangeFinished() {
        if (!memState.isActive) return;

        memState.repsPlayed++;
        updateRepsLeft();

        if (memState.repsLeft <= 0) {
            const statusEl = document.getElementById('mem-status');
            if (statusEl) statusEl.innerText = '✅';
            stopCycle();
            return;
        }

        const msInterval = memState.intervalMinutes * 60 * 1000;
        
        if (msInterval <= 0) {
            playCurrentRange();
            return;
        }
        
        memState.pauseStartedAt = Date.now();
        memState.targetTimestamp = memState.pauseStartedAt + msInterval;
        
        if (window.ttsAPI.keepSilenceAlive) window.ttsAPI.keepSilenceAlive(true);

        if (memState.countdownId) clearInterval(memState.countdownId);

        const tick = () => {
            if (!memState.isActive) {
                clearInterval(memState.countdownId);
                return;
            }
            
            let timeLeft = memState.targetTimestamp - Date.now();
            
            if (timeLeft <= 0) {
                clearInterval(memState.countdownId);
                memState.countdownId = null;
                playCurrentRange();
                return;
            }
            
            const mins = Math.floor(timeLeft / 60000);
            const secs = Math.floor((timeLeft % 60000) / 1000);
            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            memState.currentCountdownTime = timeStr;
            const statusEl = document.getElementById('mem-status');
            if (statusEl) statusEl.innerText = `${L.paused}${timeStr}`;
            updateABTimerDisplay();
            
            const imgs = document.querySelectorAll('.play-main-button img');
            imgs.forEach(img => img.src = '/assets/svg/pause-grey.svg');
        };

        tick(); 
        memState.countdownId = setInterval(tick, 1000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
