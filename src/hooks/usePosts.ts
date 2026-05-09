import { useCallback, useEffect, useRef, useState } from 'react'
import { getPosts } from '../lib/api'
import { Cat, Reactions } from '../types/cat'

const LIMIT = 10

const DEFAULT_REACTIONS: Reactions = {
    cute: 0,
    sniff: 0,
    healing: 0,
    pressure: 0,
    fluffy: 0,
}

const toCat = (p: {
    id: string
    image_url: string
    comment: string
    created_at: string
}): Cat => ({
    id: p.id,
    imageUrl: p.image_url,
    comment: p.comment,
    reactions: { ...DEFAULT_REACTIONS },
})

type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }       // 初回ローディング
    | { status: 'loadingMore' }   // 追加取得中
    | { status: 'error'; message: string }
    | { status: 'success' }

export const usePosts = () => {
    const [cats, setCats] = useState<Cat[]>([])
    const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' })
    const [hasMore, setHasMore] = useState(true)

    // offsetをrefで管理（stateにすると再レンダリングで二重リクエスト発生）
    const offsetRef = useRef(0)
    const isFetchingRef = useRef(false)  // 二重リクエスト防止フラグ

    // 初回取得
    const fetchPosts = useCallback(async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true
        setFetchState({ status: 'loading' })

        try {
            const data = await getPosts(0, LIMIT)
            setCats(data.map(toCat))
            offsetRef.current = data.length
            setHasMore(data.length === LIMIT)  // LIMIT未満 → 残なし
            setFetchState({ status: 'success' })
        } catch (e) {
            const message = e instanceof Error ? e.message : '取得に失敗しました'
            setFetchState({ status: 'error', message })
        } finally {
            isFetchingRef.current = false
        }
    }, [])

    // 追加取得（スクロール末尾で呼ばれる）
    const fetchMore = useCallback(async () => {
        if (isFetchingRef.current) return  // 二重リクエスト防止
        if (!hasMore) return               // 残データなし

        isFetchingRef.current = true
        setFetchState({ status: 'loadingMore' })

        try {
            const data = await getPosts(offsetRef.current, LIMIT)
            setCats((prev) => [...prev, ...data.map(toCat)])
            offsetRef.current += data.length
            setHasMore(data.length === LIMIT)
            setFetchState({ status: 'success' })
        } catch (e) {
            const message = e instanceof Error ? e.message : '取得に失敗しました'
            setFetchState({ status: 'error', message })
        } finally {
            isFetchingRef.current = false
        }
    }, [hasMore])

    // 新規投稿をフィード先頭に追加
    const addPost = useCallback((cat: Cat) => {
        setCats((prev) => [cat, ...prev])
        offsetRef.current += 1  // offsetもズラす
    }, [])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    return {
        cats,
        fetchState,
        hasMore,
        fetchPosts,
        fetchMore,
        addPost,
    }
}