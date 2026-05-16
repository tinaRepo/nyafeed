# Phase6-STEP17 Pull To Refresh + 更新ボタン

## 概要

ユーザーが任意のタイミングで投稿一覧を更新できるようにする。
Pull To Refresh（引っ張って更新）とヘッダーの更新ボタンの2つの手段を提供する。

## ディレクトリ構成（差分）

```
nyafeed/
├── src/
│   └── components/
│       └── Header.tsx   ← 変更（更新ボタン追加）
└── App.tsx              ← 変更（Pull To Refresh追加）
```

---

## 実装内容

### 更新ボタン（Header）

ヘッダー右側に更新ボタンを追加。
更新中はスピナーに切り替わり、二重取得を防止する。

```tsx
// 更新中はスピナー表示・ボタン無効化
{isRefreshing ? (
  <ActivityIndicator size="small" color="#f97316" />
) : (
  <Text style={styles.refreshBtnText}>↺</Text>
)}
```

### Pull To Refresh（ScrollView）

React Nativeの `RefreshControl` を使用。
`ScrollView` の `refreshControl` プロパティに渡すだけで実装できる。

```tsx
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor="#f97316"      // iOS: インジケーターの色
      colors={['#f97316']}     // Android: インジケーターの色
    />
  }
>
```

### 更新処理の共通化

更新ボタン・Pull To Refresh・投稿後リロードで同じ処理を共有する。

```
handleRefresh（共通処理）
├── 更新ボタン押下    → handleRefresh()
├── Pull To Refresh  → handleRefresh()
└── 投稿成功後       → refreshPosts() + scrollTo + Toast（STEP16）
```

`refreshPosts` はSTEP16で実装済みのため追加ロジックなし。

---

## Headerコンポーネントの変更点

### 追加したProps

```ts
type Props = {
  onPost: () => void;
  onRefresh: () => void;       // ← 追加
  isRefreshing?: boolean;      // ← 追加（スピナー切り替え用）
};
```

---

## 動作確認チェックリスト

| 確認項目        | 期待動作                                         |
| --------------- | ------------------------------------------------ |
| 更新ボタン押下  | ヘッダーのボタンがスピナーに変わる               |
| 更新ボタン押下  | フィードが最新データで更新される                 |
| Pull To Refresh | フィード最上部で下に引っ張るとインジケーター表示 |
| Pull To Refresh | 離すと再取得・フィード更新される                 |
| 更新中          | 更新ボタンが押せない（二重取得防止）             |
| インジケーター  | オレンジ色で表示される（iOS・Android共通）       |
| 投稿後          | STEP16のリロード処理と競合しない                 |
| UI崩れなし      | 更新前後でレイアウトが崩れない                   |
