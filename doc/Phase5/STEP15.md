# Phase5-STEP15 リアクション機能実装

## 概要

猫投稿へ5種類のリアクションを送信できる機能を実装。
楽観更新によりUIの即時反映とDB保存を両立する。

## ディレクトリ構成（差分）

```
api/
└── src/
    ├── db/
    │   └── schema/
    │       └── reactions.ts    ← 新規作成
    ├── routes/
    │   ├── posts.ts            ← 変更（リアクション数を集計して返す）
    │   └── reactions.ts        ← 新規作成（add/remove対応）
    └── index.ts                ← 変更（ルート登録）

catroom/
└── src/
    ├── lib/
    │   └── api.ts              ← 変更（addReaction追加・PostResponseにreactions追加）
    ├── hooks/
    │   └── usePosts.ts         ← 変更（toCatでreactions反映）
    └── components/
        ├── CatCard.tsx         ← 変更（updatedReactions対応）
        └── ReactionBar.tsx     ← 変更（API送信・action送信）
```

---

## DBスキーマ

### `post_reactions` テーブル

| カラム          | 型          | 制約                            |
| --------------- | ----------- | ------------------------------- |
| `id`            | uuid        | PRIMARY KEY / defaultRandom     |
| `post_id`       | uuid        | NOT NULL / 外部キー（posts.id） |
| `reaction_type` | varchar(20) | NOT NULL                        |
| `created_at`    | timestamp   | NOT NULL / defaultNow           |

### マイグレーション実行

```bash
cd api
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 外部キー設定

```ts
postId: uuid('post_id').notNull().references(() => posts.id, {
  onDelete: 'cascade',  // 投稿削除時にリアクションも自動削除
})
```

---

## リアクション種類

| key        | 表示         |
| ---------- | ------------ |
| `cute`     | 😍 かわいい！ |
| `sniff`    | 😤 吸いたい   |
| `healing`  | 🌿 癒される〜 |
| `pressure` | 😤 圧がすごい |
| `fluffy`   | 🐾 もふもふ   |

---

## API

### エンドポイント

```
POST /posts/:id/reactions
Content-Type: application/json

{
  "reaction_type": "cute",
  "action": "add"     // "add" または "remove"
}
```

### レスポンス

```json
{
  "success": true,
  "action": "add",
  "reactions": {
    "cute": 5,
    "sniff": 2,
    "healing": 3,
    "pressure": 1,
    "fluffy": 4
  }
}
```

### add / remove 設計

```
action: "add"    → INSERT（1件追加）
action: "remove" → DELETE（1件削除）
```

**フロント側の `activeKeys` でトグル状態を判定し、actionをAPIに送信する。**
API側はadd/removeを受け取るだけで判定しない。

#### この設計にした理由

API側でトグル判定（既存あり→DELETE）にすると、
他ユーザーのリアクションを誤って削除してしまう問題が発生する。

```
// NG: API側でトグル判定（認証なし構成では危険）
既存あり → DELETE  ← 他ユーザー分まで消えてしまう

// OK: フロントからactionを送信
action: "add"    → INSERT
action: "remove" → DELETE（1件のみ）
```

### GET /posts へのリアクション数追加

初期表示でDB上のカウントを反映するため、
`GET /posts` のレスポンスにリアクション数を含める。

```json
{
  "id": "xxxx",
  "image_url": "https://...",
  "comment": "テスト投稿",
  "created_at": "2024-01-01T00:00:00.000Z",
  "reactions": {
    "cute": 5,
    "sniff": 2,
    "healing": 3,
    "pressure": 1,
    "fluffy": 4
  }
}
```

---

## フロント設計

### 楽観更新フロー

```
ボタン押下
    ↓
① activeKeys の状態から action（add/remove）を決定
    ↓
② UIを即時更新（楽観更新）← ユーザーに即反映
    ↓
③ API送信（action付き）
    ↓
成功 → APIレスポンスの正確な数値でstateを上書き
失敗 → UIを元に戻す + コンソール警告
```

### onReact のシグネチャ

```ts
// updatedReactions あり → APIレスポンスで上書き
// updatedReactions なし → 楽観更新（±1）
onReact: (key: ReactionKey, updatedReactions?: Reactions) => void
```

### 二重送信防止

```ts
const [sendingKeys, setSendingKeys] = useState<Set<ReactionKey>>(new Set())

// 送信中のキーは押下を無視
if (sendingKeys.has(key)) return
```

---

## バグ修正記録

### 1→2のカウントが0になる問題

**原因:** API側でトグル判定していたため、他ユーザーのリアクションも含めて
DELETEされていた。

**修正:** フロントから `action` を送信してAPI側はadd/removeのみ実行する方式に変更。

### -1表示になる問題

**原因:** 楽観更新とAPIレスポンスの数値がズレていた。

**修正:** APIレスポンスの正確な数値で `setReactions` を上書きするよう変更。

---

## 既知の仕様上の制約

### 画面更新でリアクション状態がリセットされる

**原因:** 認証機能がないため「誰が押したか」を判別できない。
押下状態はローカルstateのみで管理しており、画面更新でリセットされる。

**現状の動作:**

| 操作       | 結果                                      |
| ---------- | ----------------------------------------- |
| 押下       | DBに保存される ✅                          |
| 再押下     | DBから削除される ✅                        |
| 画面更新後 | 再度押せる状態になる（DBには追加される）⚠️ |

**将来の対応候補:**

| 方法       | 内容                                          |
| ---------- | --------------------------------------------- |
| 認証導入   | ユーザーIDでリアクション管理（別Phase）       |
| デバイスID | `AsyncStorage` でデバイス単位管理（簡易対応） |
| セッション | ブラウザの `SessionStorage` で管理（Web限定） |

**現時点では認証導入までの妥協点として許容する。**

---

## 動作確認チェックリスト

| 確認項目   | 期待動作                                         |
| ---------- | ------------------------------------------------ |
| 初期表示   | DBのリアクション数が表示される                   |
| 0→1        | 即時カウント増加・オレンジ色に変化               |
| 1→2        | 正しくカウントアップされる                       |
| 再押下     | カウント減少・`post_reactions` から1件削除される |
| 送信中     | ボタンが半透明になり連打防止                     |
| 送信失敗   | カウントが元に戻る                               |
| 画面更新後 | DBのカウント数が正しく反映される                 |

## トラブルシュート

### `eq()` に `string | undefined` を渡せないエラー

`c.req.param('id')` の戻り値が `string | undefined` のため存在確認を挟む。

```ts
const postId = c.req.param('id')

if (!postId) {
  return c.json({ error: 'post id is required' }, 400)
}
// 以降は string として確定
```
