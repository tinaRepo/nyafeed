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
    reactions: Record<string, number>
}): Cat => ({
    id: p.id,
    imageUrl: p.image_url,
    comment: p.comment,
    reactions: {
        cute: p.reactions['cute'] ?? 0,
        sniff: p.reactions['sniff'] ?? 0,
        healing: p.reactions['healing'] ?? 0,
        pressure: p.reactions['pressure'] ?? 0,
        fluffy: p.reactions['fluffy'] ?? 0,
    },
})

type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'loadingMore' }
    | { status: 'refreshing' }
    | { status: 'error'; message: string }
    | { status: 'success' }

type UsePostsOptions = {
    onError?: (message: string) => void
}

export const usePosts = ({ onError }: UsePostsOptions = {}) => {
    const [cats, setCats] = useState<Cat[]>([])
    const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' })
    const [hasMore, setHasMore] = useState(true)

    const offsetRef = useRef(0)
    const isFetchingRef = useRef(false)

    // 初回取得
    const fetchPosts = useCallback(async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true
        setFetchState({ status: 'loading' })

        try {
            const data = await getPosts(0, LIMIT)
            setCats(data.map(toCat))
            offsetRef.current = data.length
            setHasMore(data.length === LIMIT)
            setFetchState({ status: 'success' })
        } catch (e) {
            const message = e instanceof Error ? e.message : '取得に失敗しました'
            setFetchState({ status: 'error', message })
            onError?.(message)
        } finally {
            isFetchingRef.current = false
        }
    }, [onError])

    // 投稿後の再取得
    const refreshPosts = useCallback(async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true
        setFetchState({ status: 'refreshing' })

        try {
            const data = await getPosts(0, LIMIT)
            setCats(data.map(toCat))       // 上書き（追記ではない）
            offsetRef.current = data.length
            setHasMore(data.length === LIMIT)
            setFetchState({ status: 'success' })
        } catch (e) {
            // 失敗してもフィードは維持（既存データを消さない）
            const message = e instanceof Error ? e.message : '更新に失敗しました'
            setFetchState({ status: 'success' })
            onError?.(message)
        } finally {
            isFetchingRef.current = false
        }
    }, [onError])

    // 追加取得
    const fetchMore = useCallback(async () => {
        if (isFetchingRef.current) return
        if (!hasMore) return

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
            onError?.(message)
        } finally {
            isFetchingRef.current = false
        }
    }, [hasMore, onError])

    const addPost = useCallback((cat: Cat) => {
        setCats((prev) => [cat, ...prev])
        offsetRef.current += 1
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
        refreshPosts,
        addPost,
    }
}