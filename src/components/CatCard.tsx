import { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Cat, ReactionKey, Reactions } from '../types/cat';
import ReactionBar from './ReactionBar';
import CatImageDetail from './CatImageDetail';

type Props = {
    cat: Cat;
};

export default function CatCard({ cat }: Props) {
    const [reactions, setReactions] = useState<Reactions>({ ...cat.reactions });
    const [activeKeys, setActiveKeys] = useState<Set<ReactionKey>>(new Set());
    const [detailVisible, setDetailVisible] = useState(false);
    const [imgError, setImgError] = useState(false);

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
            {/* 画像タップで詳細表示 */}
            <TouchableOpacity
                onPress={() => setDetailVisible(true)}
                activeOpacity={0.95}
            >
                {imgError ? (
                    // 画像ロード失敗時のfallback
                    <View style={styles.imageFallback}>
                        <Text style={styles.imageFallbackIcon}>🐱</Text>
                        <Text style={styles.imageFallbackText}>画像を表示できません</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: cat.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"         // 正方形トリミング
                        onError={() => setImgError(true)}
                    />
                )}
            </TouchableOpacity>

            {/* コメント */}
            <View style={styles.commentRow}>
                <Text style={styles.comment}>{cat.comment}</Text>
            </View>

            {/* リアクション */}
            <ReactionBar
                postId={cat.id}
                reactions={reactions}
                activeKeys={activeKeys}
                onReact={handleReact}
            />

            {/* 詳細モーダル */}
            <CatImageDetail
                uri={cat.imageUrl}
                visible={detailVisible}
                onClose={() => setDetailVisible(false)}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    image: {
        width: '100%',
        aspectRatio: 1,        // ← 正方形（1:1）に統一
        backgroundColor: '#f0f0f0',
    },
    imageFallback: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageFallbackIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    imageFallbackText: {
        fontSize: 13,
        color: '#bbb',
    },
    commentRow: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
    },
    comment: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});