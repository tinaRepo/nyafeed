# Phase6-STEP18 画像サイズ最適化 + 表示比率調整

## 概要

猫画像の表示崩れを防ぎフィード体験を改善する。
投稿時に画像をリサイズ・WebP変換し、一覧は正方形・詳細は元比率で表示する。

## ディレクトリ構成（差分）

```
catroom/
└── src/
    ├── components/
    │   ├── CatCard.tsx        ← 変更（正方形表示・詳細モーダル追加・fallback追加）
    │   └── CatImageDetail.tsx ← 新規作成（詳細表示モーダル）
    ├── lib/
    │   └── imageOptimizer.ts  ← 新規作成（webp変換・リサイズ）
    └── components/
        └── PostModal.tsx      ← 変更（最適化処理を追加）
```

---

## 画像仕様

| 場面     | 比率          | 処理                                   |
| -------- | ------------- | -------------------------------------- |
| 投稿推奨 | 4:5           | ガイドとして案内のみ                   |
| 内部保存 | 元比率維持    | 長辺1080px・WebP変換                   |
| 一覧表示 | 1:1（正方形） | `aspectRatio: 1` + `resizeMode: cover` |
| 詳細表示 | 元比率維持    | `resizeMode: contain` で全体表示       |

## 最適化の効果

| 項目     | Before             | After                 |
| -------- | ------------------ | --------------------- |
| 形式     | jpeg / png / gif   | webp                  |
| 長辺     | 元サイズ（数MB可） | 最大1080px            |
| 容量     | 大きい             | 約50〜70%削減（目安） |
| 一覧崩れ | 比率バラバラ       | 正方形で統一          |

---

## imageOptimizer.ts

Web環境のみ Canvas API でリサイズ + WebP変換を行う。
ネイティブ（Expo Go）では変換せずそのまま使用する。

```ts
// Platform分岐
if (Platform.OS !== 'web') {
  // ネイティブはそのまま返す
  return { uri, mimeType, fileName }
}
// Web: Canvas でリサイズ + WebP変換
```

失敗時はオリジナル画像で続行（サイレントフォールバック）。

---

## CatCard の変更点

```ts
// 正方形表示
image: {
  width: '100%',
  aspectRatio: 1,         // 1:1 に統一
  backgroundColor: '#f0f0f0',
}

// 画像ロード失敗時のfallback
<Image onError={() => setImgError(true)} />
{imgError && <View>🐱 画像を表示できません</View>}
```

---

## ピンチズーム（コメントアウト中）

詳細表示モーダルにピンチズーム機能を実装したが、
`react-native-gesture-handler` + `react-native-reanimated` が
**Expo Go環境では動作しない**ためコメントアウトしている。

詳細は残課題ファイル（`TODO_pinch-zoom.md`）を参照。

---

## 動作確認チェックリスト

| 確認項目   | 期待動作                                           |
| ---------- | -------------------------------------------------- |
| 一覧表示   | すべての画像が正方形で揃う                         |
| 画像タップ | 詳細モーダルが開く                                 |
| 詳細表示   | 元比率で全体が表示される                           |
| 背景タップ | 詳細モーダルが閉じる                               |
| 画像最適化 | 投稿時にWebP変換・1080px以内にリサイズ             |
| fallback   | 画像ロード失敗時に「🐱 画像を表示できません」が表示 |
| UI崩れなし | フィード全体のレイアウトが崩れない                 |
