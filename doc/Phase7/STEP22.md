# Phase7-STEP22 投稿画像制限（猫画像のみ）+ セキュリティ強化 + 動的Toastメッセージ

## 概要

猫画像以外の投稿を制限しサービスの世界観を維持する。
Google Cloud Vision API で猫ラベル検出 + NSFW判定を行う。
Vision APIのラベル結果を使って投稿完了Toastメッセージを動的に変える遊び心を追加。
あわせてbot攻撃・サイバー攻撃対策のセキュリティ強化を実施。

## ディレクトリ構成（差分）

```
api/
└── src/
    ├── lib/
    │   ├── vision.ts            ← 新規作成（Vision API判定・スコア付きラベル返却）
    │   └── toastMessage.ts      ← 新規作成（ラベル→メッセージ変換ロジック）
    ├── middleware/
    │   ├── rateLimit.ts         ← 新規作成（レート制限）
    │   ├── security.ts          ← 新規作成（セキュリティヘッダー・UA検証・Origin検証）
    │   └── ipBlock.ts           ← 新規作成（IPブロック・不審リクエストログ）
    └── routes/
        └── posts.ts             ← 変更（投稿前に画像判定・labelsをレスポンスに追加）
index.ts                         ← 変更（ミドルウェア適用）

nyafeed/
└── src/
    ├── lib/
    │   ├── api.ts               ← 変更（PostResponseにlabels追加・VisionLabel型追加）
    │   └── toastMessage.ts      ← 新規作成（スコア順メッセージ選択）
    └── components/
        └── PostModal.tsx        ← 変更（onSubmitにtoastMsg追加）
App.tsx                          ← 変更（toastMessageをstateで管理）
```

---

## インストールしたパッケージ

```bash
cd api
npm install google-auth-library
npm install hono-rate-limiter
```

---

## Vision API 設定

### 使用技術

```
Google Cloud Vision API
・LABEL_DETECTION       → 猫ラベル検出（maxResults: 30）
・SAFE_SEARCH_DETECTION → NSFW判定
1回のAPIコールで両方判定できる
```

### 認証方式

**APIキーではなくサービスアカウント（JSONキー）を使用する。**

|                  | APIキー                     | サービスアカウント（採用） |
| ---------------- | --------------------------- | -------------------------- |
| 認証方式         | `?key=xxx` クエリパラメータ | `Bearer トークン` ヘッダー |
| 権限制御         | 粗い                        | IAMロールで細かく制御可能  |
| 漏洩時           | 即悪用される                | IAMで即無効化できる        |
| トークン有効期限 | なし（固定キー）            | 1時間（自動更新）          |

### サービスアカウント設定手順

```
1. Google Cloud Console → IAMと管理 → サービスアカウント
2. 「サービスアカウントを作成」
3. 権限: roles/cloudvision.viewer のみ付与（最小権限）
4. JSONキーを発行・ダウンロード
5. Base64に変換して .env に保存
```

### JSONキーのBase64変換

```bash
# Mac / Linux
base64 -i path/to/keyfile.json

# Windows（PowerShell）
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\keyfile.json"))
```

### 環境変数

```
# api/.env
GOOGLE_VISION_CREDENTIALS_BASE64=xxxxxx  # Base64エンコードしたJSONキー
```

---

## 画像判定ロジック

### 判定フロー

```
画像URL受信
    ↓
SafeSearch 判定
├── adult / violence / racy が LIKELY 以上 → NG（nsfw）
└── OK → 次へ
    ↓
ラベル判定（スコア0.6以上・スコア降順ソート）
├── 猫ラベルが存在しない → NG（no_cat）
└── 存在する → OK（スコア付きlabels[]を返す）
    ↓
DB保存 → レスポンスにlabels[]を含める
```

### 猫と判定するラベル

```ts
const CAT_LABELS = [
  'Cat', 'Felidae', 'Small to medium-sized cats',
  'Whiskers', 'Kitten', 'Maine coon', 'Persian cat',
  'Tabby cat', 'Siamese cat',
]
```

### 誤判定の許容設計

| ケース         | 動作 | 理由                     |
| -------------- | ---- | ------------------------ |
| 環境変数未設定 | 通す | 開発時の動作担保         |
| API障害・例外  | 通す | サービス継続優先         |
| 信頼度60%未満  | 拒否 | 誤検知を減らす           |
| 猫+人の画像    | 通す | 猫ラベルが検出されれば可 |

### エラーメッセージ

| reason      | メッセージ                                                             |
| ----------- | ---------------------------------------------------------------------- |
| `no_cat`    | 猫成分を検出できませんでした🐱 猫が写っている画像を投稿してください     |
| `nsfw`      | この画像は投稿できません                                               |
| `api_error` | 画像の確認中にエラーが発生しました。しばらくしてから再試行してください |

---

## 動的Toastメッセージ

### 概要

Vision APIのラベル結果（スコア付き）を使って、
投稿完了Toastメッセージを画像の内容に応じて変える遊び心機能。

### スコア順優先の判定

```
Vision API レスポンス（スコア降順）:
[
  { description: 'Cat',    score: 0.98 },
  { description: 'Kitten', score: 0.91 },  ← 最初にルールにマッチ
  { description: 'White',  score: 0.75 },
]
→ Toast:「こねこちゃん、とうじょう🐣 投稿完了にゃ！」

[
  { description: 'Person', score: 0.97 },  ← 最初にルールにマッチ
  { description: 'Cat',    score: 0.95 },
]
→ Toast:「猫と人間の共存、尊い…🥹 投稿完了にゃ！」
```

### メッセージ一覧

#### 人間+猫系

| 検出ラベル              | メッセージ                                       |
| ----------------------- | ------------------------------------------------ |
| Baby / Infant / Toddler | あかちゃんと猫、反則級のかわいさ😭 投稿完了にゃ！ |
| Child / Girl / Boy      | ちびっこと猫の最強コンビ🌟 投稿完了にゃ！         |
| Lap / Lap cat           | 膝の上に猫、もう動けない😂 投稿完了にゃ！         |
| Woman / Lady / Female   | 猫に選ばれし者…🌸 投稿完了にゃ！                  |
| Man / Male / Guy        | 猫に心を許された男、投稿完了にゃ🤝                |
| Person / Human / People | 猫と人間の共存、尊い…🥹 投稿完了にゃ！            |

#### 猫の種類系

| 検出ラベル  | メッセージ                                    |
| ----------- | --------------------------------------------- |
| Kitten      | こねこちゃん、とうじょう🐣 投稿完了にゃ！      |
| Persian cat | ふわっふわのペルシャ様、投稿完了でございます👑 |
| Maine coon  | おおきい…もふもふ…投稿完了にゃ🦁               |
| Siamese cat | シャム猫さま、ご降臨🙏 投稿完了にゃ！          |
| Tabby cat   | トラねこさん登場にゃ🐯 投稿完了！              |
| White       | しろねこさん、眩しい…💫 投稿完了にゃ！         |
| Black       | くろねこさん、ミステリアス🌙 投稿完了にゃ！    |
| Orange      | 茶トラさん、元気いっぱい🍊 投稿完了にゃ！      |

#### 猫の状態系

| 検出ラベル       | メッセージ                                 |
| ---------------- | ------------------------------------------ |
| Sleeping / Sleep | すやすやにゃ〜💤 起こさないでね、投稿完了！ |
| Yawning / Yawn   | ふわあ〜っ😪 眠そうだけど投稿完了にゃ！     |
| Playing / Play   | 遊んでる遊んでる🎾 投稿完了にゃ！           |
| Sitting / Sit    | おすわりえらい🪑 投稿完了にゃ！             |

#### 場所・シチュエーション系

| 検出ラベル                        | メッセージ                                |
| --------------------------------- | ----------------------------------------- |
| Window / Windowsill               | 窓辺でまったり、投稿完了にゃ🪟             |
| Cardboard box / Box               | 箱に入らずにはいられない…📦 投稿完了にゃ！ |
| Food / Eating                     | ごはん中に失礼します🍚 投稿完了にゃ！      |
| Blanket / Bed / Pillow            | 毛布でぬくぬく、投稿完了にゃ🛋️             |
| Grass / Garden / Outdoor / Street | のらねこさんかな？投稿完了にゃ🌿           |

#### デフォルト（ランダム）

```
・投稿しました 🐾
・今日もかわいい猫をありがとう🐱 投稿完了にゃ！
・猫、来た。投稿完了にゃ🐾
```

---

## セキュリティ強化

### レート制限

| エンドポイント              | 制限         | 理由                                     |
| --------------------------- | ------------ | ---------------------------------------- |
| `POST /posts`               | 10分間に5回  | 大量投稿bot対策                          |
| `POST /upload-url`          | 10分間に3回  | Vision API無料枠保護                     |
| `POST /posts/:id/reactions` | 1分間に30回  | リアクションbot対策                      |
| `GET /posts`                | 1分間に120回 | 脳死スワイプ・連打更新を考慮した緩め設定 |

### セキュリティヘッダー

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security（本番のみ）
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### その他の対策

| 対策               | 内容                                      |
| ------------------ | ----------------------------------------- |
| ペイロード制限     | 1MB超のリクエストを拒否（413）            |
| UA検証             | curl・python-requests・scrapy等をブロック |
| Origin検証         | 許可オリジン以外のPOSTを拒否              |
| IPブロック         | 環境変数 `BLOCKED_IPS` でカンマ区切り管理 |
| 不審リクエストログ | 4xx/5xxをJSON形式でコンソール出力         |

### 追加環境変数

```
ALLOWED_ORIGINS=https://your-domain.com
BLOCKED_IPS=1.2.3.4,5.6.7.8
NODE_ENV=production
```

---

## Cloudflare WAF（ドメイン取得後に対応）

**ドメインがないと設定不可のため本番リリース時に対応する。**

```
設定内容:
・大量リクエストbot対策ルール
・不審なUser-Agentブロック
・Bot Fight Mode ON
・DDoS Protection確認
・高脅威スコアにManaged Challenge（CAPTCHA）
```

---

## セキュリティ対策まとめ

| 脅威                 | 対策                  | 実装場所         |
| -------------------- | --------------------- | ---------------- |
| 大量投稿bot          | レート制限（10分5回） | `rateLimit.ts`   |
| 大量アップロード     | レート制限（10分3回） | `rateLimit.ts`   |
| 巨大ペイロード       | 1MB制限               | `security.ts`    |
| 自動化ツール         | UA検証・ブロック      | `security.ts`    |
| 不正オリジン         | Origin検証            | `security.ts`    |
| クリックジャッキング | X-Frame-Options       | `security.ts`    |
| 特定IP攻撃           | IPブロックリスト      | `ipBlock.ts`     |
| DDoS                 | Cloudflare WAF        | ⏳ ドメイン取得後 |
| bot全般              | Bot Fight Mode        | ⏳ ドメイン取得後 |
| 猫以外の画像         | Vision API判定        | `vision.ts`      |
| NSFW画像             | SafeSearch判定        | `vision.ts`      |

---

## トラブルシュート

### 投稿時に「画像の確認中にエラーが発生しました」

APIターミナルのログを確認して原因を特定する。

```ts
// vision.ts に追加
console.log('✅ JSON parsed. client_email:', json.client_email)
console.log('✅ Token acquired:', !!token.token)
console.error('❌ getAuthToken error:', e)
```

よくある原因：
- Base64変換が不正
- Vision APIが有効化されていない
- サービスアカウントの権限不足（`roles/cloudvision.viewer` が必要）
- 環境変数が読み込まれていない（サーバー再起動で解決）

### shadow* 非推奨警告

```ts
// Before
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,

// After
boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
```

### pointerEvents 非推奨警告

```tsx
// Before
<View pointerEvents="none">

// After
<View style={{ pointerEvents: 'none' }}>
```
