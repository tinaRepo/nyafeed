# Phase2-STEP5.5 追加対応まとめ

## 対応一覧

| #   | 問題                            | 対応内容                                             | 対象ファイル      |
| --- | ------------------------------- | ---------------------------------------------------- | ----------------- |
| 1   | Pressable の hovered 型エラー   | `TouchableOpacity` + `onMouseEnter/Leave` に置き換え | `ImagePicker.tsx` |
| 2   | ステータスバーへの被り          | `SafeAreaProvider / SafeAreaView` を追加             | `App.tsx`         |
| 3   | `<input>` クラッシュ（Expo Go） | `Platform.OS` で Web / ネイティブを分岐              | `ImagePicker.tsx` |

---

## 1. Pressable hovered 型エラー修正

### 原因
`PressableStateCallbackType` に `hovered` が含まれず型不一致。

### 対応
```tsx
// Before
<Pressable style={({ hovered }) => [styles.base, hovered && styles.hovered]}>

// After
const [isHovered, setIsHovered] = useState(false);
<TouchableOpacity
  style={[styles.base, isHovered && styles.hovered]}
  // @ts-ignore: Web専用イベント
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
```

---

## 2. SafeArea対応（ステータスバー被り修正）

### インストール
```bash
npx expo install react-native-safe-area-context
```

### 対応
```tsx
// App.tsx
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaProvider>
  <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
    {/* 既存のコンテンツ */}
  </SafeAreaView>
</SafeAreaProvider>
```

### 効果
| 環境               | 効果                               |
| ------------------ | ---------------------------------- |
| iOS（Expo Go）     | ノッチ・ステータスバーの被りを回避 |
| Android（Expo Go） | 時刻・通知エリアの被りを回避       |
| Web                | 影響なし（余白変化なし）           |

---

## 3. `<input>` クラッシュ修正（Platform分岐）

### 原因
`<input type="file">` はHTMLネイティブ要素のため、
Expo Go（ネイティブレンダラー）で `Invariant Violation` エラーが発生。

### インストール
```bash
npx expo install expo-image-picker
```

### 対応
```tsx
// Platform.OS で分岐
const handleAreaClick = () => {
  if (Platform.OS === 'web') {
    inputRef.current?.click();   // Web: 隠しinput
  } else {
    handleNativePick();          // ネイティブ: expo-image-picker
  }
};

// <input> のレンダリングも分岐
{Platform.OS === 'web' && (
  <input type="file" ... />
)}
```