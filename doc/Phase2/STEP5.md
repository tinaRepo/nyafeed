# Phase2-STEP5

## 方針確認（現状はWeb専用）
```bash
expo-image-picker は内部的に Web File API を使用。
Web専用構成のため、直接 Web File API で実装する方が
依存を増やさず・シンプル・確実。
→ PostModal.tsx の既存 input[type=file] を正式実装として整備する。
```


## state設計まとめ
```bash
PostModal
└── pickedImage: PickedImage | null   ← ImagePickerで管理

PickedImage 型
├── uri: string        objectURL（Image表示・Cat.imageUrlに渡す）
├── fileName: string   ファイル名（情報バー表示）
├── fileSize: number   バイト数（情報バー表示）
└── mimeType: string   形式確認（バリデーション済み）

ImagePicker（内部state）
└── validationError: string   形式・サイズエラーメッセージ
```

## ObjectURLライフサイクル
```bash
選択時  → URL.createObjectURL(file)  で uri 生成
変更時  → 旧 uri を revokeObjectURL → 新 uri を生成
削除時  → revokeObjectURL で解放
モーダルclose時 → handleClose でリセット（uriは投稿後もCatCardで使用継続）
```

## 起動確認
```bash
# Web専用で起動
npx expo start --web

# またはnpm scriptで起動
npm run web
```

## 動作確認

| 確認項目 | 期待動作 |
|----------|----------|
| 選択エリア表示 | 点線枠・猫アイコン・「ファイルを選択」ボタンが表示される |
| ホバー変化 | エリアにカーソルを当てるとオレンジ枠に変化する |
| ファイル選択 | タップでOSのファイルダイアログが開く |
| プレビュー表示 | 選択後に画像が高さ200pxで表示される |
| ファイル情報 | プレビュー下にファイル名・サイズが表示される |
| 画像変更 | 「変更」ボタンで再選択できる |
| 画像削除 | 「✕」ボタンで選択解除し初期状態に戻る |
| 形式エラー | PDFなど画像以外を選ぶとエラーメッセージ表示 |
| サイズエラー | 10MB超の画像選択時にエラーメッセージ表示 |
| 投稿反映 | 選択画像がフィードのカードに表示される |
| 画像省略 | 未選択でもダミー画像で投稿できる |