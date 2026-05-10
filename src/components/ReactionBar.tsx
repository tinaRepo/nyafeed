import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReactionKey, Reactions } from '../types/cat';
import { ReactionMasterItem } from '../lib/api';
import { addReaction } from '../lib/api';

type Props = {
    postId: string;
    reactions: Reactions;
    activeKeys: Set<ReactionKey>;
    reactionMaster: ReactionMasterItem[];
    onReact: (key: ReactionKey, updatedReactions?: Reactions) => void;
};

export default function ReactionBar({
    postId,
    reactions,
    activeKeys,
    reactionMaster,
    onReact,
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
            console.warn('reaction failed:', e)
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

    return (
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
                        <Text style={[styles.count, isActive && styles.countActive]}>
                            {reactions[key] ?? 0}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    );
}

const styles = StyleSheet.create({
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
    count: { fontSize: 12, color: '#aaa', minWidth: 16, textAlign: 'right' },
    countActive: { color: '#f97316', fontWeight: 'bold' },
});