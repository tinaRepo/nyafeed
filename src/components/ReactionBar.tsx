import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReactionKey, Reactions } from '../types/cat';
import { addReaction } from '../lib/api';

const REACTION_CONFIG: { key: ReactionKey; emoji: string; label: string }[] = [
    { key: 'cute', emoji: '😍', label: 'かわいい！' },
    { key: 'sniff', emoji: '😤', label: '吸いたい' },
    { key: 'healing', emoji: '🌿', label: '癒される〜' },
    { key: 'pressure', emoji: '😤', label: '圧がすごい' },
    { key: 'fluffy', emoji: '🐾', label: 'もふもふ' },
];

type Props = {
    postId: string;
    reactions: Reactions;
    activeKeys: Set<ReactionKey>;
    onReact: (key: ReactionKey, updatedReactions?: Reactions) => void;
};

export default function ReactionBar({
    postId,
    reactions,
    activeKeys,
    onReact,
}: Props) {
    const [sendingKeys, setSendingKeys] = useState<Set<ReactionKey>>(new Set())

    const handlePress = async (key: ReactionKey) => {
        if (sendingKeys.has(key)) return

        // 現在の状態でadd/removeを決定
        const action = activeKeys.has(key) ? 'remove' : 'add'  // ← 追加

        // 楽観更新
        onReact(key)

        setSendingKeys((prev) => new Set(prev).add(key))
        try {
            const result = await addReaction(postId, key, action)  // ← action追加
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

    return (
        <View style={styles.container}>
            {REACTION_CONFIG.map(({ key, emoji, label }) => {
                const isActive = activeKeys.has(key)
                const isSending = sendingKeys.has(key)

                return (
                    <TouchableOpacity
                        key={key}
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
                            {reactions[key]}
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