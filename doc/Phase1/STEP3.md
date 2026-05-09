# Phase1-STEP3

## 状態管理の設計まとめ
```bash
CatCard（useState × 2）
├── reactions: Reactions        → 各ボタンのカウント数
└── activeKeys: Set<ReactionKey> → どのボタンを押したか（トグル用）
        ↓ propsで渡す
ReactionBar（表示のみ・状態なし）
```

| state           | 型                           | 役割               |
| --------------- | --------------------------- | ---------------- |
| reactionsRecord | Record<ReactionKey, number> | 各リアクションの現在数      |
| activeKeysSet   | Set<ReactionKey>            | 押下済みキーの管理（トグル状態） |

- ポイント： **ReactionBar** は純粋な表示コンポーネントとして切り出し。状態は **CatCard** のみが持つ。


## 起動確認
```bash
# Web専用で起動
npx expo start --web

# またはnpm scriptで起動
npm run web
```

## 動作確認

| 確認項目      | 期待動作                      |
| --------- | ------------------------- |
| ボタン表示     | 各カードに5種のリアクションボタンが並ぶ      |
| カウント初期値   | ダミーデータの数値が表示されている         |
| 押下でカウント増減 | タップ/クリックで+1、再押下で-1（トグル動作） |
| アクティブUI   | 押したボタンがオレンジ色に変化する         |
| 複数同時押し    | 異なる種類のリアクションを複数同時に押せる     |
| フィード崩れなし  | カード幅・スクロールが崩れない           |
