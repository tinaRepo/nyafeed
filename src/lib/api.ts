export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'

export type ReactionKey = 'cute' | 'sniff' | 'healing' | 'pressure' | 'fluffy'

const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD ?? ''

const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_PASSWORD}`,
})

export type AdminReportItem = {
    postId: string
    reportCount: number
    post: {
        id: string
        imageUrl: string
        comment: string
        createdAt: string
    } | null
    reasons: { reason: string; createdAt: string }[]
}

export type AdminPostItem = {
    id: string
    imageUrl: string
    comment: string
    createdAt: string
}

export type VisionLabel = {
    description: string
    score: number
}

export type PostResponse = {
    id: string
    image_url: string
    comment: string
    created_at: string
    reactions: Record<ReactionKey, number>
    labels?: VisionLabel[]
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

export type ReactionMasterItem = {
    id: string
    name: string
    emoji: string
    label: string
}

export const REPORT_REASONS = [
    { value: 'spam', label: 'スパム' },
    { value: 'not_cat', label: '猫ではない' },
    { value: 'offensive', label: '不快な画像' },
    { value: 'grotesque', label: 'グロテスク' },
    { value: 'other', label: 'その他' },
] as const

// fetch 共通エラーハンドリング
const handleApiError = async (res: Response): Promise<never> => {
    const data = await res.json().catch(() => ({}))

    // ステータスコードに応じたメッセージ
    if (res.status === 429) {
        throw new Error(data.error ?? 'しばらく時間をおいてから再試行してください')
    }
    if (res.status === 400) {
        throw new Error(data.error ?? '入力内容を確認してください')
    }
    if (res.status === 403) {
        throw new Error('アクセスが拒否されました')
    }
    if (res.status === 500) {
        throw new Error('サーバーエラーが発生しました。しばらくしてから再試行してください')
    }
    throw new Error(data.error ?? `エラーが発生しました（${res.status}）`)
}

export type ReportReasonValue = typeof REPORT_REASONS[number]['value']

// GET /posts
export const getPosts = async (
    offset = 0,
    limit = 10,
): Promise<PostResponse[]> => {
    const res = await fetch(
        `${API_BASE_URL}/posts?offset=${offset}&limit=${limit}`
    )
    if (!res.ok) await handleApiError(res)
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
    if (!res.ok) await handleApiError(res)
    return res.json()
}

// POST /posts/:id/reactions（トグル対応）
export const addReaction = async (
    postId: string,
    reactionType: ReactionKey,
    action: 'add' | 'remove',
): Promise<AddReactionResponse> => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: reactionType, action }),
    })
    if (!res.ok) await handleApiError(res)
    return res.json()
}

// GET /reactions/master
export const getReactionMaster = async (): Promise<ReactionMasterItem[]> => {
    const res = await fetch(`${API_BASE_URL}/reactions/master`)
    if (!res.ok) throw new Error(`Failed to fetch reaction master: ${res.status}`)
    return res.json()
}

// POST /posts/:id/report
export const reportPost = async (
    postId: string,
    reason: ReportReasonValue,
): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error ?? `API error: ${res.status}`)
    }
    return res.json()
}

// GET /admin/reports
export const getAdminReports = async (): Promise<AdminReportItem[]> => {
    const res = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: adminHeaders(),
    })
    if (!res.ok) throw new Error(`Admin auth failed: ${res.status}`)
    return res.json()
}

// GET /admin/posts
export const getAdminPosts = async (
    offset = 0,
    limit = 20,
): Promise<AdminPostItem[]> => {
    const res = await fetch(
        `${API_BASE_URL}/admin/posts?offset=${offset}&limit=${limit}`,
        { headers: adminHeaders() }
    )
    if (!res.ok) throw new Error(`Admin auth failed: ${res.status}`)
    return res.json()
}

// DELETE /admin/posts/:id
export const deleteAdminPost = async (postId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: adminHeaders(),
    })
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}