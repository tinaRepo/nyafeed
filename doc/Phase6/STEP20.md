# Phase6-STEP20 リアクションマスタDB化

## 概要

ソースコードに直接定義されていたリアクション一覧をDB管理へ移行。
コード修正・デプロイなしでリアクションの追加・削除・順序変更が可能になる。

## ディレクトリ構成（差分）

```
api/
└── src/
    ├── db/
    │   └── schema/
    │       └── reactionMaster.ts  ← 新規作成
    ├── routes/
    │   ├── reactionMaster.ts      ← 新規作成
    │   └── reactions.ts           ← 変更（バリデーションをDB参照に変更）
    └── index.ts                   ← 変更（ルート登録）

nyafeed/
└── src/
    ├── lib/
    │   └── api.ts                 ← 変更（getReactionMaster追加）
    ├── hooks/
    │   └── useReactionMaster.ts   ← 新規作成
    └── components/
        ├── ReactionBar.tsx        ← 変更（動的表示に変更）
        └── CatCard.tsx            ← 変更（reactionMasterをpropsで受け取る）
App.tsx                            ← 変更（useReactionMasterを追加）
```

---

## DBスキーマ

### `reaction_master` テーブル

| カラム       | 型          | 説明                                 |
| ------------ | ----------- | ------------------------------------ |
| `id`         | uuid        | PRIMARY KEY                          |
| `name`       | varchar(20) | リアクションキー（'cute'等）・UNIQUE |
| `emoji`      | varchar(10) | 絵文字                               |
| `label`      | varchar(20) | 表示ラベル                           |
| `sort_order` | integer     | 表示順                               |
| `is_active`  | boolean     | 表示/非表示フラグ                    |
| `created_at` | timestamp   | 作成日時                             |

### マイグレーション実行

```bash
cd api
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## API

### エンドポイント

| メソッド | パス                     | 説明                                       |
| -------- | ------------------------ | ------------------------------------------ |
| GET      | `/reactions/master`      | アクティブなリアクション一覧を表示順で返す |
| POST     | `/reactions/master/seed` | 初期データ投入（開発用・1回のみ）          |

### レスポンス（GET /reactions/master）

```json
[
  { "id": "xxxx", "name": "cute",     "emoji": "😍", "label": "かわいい！" },
  { "id": "xxxx", "name": "sniff",    "emoji": "😤", "label": "吸いたい"   },
  { "id": "xxxx", "name": "healing",  "emoji": "🌿", "label": "癒される〜" },
  { "id": "xxxx", "name": "pressure", "emoji": "😤", "label": "圧がすごい" },
  { "id": "xxxx", "name": "fluffy",   "emoji": "🐾", "label": "もふもふ"   }
]
```

---

## 初期データ投入

マイグレーション後に1回だけ実行する。

```bash
# Windows（curl）
curl -X POST http://localhost:3000/reactions/master/seed

# Mac
curl -X POST http://localhost:3000/reactions/master/seed
```

```json
// 成功時
{ "message": "seeded", "count": 5 }

// 2回目以降（冪等性あり）
{ "message": "already seeded", "count": 5 }
```

---

## フロント設計

### データフロー

```
App.tsx
└── useReactionMaster()     DBからリアクション一覧を取得
        ↓ reactionMaster[] をpropsで渡す
CatCard.tsx
        ↓ reactionMaster[] をpropsで渡す
ReactionBar.tsx
└── reactionMaster.map()    動的にボタンを生成
```

### Before / After

```ts
// Before（ハードコード）
const REACTION_CONFIG = [
  { key: 'cute', emoji: '😍', label: 'かわいい！' },
  ...
]

// After（DB取得・動的生成）
const { reactionMaster } = useReactionMaster()
reactionMaster.map(({ name, emoji, label }) => ...)
```

---

## DBでリアクションを管理する方法

Neon コンソール → SQL Editor で操作するだけでフロントに反映される。

```sql
-- リアクション追加
INSERT INTO reaction_master (name, emoji, label, sort_order, is_active)
VALUES ('heart', '❤️', 'すき', 6, true);

-- リアクション非表示（削除せず無効化）
UPDATE reaction_master SET is_active = false WHERE name = 'pressure';

-- 表示順変更
UPDATE reaction_master SET sort_order = 1 WHERE name = 'fluffy';
```

---

## 動作確認チェックリスト

| 確認項目                | 期待動作                             |
| ----------------------- | ------------------------------------ |
| `GET /reactions/master` | 5件のリアクションが返る              |
| フィード表示            | DBのリアクションでボタンが生成される |
| `is_active = false`     | ボタンが非表示になる                 |
| `sort_order` 変更       | ボタンの並び順が変わる               |
| 新規リアクション追加    | デプロイなしでボタンが追加される     |
| 既存リアクション機能    | カウント増減・DB保存が正常動作する   |

## Gitコミット

```bash
# API
cd api
git add .
git commit -m "feat: add reaction_master table and GET /reactions/master"

# フロント
cd nyafeed
git add .
git commit -m "feature/reaction-master-db"
```
