
        // --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
        window.memoLoopsPlayed = 0;
        window.memoCountdownInterval = null; 
        window.memoLoopTimeout = null;
        window.memoRestartTimeout = null;
        window.isLoopingPause = false; 
        window.memoLang = window.location.pathname.includes('/r/') || window.location.pathname.includes('/ml/') || window.location.pathname.includes('/ru/') ? 'ru' : 'en';
        window.isMemoPlaying = false; 

        // --- ГЛОБАЛЬНАЯ БЛОКИРОВКА (ГЕЙТКИПЕР) ---
        window.memoNextAllowedTime = 0;
        window.memoLockId = 0;

        // --- ОБЩИЙ ТАЙМЕР СЕССИИ ---
        window.globalSessionSeconds = 0;
        window.globalSessionInterval = null;

        function startGlobalSessionTimer() {
            const timerEl = document.getElementById('global-session-timer');
            if (timerEl) timerEl.style.display = 'block';
            if (!window.globalSessionInterval) {
                window.globalSessionInterval = setInterval(() => {
                    window.globalSessionSeconds++;
                    let m = Math.floor(window.globalSessionSeconds / 60).toString().padStart(2, '0');
                    let s = (window.globalSessionSeconds % 60).toString().padStart(2, '0');
                    if (timerEl) timerEl.innerText = `${m}:${s}`;
                }, 1000);
            }
        }

        function pauseGlobalSessionTimer() {
            if (window.globalSessionInterval) {
                clearInterval(window.globalSessionInterval);
                window.globalSessionInterval = null;
            }
        }

        function resetGlobalSessionTimer() {
            pauseGlobalSessionTimer();
            window.globalSessionSeconds = 0;
            const timerEl = document.getElementById('global-session-timer');
            if (timerEl) {
                timerEl.innerText = '00:00';
                timerEl.style.display = 'none';
            }
        }
      
        document.addEventListener("DOMContentLoaded", () => {
            const favBtn = document.getElementById('toggle-memo-favorite');
            const shareBtn = document.getElementById('btn_share_memo');
            const iconOutline = document.getElementById('star-outline');
            const iconSolid = document.getElementById('star-solid');
            const textInput = document.getElementById("inputText");

            // Подбрасываем фейковый контейнер таймера в плеер
            setInterval(() => {
                const mainRow = document.querySelector('.tts-main-row');
                if (mainRow && !document.getElementById('dummy-ab-timer-container')) {
                    mainRow.style.position = 'relative'; 
                    const timerContainer = document.createElement('div');
                    timerContainer.id = 'dummy-ab-timer-container';
                    timerContainer.className = 'dummy-ab-timer-container';
                    timerContainer.innerHTML = `<span id="ab-btn-timer" style="font-variant-numeric: tabular-nums;"></span>`;
                    mainRow.appendChild(timerContainer);
                }
            }, 400);

            if (!textInput) return;

            function getMemoData() {
                const currentText = textInput.value.trim();
                if (!currentText) return null;

                const memoSlug = "memo_" + currentText.substring(0, 50).replace(/\s+/g, '_'); 
                const memoTitle = "📝 " + currentText.substring(0, 35) + (currentText.length > 35 ? "..." : "");

                const params = new URLSearchParams();
                params.set('text', currentText);
                params.set('delay', document.getElementById("ttsDelay").value || "0");
                params.set('end', document.getElementById("ttsEndDelay").value || "0");
                params.set('trn', document.getElementById("ttsIsTranslation").checked ? "1" : "0");
                params.set('loop', document.getElementById("ttsIsLoop").checked ? "1" : "0");
                params.set('lc', document.getElementById("ttsLoopCount").value || "∞");
                params.set('snd', document.getElementById("ttsSound").value || "none");
                params.set('sep', document.getElementById("ttsDelimiter").value || "");

                return {
                    slug: memoSlug,
                    id: memoSlug,
                    title: memoTitle,
                    path: window.location.pathname,
                    search: "?" + params.toString(), 
                    timestamp: Date.now()
                };
            }

            if (favBtn) {
                function updateMemoIcon() {
                    const data = getMemoData();
                    if (data && typeof isFavorite === 'function') {
                        const saved = isFavorite(data.slug);
                        iconOutline.style.display = saved ? 'none' : 'inline-block';
                        iconSolid.style.display = saved ? 'inline-block' : 'none';
                    } else {
                        iconOutline.style.display = 'inline-block';
                        iconSolid.style.display = 'none';
                    }
                }

                setTimeout(updateMemoIcon, 100);
                textInput.addEventListener('input', updateMemoIcon);

                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const positionData = getMemoData();
                    
                    if (positionData && typeof toggleFavoriteGlobal === 'function') {
                        toggleFavoriteGlobal(positionData);
                        updateMemoIcon();
                        if (typeof window.syncSmartIcons === 'function') setTimeout(window.syncSmartIcons, 50);
                    } else if (!positionData) {
                        alert(window.memoLang === 'ru' ? 'Сначала введите текст!' : 'Please enter text first!');
                    }
                });
            }

            if (shareBtn) {
                shareBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const data = getMemoData();
                    
                    if (!data) {
                        alert(window.memoLang === 'ru' ? 'Сначала введите текст!' : 'Please enter text first!');
                        return;
                    }

                    let origin = window.location.origin;
                    const fullUrl = origin + data.path + data.search;

                    navigator.clipboard.writeText(fullUrl).then(() => {
                        if (typeof showBubbleNotification === 'function') {
                            showBubbleNotification(window.memoLang === 'ru' ? 'Ссылка скопирована!' : 'Link copied!');
                        } else {
                            alert(window.memoLang === 'ru' ? 'Ссылка скопирована!' : 'Link copied!');
                        }
                    }).catch(err => console.error('Ошибка копирования: ', err));
                });
            }
        });

        if (window.MediaMetadata) {
            const OriginalMediaMetadata = window.MediaMetadata;
            window.MediaMetadata = function(options) {
                if (options && typeof options.title === 'string' && options.title.includes('memo_custom')) {
                    const textEl = document.getElementById("inputText");
                    if (textEl && textEl.value.trim()) {
                        let text = textEl.value.trim();
                        let titleWords = text.split(/\s+/).slice(0, 5).join(' ');
                        if (text.split(/\s+/).length > 5) titleWords += '...';
                        options.title = titleWords;
                    } else {
                        options.title = "Memorize Text";
                    }
                    options.artist = "Dhamma.gift Voice";
                }
                return new OriginalMediaMetadata(options);
            };
        }

        function expandWithAI() {
            const text = document.getElementById("inputText").value.trim();
            if (!text) return;
            const prompt = `You are an expert philologist and Tipitaka scholar. 
The provided text contains repetition markers (such as "...pe...", "...", "и т.д.", "etc."). 

1. Identify the language and the specific pattern. 
2. If it is a Dhamma sequence, recognize the list: 5 aggregates (khandhas), 6 sense bases (ayatanas), 12 links of dependent origination (nidanas), 18 elements (dhatu), 32 parts of the body, etc.
3. Expand the sequence to its full version, strictly following the grammatical rules, case endings, and style of the input language (Pali, Russian, English, etc.).
4. Replace the markers with the complete iterations.
Output ONLY the fully expanded text without any introductory or concluding remarks:

${text}`;

            const encodedPrompt = encodeURIComponent(prompt);
            const url = `https://chatgpt.com/?q=${encodedPrompt}`; 
            window.open(url, '_blank');
        }

        // --- ЛОКАЛИЗАЦИЯ ИНТЕРФЕЙСА ---
        window.addEventListener('DOMContentLoaded', () => {
            if (window.memoLang === 'ru') {
                document.title = 'Память и Медитация';
                document.getElementById('page_h1').innerHTML = 'Памятование и Медитация';
                document.getElementById('page_desc').innerHTML = 'Прилежно стремитесь к цели';
                document.getElementById('inputText').placeholder = 'Вставьте текст, который хотите выучить или изучить в медитации';
                document.getElementById('tts_header').innerText = 'Настройки голоса (TTS)';
                document.getElementById('tts_delim_label').innerText = 'Разделитель:';
                document.getElementById('tts_delay_label').innerText = 'Интервал (сек):';
                document.getElementById('tts_sound_label').innerText = 'Звук:';
                document.getElementById('tts_end_delay_label').innerText = 'Пауза в конце (сек):';
                document.getElementById('tts_sound_none').innerText = 'Ничего';
                document.getElementById('tts_trn_label').innerText = 'Перевод';
                document.getElementById('tts_loop_label').innerText = 'Цикл';
                document.getElementById('btn_play_toggle').title = 'Слушать'; 
                document.getElementById('btn_transform').innerText = 'Сжать';

                document.getElementById('btn_clear').title = 'Очистить';
                document.getElementById('btn_settings').title = 'Настройки';
                document.getElementById('btn_reset_tts').title = 'Сбросить настройки';
                document.getElementById('link_tips').childNodes[0].nodeValue = 'Советы и хитрости заучивания ';
                document.getElementById('link_open_any').innerText = 'Открыть любую Сутту в этом режиме';
                document.getElementById('lbl_result').innerText = 'Результат:';

                document.getElementById('edit_mode_label').innerText = 'Авто-курсор';
                document.getElementById('edit_mode_label').title = 'Ставит курсор в конец текущей строки при остановке плеера';

                document.getElementById('help_text_1').innerHTML = 'Сокращайте текст до первых букв для быстрого заучивания (напр. "Sabbaṁ taṁ" → "S t").<br><b>AI Expand</b> попросить ИИ заполнить сокращенный текст (peyyāla)<br><b>TTS:</b> <b>Разделитель</b> режет текст на части. <b>Пауза</b> добавляет задержку между ними. <b>Звук</b> играет в конце. <b>Цикл</b> повторяет.';
            }

            if ('mediaSession' in navigator) {
                const container = document.getElementById('tts-virtual-container');
                if (container) {
                    const observer = new MutationObserver((mutations) => {
                        for (let mutation of mutations) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                                const el = mutation.target;
                                if (el.classList.contains('active-word')) {
                                    const activeText = el.textContent.trim();
                                    if (activeText) {
                                        navigator.mediaSession.metadata = new MediaMetadata({
                                            title: activeText,
                                            artist: 'Dhamma.gift Voice',
                                            artwork: [{ src: '/assets/img/albumart-memo.png', sizes: '1024x1024', type: 'image/png' }]
                                        });
                                    }
                                }
                            }
                        }
                    });
                    observer.observe(container, { attributes: true, subtree: true, attributeFilter: ['class'] });
                }
            }
        });

        function toggleMemoTTS() {
            if (window.isMemoPlaying) {
                stopMemoTTS(true);
            } else {
                startMemoTTS();
            }
        }

        function updatePlayButtonState(playing) {
            window.isMemoPlaying = playing;
            const btn = document.getElementById('btn_play_toggle');
            const iconPlay = document.getElementById('icon_play');
            const iconStop = document.getElementById('icon_stop');
            
            // Управление глобальным таймером
            if (playing) {
                startGlobalSessionTimer();
            } else {
                pauseGlobalSessionTimer();
            }

            if (!btn) return;

            if (playing) {
                btn.classList.remove('btn-success');
                btn.classList.add('btn-danger');
                btn.title = window.memoLang === 'ru' ? 'Стоп' : 'Stop';
                iconPlay.style.display = 'none';
                iconStop.style.display = 'inline-block';
            } else {
                btn.classList.remove('btn-danger');
                btn.classList.add('btn-success');
                btn.title = window.memoLang === 'ru' ? 'Слушать' : 'Play';
                iconPlay.style.display = 'inline-block';
                iconStop.style.display = 'none';
            }
        }

        Object.defineProperty(window, 'TTS_SEGMENT_DELAY', {
            get: function() {
                const delayInput = document.getElementById("ttsDelay");
                if (!delayInput) return 0;
                
                const delaySec = parseFloat(delayInput.value) || 0;
                const delayMs = delaySec * 1000;
                
                if (delayMs > 0 && window.ttsAPI) {
                    const state = window.ttsAPI.getState();
                    const maxIndex = state.endIndex !== undefined ? state.endIndex : state.playlist.length - 1;
                    
                    if (state.speaking && !window.isLoopingPause && state.currentIndex <= maxIndex) {
                        setTimeout(() => window.startMemoVisualTimer(delayMs, ''), 0);
                    }
                }
                return delayMs;
            },
            set: function(val) {},
            configurable: true
        });

        // --- ПЕРЕХВАТЧИК АУДИО (СТРОГИЙ КОНТРОЛЬ ТАЙМЕРА) ---
        (function interceptAudioForTimer() {
            const iconSVG = `<img src="/assets/svg/hourglass-regular-full.svg" class="memo-timer-icon" alt="timer">`;
            const originalPlay = Audio.prototype.play;
            
            Audio.prototype.play = function() {
                if (this.src && this.src.includes('/assets/sounds/')) {
                    return originalPlay.apply(this, arguments);
                }

                const now = Date.now();
                if (window.memoNextAllowedTime > now) {
                    const waitTime = window.memoNextAllowedTime - now;
                    const lockIdAtRequest = window.memoLockId;
                    
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            if (lockIdAtRequest !== window.memoLockId) return resolve();
                            
                            const container = document.getElementById('dummy-ab-timer-container');
                            const span = document.getElementById('ab-btn-timer');
                            if (container && container.style.display !== 'none' && span) span.innerHTML = iconSVG;

                            if (window.memoCountdownInterval) clearInterval(window.memoCountdownInterval);
                            resolve(originalPlay.apply(this));
                        }, waitTime);
                    });
                }

                window.memoNextAllowedTime = 0;
                const container = document.getElementById('dummy-ab-timer-container');
                const span = document.getElementById('ab-btn-timer');
                if (container && container.style.display !== 'none' && span) span.innerHTML = iconSVG;

                if (window.memoCountdownInterval) clearInterval(window.memoCountdownInterval);
                
                return originalPlay.apply(this, arguments);
            };

            if (window.speechSynthesis) {
                const originalSpeak = window.speechSynthesis.speak;
                window.speechSynthesis.speak = function(utterance) {
                    const now = Date.now();
                    
                    const doSpeak = () => {
                        window.memoNextAllowedTime = 0;
                        utterance.addEventListener('start', () => {
                            const container = document.getElementById('dummy-ab-timer-container');
                            const span = document.getElementById('ab-btn-timer');
                            if (container && container.style.display !== 'none' && span) span.innerHTML = iconSVG;

                            if (window.memoCountdownInterval) clearInterval(window.memoCountdownInterval);
                        });
                        return originalSpeak.apply(window.speechSynthesis, [utterance]);
                    };

                    if (window.memoNextAllowedTime > now) {
                        const waitTime = window.memoNextAllowedTime - now;
                        const lockIdAtRequest = window.memoLockId;
                        
                        setTimeout(() => {
                            if (lockIdAtRequest !== window.memoLockId) return;
                            doSpeak();
                        }, waitTime);
                        return;
                    }

                    return doSpeak();
                };
            }
        })();

        // --- ВИЗУАЛЬНЫЙ ТАЙМЕР ---
        window.startMemoVisualTimer = function(durationMs, textPrefix) {
            if (window.memoCountdownInterval) clearInterval(window.memoCountdownInterval);
            const container = document.getElementById('dummy-ab-timer-container');
            const span = document.getElementById('ab-btn-timer');
            if (!container || !span) return;
            
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center'; 
            const endTime = Date.now() + durationMs;
            
            window.memoNextAllowedTime = endTime; 
            window.memoLockId++;
            
            const iconSVG = `<img src="/assets/svg/hourglass-regular-full.svg" class="memo-timer-icon spaced" alt="timer">`;
            
            const tick = () => {
                const left = endTime - Date.now();
                if (left <= 0) {
                    clearInterval(window.memoCountdownInterval);
                    span.innerHTML = `<img src="/assets/svg/hourglass-regular-full.svg" class="memo-timer-icon" alt="timer">`; 
                    return;
                }
                const mins = Math.floor(left / 60000);
                const secs = Math.floor((left % 60000) / 1000);
                const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
                
                const prefixHtml = textPrefix ? `<span style="margin-right:4px;">${textPrefix}</span>` : iconSVG;
                span.innerHTML = `${prefixHtml}<span style="font-variant-numeric: tabular-nums;">${timeStr}</span>`;
            };
            tick();
            window.memoCountdownInterval = setInterval(tick, 1000);
        };

        function преобразоватьТекст() {
            const входнойТекст = document.getElementById("inputText").value;
            localStorage.setItem("входнойТекст", входнойТекст);
            const строкиСКавычками = входнойТекст.split('\n');
            const строки = строкиСКавычками.map(строка => {
                return строка.replace(/"/g, ' " ').replace(/—/g, ' — ').replace(/“/g, ' “ ').replace(/‘/g, " ‘ ").replace(/\?/g, " ? ").replace(/,/g, " , ").replace(/\./g, " . ").replace(/:/g, " : ").replace(/;/g, " ; ");
            });
            const результат = строки.map(строка => {
                const слова = строка.split(/\s+/);
                const преобразованныеСлова = слова.map(word => {
                    const перваяБуква = word.match(/^\p{L}/u); 
                    if (перваяБуква) return перваяБуква[0];
                    else {
                        const диакритическиеСимволы = word.match(/^[\p{M}\p{N}\p{S}\p{P}]/u);
                        return диакритическиеСимволы ? диакритическиеСимволы[0] : '';
                    }
                });
                return преобразованныеСлова.join(' ').replace(/ \?/g, "?").replace(/“ /g, '').replace(/ ,/g, ", ").replace(/ \. /g, ". ").replace(/ : /g, ": ").replace(/ ; /g, "; ").replace(/ ‘ /g, " ");
            }).join('\n'); 
            document.getElementById("результат").innerText = результат;
            document.getElementById("result_header").style.display = 'flex';
            localStorage.setItem("результат", результат);
        }

        function очистить() {
            const msg = window.memoLang === 'ru' ? 'Это удалит текст. Уверены?' : 'This will erase the text. Sure?';
            if (confirm(msg)) {
                document.getElementById("inputText").value = "";
                document.getElementById("результат").innerText = "";
                document.getElementById("result_header").style.display = 'none';
                localStorage.removeItem("входнойТекст");
                localStorage.removeItem("результат");
                
                const url = new URL(window.location.href);
                if (url.searchParams.has('text')) {
                    url.searchParams.delete('text');
                    window.history.replaceState({}, document.title, url.toString());
                }
            }
        }

        function копироватьРезультат() {
            const результат = document.getElementById("результат").innerText;
            if (результат) {
                const tempTextarea = document.createElement("textarea");
                tempTextarea.value = результат;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand("copy");
                document.body.removeChild(tempTextarea);
                
                if (typeof showBubbleNotification === 'function') {
                    showBubbleNotification(window.memoLang === 'ru' ? 'Скопировано в буфер' : 'Copied to Clipboard');
                } else {
                    alert('Скопировано');
                }
            }
        }

        window.addEventListener('load', function() {
            const editToggle = document.getElementById('editModeToggle');
            if (editToggle) {
                const savedEditMode = localStorage.getItem('memo_edit_mode');
                editToggle.checked = savedEditMode === null ? true : (savedEditMode === 'true');
                editToggle.addEventListener('change', (e) => localStorage.setItem('memo_edit_mode', e.target.checked));
            }
 
            const urlParams = new URLSearchParams(window.location.search);
            const textParam = urlParams.get('text');
            
            if (textParam) {
                document.getElementById("inputText").value = textParam;
                localStorage.setItem("входнойТекст", textParam); 
                document.getElementById("результат").innerText = "";
                document.getElementById("result_header").style.display = 'none';
            } else {
                const входнойТекст = localStorage.getItem("входнойТекст");
                const результат = localStorage.getItem("результат");
                if (входнойТекст) document.getElementById("inputText").value = входнойТекст;
                if (результат && результат.trim() !== "") {
                    document.getElementById("результат").innerText = результат;
                    document.getElementById("result_header").style.display = 'none';
                }
            }

            if (urlParams.has('delay')) localStorage.setItem('memo_tts_delay', urlParams.get('delay'));
            if (urlParams.has('end'))   localStorage.setItem('memo_tts_end_delay', urlParams.get('end'));
            if (urlParams.has('trn'))   localStorage.setItem('memo_is_translation', urlParams.get('trn') === '1');
            if (urlParams.has('loop'))  localStorage.setItem('memo_tts_loop', urlParams.get('loop') === '1');
            if (urlParams.has('lc'))    localStorage.setItem('memo_tts_loop_count', urlParams.get('lc'));
            if (urlParams.has('snd'))   localStorage.setItem('memo_tts_sound', urlParams.get('snd'));
            if (urlParams.has('sep'))   {
                localStorage.setItem('memo_tts_delimiter', urlParams.get('sep'));
            }

            const isTrn = localStorage.getItem('memo_is_translation') === 'true';
            document.getElementById('ttsIsTranslation').checked = isTrn;

            const savedDelim = localStorage.getItem('memo_tts_delimiter');
            if (savedDelim !== null) document.getElementById('ttsDelimiter').value = savedDelim;

            const savedDelay = localStorage.getItem('memo_tts_delay');
            if (savedDelay !== null) document.getElementById('ttsDelay').value = savedDelay;

            const savedEndDelay = localStorage.getItem('memo_tts_end_delay');
            if (savedEndDelay !== null) document.getElementById('ttsEndDelay').value = savedEndDelay;

            const savedLoop = localStorage.getItem('memo_tts_loop');
            const isLoop = savedLoop === null ? true : savedLoop === 'true';
            document.getElementById('ttsIsLoop').checked = isLoop;

            const savedLoopCount = localStorage.getItem('memo_tts_loop_count');
            if (savedLoopCount) document.getElementById('ttsLoopCount').value = savedLoopCount;
            document.getElementById('ttsLoopCount').type = document.getElementById('ttsLoopCount').value === '∞' ? 'text' : 'number';

            const savedSound = localStorage.getItem('memo_tts_sound');
            if (savedSound) document.getElementById('ttsSound').value = savedSound;

            toggleLoopInputVisibility();
        });

        function toggleLoopInputVisibility() {
            const loopInput = document.getElementById('ttsLoopCount');
            const isLoopChecked = document.getElementById('ttsIsLoop').checked;
            loopInput.style.display = isLoopChecked ? 'inline-block' : 'none';
        }

        document.getElementById('ttsIsTranslation').addEventListener('change', (e) => {
            localStorage.setItem('memo_is_translation', e.target.checked);
            stopMemoTTS(true);
        });
        document.getElementById('ttsDelimiter').addEventListener('input', (e) => {
            localStorage.setItem('memo_tts_delimiter', e.target.value);
            stopMemoTTS(true);
        });
        document.getElementById('ttsSound').addEventListener('change', (e) => localStorage.setItem('memo_tts_sound', e.target.value));
        
        document.getElementById('ttsDelay').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            localStorage.setItem('memo_tts_delay', val);
            window.TTS_SEGMENT_DELAY = val * 1000;
        });

        document.getElementById('ttsEndDelay').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            localStorage.setItem('memo_tts_end_delay', val);
        });

        document.getElementById('ttsIsLoop').addEventListener('change', (e) => {
            localStorage.setItem('memo_tts_loop', e.target.checked);
            toggleLoopInputVisibility();
        });

        const loopCountInput = document.getElementById('ttsLoopCount');
        loopCountInput.addEventListener('focus', (e) => {
            if (e.target.value === '∞') { e.target.type = 'number'; e.target.value = '0'; }
        });
        loopCountInput.addEventListener('blur', (e) => {
            if (e.target.value === '0' || e.target.value.trim() === '') {
                e.target.type = 'text'; e.target.value = '∞';
            }
            localStorage.setItem('memo_tts_loop_count', e.target.value);
        });
        
        document.getElementById('inputText').addEventListener('input', () => stopMemoTTS(true));

        window.mockPaliJson = {};
        const originalFetch = window.fetch;
        window.fetch = async function() {
            const url = arguments[0];
            if (typeof url === 'string' && url.includes('memo_custom_rootd-pli-ms.json')) {
                return new Response(JSON.stringify(window.mockPaliJson), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return originalFetch.apply(this, arguments);
        };

        function convertPaliToDevanagari(str) {
            const mapping = {
                'kh':'ख', 'gh':'घ', 'ch':'छ', 'jh':'झ', 'ṭh':'ठ', 'ḍh':'ढ', 'th':'थ', 'dh':'ध', 'ph':'फ', 'bh':'भ',
                'k':'क', 'g':'ग', 'ṅ':'ङ', 'c':'च', 'j':'ज', 'ñ':'ञ', 'ṭ':'ट', 'ḍ':'ड', 'ṇ':'ण', 't':'त', 'd':'द', 'n':'न',
                'p':'प', 'b':'ब', 'm':'म', 'y':'य', 'r':'र', 'l':'ल', 'ḷ':'ळ', 'v':'व', 's':'स', 'h':'ह'
            };
            const vowels = {'a':'अ', 'ā':'आ', 'i':'इ', 'ī':'ई', 'u':'उ', 'ū':'ऊ', 'e':'ए', 'o':'ओ'};
            const marks = {'ā':'ा', 'i':'ि', 'ī':'ी', 'u':'ु', 'ū':'ू', 'e':'े', 'o':'ो'};
            
            let res = ""; 
            let i = 0; 
            str = str.toLowerCase();

            const isSingleWord = !str.trim().includes(' ');

            if (isSingleWord) {
                const cleanWord = str.replace(/[.,;!?\n|]/g, '').trim();
                const specialCases = {};
                
                if (specialCases[cleanWord]) {
                    let punctuation = str.match(/[.,;!?\n|]+$/);
                    return specialCases[cleanWord] + (punctuation ? punctuation[0] : '');
                }
            }

            while (i < str.length) {
                let char = str[i]; 
                let nextChar = str[i+1] || ''; 
                let doubleChar = char + nextChar;
                
                if (char === 'ṃ' || char === 'ṁ') { 
                    res += (isSingleWord && i === str.length - 1) ? 'ङ्' : 'ं'; 
                    i++; 
                    continue; 
                }
                
                if (vowels[char]) {
                    if (i === 0 || !str[i-1].match(/[a-zāīūṭḍṇṅñṃḷ]/i) || vowels[str[i-1]]) res += vowels[char];
                    i++; continue;
                }
                
                let cons = mapping[doubleChar] ? doubleChar : (mapping[char] ? char : null);
                if (cons) {
                    res += mapping[cons]; 
                    i += cons.length; 
                    let v = str[i];
                    if (vowels[v]) {
                        if (v !== 'a') res += marks[v];
                        i++;
                    } else if (!v || (v !== ' ' && !v.match(/[.,;!?\n]/))) {
                        res += '्'; 
                        if (v === 'h' && char === 'm') res += '\u200C';
                    }
                    continue;
                }
                res += char; 
                i++;
            }
            return res;
        }

        function startMemoTTS(isRestart = false) {
            if (isRestart !== true) {
                resetGlobalSessionTimer(); // Сбрасываем таймер только если это старт с нуля (не луп)
                window.memoLoopsPlayed = 0;
                if (window.memoCountdownInterval) clearInterval(window.memoCountdownInterval);
                const container = document.getElementById('dummy-ab-timer-container');
                if (container) {
                    container.style.display = 'none';
                    const span = document.getElementById('ab-btn-timer');
                    if (span) span.innerHTML = '';
                }
            }

            updatePlayButtonState(true); 

            const settingsPanel = document.getElementById('ttsSettings');
            if (settingsPanel && settingsPanel.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(settingsPanel);
                if (bsCollapse) bsCollapse.hide();
                else settingsPanel.classList.remove('show');
            }

            let text = document.getElementById("inputText").value.trim();
            if (!text) {
                updatePlayButtonState(false);
                return;
            }

            let detectedLang = 'en'; 
            if (/[а-яА-ЯёЁ]/.test(text)) detectedLang = 'ru'; 
            else if (/[\u0E00-\u0E7F]/.test(text)) detectedLang = 'th'; 
            window.memoDetectedTrnLang = detectedLang; 

            let rawDelim = document.getElementById("ttsDelimiter").value;
            rawDelim = rawDelim.replace(/\\n/g, '\n'); 
            
            let segments = [text];
            if (rawDelim) {
                for (let char of rawDelim) {
                    let newSegments = [];
                    for (let seg of segments) {
                        newSegments.push(...seg.split(char));
                    }
                    segments = newSegments;
                }
            }
            segments = segments.map(s => s.trim()).filter(s => s.length > 0);

            if (segments.length === 0) {
                updatePlayButtonState(false);
                return;
            }

            const delaySec = parseFloat(document.getElementById("ttsDelay").value) || 0;
            window.TTS_SEGMENT_DELAY = delaySec * 1000;
            window.isLoopingPause = false;

            const isTranslation = document.getElementById("ttsIsTranslation").checked;
            const container = document.getElementById("tts-virtual-container");
            
            if (!container.innerHTML) {
                container.style.display = 'block'; 
                window.mockPaliJson = {}; 
                
                segments.forEach((seg, index) => {
                    const id = `memo_custom:1.${index+1}`; 
                    const span = document.createElement('span');
                    span.id = id;
                    span.style.display = 'inline-block';
                    span.style.margin = '2px 4px';
                
                    span.style.maxWidth = '100%';
                    span.style.overflowWrap = 'break-word';
                    span.style.wordBreak = 'break-word';
                    
                    if (/[\u0900-\u097F]/.test(seg)) {
                        span.className = 'pli-lang';
                        span.textContent = seg;
                        window.mockPaliJson[id] = "“" + seg + "”"; 
                    } else {
                        if (isTranslation) {
                            if (detectedLang === 'ru') span.className = 'rus-lang';
                            else if (detectedLang === 'th') span.className = 'tha-lang';
                            else span.className = 'eng-lang';
                            span.textContent = seg;
                        } else {
                            span.className = 'pli-lang';
                            span.textContent = seg; 
                            window.mockPaliJson[id] = "“" + convertPaliToDevanagari(seg) + "”"; 
                        }
                    }
                    container.appendChild(span);
                });

                window.detectTranslationLang = function() {
                    return window.memoDetectedTrnLang;
                };
            }

            const targetMode = isTranslation ? 'trn' : 'pi';
            localStorage.setItem('tts_preferred_mode', targetMode);
            const modeSelect = document.getElementById('tts-mode-select');
            if (modeSelect) modeSelect.value = targetMode;

            document.getElementById('hiddenVoiceLink').click();

            document.body.style.transition = 'padding-bottom 0.4s ease';
            document.body.style.paddingBottom = '120px';

            setTimeout(() => {
                if (window.ttsAPI) {
                    const state = window.ttsAPI.getState();
                    if (state.playlist && state.playlist.length > 0) {
                        state.startIndex = 0;
                        state.endIndex = state.playlist.length - 1;
                    }
                }
            }, 400);
        }

        function stopMemoTTS(fullReset = true) {
            const editToggle = document.getElementById('editModeToggle');
            const ta = document.getElementById("inputText");
            
            if (editToggle && editToggle.checked && window.ttsAPI && ta) {
                const state = window.ttsAPI.getState();
                const spans = document.getElementById("tts-virtual-container")?.children;
                
                if (state && spans && spans[state.currentIndex]) {
                    let searchPos = 0;
                    for (let i = 0; i <= state.currentIndex; i++) {
                        const txt = spans[i].textContent;
                        searchPos = ta.value.indexOf(txt, searchPos);
                        
                        if (i === state.currentIndex && searchPos !== -1) {
                            let lineEnd = ta.value.indexOf('\n', searchPos);
                            if (lineEnd === -1) lineEnd = ta.value.length; 
                            
                            ta.focus();
                            ta.setSelectionRange(lineEnd, lineEnd);
                            ta.scrollTop = ta.scrollHeight * (lineEnd / ta.value.length);
                        }
                        if (searchPos !== -1) searchPos += txt.length;
                    }
                }
            }
      
            updatePlayButtonState(false); 
            window.isLoopingPause = false;
            
            window.memoNextAllowedTime = 0; 
            window.memoLockId++;
            
            if (window.ttsAPI) {
                if (fullReset) {
                    const state = window.ttsAPI.getState();
                    state.currentIndex = 0; 
                }
                if (window.ttsAPI.stop) window.ttsAPI.stop();
            }
            
            if (fullReset) {
                resetGlobalSessionTimer(); // Сброс глобального таймера на полное выключение

                const container = document.getElementById("tts-virtual-container");
                if (container) {
                    container.innerHTML = '';
                    container.style.display = 'none';
                }
                document.body.style.paddingBottom = '0px';

                localStorage.removeItem('tts_last_slug');
                localStorage.removeItem('tts_last_index');
            }

            if (window.memoCountdownInterval) {
                clearInterval(window.memoCountdownInterval);
                window.memoCountdownInterval = null;
            }
            if (window.memoLoopTimeout) clearTimeout(window.memoLoopTimeout);
            if (window.memoRestartTimeout) clearTimeout(window.memoRestartTimeout);

            const container = document.getElementById('dummy-ab-timer-container');
            if (container) {
                container.style.display = 'none';
                const span = document.getElementById('ab-btn-timer');
                if (span) span.innerHTML = '';
            }
            
            window.memoLoopsPlayed = 0;
        }

        document.addEventListener('tts-range-finished', () => {
            const isLoop = document.getElementById('ttsIsLoop').checked;
            const soundChoice = document.getElementById('ttsSound').value;
            const delaySec = parseFloat(document.getElementById("ttsDelay").value) || 0;
            const intervalMs = delaySec * 1000;
            
            window.isLoopingPause = true;

            if (!isLoop) {
                if (soundChoice !== 'none') new Audio(`/assets/sounds/${soundChoice}`).play().catch(e => console.warn(e));
                stopMemoTTS(true); 
                return;
            }

            const loopInput = document.getElementById('ttsLoopCount').value;
            let targetLoops = loopInput === '∞' ? Infinity : parseInt(loopInput) || Infinity;
            window.memoLoopsPlayed = (window.memoLoopsPlayed || 0) + 1;

            if (window.memoLoopsPlayed >= targetLoops) {
                if (soundChoice !== 'none') new Audio(`/assets/sounds/${soundChoice}`).play().catch(e => console.warn(e));
                stopMemoTTS(true); 
                return;
            }

            const endDelaySec = parseFloat(document.getElementById("ttsEndDelay").value) || 10;
            const FIXED_PAUSE = endDelaySec * 1000; 
            const lCycle = window.memoLang === 'ru' ? 'Конец.' : 'End.';

            const startLoopRestart = () => {
                if (FIXED_PAUSE > 0) {
                    window.startMemoVisualTimer(FIXED_PAUSE, lCycle);
                    window.memoRestartTimeout = setTimeout(() => {
                        const container = document.getElementById("tts-virtual-container");
                        if (container.style.display === 'none' || !document.getElementById('ttsIsLoop').checked) return;
                        startMemoTTS(true); 
                    }, FIXED_PAUSE);
                } else {
                    const container = document.getElementById("tts-virtual-container");
                    if (container.style.display === 'none' || !document.getElementById('ttsIsLoop').checked) return;
                    startMemoTTS(true); 
                }
            };

            if (intervalMs > 0) {
                window.startMemoVisualTimer(intervalMs, '');
                window.memoLoopTimeout = setTimeout(() => {
                    if (soundChoice !== 'none') new Audio(`/assets/sounds/${soundChoice}`).play().catch(e => console.warn(e));
                    startLoopRestart();
                }, intervalMs);
            } else {
                if (soundChoice !== 'none') new Audio(`/assets/sounds/${soundChoice}`).play().catch(e => console.warn(e));
                startLoopRestart();
            }
        });

        document.addEventListener('click', (e) => {
            window.memoNextAllowedTime = 0; 
            window.memoLockId++; 
            
            const playMainBtn = e.target.closest('.play-main-button');
            const closeMainBtn = e.target.closest('.close-tts-btn');
            
            if (playMainBtn) {
                if (window.ttsAPI) {
                    const state = window.ttsAPI.getState();
                    if (!state.speaking) {
                        const container = document.getElementById("tts-virtual-container");
                        if (!container || container.innerHTML === '') {
                            e.preventDefault();
                            e.stopPropagation();
                            startMemoTTS();
                        } else {
                            startGlobalSessionTimer(); // Резюмируем таймер, если сняли с паузы через плавающую панель
                        }
                    } else {
                        pauseGlobalSessionTimer(); // Ставим таймер на паузу, если нажали паузу в панели
                    }
                }
            }
            if (closeMainBtn) {
                stopMemoTTS(false); 
                resetGlobalSessionTimer(); // Сбрасываем таймер если плеер был полностью закрыт крестиком
            }
        }, { capture: true }); 

        window.resetTTSSettings = function() {
            const msg = window.memoLang === 'ru' ? 'Сбросить настройки TTS по умолчанию?' : 'Reset TTS settings to default?';
            if (confirm(msg)) {
                document.getElementById('ttsDelimiter').value = '.,:;?!—…|\\n';
                document.getElementById('ttsDelay').value = '2';
                document.getElementById('ttsSound').value = 'tick.mp3';
                document.getElementById('ttsEndDelay').value = '10';
                document.getElementById('ttsIsTranslation').checked = false;
                document.getElementById('ttsIsLoop').checked = true;
                
                const loopInput = document.getElementById('ttsLoopCount');
                loopInput.type = 'text';
                loopInput.value = '∞';
                
                toggleLoopInputVisibility();
                
                localStorage.removeItem('memo_tts_delimiter');
                localStorage.removeItem('memo_tts_delay');
                localStorage.removeItem('memo_tts_sound');
                localStorage.removeItem('memo_tts_end_delay');
                localStorage.setItem('memo_is_translation', 'false'); 
                localStorage.removeItem('memo_tts_loop');
                localStorage.removeItem('memo_tts_loop_count');
                
                window.TTS_SEGMENT_DELAY = 2000;
                stopMemoTTS(true);
            }
        };