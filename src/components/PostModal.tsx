import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    ScrollView,
} from 'react-native';
import { Cat, Reactions } from '../types/cat';

// 投稿時のダミー画像プール（画像未選択時のフォールバック）
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

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (cat: Cat) => void;
};

export default function PostModal({ visible, onClose, onSubmit }: Props) {
    const [comment, setComment] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const [error, setError] = useState('');

    // ファイル選択ハンドラ（Web: input[type=file]）
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setPreviewFile(objectUrl);
        setSelectedImage(objectUrl);
    };

    const handleSubmit = () => {
        if (!comment.trim()) {
            setError('コメントを入力してください');
            return;
        }

        // 画像未選択ならダミープールからランダム取得
        const imageUrl =
            selectedImage ??
            DUMMY_IMAGE_POOL[Math.floor(Math.random() * DUMMY_IMAGE_POOL.length)];

        const newCat: Cat = {
            id: `post-${Date.now()}`,
            imageUrl,
            comment: comment.trim(),
            reactions: { ...DEFAULT_REACTIONS },
        };

        onSubmit(newCat);
        handleClose();
    };

    const handleClose = () => {
        setComment('');
        setSelectedImage(null);
        setPreviewFile(null);
        setError('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            {/* 背景オーバーレイ */}
            <Pressable style={styles.overlay} onPress={handleClose} />

            {/* モーダル本体 */}
            <View style={styles.sheet}>
                <ScrollView
                    contentContainerStyle={styles.inner}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ヘッダー */}
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>🐾 猫を投稿する</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 画像プレビュー / 選択エリア */}
                    <View style={styles.imageArea}>
                        {previewFile ? (
                            <>
                                <Image
                                    source={{ uri: previewFile }}
                                    style={styles.preview}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={styles.removeImageBtn}
                                    onPress={() => {
                                        setPreviewFile(null);
                                        setSelectedImage(null);
                                    }}
                                >
                                    <Text style={styles.removeImageText}>画像を変更</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                                <Text style={styles.imagePlaceholderText}>
                                    画像を選択（省略可）
                                </Text>
                                <Text style={styles.imagePlaceholderSub}>
                                    未選択の場合はダミー画像が使われます
                                </Text>
                                {/* Web専用: input[type=file] をネイティブ要素で配置 */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={webFileInputStyle}
                                />
                            </View>
                        )}
                    </View>

                    {/* コメント入力 */}
                    <View style={styles.inputArea}>
                        <Text style={styles.label}>コメント *</Text>
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            value={comment}
                            onChangeText={(text) => {
                                setComment(text);
                                if (error) setError('');
                            }}
                            placeholder="この子についてひとこと…"
                            placeholderTextColor="#bbb"
                            multiline
                            numberOfLines={3}
                            maxLength={100}
                        />
                        <View style={styles.inputMeta}>
                            {error ? (
                                <Text style={styles.errorText}>{error}</Text>
                            ) : (
                                <Text style={styles.charCount}>{comment.length} / 100</Text>
                            )}
                        </View>
                    </View>

                    {/* 投稿ボタン */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            !comment.trim() && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!comment.trim()}
                    >
                        <Text style={styles.submitBtnText}>投稿する 🐱</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
}

// Web専用: input[type=file] スタイル（全面タップ可能に）
const webFileInputStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
};

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
    closeBtn: {
        padding: 4,
    },
    closeBtnText: {
        fontSize: 18,
        color: '#999',
    },
    imageArea: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#f7f7f7',
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        position: 'relative', // input重ね用
    },
    imagePlaceholderIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    imagePlaceholderSub: {
        fontSize: 11,
        color: '#bbb',
    },
    preview: {
        width: '100%',
        height: 200,
    },
    removeImageBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    removeImageText: {
        fontSize: 13,
        color: '#f97316',
    },
    inputArea: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 6,
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
});