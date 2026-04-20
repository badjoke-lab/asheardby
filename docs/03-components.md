# AsHeardBy 実装者向けコンポーネント一覧 v0.1

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

---

## 1. ルート構成

### `AsHeardByPage`
ページ全体の最上位。

**責務**
- 全体状態の保持
- セクションへの props 配布
- 初期選択の設定
- コンポーネント間イベントの仲介

---

## 2. レイアウト系

### `AppShell`
全体の余白、背景、最大幅、百科事典風の骨格を担当。

### `HeroSection`
ページ上部の導入。

### `MainThreeColumnLayout`
デスクトップ時の3カラム骨格。

### `MobileStackLayout`
モバイル時の縦1列骨格。

---

## 3. Source 系

### `SourceSection`
音源選択セクション全体。

### `BuiltInSampleList`
内蔵サンプル一覧。

### `BuiltInSampleCard`
1サンプル分のカード。

### `UploadAudioPanel`
アップロード領域。

### `UploadStatusMessage`
アップロード状態文だけを表示。

---

## 4. Filter 系

### `FilterSection`
フィルタ一覧セクション全体。

### `FilterGroup`
カテゴリ単位のグループ。

### `FilterCardList`
カード一覧。

### `FilterCard`
1フィルタ分のカード。

### `FilterBadge`
Condition / Animal の小ラベル。

---

## 5. Compare / Player 系

### `CompareSection`
聞き比べセクション全体。

### `AudioPlayerPanel`
プレイヤー本体を包む。

### `AudioControls`
再生系ボタン群。

### `CompareModeToggle`
Original / Filtered 切替。

### `CurrentSelectionSummary`
現在の source / mode を短く表示。

### `HeadphonesNotice`
左右差などのときだけ表示。

### `MomentaryOriginalButton`
任意追加。押している間だけ Original に戻す。

---

## 6. Visualization 系

### `VisualizationSection`
可視化セクション全体。

### `BandComparisonChart`
主表示。全フィルタ共通。

### `ContextVisualSlot`
補助表示の差し替え領域。

### `LeftRightBalanceMeter`
左右差用。

### `NoiseOverlapVisual`
雑音下 / 耳鳴り / 輪郭低下用。

### `RangeDifferenceIndicator`
Animal 用。Human range / Extended high / Extended low を見せる。

---

## 7. Notes 系

### `FilterNotesSection`
選択中フィルタの詳細説明全体。

### `FilterNotesHeader`
フィルタ名と短い要約。

### `FilterNotesList`
5項目説明一覧。

### `FilterNoteItem`
1項目分。

### `SmallDisclaimer`
reference / approximation / 個人差あり などの小注記。

---

## 8. About 系

### `AboutSection`
最下部の補足説明。

### `FooterNote`
短いフッター注記。

---

## 9. 状態表示系

### `StatusMessage`
汎用状態文。

### `ErrorNotice`
エラー表示専用。

### `InlineHint`
補助ヒント専用。

---

## 10. データ / ロジック分離向け

### `audioSources.ts`
- built-in sample 定義
- source metadata

### `filters.ts`
- filter 定義
- group type
- short text
- 5項目説明
- visualization type
- headphones recommendation

### `uiText.ts`
- Hero 文言
- 共通ラベル
- 状態文言

### `audioEngine.ts`
- audio source load
- original / filtered 切替
- filter apply

### `visualizationModel.ts`
- 5帯域の表示値生成
- context visual type 判定
