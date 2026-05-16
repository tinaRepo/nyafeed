# Phase1-STEP1
## プロジェクト作成コマンド
```bash
npx create-expo-app@latest フォルダ名 --template blank-typescript
```

## 追加packageインストール
```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

## 起動確認
```bash
# Web専用で起動
npx expo start --web

# またはnpm scriptで起動
npm run web
```

## 動作確認
```bash
1. ターミナルで `npm run web` を実行
2. 自動でブラウザが開く（http://localhost:8081）
3. 「Phase1-STEP1」「Web Expo 初期構築 ✅」が表示されればOK
4. TypeScriptエラーがターミナルに出ていないことを確認
```