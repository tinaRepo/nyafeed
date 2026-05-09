const API_BASE_URL = 'http://localhost:3000'

type UploadUrlResponse = {
    upload_url: string
    public_url: string
    key: string
}

// MIME typeを取得（PickedImageのmimeTypeを使用）
const getMimeType = (uri: string, mimeType?: string): string => {
    if (mimeType) return mimeType
    const ext = uri.split('.').pop()?.toLowerCase()
    const map: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
    }
    return map[ext ?? ''] ?? 'image/jpeg'
}

// STEP1: APIから署名付きURLを取得
const getUploadUrl = async (contentType: string): Promise<UploadUrlResponse> => {
    const res = await fetch(`${API_BASE_URL}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType }),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error ?? 'Failed to get upload URL')
    }

    return res.json()
}

// STEP2: 署名付きURLに画像をPUT（R2へ直接アップロード）
const putImageToR2 = async (
    uploadUrl: string,
    uri: string,
    contentType: string,
): Promise<void> => {
    // Web: objectURLからBlobを取得
    const imageRes = await fetch(uri)
    const blob = await imageRes.blob()

    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
    })

    if (!putRes.ok) {
        throw new Error(`Failed to upload image: ${putRes.status}`)
    }
}

// 公開関数：uri → public_url を返す
export const uploadImage = async (
    uri: string,
    mimeType?: string,
): Promise<string> => {
    const contentType = getMimeType(uri, mimeType)

    // STEP1: 署名付きURL取得
    const { upload_url, public_url } = await getUploadUrl(contentType)

    // STEP2: R2へアップロード
    await putImageToR2(upload_url, uri, contentType)

    // STEP3: 公開URLを返す
    return public_url
}