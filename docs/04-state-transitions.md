# AsHeardBy 状態遷移表 v0.1

## 1. 全体の主要 state

### A. Source state
- `builtInSelected`
- `uploadSelected`
- `sourceLoading`
- `sourceReady`
- `sourceError`

### B. Filter state
- `filterSelected`
- `filterSwitching`

### C. Compare state
- `original`
- `filtered`

### D. Playback state
- `idle`
- `playing`
- `paused`
- `ended`

### E. Audio engine state
- `uninitialized`
- `preparing`
- `ready`
- `failed`

---

## 2. 初期状態

| 項目 | 初期値 |
|---|---|
| selectedSourceType | built-in |
| selectedBuiltInSampleId | voice |
| selectedFilterId | high-frequency-loss |
| compareMode | filtered |
| audioStatus | uninitialized |
| playbackStatus | idle |

---

## 3. Source 状態遷移

### 3-1. built-in 選択

| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| any source state | `SELECT_BUILTIN_SOURCE(sampleId)` | `sourceLoading` | sampleId を保存、音源ロード開始 |
| `sourceLoading` | `SOURCE_LOAD_SUCCESS` | `sourceReady` | source 情報更新 |
| `sourceLoading` | `SOURCE_LOAD_ERROR` | `sourceError` | error message 設定 |

### 3-2. upload 選択

| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| any source state | `UPLOAD_FILE(file)` | `sourceLoading` | file 検証、object URL 作成 |
| `sourceLoading` | `UPLOAD_VALIDATION_FAIL` | `sourceError` | unsupported / failed 表示 |
| `sourceLoading` | `SOURCE_LOAD_SUCCESS` | `sourceReady` | upload source を active にする |

---

## 4. Filter 状態遷移

| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| `filterSelected` | `SELECT_FILTER(filterId)` | `filterSwitching` | selectedFilterId 更新開始 |
| `filterSwitching` | `FILTER_APPLY_SUCCESS` | `filterSelected` | audioEngine に filter 反映、notes 更新 |
| `filterSwitching` | `FILTER_APPLY_FAIL` | `filterSelected` | fallback / error notice |

---

## 5. Compare モード遷移

| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| `original` | `SET_COMPARE_MODE(filtered)` | `filtered` | filtered chain を有効化 |
| `filtered` | `SET_COMPARE_MODE(original)` | `original` | original chain を有効化 |

### 任意追加
| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| `filtered` | `PRESS_HOLD_ORIGINAL` | `original` | 押下中のみ original |
| `original` | `RELEASE_HOLD_ORIGINAL` | `filtered` | filtered に戻す |

---

## 6. Playback 状態遷移

| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| `idle` | `PRESS_PLAY` | `playing` | 再生開始 |
| `paused` | `PRESS_PLAY` | `playing` | 再開 |
| `playing` | `PRESS_PAUSE` | `paused` | 一時停止 |
| `playing` | `AUDIO_ENDED` | `ended` | 再生終了 |
| `ended` | `PRESS_PLAY` | `playing` | 先頭または現位置から再生 |
| `playing / paused / ended` | `PRESS_RESTART` | `playing` | 先頭に戻して再生 |

---

## 7. Audio engine 状態遷移

| 現在 | イベント | 次 | 処理 |
|---|---|---|---|
| `uninitialized` | `INIT_AUDIO_ENGINE` | `preparing` | engine 準備開始 |
| `preparing` | `ENGINE_READY` | `ready` | 再生可能化 |
| `preparing` | `ENGINE_FAIL` | `failed` | エラー表示 |
| `failed` | `RETRY_INIT_AUDIO_ENGINE` | `preparing` | 再試行 |

---

## 8. ページ全体の代表フロー

### フローA: 初回訪問
1. ページ表示
2. default source = voice
3. default filter = high-frequency-loss
4. compareMode = filtered
5. user presses play
6. audio engine 初期化
7. source ready
8. playback starts

### フローB: フィルタ変更
1. user selects new filter
2. selectedFilterId 更新
3. band comparison 更新
4. context visual 差し替え
5. notes 更新
6. 再生中ならそのまま反映

### フローC: source 変更
1. user selects another built-in sample or uploads file
2. source loading
3. source ready
4. current compareMode / current filter を維持
5. 再生中なら再生継続 or 再ロード後再開
