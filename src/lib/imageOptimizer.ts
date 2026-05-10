// Web専用：Canvas API を使ってリサイズ + WebP変換
// ネイティブ（Expo Go）では変換せずそのまま使用

import { Platform } from 'react-native'

type OptimizeResult = {
    uri: string
    mimeType: string
    fileName: string
}

const MAX_LONG_SIDE = 1080  // 長辺の最大px

// Canvas でリサイズ + WebP変換（Web専用）
const optimizeOnWeb = (uri: string): Promise<OptimizeResult> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => {
            const { naturalWidth: w, naturalHeight: h } = img

            // リサイズ計算（長辺1080px基準）
            const scale = Math.min(1, MAX_LONG_SIDE / Math.max(w, h))
            const targetW = Math.round(w * scale)
            const targetH = Math.round(h * scale)

            const canvas = document.createElement('canvas')
            canvas.width = targetW
            canvas.height = targetH

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Canvas context unavailable'))
                return
            }

            ctx.drawImage(img, 0, 0, targetW, targetH)

            // WebP変換（quality: 0.85）
            const webpUri = canvas.toDataURL('image/webp', 0.85)

            resolve({
                uri: webpUri,
                mimeType: 'image/webp',
                fileName: `cat_${Date.now()}.webp`,
            })
        }
        img.onerror = () => reject(new Error('Image load failed'))
        img.src = uri
    })
}

// 公開関数：Platform分岐
export const optimizeImage = async (
    uri: string,
    mimeType?: string,
): Promise<OptimizeResult> => {
    // ネイティブ（Expo Go）はそのまま返す
    if (Platform.OS !== 'web') {
        return {
            uri,
            mimeType: mimeType ?? 'image/jpeg',
            fileName: `cat_${Date.now()}.jpg`,
        }
    }

    // すでにWebPの場合はリサイズのみ
    try {
        return await optimizeOnWeb(uri)
    } catch (e) {
        console.warn('image optimize failed, use original:', e)
        // 失敗時はオリジナルで続行
        return {
            uri,
            mimeType: mimeType ?? 'image/jpeg',
            fileName: `cat_${Date.now()}.jpg`,
        }
    }
}