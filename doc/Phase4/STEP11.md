# Phase4-STEP11 画像アップロード（Cloudflare R2）

## アーキテクチャ

```
フロント（Expo）
    ↓ POST /upload-url
API（Hono）
    ↓ 署名付きURL発行
フロント
    ↓ PUT（直接アップロード）
Cloudflare R2
    ↓ public_url を返す
フロント（画像表示）
```

## 事前準備（Cloudflare R2側）

```
1. https://dash.cloudflare.com にアクセス
2. 左メニュー → R2 Object Storage
3. 「Create bucket」でバケット作成（例: nyafeed-images）
4. バケット → Settings → Public access → 「Allow Access」を有効化
5. 表示される Public Bucket URL をメモ
   例: https://pub-xxxxxxxx.r2.dev
```

### APIトークン発行

```
1. Cloudflare ダッシュボード右上アイコン → My Profile
2. 左メニュー → API Tokens → Create Token
3. 「Create Custom Token」を選択
4. Permissions: R2 → Edit に設定
5. 「Create Token」→ 表示されたトークンをメモ（1度しか表示されない）
```

### アカウントID確認

```
Cloudflare ダッシュボード右サイドバー → 「Account ID」をコピー
```

---

## インストールしたパッケージ

```bash
cd api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## ディレクトリ構成（差分）

```
api/
└── src/
    ├── lib/
    │   └── r2.ts           ← 新規作成（R2クライアント）
    ├── routes/
    │   └── upload.ts       ← 新規作成（アップロードURL発行）
    └── index.ts            ← 変更（ルート登録）

catapp/
└── src/
    ├── lib/
    │   └── upload.ts       ← 新規作成（アップロード処理）
    └── components/
        └── PostModal.tsx   ← 変更（アップロード処理組み込み）
```

## 環境変数

### `api/.env`

```
DATABASE_URL=postgresql://...

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=nyafeed-images
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

## エンドポイント

### リクエスト

```
POST /upload-url
Content-Type: application/json

{
  "content_type": "image/jpeg"
}
```

### レスポンス（成功時 200）

```json
{
  "upload_url": "https://xxx.r2.cloudflarestorage.com/...?X-Amz-...",
  "public_url": "https://pub-xxxxxxxx.r2.dev/images/2024/01/uuid.jpg",
  "key": "images/2024/01/uuid.jpg"
}
```

## アップロードフロー（フロント）

```ts
// STEP1: 署名付きURL取得
const { upload_url, public_url } = await fetch(`${API_BASE_URL}/upload-url`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content_type: 'image/jpeg' }),
}).then(r => r.json())

// STEP2: R2へ直接アップロード
const blob = await fetch(imageUri).then(r => r.blob())
await fetch(upload_url, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: blob,
})

// STEP3: public_url を投稿データとして使用
```

---

## トラブルシュート

### CORS エラー（Failed to fetch）

**原因:** R2バケットのCORS設定が未設定のため、ブラウザからの直接PUTが拒否される。

**対応:** Cloudflare R2コンソール → バケット → Settings → CORS Policy に以下を設定。

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:8081",
      "http://localhost:3000",
      "http://192.168.x.x:8081"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

### Expo Go（スマホ）で Network request failed

**原因:** スマホの `localhost` はスマホ自身を指すためPCのAPIに届かない。

**対応:** `catapp/src/lib/upload.ts` のURLをPCのIPアドレスに変更する。

```ts
// Before
const API_BASE_URL = 'http://localhost:3000'

// After
const API_BASE_URL = 'http://192.168.x.x:3000'  // PCのIPアドレスに変更
```

PCのIPアドレス確認方法：

```cmd
# Windows
ipconfig
→ 「IPv4 アドレス」の値を使う

# Mac
ifconfig | grep inet
→ 192.168.x.x 形式の値を使う
```

R2のCORSにもIPを追加することを忘れずに。

| 注意点               | 内容                                         |
| -------------------- | -------------------------------------------- |
| IPは変わることがある | Wi-Fi再接続時に再確認が必要                  |
| 同じWi-Fiが必要      | PCとスマホが同一ネットワークである必要がある |
| 本番環境では不要     | 固定URLになるため開発時限定の問題            |

---

## 動作確認チェックリスト

| 確認項目                | 期待動作                                   |
| ----------------------- | ------------------------------------------ |
| `POST /upload-url`      | `upload_url` / `public_url` / `key` が返る |
| 画像付き投稿（PC）      | R2にファイルが保存される                   |
| 画像付き投稿（Expo Go） | IPアドレス指定で正常にアップロードされる   |
| `public_url`            | ブラウザで画像が表示できる                 |
| アップロード中          | スピナー表示・操作不可になる               |
| アップロード失敗        | エラーメッセージ＋「再試行」が表示される   |
