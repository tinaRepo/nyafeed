import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Cat, ReactionKey, Reactions } from '../types/cat';
import ReactionBar from './ReactionBar';

type Props = {
    cat: Cat;
};

export default function CatCard({ cat }: Props) {
    const [reactions, setReactions] = useState<Reactions>({ ...cat.reactions });
    const [activeKeys, setActiveKeys] = useState<Set<ReactionKey>>(new Set());

    const handleReact = (key: ReactionKey, updatedReactions?: Reactions) => {
        if (updatedReactions) {
            // APIレスポンスの正確な数値で上書き
            setReactions(updatedReactions)
        } else {
            // 楽観更新（API応答前の即時反映）
            const isActive = activeKeys.has(key)
            setReactions((prev) => ({
                ...prev,
                [key]: isActive ? prev[key] - 1 : prev[key] + 1,
            }))
        }

        // アクティブ状態のトグル
        setActiveKeys((prev) => {
            const next = new Set(prev)
            activeKeys.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    return (
        <View style={styles.card}>
            <Image
                source={{ uri: cat.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.commentRow}>
                <Text style={styles.comment}>{cat.comment}</Text>
            </View>
            <ReactionBar
                postId={cat.id}
                reactions={reactions}
                activeKeys={activeKeys}
                onReact={handleReact}
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
        height: 220,
        backgroundColor: '#f0f0f0',
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