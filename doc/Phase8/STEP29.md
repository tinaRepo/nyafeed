# Phase8-STEP29 お問い合わせページ（Resend + Gmail）

## 概要

ユーザーが運営へ問い合わせできるページを追加する。
Resend経由でGmailにHTMLメールを送信する。
DBには保存せず、メール送信のみで完結する。

## ディレクトリ構成（差分）

```
api/
└── src/
    └── routes/
        └── contact.ts             ← 新規作成
index.ts                           ← 変更（ルート登録）

nyafeed/
└── src/
    ├── screens/
    │   └── ContactScreen.tsx      ← 新規作成
    └── components/
        └── Footer.tsx             ← 変更（お問い合わせリンク追加）
App.tsx                            ← 変更（contact画面遷移追加）
```

---

## インストール

```bash
cd api
npm install resend
```

---

## Resend 設定手順

```
1. https://resend.com にアクセスしてアカウント作成
2. API Keys → Create API Key
3. 発行されたAPIキーをメモ
4. 無料枠: 1日100通・月3000通まで
```

## 環境変数

```
# api/.env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_FROM_EMAIL=onboarding@resend.dev   # 独自ドメインなければこれを使用
CONTACT_TO_EMAIL=nyafeed.contact@gmail.com # 受信するGmailアドレス
```

---

## API

### エンドポイント

```
POST /contact
Content-Type: application/json

{
  "name":        "田中 太郎",
  "email":       "example@gmail.com",
  "contactType": "bug",
  "detail":      "詳細内容"
}
```

### お問い合わせ種別

| value            | 表示ラベル |
| ---------------- | ---------- |
| `bug`            | 不具合報告 |
| `delete_request` | 削除依頼   |
| `report`         | 通報       |
| `request`        | 要望       |
| `other`          | その他     |

### バリデーション

| フィールド  | チェック内容                         |
| ----------- | ------------------------------------ |
| name        | 必須・空文字不可                     |
| email       | 必須・メール形式チェック（正規表現） |
| contactType | 必須・定義済み種別のみ               |
| detail      | 必須・1000文字以内                   |

### メール設定

```
件名: [NyaFeed] {種別}のお問い合わせ
From: NyaFeed お問い合わせ <{CONTACT_FROM_EMAIL}>
To:   {CONTACT_TO_EMAIL}（Gmail）
replyTo: 問い合わせ者のメールアドレス（返信が直接届く）
```

---

## フロント設計

### 画面遷移

```ts
type Screen = 'feed' | 'terms' | 'privacy' | 'admin' | 'contact'
```

### フォームの状態管理

```ts
type FormState = {
  name:        string
  email:       string
  contactType: ContactTypeValue | ''
  detail:      string
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string }
```

### 送信フロー

```
入力 → バリデーション（フロント）
    ↓ エラーあり → 各フィールドにエラーメッセージ表示
    ↓ エラーなし
POST /contact
    ↓ 成功 → 完了画面に切り替わる
    ↓ 失敗 → エラーメッセージ表示
```

### 完了画面

送信成功後は入力フォームから完了画面に切り替わる。
「フィードに戻る」ボタンでfeedに戻る。

---

## フッターの最終構成

```
© 2025 NyaFeed
利用規約 | プライバシーポリシー | お問い合わせ | 管理
```

---

## 動作確認チェックリスト

| 確認項目       | 期待動作                                   |
| -------------- | ------------------------------------------ |
| フッターリンク | 「お問い合わせ」からページに遷移できる     |
| 空送信         | 各フィールドにエラーメッセージが表示される |
| メール形式不正 | エラーメッセージが表示される               |
| 種別選択       | ボタンが選択状態になる                     |
| 1001文字以上   | エラーが表示される                         |
| 送信中         | スピナー表示・ボタン無効化                 |
| 送信成功       | ✅ 完了画面に切り替わる                     |
| Gmail受信      | 整形されたHTMLメールが届く                 |
| 返信先         | ユーザーのメールアドレスに返信できる       |
| スマホ表示     | キーボード表示時にフォームが隠れない       |
