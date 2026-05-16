import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cat, ReactionKey, Reactions } from '../types/cat';
import ReactionBar from './ReactionBar';
import CatImageDetail from './CatImageDetail';
import ReportModal from './ReportModal';
import { ReactionMasterItem } from '../lib/api';

type Props = {
    cat: Cat;
    reactionMaster: ReactionMasterItem[];
};

export default function CatCard({ cat, reactionMaster }: Props) {
    const [reactions, setReactions] = useState<Reactions>({ ...cat.reactions });
    const [activeKeys, setActiveKeys] = useState<Set<ReactionKey>>(new Set());
    const [detailVisible, setDetailVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [isReported, setIsReported] = useState(false);  // 通報後に非表示

    // 通報済みは表示しない
    if (isReported) return null

    const handleReact = (key: ReactionKey, updatedReactions?: Reactions) => {
        if (updatedReactions) {
            setReactions(updatedReactions)
        } else {
            const isActive = activeKeys.has(key)
            setReactions((prev) => ({
                ...prev,
                [key]: isActive ? prev[key] - 1 : prev[key] + 1,
            }))
        }
        setActiveKeys((prev) => {
            const next = new Set(prev)
            activeKeys.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    return (
        <View style={styles.card}>
            {/* 画像 */}
            <TouchableOpacity onPress={() => setDetailVisible(true)} activeOpacity={0.95}>
                {imgError ? (
                    <View style={styles.imageFallback}>
                        <Text style={styles.imageFallbackIcon}>🐱</Text>
                        <Text style={styles.imageFallbackText}>画像を表示できません</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: cat.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={() => setImgError(true)}
                    />
                )}
            </TouchableOpacity>

            {/* コメント + 通報ボタン */}
            <View style={styles.commentRow}>
                <Text style={styles.comment}>{cat.comment}</Text>
                <TouchableOpacity
                    style={styles.reportBtn}
                    onPress={() => setReportVisible(true)}
                >
                    <Text style={styles.reportBtnText}>🚩</Text>
                </TouchableOpacity>
            </View>

            {/* リアクション */}
            <ReactionBar
                postId={cat.id}
                reactions={reactions}
                activeKeys={activeKeys}
                reactionMaster={reactionMaster}
                onReact={handleReact}
            />

            {/* 詳細モーダル */}
            <CatImageDetail
                uri={cat.imageUrl}
                visible={detailVisible}
                onClose={() => setDetailVisible(false)}
            />

            {/* 通報モーダル */}
            <ReportModal
                postId={cat.id}
                visible={reportVisible}
                onClose={() => setReportVisible(false)}
                onReported={() => setIsReported(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',  // Web
        elevation: 2,                                 // Android
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
    },
    imageFallback: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageFallbackIcon: { fontSize: 40, marginBottom: 8 },
    imageFallbackText: { fontSize: 13, color: '#bbb' },
    commentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        gap: 8,
    },
    comment: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    reportBtn: {
        paddingTop: 2,
    },
    reportBtnText: {
        fontSize: 16,
        opacity: 0.4,
    },
});