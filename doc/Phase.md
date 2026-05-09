# Phase1：フロント土台（APIなし）

## STEP1：Expo初期構築
### ゴール
- Expo起動
- Web表示
- iOSシミュレータ起動

---

## STEP2：Expo Router導入
### ゴール
- 画面遷移
- tabs構成

---

## STEP3：NativeWind導入
### ゴール
- Tailwind適用確認

---

## STEP4：ホーム画面UI
### ゴール
- 猫カード表示
- ダミーデータ表示

※まだAPI不要

---

# Phase2：投稿UI（APIなし）

## STEP5：画像選択
### 使用
- expo-image-picker

### ゴール
- 画像選択UI実装

---

## STEP6：投稿フォーム
### ゴール
- コメント入力
- 投稿ボタン

※まだAPI送信なし

---

# Phase3：Backend構築（初API）

## STEP7：Hono構築
### ゴール
- /health
- Hello API

---

## STEP8：PostgreSQL接続
### 使用
- Neon
- Drizzle ORM

### ゴール
- DB接続成功

---

## STEP9：postsテーブル作成
### ゴール
- 投稿データ構造定義

---

## STEP10：投稿API
### ゴール
- 投稿作成API完成

---

# Phase4：フロント接続

## STEP11：画像アップロード
### 使用
- Cloudflare R2

### ゴール
- 画像アップロード成功

---

## STEP12：フロント→API投稿
### ゴール
- 投稿がDBに保存される

---

## STEP13：一覧取得
### ゴール
- 投稿一覧をAPIから取得して表示

---

# Phase5：UX改善

## STEP14：無限スクロール
### ゴール
- スクロールで追加読み込み

---

## STEP15：リアクション
### ゴール
- リアクション機能実装

---

## STEP16：今日のテーマ
### ゴール
- 未定（UX改善・演出・機能拡張）