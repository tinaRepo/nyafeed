// SPからのアクセスはIPアドレスに変更すること
// PC確認時   → 'http://localhost:3000'
// Expo Go時  → 'http://192.168.x.x:3000'
export const API_BASE_URL = 'http://localhost:3000'

export type PostResponse = {
    id: string
    image_url: string
    comment: string
    created_at: string
}

export type CreatePostRequest = {
    image_url: string
    comment: string
}

// GET /posts（offset pagination対応）
export const getPosts = async (
    offset = 0,
    limit = 10,
): Promise<PostResponse[]> => {
    const res = await fetch(
        `${API_BASE_URL}/posts?offset=${offset}&limit=${limit}`
    )
    if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status}`)
    }
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