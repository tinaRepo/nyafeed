import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReactionKey, Reactions } from '../types/cat';
import { ReactionMasterItem } from '../lib/api';
import { addReaction } from '../lib/api';
import { toFuzzyLabel, calcTotalReactions } from '../lib/fuzzyCount';

type Props = {
    postId: string;
    reactions: Reactions;
    activeKeys: Set<ReactionKey>;
    reactionMaster: ReactionMasterItem[];
    onReact: (key: ReactionKey, updatedReactions?: Reactions) => void;
    onError?: (message: string) => void;
};

// levelに応じたラベルカラー
const LEVEL_COLORS: Record<number, string> = {
    0: 'transparent',
    1: '#94a3b8',  // slate（じわじわ）
    2: '#f97316',  // orange（かなり）
    3: '#ef4444',  // red（集まっている）
    4: '#dc2626',  // red-700（危険）
    5: '#7c3aed',  // violet（神クラス）
}

export default function ReactionBar({
    postId,
    reactions,
    activeKeys,
    reactionMaster,
    onReact,
    onError,
}: Props) {
    const [sendingKeys, setSendingKeys] = useState<Set<ReactionKey>>(new Set())

    const handlePress = async (key: ReactionKey) => {
        if (sendingKeys.has(key)) return
        const action = activeKeys.has(key) ? 'remove' : 'add'
        onReact(key)

        setSendingKeys((prev) => new Set(prev).add(key))
        try {
            const result = await addReaction(postId, key, action)
            onReact(key, result.reactions as Reactions)
        } catch (e) {
            onReact(key)
            const message = e instanceof Error ? e.message : 'リアクションに失敗しました'
            onError?.(message)
        } finally {
            setSendingKeys((prev) => {
                const next = new Set(prev)
                next.delete(key)
                return next
            })
        }
    }

    // マスターが未取得の場合は表示しない
    if (reactionMaster.length === 0) return null

    // 合計リアクション数を曖昧ラベルに変換
    const total = calcTotalReactions(reactions)
    const fuzzy = toFuzzyLabel(total)

    return (
        <View style={styles.wrapper}>
            {/* リアクションボタン群 */}
            <View style={styles.container}>
                {reactionMaster.map(({ name, emoji, label }) => {
                    const key = name as ReactionKey
                    const isActive = activeKeys.has(key)
                    const isSending = sendingKeys.has(key)

                    return (
                        <TouchableOpacity
                            key={name}
                            style={[
                                styles.btn,
                                isActive && styles.btnActive,
                                isSending && styles.btnSending,
                            ]}
                            onPress={() => handlePress(key)}
                            activeOpacity={0.7}
                            disabled={isSending}
                        >
                            <Text style={styles.emoji}>{emoji}</Text>
                            <Text style={[styles.label, isActive && styles.labelActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* 曖昧ラベル表示（合計が1以上の場合のみ） */}
            {fuzzy.level > 0 && (
                <View style={styles.fuzzyRow}>
                    <Text style={[
                        styles.fuzzyLabel,
                        { color: LEVEL_COLORS[fuzzy.level] ?? '#888' }
                    ]}>
                        🐾 {fuzzy.label}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingBottom: 14,
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        paddingHorizontal: 14,
        paddingBottom: 14,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
    },
    btnActive: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
    btnSending: { opacity: 0.5 },
    emoji: { fontSize: 13 },
    label: { fontSize: 11, color: '#888' },
    labelActive: { color: '#f97316', fontWeight: 'bold' },
    fuzzyRow: {
        paddingHorizontal: 14,
        paddingTop: 2,
    },
    fuzzyLabel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});