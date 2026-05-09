# Phase5-STEP14 無限スクロール実装

## 概要

スクロール末尾に近づいたタイミングで追加データを取得し、
フィードに追記する。offset paginationで実装。

## ディレクトリ構成（差分）

```
api/
└── src/
    └── routes/
        └── posts.ts      ← 変更（offset/limit対応）

catroom/
├── src/
│   ├── lib/
│   │   └── api.ts        ← 変更（offset/limitパラメータ追加）
│   └── hooks/
│       └── usePosts.ts   ← 変更（無限スクロール対応）
└── App.tsx               ← 変更（スクロール検知追加）
```

---

## API側

### クエリパラメータ

```
GET /posts?offset=0&limit=10
```

| パラメータ | デフォルト | 最大値 | 説明         |
| ---------- | ---------- | ------ | ------------ |
| `offset`   | 0          | -      | 取得開始位置 |
| `limit`    | 10         | 50     | 取得件数     |

### 動作例

```
初回: GET /posts?offset=0&limit=10  → 1〜10件目
2回: GET /posts?offset=10&limit=10  → 11〜20件目
3回: GET /posts?offset=20&limit=10  → 21〜30件目
```

---

## フロント側

### 状態設計

```
usePosts
├── cats: Cat[]              フィードデータ（追加取得で末尾に追記）
├── fetchState               取得状態
│   ├── idle
│   ├── loading              初回ローディング
│   ├── loadingMore          追加取得中
│   ├── error
│   └── success
├── hasMore: boolean         残データの有無
├── fetchPosts()             初回取得・再取得
├── fetchMore()              追加取得（スクロール末尾で呼ぶ）
└── addPost(cat)             新規投稿をフィード先頭に追加
```

### stateではなくrefで管理する理由

```ts
// offsetをstateにすると…
const [offset, setOffset] = useState(0)
// → 更新タイミングの問題で古い値を参照し二重取得が発生する

// refで管理することで…
const offsetRef = useRef(0)
// → 常に最新値を参照できる・再レンダリングが発生しない
```

### 二重リクエスト防止

```ts
const isFetchingRef = useRef(false)

const fetchMore = async () => {
  if (isFetchingRef.current) return  // 取得中なら即リターン
  if (!hasMore) return               // 残データなしなら即リターン

  isFetchingRef.current = true
  try {
    // ...取得処理
  } finally {
    isFetchingRef.current = false    // 完了・エラー時に必ず解除
  }
}
```

### スクロール検知

```ts
// 末尾から300px以内でfetchMoreを呼ぶ
const LOAD_MORE_THRESHOLD = 300

const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
  const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
  const distanceFromBottom =
    contentSize.height - contentOffset.y - layoutMeasurement.height

  if (distanceFromBottom < LOAD_MORE_THRESHOLD) {
    fetchMore()
  }
}

// scrollEventThrottle: 200msごとにイベント発火（負荷軽減）
<ScrollView
  onScroll={handleScroll}
  scrollEventThrottle={200}
>
```

### 全件取得の判定

```ts
// 取得件数がlimitより少ない = 残データなし
setHasMore(data.length === LIMIT)
```

---

## フッター表示

| 状態         | 表示                      |
| ------------ | ------------------------- |
| 追加取得中   | スピナー＋「読み込み中…」 |
| 全件取得済み | 「🐾 全部見たにゃ！」      |
| それ以外     | 非表示                    |

---

## 動作確認チェックリスト

| 確認項目       | 期待動作                                  |
| -------------- | ----------------------------------------- |
| 初回表示       | 10件が表示される                          |
| スクロール末尾 | 追加10件が取得・表示される                |
| 重複表示なし   | 同じ投稿が2回出ない                       |
| 全件表示後     | 「🐾 全部見たにゃ！」が表示される          |
| 追加取得中     | フッターにスピナーが表示される            |
| API確認        | `GET /posts?offset=10` で11件目以降が返る |

## Gitコミット

```bash
# API
cd api
git add .
git commit -m "feat: add offset/limit pagination to GET /posts"

# フロント
cd catroom
git add .
git commit -m "feat: implement infinite scroll with offset pagination"
```
