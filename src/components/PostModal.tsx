// handleSubmit 内のアップロード前に最適化処理を追加

import { optimizeImage } from '../lib/imageOptimizer';
import { getToastMessage } from '../lib/toastMessage'
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Cat, Reactions } from '../types/cat';
import ImagePickerComponent, { PickedImage } from './ImagePicker';
import { uploadImage } from '../lib/upload';
import { createPost } from '../lib/api';

const DUMMY_IMAGE_POOL = [
    'https://placecats.com/406/300',
    'https://placecats.com/407/300',
    'https://placecats.com/408/300',
    'https://placecats.com/409/300',
    'https://placecats.com/410/300',
];

const DEFAULT_REACTIONS: Reactions = {
    cute: 0,
    sniff: 0,
    healing: 0,
    pressure: 0,
    fluffy: 0,
};

// アップロード状態をステップで管理
type UploadState =
    | { status: 'idle' }
    | { status: 'uploading_image' }   // R2アップロード中
    | { status: 'checking_image' }    // VISION API画像確認中
    | { status: 'saving_post' }       // API保存中
    | { status: 'error'; message: string }

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (cat: Cat, toastMsg: string) => void;
};

export default function PostModal({ visible, onClose, onSubmit }: Props) {
    const [comment, setComment] = useState('');
    const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
    const [commentError, setCommentError] = useState('');
    const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });

    const isLoading = uploadState.status !== 'idle'
        && uploadState.status !== 'error'

    // ローディングメッセージをステップに応じて切り替え
    const loadingMessage =
        uploadState.status === 'uploading_image'
            ? '画像をアップロード中…'
            : uploadState.status === 'checking_image'
                ? '画像を確認中…'
                : '投稿を保存中…'

    const handleSubmit = async () => {
        if (!comment.trim()) {
            setCommentError('コメントを入力してください');
            return;
        }

        try {
            let imageUrl: string

            if (pickedImage) {
                setUploadState({ status: 'uploading_image' })

                // 最適化（リサイズ + WebP変換）してからアップロード
                const optimized = await optimizeImage(pickedImage.uri, pickedImage.mimeType)
                imageUrl = await uploadImage(optimized.uri, optimized.mimeType)

            } else {
                imageUrl = DUMMY_IMAGE_POOL[
                    Math.floor(Math.random() * DUMMY_IMAGE_POOL.length)
                ] as string
            }

            setUploadState({ status: 'checking_image' })
            const created = await createPost({
                image_url: imageUrl,
                comment: comment.trim(),
            })

            setUploadState({ status: 'saving_post' })
            const newCat: Cat = {
                id: created.id,
                imageUrl: created.image_url,
                comment: created.comment,
                reactions: { ...DEFAULT_REACTIONS },
            }

            const toastMsg = getToastMessage(created.labels ?? [])

            onSubmit(newCat, toastMsg)
            handleClose()

        } catch (e) {
            const message = e instanceof Error ? e.message : '投稿に失敗しました'
            setUploadState({ status: 'error', message })
        }
    };

    const handleClose = () => {
        if (isLoading) return
        setComment('');
        setPickedImage(null);
        setCommentError('');
        setUploadState({ status: 'idle' });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose} />

            <View style={styles.sheet}>
                <ScrollView
                    contentContainerStyle={styles.inner}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ヘッダー */}
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>🐾 猫を投稿する</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeBtn}
                            disabled={isLoading}
                        >
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 画像選択 */}
                    <View style={styles.section}>
                        <Text style={styles.label}>猫画像</Text>
                        <ImagePickerComponent
                            value={pickedImage}
                            onChange={setPickedImage}
                        />
                    </View>

                    {/* コメント入力 */}
                    <View style={styles.section}>
                        <Text style={styles.label}>コメント *</Text>
                        <TextInput
                            style={[styles.input, commentError ? styles.inputError : null]}
                            value={comment}
                            onChangeText={(text) => {
                                setComment(text);
                                if (commentError) setCommentError('');
                            }}
                            placeholder="この子についてひとこと…"
                            placeholderTextColor="#bbb"
                            multiline
                            numberOfLines={3}
                            maxLength={100}
                            editable={!isLoading}
                        />
                        <View style={styles.inputMeta}>
                            {commentError ? (
                                <Text style={styles.errorText}>{commentError}</Text>
                            ) : (
                                <Text style={styles.charCount}>{comment.length} / 100</Text>
                            )}
                        </View>
                    </View>

                    {/* エラー表示 */}
                    {uploadState.status === 'error' && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorBoxText}>
                                ⚠️ {uploadState.message}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setUploadState({ status: 'idle' })}
                            >
                                <Text style={styles.retryText}>再試行</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 投稿ボタン */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!comment.trim() || isLoading) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!comment.trim() || isLoading}
                    >
                        {isLoading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.submitBtnText}>{loadingMessage}</Text>
                            </View>
                        ) : (
                            <Text style={styles.submitBtnText}>投稿する 🐱</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 32,
    },
    inner: {
        padding: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    closeBtn: { padding: 4 },
    closeBtnText: {
        fontSize: 18,
        color: '#999',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fafafa',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fff5f5',
    },
    inputMeta: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
    },
    charCount: {
        fontSize: 11,
        color: '#bbb',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#fff5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    errorBoxText: {
        fontSize: 12,
        color: '#ef4444',
        flex: 1,
    },
    retryText: {
        fontSize: 12,
        color: '#f97316',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    submitBtn: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: '#fbd5b5',
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});