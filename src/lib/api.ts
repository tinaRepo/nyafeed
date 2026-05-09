// SPからのアクセスはIPアドレスに変更すること
// PC確認時   → 'http://localhost:3000'
// Expo Go時  → 'http://192.168.x.x:3000'
export const API_BASE_URL = 'http://localhost:3000'

export type ReactionKey = 'cute' | 'sniff' | 'healing' | 'pressure' | 'fluffy'

export type PostResponse = {
    id: string
    image_url: string
    comment: string
    created_at: string
    reactions: Record<ReactionKey, number>
}

export type CreatePostRequest = {
    image_url: string
    comment: string
}

export type AddReactionResponse = {
    success: boolean
    action: 'added' | 'removed'
    reactions: Record<ReactionKey, number>
}

// GET /posts
export const getPosts = async (
    offset = 0,
    limit = 10,
): Promise<PostResponse[]> => {
    const res = await fetch(
        `${API_BASE_URL}/posts?offset=${offset}&limit=${limit}`
    )
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)
    return res.json()
}

// POST /posts
export const createPost = async (
    body: CreatePostRequest,
): Promise<PostResponse> => {
    const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error ?? `API error: ${res.status}`)
    }
    return res.json()
}

// POST /posts/:id/reactions（トグル対応）
// POST /posts/:id/reactions
export const addReaction = async (
    postId: string,
    reactionType: ReactionKey,
    action: 'add' | 'remove',
): Promise<AddReactionResponse> => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: reactionType, action }),  // ← 追加
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error ?? `API error: ${res.status}`)
    }
    return res.json()
}