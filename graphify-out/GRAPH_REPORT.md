# Graph Report - /var/www/html/read  (2026-08-05)

## Corpus Check
- 55 files · ~148,731 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 996 nodes · 1791 edges · 56 communities (54 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.59)
- Token cost: 69,657 input · 0 output

## Community Hubs (Navigation)
- Voice TTS Player (voice.js)
- Voice TTS Player (voice11.06.26 variant)
- Voice TTS Player (voiceBak variant)
- Voice TTS Player (voiceWakeScreenAlways variant)
- Voice TTS Player (voiceNew variant)
- Voice TTS Player (voicePausePlayingFix variant)
- Voice TTS Player (voiceBak12022026 variant)
- Voice TTS Player (voiceBakBeforeLegacy16022026 variant)
- Voice TTS Player (voiceOldWithSpan variant)
- Voice TTS Player (voiceDone2speeds2selects variant)
- Common Reader Utilities (common.js)
- Voice TTS Player (voiceWithSliderBrokenLinkRow variant)
- Voice TTS Player (voiceBak03022026 variant)
- Voice Memorization Mode (voice-memInpineCss variant)
- Sutta Reader Core (memorizeBak variant)
- Voice Memorization Mode (voice-mem.js)
- Sutta Reader Core (devanagariBak variant)
- Sutta Reader Core (multilangBak variant)
- Common Reader Utilities (commonScrollUpDown variant)
- Sutta Reader Core (devanagari.js)
- Sutta Reader Core (indexBSbak variant)
- Sutta Reader Core (indexWithoutOnClick variant)
- Sutta Reader Core (reader-rus-translationsBak variant)
- Sutta Reader Core (var-rus-new variant)
- Sutta Reader Core (indexBB variant)
- Sutta Reader Core (memorize.js)
- Sutta Reader Core (index.js)
- Sutta Reader Core (index-api.js)
- Sutta Reader Core (indexBS.js)
- Sutta Reader Core (multilang.js)
- Sutta Reader Core (reader-rus-translations.js)
- Sutta Reader Core (reader-th.js)
- Sutta Reader Core (ai.js)
- Sutta Reader Core (multilang-th.js)
- Sutta Reader Core (multilangfullrev.js)
- Sutta Reader Core (multilangrev.js)
- Sutta Reader Core (multitran.js)
- Sutta Reader Core (multitran-en.js)
- Reader Page UI - Toolbar & Search (index.html / reader-rus.html)
- Reader Page UI - Settings & Help Modals
- Path Resolution API (get_paths.php)
- Path Resolution API (get_paths2.php)

## God Nodes (most connected - your core abstractions)
1. `playCurrentSegment()` - 17 edges
2. `playCurrentSegment()` - 17 edges
3. `playCurrentSegment()` - 16 edges
4. `playCurrentSegment()` - 15 edges
5. `playCurrentSegment()` - 15 edges
6. `playCurrentSegment()` - 14 edges
7. `setupListeners()` - 13 edges
8. `handleSuttaClick()` - 13 edges
9. `handleSuttaClick()` - 13 edges
10. `playCurrentSegment()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Dhamma.gift Read — English Reader Page` --semantically_similar_to--> `Dhamma.gift Read — Russian Reader Page`  [INFERRED] [semantically similar]
  index.html → reader-rus.html
- `getPunctuationSetting()` --semantically_similar_to--> `getPunctuationSetting()`  [INFERRED] [semantically similar]
  index.html → reader-rus.html
- `Search/Toolbar Form (#form)` --semantically_similar_to--> `Search/Toolbar Form (#form)`  [INFERRED] [semantically similar]
  index.html → reader-rus.html
- `Form Submit Handler (builds sutta from query)` --semantically_similar_to--> `Form Submit Handler (builds sutta from query)`  [INFERRED] [semantically similar]
  index.html → reader-rus.html
- `Sutta Content Container (#sutta)` --semantically_similar_to--> `Sutta Content Container (#sutta)`  [INFERRED] [semantically similar]
  index.html → reader-rus.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Smart Panel Proxy Controls (English)** — index_smart_panel, index_form, index_settings_modal, index_help_modal [INFERRED 0.85]
- **Smart Panel Proxy Controls (Russian)** — reader_rus_smart_panel, reader_rus_form, reader_rus_settings_modal, reader_rus_help_modal [INFERRED 0.85]
- **English/Russian Reader Localization Pair** — index_page, reader_rus_page, index_language_switch, reader_rus_language_switch [EXTRACTED 1.00]

## Communities (56 total, 2 thin omitted)

### Community 0 - "Voice TTS Player (voice.js)"
Cohesion: 0.11
Nodes (45): cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectDynamicLang(), detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData() (+37 more)

### Community 1 - "Voice TTS Player (voice11.06.26 variant)"
Cohesion: 0.11
Nodes (44): cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData(), getContextInfo() (+36 more)

### Community 2 - "Voice TTS Player (voiceBak variant)"
Cohesion: 0.11
Nodes (44): cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData(), getContextInfo() (+36 more)

### Community 3 - "Voice TTS Player (voiceWakeScreenAlways variant)"
Cohesion: 0.11
Nodes (44): cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData(), getContextInfo() (+36 more)

### Community 4 - "Voice TTS Player (voiceNew variant)"
Cohesion: 0.11
Nodes (42): cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData(), getContextInfo() (+34 more)

### Community 5 - "Voice TTS Player (voicePausePlayingFix variant)"
Cohesion: 0.11
Nodes (40): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData() (+32 more)

### Community 6 - "Voice TTS Player (voiceBak12022026 variant)"
Cohesion: 0.11
Nodes (38): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData() (+30 more)

### Community 7 - "Voice TTS Player (voiceBakBeforeLegacy16022026 variant)"
Cohesion: 0.11
Nodes (38): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), DEFAULT_PALI_CONFIG, detectTranslationLang(), fetchGoogleAudio(), fetchSegmentsData() (+30 more)

### Community 8 - "Voice TTS Player (voiceOldWithSpan variant)"
Cohesion: 0.14
Nodes (29): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), closeAllPlayers(), createPlaylistFromData(), detectTranslationLang(), fetchSegmentsData(), getElementId() (+21 more)

### Community 9 - "Voice TTS Player (voiceDone2speeds2selects variant)"
Cohesion: 0.17
Nodes (24): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), detectTranslationLang(), fetchSegmentsData(), getElementId(), getRateForLang() (+16 more)

### Community 10 - "Common Reader Utilities (common.js)"
Cohesion: 0.11
Nodes (15): buildFullTOC(), buildThirdPartyLinksHTML(), checkTriggerZone(), findItiVagga(), getBjtUrl(), getDprUrl(), getTOCNodes(), getTopVisibleSegment() (+7 more)

### Community 11 - "Voice TTS Player (voiceWithSliderBrokenLinkRow variant)"
Cohesion: 0.20
Nodes (21): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), detectTranslationLang(), fetchSegmentsData(), getElementId(), getRateForLang() (+13 more)

### Community 12 - "Voice TTS Player (voiceBak03022026 variant)"
Cohesion: 0.21
Nodes (20): addTtsButton(), cleanTextForTTS(), clearTtsStorage(), createPlaylistFromData(), detectTranslationLang(), fetchSegmentsData(), getElementId(), handleSuttaClick() (+12 more)

### Community 13 - "Voice Memorization Mode (voice-memInpineCss variant)"
Cohesion: 0.26
Nodes (20): activatePickMode(), armLoopInPlayer(), clearLineAction(), extractSnippet(), handleRangeFinished(), highlightRange(), init(), injectStyles() (+12 more)

### Community 14 - "Sutta Reader Core (memorizeBak variant)"
Cohesion: 0.11
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 15 - "Voice Memorization Mode (voice-mem.js)"
Cohesion: 0.28
Nodes (19): activatePickMode(), armLoopInPlayer(), clearLineAction(), extractSnippet(), handleRangeFinished(), highlightRange(), init(), injectUI() (+11 more)

### Community 16 - "Sutta Reader Core (devanagariBak variant)"
Cohesion: 0.12
Nodes (16): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+8 more)

### Community 17 - "Sutta Reader Core (multilangBak variant)"
Cohesion: 0.13
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 18 - "Common Reader Utilities (commonScrollUpDown variant)"
Cohesion: 0.15
Nodes (13): buildFullTOC(), checkTriggerZone(), findItiVagga(), generateThirdPartyLinks(), getBjtUrl(), getDprUrl(), getTopVisibleSegment(), isManualAction() (+5 more)

### Community 19 - "Sutta Reader Core (devanagari.js)"
Cohesion: 0.12
Nodes (14): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+6 more)

### Community 20 - "Sutta Reader Core (indexBSbak variant)"
Cohesion: 0.16
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 21 - "Sutta Reader Core (indexWithoutOnClick variant)"
Cohesion: 0.16
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 22 - "Sutta Reader Core (reader-rus-translationsBak variant)"
Cohesion: 0.16
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 23 - "Sutta Reader Core (var-rus-new variant)"
Cohesion: 0.16
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 24 - "Sutta Reader Core (indexBB variant)"
Cohesion: 0.14
Nodes (17): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+9 more)

### Community 25 - "Sutta Reader Core (memorize.js)"
Cohesion: 0.12
Nodes (15): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+7 more)

### Community 26 - "Sutta Reader Core (index.js)"
Cohesion: 0.14
Nodes (15): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+7 more)

### Community 27 - "Sutta Reader Core (index-api.js)"
Cohesion: 0.17
Nodes (16): abbreviations, bodyTag, buildSutta(), citation, fdgButton, form, homeButton, next (+8 more)

### Community 28 - "Sutta Reader Core (indexBS.js)"
Cohesion: 0.14
Nodes (15): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+7 more)

### Community 29 - "Sutta Reader Core (multilang.js)"
Cohesion: 0.14
Nodes (15): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+7 more)

### Community 30 - "Sutta Reader Core (reader-rus-translations.js)"
Cohesion: 0.14
Nodes (15): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+7 more)

### Community 31 - "Sutta Reader Core (reader-th.js)"
Cohesion: 0.14
Nodes (14): bodyTag, citation, fdgButton, form, homeButton, next, next2, previous (+6 more)

### Community 32 - "Sutta Reader Core (ai.js)"
Cohesion: 0.15
Nodes (14): abbreviations, bodyTag, citation, form, homeButton, next, next2, previous (+6 more)

### Community 33 - "Sutta Reader Core (multilang-th.js)"
Cohesion: 0.15
Nodes (14): bodyTag, citation, fdgButton, form, homeButton, next, next2, previous (+6 more)

### Community 34 - "Sutta Reader Core (multilangfullrev.js)"
Cohesion: 0.14
Nodes (14): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+6 more)

### Community 35 - "Sutta Reader Core (multilangrev.js)"
Cohesion: 0.14
Nodes (14): abbreviations, bodyTag, citation, fdgButton, form, homeButton, next, next2 (+6 more)

### Community 36 - "Sutta Reader Core (multitran.js)"
Cohesion: 0.15
Nodes (14): abbreviations, bodyTag, citation, form, homeButton, next, next2, previous (+6 more)

### Community 37 - "Sutta Reader Core (multitran-en.js)"
Cohesion: 0.15
Nodes (14): abbreviations, bodyTag, citation, form, homeButton, next, next2, previous (+6 more)

### Community 38 - "Reader Page UI - Toolbar & Search (index.html / reader-rus.html)"
Cohesion: 0.20
Nodes (14): Search/Toolbar Form (#form), Form Submit Handler (builds sutta from query), getPunctuationSetting(), Language Switch Link (en → ru), Dhamma.gift Read — English Reader Page, Smart Quick-Access Panel (#smart-panel / #smart-gear-container), Sutta Content Container (#sutta), Search/Toolbar Form (#form) (+6 more)

### Community 39 - "Reader Page UI - Settings & Help Modals"
Cohesion: 0.47
Nodes (6): Help / Hotkeys Modal (#paliLookupInfo), Reading Mode Options (Standard, Multi Trn, Memorization, Devanagari, Multi Lang, Thai, Reverse, Full Reverse), Settings Modal (#settings), Help / Hotkeys Modal (#paliLookupInfo), Reading Mode Options (Стандартный, Мульти Перевод, Для запоминания, Devanagari, Мульти Язык, Thai, Реверс, Полный Реверс), Settings Modal (#settings)

## Knowledge Gaps
- **296 isolated node(s):** `suttaArea`, `homeButton`, `bodyTag`, `previous`, `next` (+291 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `suttaArea`, `homeButton`, `bodyTag` to the rest of the system?**
  _296 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Voice TTS Player (voice.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.10726950354609929 - nodes in this community are weakly interconnected._
- **Should `Voice TTS Player (voice11.06.26 variant)` be split into smaller, more focused modules?**
  _Cohesion score 0.11100832562442182 - nodes in this community are weakly interconnected._
- **Should `Voice TTS Player (voiceBak variant)` be split into smaller, more focused modules?**
  _Cohesion score 0.10823311748381129 - nodes in this community are weakly interconnected._
- **Should `Voice TTS Player (voiceWakeScreenAlways variant)` be split into smaller, more focused modules?**
  _Cohesion score 0.11008325624421832 - nodes in this community are weakly interconnected._
- **Should `Voice TTS Player (voiceNew variant)` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Voice TTS Player (voicePausePlayingFix variant)` be split into smaller, more focused modules?**
  _Cohesion score 0.10676532769556026 - nodes in this community are weakly interconnected._