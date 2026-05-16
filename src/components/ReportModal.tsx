import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { REPORT_REASONS, ReportReasonValue, reportPost } from '../lib/api';

type Props = {
    postId: string;
    visible: boolean;
    onClose: () => void;
    onReported: () => void;  // 通報完了後にカードを非表示にするコールバック
};

export default function ReportModal({
    postId,
    visible,
    onClose,
    onReported,
}: Props) {
    const [selected, setSelected] = useState<ReportReasonValue | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDone, setIsDone] = useState(false)

    const handleReport = async () => {
        if (!selected) return
        setIsLoading(true)
        try {
            await reportPost(postId, selected)
            setIsDone(true)
            // 1.5秒後に自動でモーダルを閉じてカードを非表示
            setTimeout(() => {
                onReported()
                handleClose()
            }, 1500)
        } catch (e) {
            console.warn('report failed:', e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setSelected(null)
        setIsLoading(false)
        setIsDone(false)
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose} />

            <View style={styles.sheet}>

                {isDone ? (
                    // 通報完了
                    <View style={styles.doneContainer}>
                        <Text style={styles.doneIcon}>✅</Text>
                        <Text style={styles.doneText}>通報を受け付けました</Text>
                        <Text style={styles.doneSub}>ご協力ありがとうございます</Text>
                    </View>
                ) : (
                    <>
                        {/* ヘッダー */}
                        <View style={styles.header}>
                            <Text style={styles.title}>🚩 この投稿を通報</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.description}>
                            通報理由を選択してください
                        </Text>

                        {/* 理由選択 */}
                        <View style={styles.reasonList}>
                            {REPORT_REASONS.map(({ value, label }) => (
                                <TouchableOpacity
                                    key={value}
                                    style={[
                                        styles.reasonBtn,
                                        selected === value && styles.reasonBtnSelected,
                                    ]}
                                    onPress={() => setSelected(value)}
                                >
                                    <View style={[
                                        styles.radio,
                                        selected === value && styles.radioSelected,
                                    ]} />
                                    <Text style={[
                                        styles.reasonLabel,
                                        selected === value && styles.reasonLabelSelected,
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 送信ボタン */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                (!selected || isLoading) && styles.submitBtnDisabled,
                            ]}
                            onPress={handleReport}
                            disabled={!selected || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitBtnText}>通報する</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    closeBtn: { padding: 4 },
    closeBtnText: { fontSize: 18, color: '#999' },
    description: {
        fontSize: 13,
        color: '#888',
        marginBottom: 16,
    },
    reasonList: {
        gap: 8,
        marginBottom: 20,
    },
    reasonBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
    },
    reasonBtnSelected: {
        borderColor: '#ef4444',
        backgroundColor: '#fff5f5',
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    radioSelected: {
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
    },
    reasonLabel: {
        fontSize: 14,
        color: '#555',
    },
    reasonLabelSelected: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: '#fca5a5',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    doneContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    doneIcon: { fontSize: 48, marginBottom: 12 },
    doneText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    doneSub: { fontSize: 13, color: '#888' },
})