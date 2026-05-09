import { useState } from 'react';
import {
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
    const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
    const [commentError, setCommentError] = useState('');

    const handleSubmit = () => {
        if (!comment.trim()) {
            setCommentError('コメントを入力してください');
            return;
        }

        const imageUrl =
            pickedImage?.uri ??
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
        setPickedImage(null);
        setCommentError('');
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
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 画像選択（ImagePickerに差し替え） */}
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
                        />
                        <View style={styles.inputMeta}>
                            {commentError ? (
                                <Text style={styles.errorText}>{commentError}</Text>
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