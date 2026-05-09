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

type UploadState =
    | { status: 'idle' }
    | { status: 'uploading' }
    | { status: 'error'; message: string }

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (cat: Cat) => void;
};

export default function PostModal({ visible, onClose, onSubmit }: Props) {
    const [comment, setComment] = useState('');
    const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
    const [commentError, setCommentError] = useState('');
    const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });

    const isUploading = uploadState.status === 'uploading'

    const handleSubmit = async () => {
        if (!comment.trim()) {
            setCommentError('コメントを入力してください');
            return;
        }

        setUploadState({ status: 'uploading' });

        try {
            let imageUrl: string

            if (pickedImage) {
                // 画像が選択されている場合はR2にアップロード
                imageUrl = await uploadImage(pickedImage.uri, pickedImage.mimeType)
            } else {
                // 未選択の場合はダミー画像
                imageUrl = DUMMY_IMAGE_POOL[
                    Math.floor(Math.random() * DUMMY_IMAGE_POOL.length)
                ] as string
            }

            const newCat: Cat = {
                id: `post-${Date.now()}`,
                imageUrl,
                comment: comment.trim(),
                reactions: { ...DEFAULT_REACTIONS },
            };

            onSubmit(newCat);
            handleClose();

        } catch (e) {
            const message = e instanceof Error ? e.message : 'アップロードに失敗しました'
            setUploadState({ status: 'error', message })
        }
    };

    const handleClose = () => {
        if (isUploading) return  // アップロード中は閉じない
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
            <Pressable
                style={styles.overlay}
                onPress={handleClose}
            />

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
                            disabled={isUploading}
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
                            editable={!isUploading}
                        />
                        <View style={styles.inputMeta}>
                            {commentError ? (
                                <Text style={styles.errorText}>{commentError}</Text>
                            ) : (
                                <Text style={styles.charCount}>{comment.length} / 100</Text>
                            )}
                        </View>
                    </View>

                    {/* アップロードエラー表示 */}
                    {uploadState.status === 'error' && (
                        <View style={styles.uploadErrorBox}>
                            <Text style={styles.uploadErrorText}>
                                ⚠️ {uploadState.message}
                            </Text>
                            <TouchableOpacity onPress={() => setUploadState({ status: 'idle' })}>
                                <Text style={styles.retryText}>再試行</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 投稿ボタン */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!comment.trim() || isUploading) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!comment.trim() || isUploading}
                    >
                        {isUploading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.submitBtnText}>アップロード中…</Text>
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
    uploadErrorBox: {
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
    uploadErrorText: {
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