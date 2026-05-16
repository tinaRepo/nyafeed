# Phase4-STEP13 投稿一覧取得 + フィード表示

## 概要

DBから投稿一覧を取得し、フロントのフィードに反映する。
ダミーデータから実データへの切り替えを行う。

## ディレクトリ構成（差分）

```
api/
└── src/
    └── routes/
        └── posts.ts      ← 変更（GET /posts 追加）

nyafeed/
├── src/
│   ├── lib/
│   │   └── api.ts        ← 変更（getPosts 追加）
│   └── hooks/
│       └── usePosts.ts   ← 新規作成（取得ロジック）
└── App.tsx               ← 変更（ダミーデータ → API取得）
```

---

## API側

### エンドポイント

```
GET /posts
→ 投稿一覧を最新順（created_at DESC）で返す
```

### レスポンス

```json
[
  {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "image_url": "https://pub-xxxxxxxx.r2.dev/images/...",
    "comment": "テスト投稿にゃ🐱",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 最新順ソート

```ts
import { desc } from 'drizzle-orm'

const allPosts = await db
  .select()
  .from(posts)
  .orderBy(desc(posts.createdAt))  // created_at の降順
```

---

## フロント側

### 設計

```
usePosts（カスタムフック）
├── cats: Cat[]              フィードデータ
├── fetchState               取得状態（idle/loading/error/success）
├── fetchPosts()             再取得（エラー時・更新時に使用）
└── addPost(cat)             新規投稿をフィード先頭に追加
        ↓
App.tsx で使用
├── 初回ローディング → スピナー表示
├── エラー          → エラーメッセージ＋再読み込みボタン
├── 投稿ゼロ        → 空状態メッセージ
└── 通常            → フィード表示
```

### フェッチ状態の型

```ts
type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success' }
```

### APIレスポンス → Cat型変換

```ts
const toCat = (p: PostResponse): Cat => ({
  id:        p.id,
  imageUrl:  p.image_url,
  comment:   p.comment,
  reactions: { ...DEFAULT_REACTIONS },
})
```

---

## 画面の状態一覧

| 状態               | 表示内容                                 |
| ------------------ | ---------------------------------------- |
| 初回ローディング中 | スピナー＋「投稿を読み込み中…」          |
| エラー（投稿ゼロ） | 😿 エラーメッセージ＋「再読み込み」ボタン |
| 投稿ゼロ（正常）   | 🐱 「まだ投稿がありません」               |
| 通常               | 投稿カードのフィード                     |

---

## 動作確認チェックリスト

| 確認項目     | 期待動作                                   |
| ------------ | ------------------------------------------ |
| 起動時       | スピナーが表示される                       |
| フィード表示 | DBの投稿が最新順で表示される               |
| 投稿後       | 新しい投稿がフィード先頭に追加される       |
| 投稿ゼロ時   | 「まだ投稿がありません」が表示される       |
| API停止時    | エラーメッセージ＋「再読み込み」ボタン表示 |
| `GET /posts` | 最新順の配列が返る                         |

## Expo Go（スマホ）での注意点

`api.ts` のURLをPCのIPアドレスに変更する。

```ts
// Before
export const API_BASE_URL = 'http://localhost:3000'

// After
export const API_BASE_URL = 'http://192.168.x.x:3000'
```
