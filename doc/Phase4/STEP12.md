# Phase4-STEP12 フロント→API投稿連携

## 概要

STEP11（R2アップロード）とSTEP10（POST /posts）を繋ぎ、
画像アップロード → API送信 → DB保存 → フィード反映 までを一連のフローとして完成させる。

## ディレクトリ構成（差分）

```
catroom/
└── src/
    ├── lib/
    │   ├── api.ts        ← 新規作成（API呼び出し・URL一元管理）
    │   └── upload.ts     ← 変更（API_BASE_URLをapi.tsから参照）
    └── components/
        └── PostModal.tsx ← 変更（API送信ステップを追加）
```

## 変更ポイント

### API_BASE_URLの一元管理

STEP11では `upload.ts` に直接URLを書いていたが、
`api.ts` に移動してURLを1箇所で管理するよう変更。

```ts
// catroom/src/lib/api.ts
// PC確認時   → 'http://localhost:3000'
// Expo Go時  → 'http://192.168.x.x:3000'
export const API_BASE_URL = 'http://localhost:3000'
```

### 投稿ステップの状態管理

ローディング状態をステップごとに細分化して
ユーザーに進捗を伝える。

```ts
type UploadState =
  | { status: 'idle' }
  | { status: 'uploading_image' }  // R2アップロード中
  | { status: 'saving_post' }      // API保存中
  | { status: 'error'; message: string }
```

---

## 投稿フロー

```
① 「投稿する」押下
        ↓
② 画像あり → R2アップロード（uploading_image）
   画像なし → ダミーURL使用
        ↓
③ POST /posts に image_url + comment を送信（saving_post）
        ↓
④ DBに保存される
        ↓
⑤ レスポンスから Cat を生成 → フィード先頭に追加
        ↓
⑥ モーダルを閉じる
```

## APIリクエスト・レスポンス

### リクエスト

```
POST http://localhost:3000/posts
Content-Type: application/json

{
  "image_url": "https://pub-xxxxxxxx.r2.dev/images/2024/01/uuid.jpg",
  "comment": "テスト投稿にゃ🐱"
}
```

### レスポンス（成功時 201）

```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "image_url": "https://pub-xxxxxxxx.r2.dev/images/2024/01/uuid.jpg",
  "comment": "テスト投稿にゃ🐱",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 動作確認チェックリスト

| 確認項目        | 期待動作                              |
| --------------- | ------------------------------------- |
| 画像付き投稿    | R2保存 → DB保存 → フィード反映        |
| 画像なし投稿    | ダミー画像 → DB保存 → フィード反映    |
| Neon コンソール | `posts` テーブルに行が追加されている  |
| ローディング①   | 「画像をアップロード中…」スピナー表示 |
| ローディング②   | 「投稿を保存中…」スピナー表示         |
| エラー時        | メッセージ＋「再試行」が表示される    |
| モーダルclose   | ローディング中は閉じられない          |

## Expo Go（スマホ）での注意点

`api.ts` のURLをPCのIPアドレスに変更する。

```ts
// Before
export const API_BASE_URL = 'http://localhost:3000'

// After
export const API_BASE_URL = 'http://192.168.x.x:3000'
```

IPアドレス確認方法：

```cmd
# Windows
ipconfig → 「IPv4 アドレス」を使用

# Mac
ifconfig | grep inet
```
