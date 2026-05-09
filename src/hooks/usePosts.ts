import { useCallback, useEffect, useState } from 'react'
import { getPosts } from '../lib/api'
import { Cat, Reactions } from '../types/cat'

const DEFAULT_REACTIONS: Reactions = {
    cute: 0,
    sniff: 0,
    healing: 0,
    pressure: 0,
    fluffy: 0,
}

// APIレスポンス → Cat型に変換
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
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success' }

export const usePosts = () => {
    const [cats, setCats] = useState<Cat[]>([])
    const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' })

    const fetchPosts = useCallback(async () => {
        setFetchState({ status: 'loading' })
        try {
            const data = await getPosts()
            setCats(data.map(toCat))
            setFetchState({ status: 'success' })
        } catch (e) {
            const message = e instanceof Error ? e.message : '取得に失敗しました'
            setFetchState({ status: 'error', message })
        }
    }, [])

    // 初回マウント時に取得
    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    // 新規投稿をフィード先頭に追加
    const addPost = useCallback((cat: Cat) => {
        setCats((prev) => [cat, ...prev])
    }, [])

    return {
        cats,
        fetchState,
        fetchPosts,  // 再取得用（pull-to-refresh等で使用可能）
        addPost,
    }
}