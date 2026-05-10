# TODO: ピンチズーム実装（EAS Build移行時）

## 概要

詳細画像表示モーダルのピンチズーム機能は実装済みだが、
Expo Go環境での動作制約によりコメントアウト中。
EAS Build移行時にコメントを外して有効化する。

## 現状

| 環境                    | 状態                             |
| ----------------------- | -------------------------------- |
| Expo Go（開発中）       | ❌ 動作しない（コメントアウト中） |
| EAS Build（本番ビルド） | ✅ 動作する（コメントを外せばOK） |

## 原因

`react-native-gesture-handler` と `react-native-reanimated` は
ネイティブモジュールに依存しており、Expo Go のバンドル済みランタイムでは
初期化エラー（`Exception in HostFunction`）が発生する。

```
Reanimated 4.x → New Architecture専用・Expo Go非対応
Reanimated 3.x → Expo SDK 54 との組み合わせで初期化エラー
→ 現時点では Expo Go での動作不可
```

---

## EAS Build移行時の対応手順

### 1. パッケージインストール

```bash
cd catroom
npx expo install react-native-reanimated react-native-gesture-handler
```

### 2. babel.config.js のコメントを外す

```js
// Before
// plugins: ['react-native-reanimated/plugin'],

// After
plugins: ['react-native-reanimated/plugin'],
```

### 3. App.tsx のコメントを外す

```tsx
// Before
// import 'react-native-reanimated';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// After
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
```

```tsx
// Before
// <GestureHandlerRootView style={{ flex: 1 }}>
<SafeAreaProvider>
  ...
</SafeAreaProvider>
// </GestureHandlerRootView>

// After
<GestureHandlerRootView style={{ flex: 1 }}>
  <SafeAreaProvider>
    ...
  </SafeAreaProvider>
</GestureHandlerRootView>
```

### 4. CatImageDetail.tsx のコメントを外す

以下をすべてコメント解除する：

```
・import（Animated・Gesture・GestureDetector等）
・SharedValue の定義
・resetTransform 関数
・pinchGesture / panGesture / tapGesture / doubleTapGesture
・imageGesture / animatedStyle
・GestureHandlerRootView への差し替え
・GestureDetector + Animated.View への差し替え
・ヒントテキスト
・スタイル（background・hint・hintText）
```

現在の `TouchableOpacity` ラップは削除する。

### 5. EAS Buildで動作確認

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

---

## ピンチズームの操作仕様（実装済み内容）

| 操作              | 動作                            |
| ----------------- | ------------------------------- |
| 2本指ピンチアウト | 最大4倍まで拡大                 |
| 2本指ピンチイン   | 最小1倍まで縮小                 |
| 1本指ドラッグ     | 拡大中に画像を移動（感度0.6倍） |
| ダブルタップ      | 等倍→2倍 / 拡大中→リセット      |
| 背景タップ        | モーダルを閉じる                |
| 閉じるボタン      | モーダルを閉じる                |

---

## 関連ファイル

```
my-app/
├── babel.config.js              ← plugins をコメントアウト中
├── App.tsx                      ← GestureHandlerRootView をコメントアウト中
└── src/
    └── components/
        └── CatImageDetail.tsx   ← ピンチズーム実装をコメントアウト中
```
