# Phase6-STEP19 空状態UI + SEO/アイコン改善

## 概要

初回訪問時の体験改善・SEO対応・アイコン設定を行う。
投稿0件時の空状態UIを改善し、サービス感を高める。

## ディレクトリ構成（差分）

```
nyafeed/
├── app.json                   ← 変更（PWA・SEO・OGP設定）
├── assets/
│   ├── favicon.png            ← 差し替え（猫アイコン）
│   ├── icon.png               ← 差し替え（猫アイコン）
│   ├── adaptive-icon.png      ← 差し替え（猫アイコン）
│   └── splash-icon.png        ← 差し替え（猫アイコン）
└── src/
    └── components/
        └── EmptyFeed.tsx      ← 新規作成（空状態UI）
App.tsx                        ← 変更（EmptyFeed に差し替え）
```

---

## アイコン

### 生成サイズ一覧

| ファイル名 | サイズ | 用途 |
|-----------|--------|------|
| `favicon.png` | 32×32px | ブラウザタブアイコン |
| `favicon-64.png` | 64×64px | ブラウザタブアイコン（高解像度） |
| `icon.png` | 1024×1024px | アプリアイコン（iOS/Android） |
| `adaptive-icon.png` | 1024×1024px | Androidアダプティブアイコン |
| `splash-icon.png` | 512×512px | スプラッシュ画面 |
| `apple-touch-icon.png` | 180×180px | iOS ホーム画面追加時 |
| `icon-192.png` | 192×192px | PWAアイコン（小） |
| `icon-512.png` | 512×512px | PWAアイコン（大） |

### 配置先

```
nyafeed/assets/ に配置（名前そのままでOK）
├── favicon.png          ← favicon.png をそのまま配置
├── icon.png             ← icon.png をそのまま配置
├── adaptive-icon.png    ← adaptive-icon.png をそのまま配置
└── splash-icon.png      ← splash-icon.png をそのまま配置

PWA用（web公開時に使用・今は保管）
├── apple-touch-icon.png
├── icon-192.png
└── icon-512.png
```

`favicon-64.png` は `favicon.png` と重複するため、
32px版か64px版どちらかを選んで `favicon.png` として配置する。

---

## SEO / OGP 設定（app.json）

```json
"web": {
  "favicon": "./assets/favicon.png",
  "name": "NyaFeed",
  "shortName": "NyaFeed",
  "description": "かわいい猫だけが流れる匿名掲示板",
  "themeColor": "#f97316",
  "backgroundColor": "#ffffff",
  "display": "standalone",
  "lang": "ja",
  "meta": {
    "og:title": "NyaFeed｜猫だけ匿名掲示板",
    "og:description": "かわいい猫だけが流れる匿名掲示板",
    "og:type": "website",
    "twitter:card": "summary_large_image",
    "theme-color": "#f97316",
    "description": "かわいい猫だけが流れる匿名掲示板"
  }
}
```

---

## 空状態UI（EmptyFeed）

投稿0件時に表示するコンポーネント。

```
表示内容：
・猫アイコン（🐱）＋ 吹き出し「にゃ？」
・「まだ猫がいないにゃ…」タイトル
・説明文
・「🐾 最初の猫を投稿する」ボタン
・「匿名で投稿できます」サブテキスト
```

### App.tsx での差し替え

```tsx
// 投稿ゼロ時
if (fetchState.status === 'success' && cats.length === 0) {
  return <EmptyFeed onPost={() => setModalVisible(true)} />
}
```

---

## OGP確認方法

```
https://ogp.bber.jp
または
https://developers.facebook.com/tools/debug/
→ URLを入力してタイトル・説明・画像を確認
```

---

## 動作確認チェックリスト

| 確認項目 | 期待動作 |
|---------|---------|
| 投稿0件時 | 猫アイコン＋メッセージ＋投稿ボタンが表示される |
| 空状態の投稿ボタン | タップでモーダルが開く |
| favicon | ブラウザのタブに猫アイコンが表示される |
| ページタイトル | タブに「NyaFeed」が表示される |
| theme-color | モバイルブラウザのアドレスバーがオレンジになる |
| OGP | タイトル・説明が正しく表示される |
