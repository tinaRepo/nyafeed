import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Cat, ReactionKey, Reactions } from '../types/cat';
import ReactionBar from './ReactionBar';

type Props = {
    cat: Cat;
};

export default function CatCard({ cat }: Props) {
    // リアクション数（カード単位で管理）
    const [reactions, setReactions] = useState<Reactions>({ ...cat.reactions });
    // 押したボタンのSet（トグル管理）
    const [activeKeys, setActiveKeys] = useState<Set<ReactionKey>>(new Set());

    const handleReact = (key: ReactionKey) => {
        const isActive = activeKeys.has(key);

        // カウント増減
        setReactions((prev) => ({
            ...prev,
            [key]: isActive ? prev[key] - 1 : prev[key] + 1,
        }));

        // アクティブ状態トグル
        setActiveKeys((prev) => {
            const next = new Set(prev);
            isActive ? next.delete(key) : next.add(key);
            return next;
        });
    };

    return (
        <View style={styles.card}>
            {/* 猫画像 */}
            <Image
                source={{ uri: cat.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* コメント */}
            <View style={styles.commentRow}>
                <Text style={styles.comment}>{cat.comment}</Text>
            </View>

            {/* リアクションバー */}
            <ReactionBar
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