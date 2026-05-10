# Phase6-STEP20.md

==================================================
Phase6-STEP20
リアクションマスタDB化
============

■ 目的

現在ソースコードに直接定義されている
リアクション一覧をDB管理へ移行する。

これにより、

・リアクション追加
・リアクション削除
・表示順変更

をコード修正なしで行えるようにする。

---

■ 背景

現状：

```ts
const REACTION_CONFIG: { key: ReactionKey; emoji: string; label: string }[] = [
    { key: 'cute', emoji: '😍', label: 'かわいい！' },
    { key: 'sniff', emoji: '😤', label: '吸いたい' },
    { key: 'healing', emoji: '🌿', label: '癒される〜' },
    { key: 'pressure', emoji: '😤', label: '圧がすごい' },
    { key: 'fluffy', emoji: '🐾', label: 'もふもふ' },
];
```

のようにフロントへ直接記述されている。

この構成だと：

・追加時デプロイ必要
・管理しづらい
・将来の運営変更に弱い

問題がある。

---

■ ゴール

・reaction_master テーブル作成
・APIから取得
・フロントで動的表示
・DB変更のみで追加/削除可能

---

■ DB設計

reaction_master

・id
・name
・sort_order
・is_active
・created_at

---

■ API

GET /reactions

レスポンス：

[
{
id,
name
}
]

---

■ フロント動作

1. 初回表示時取得
2. state保存
3. mapでボタン生成

---

■ 実装要件

・active=trueのみ表示
・sort_order順表示
・ハードコード削除
・既存リアクション機能維持

---

■ 技術

・Hono
・Drizzle ORM
・PostgreSQL
・React useEffect

---

■ 禁止事項

・管理画面作成
・リアルタイム更新
・複雑キャッシュ
・権限管理

---

■ 出力内容（Claude）

・DB schema
・migration
・APIコード
・フロント修正
・state更新処理
・確認方法

---

■ 確認項目

・DBから取得できる
・リアクション表示される
・追加/削除がDBだけで反映される
・既存投稿で動作する
