import { API_BASE_URL } from './api'

type UploadUrlResponse = {
    upload_url: string
    public_url: string
    key: string
}

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

const putImageToR2 = async (
    uploadUrl: string,
    uri: string,
    contentType: string,
): Promise<void> => {
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

export const uploadImage = async (
    uri: string,
    mimeType?: string,
): Promise<string> => {
    const contentType = getMimeType(uri, mimeType)
    const { upload_url, public_url } = await getUploadUrl(contentType)
    await putImageToR2(upload_url, uri, contentType)
    return public_url
}