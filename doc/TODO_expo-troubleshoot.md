# TODO: Expo Go トラブルシュート

## 「使用可能なデータが見つかりません」エラー

### 症状

Expo Go でQRコードを読み込んでもアプリが開かず
「使用可能なデータが見つかりません」と表示される。

---

### 原因

`development build` モードで起動しているため。
Expo Go は `development build` を開くことができない。

```
# ターミナルに以下が表示されている場合が該当
› Using development build
› Press s │ switch to Expo Go
```

---

### 解決方法

ターミナルで `s` を押して Expo Go モードに切り替える。

```bash
s
```

切り替わると以下のように表示される。

```
› Using Expo Go
› Press s │ switch to development build
```

QRコードが変わるので**新しいQRコードを再スキャン**する。

---

### モードの違い

| モード            | 用途                              | 開くアプリ      |
| ----------------- | --------------------------------- | --------------- |
| development build | EAS Buildで作成した独自アプリ専用 | EAS Buildアプリ |
| Expo Go           | 標準の開発確認                    | Expo Goアプリ   |

---

## Expo Go でAPIに繋がらない

### 症状

PCのブラウザでは正常に動作するが、
Expo Go（スマホ）では「使用可能なデータが見つかりません」や
「Network request failed」が表示される。

### 原因

スマホの `localhost` はスマホ自身を指すため、
PCで動いているAPIサーバーに届かない。

### 解決方法

`nyafeed/src/lib/api.ts` の `API_BASE_URL` を
PCのIPアドレスに変更する。

```ts
// Before（PCからしか繋がらない）
export const API_BASE_URL = 'http://localhost:3000'

// After（スマホからも繋がる）
export const API_BASE_URL = 'http://192.168.x.x:3000'
```

PCのIPアドレス確認方法：

```cmd
# Windows
ipconfig → 「IPv4 アドレス」を使用

# Mac
ifconfig | grep inet
```

### 注意点

| 状況                 | 内容                                         |
| -------------------- | -------------------------------------------- |
| IPは変わることがある | Wi-Fi再接続時に再確認が必要                  |
| 同じWi-Fiが必要      | PCとスマホが同一ネットワークである必要がある |
| 本番環境では不要     | 固定URLになるため開発時限定の問題            |

---

## セキュリティ導入後に Expo Go で繋がらない

### 症状

セキュリティミドルウェア導入後、
Expo Go からのリクエストが弾かれる。

### 確認手順

#### 1. APIに疎通できるか確認

Expo Go端末のブラウザで以下にアクセス：

```
http://192.168.x.x:3000/health
→ {"status":"ok"} が返れば API自体には繋がっている
```

#### 2. APIターミナルのログを確認

```json
{
  "type": "suspicious_request",
  "ip": "192.168.x.x",
  "method": "POST",
  "path": "/posts",
  "status": 403,
  "ua": "..."
}
```

### よくある原因と対処

#### userAgentCheck で弾かれている

```ts
// security.ts
// axios のパターンを削除（Expo Goが内部的に使う場合がある）
const BLOCKED_UA_PATTERNS = [
  /^curl\//i,
  /^python-requests/i,
  // /^axios\//i,  ← コメントアウト
  /^go-http-client/i,
  /scrapy/i,
]
```

#### ALLOWED_ORIGINS に IP が含まれていない

```
# api/.env
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000,http://192.168.x.x:8081
```

#### R2のCORSにIPが含まれていない

```json
{
  "AllowedOrigins": [
    "http://localhost:8081",
    "http://192.168.x.x:8081"
  ]
}
```

---

## getPostsRateLimit の limit ミス

### 症状

一覧取得が頻繁にレート制限エラーになる。

### 原因

`rateLimit.ts` の `getPostsRateLimit` の `limit` が
コメントと異なる値になっていた。

```ts
// NG（コメントは120回なのに5回になっている）
export const getPostsRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,   // ← ミス
  ...
})

// OK
export const getPostsRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 120,  // 1分間に120回
  ...
})
```

---

## レート制限が適用されない

### 症状

`index.ts` でレート制限を設定したが効いていない。

### 原因

Honoは先に登録されたルートが優先されるため、
`app.route()` の後に `app.post()` でレート制限を追加しても
先のルートが優先されて適用されない。

### 解決方法

各ルートファイル内でレート制限を適用する。

```ts
// NG（index.tsで二重登録）
app.route('/posts', postsRoute)
app.post('/posts', postRateLimit, ...)  // 効かない

// OK（各ルートファイル内で適用）
// posts.ts
postsRoute.get('/', getPostsRateLimit, async (c) => { ... })
postsRoute.post('/', postRateLimit, async (c) => { ... })
```

`index.ts` はルート登録のみにする。

```ts
app.route('/posts',               postsRoute)
app.route('/upload-url',          uploadRoute)
app.route('/reactions/master',    reactionMasterRoute)
app.route('/posts/:id/reactions', reactionsRoute)
app.route('/posts/:id/report',    reportsRoute)
app.route('/ng-words',            ngWordsRoute)
app.route('/admin',               adminRoute)
app.route('/contact',             contactRoute)
```
