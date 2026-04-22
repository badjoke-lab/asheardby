# AsHeardBy 実装者向けコンポーネント一覧 v0.2

## 全体方針
MVPは **1ページ完結**。
構成は大きく

- App shell
- Source selection
- Filter selection
- Compare / player
- Visualization
- Notes
- About

に分ける。

ただし現時点では、理想構成へ一気に分割するのではなく、**1枚実装から安全に分離していく段階的リファクタ** を採っている。

---

## 現在の実装スナップショット

現在 repo 上で使っている主なファイルは次のとおり。

### ページ / 接続
- `src/App.tsx`
  - 最小の state と panel 接続

### レイアウト系
- `src/layout.tsx`
  - `HeroSection`
  - `AboutPanel`

### パネル系
- `src/sourcePanel.tsx`
  - `SourcePanel`
- `src/modesPanel.tsx`
  - `ModesPanel`
- `src/notesPanel.tsx`
  - `NotesPanel`
- `src/comparePanel.tsx`
  - `ComparePanel`

### ロジック / hook
- `src/appHooks.ts`
  - `useCompareStatusText`
  - `useUploadedAudio`
  - `useResolvedSource`
- `src/audio.ts`
  - built-in sample generation
  - Web Audio engine
  - `useAudioEngine`
- `src/visualization.ts`
  - band comparison model

### データ
- `src/data.ts`
  - UI text
  - built-in source definitions
  - filter definitions
- `src/types.ts`
  - shared types

この状態をベースに、必要に応じてさらに細分化していく。

---

## 1. ルート構成

### `App`
ページ全体の最上位。

**責務**
- 全体状態の保持
- panel への props 配布
- audio / visualization / docs 方針との接続

現段階では `App.tsx` は **ページコンテナ** に近い役割まで整理されている。

---

## 2. レイアウト系

### `HeroSection`
ページ上部の導入。

### `AboutPanel`
最下部の補足説明。

今はこの2つを `src/layout.tsx` にまとめている。

---

## 3. Source 系

### `SourcePanel`
音源選択セクション全体。

**責務**
- built-in sample の表示
- upload input の表示
- 選択状態の見た目

将来的には必要に応じて
- `BuiltInSampleCard`
- `UploadAudioPanel`
- `UploadStatusMessage`
などへ再分割できるが、現時点では1ファイルで十分。

---

## 4. Filter 系

### `ModesPanel`
Condition / Animal Reference の2グループをまとめるパネル。

**責務**
- グループ見出し
- フィルタカード一覧
- 選択状態の見た目

将来的には `FilterCard` などへ分けてもよいが、今は1ファイルで扱う。

---

## 5. Compare / Player 系

### `ComparePanel`
中央カラム全体。

**責務**
- source / mode / view summary
- Original / Filtered toggle
- Play / Pause / Restart
- audio element
- status text
- band comparison
- context visual
- error display

現在の `ComparePanel` は、将来分けうる
- audio controls
- compare toggle
- visualization
- context visual
をまとめて持つ **MVP中心パネル** である。

---

## 6. Notes 系

### `NotesPanel`
選択中フィルタの詳細説明全体。

**責務**
- フィルタ名
- 短い要約
- 5項目説明
- 小さい disclaimer

---

## 7. app-level hooks

### `useCompareStatusText`
`engineState / playbackState / error` から compare status 文言を返す。

### `useUploadedAudio`
uploaded object URL の生成・保持・cleanup を担当する。

### `useResolvedSource`
現在の source state から、実際に使う `{ title, url }` を返す。

---

## 8. audio / visualization

### `src/audio.ts`
**責務**
- built-in sample のブラウザ内生成
- Web Audio graph の構築
- compare mode 適用
- filter 適用
- `useAudioEngine` 提供

### `src/visualization.ts`
**責務**
- filter ごとの帯域表示モデル返却

現在の可視化は **説明図としての model** であり、厳密な計測器UIではない。

---

## 9. 今後の分割候補

現時点で直ちに必要ではないが、次の粒度へ分ける余地はある。

- `comparePanel.tsx` →
  - `AudioControls`
  - `CompareModeToggle`
  - `BandComparisonChart`
  - `ContextVisual`
- `sourcePanel.tsx` →
  - `BuiltInSampleCard`
  - `UploadAudioPanel`
- `modesPanel.tsx` →
  - `FilterCard`
- `audio.ts` →
  - sample generation
  - engine
  - hook

ただし今は **動くMVPを保ちながらの最小整理** を優先する。
