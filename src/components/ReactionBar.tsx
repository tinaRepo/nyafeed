import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReactionKey, Reactions } from '../types/cat';

// リアクション定義（ラベル・絵文字を一元管理）
const REACTION_CONFIG: { key: ReactionKey; emoji: string; label: string }[] = [
    { key: 'cute', emoji: '😍', label: 'かわいい！' },
    { key: 'sniff', emoji: '😤', label: '吸いたい' },
    { key: 'healing', emoji: '🌿', label: '癒される〜' },
    { key: 'pressure', emoji: '😤', label: '圧がすごい' },
    { key: 'fluffy', emoji: '🐾', label: 'もふもふ' },
];

type Props = {
    reactions: Reactions;
    activeKeys: Set<ReactionKey>;
    onReact: (key: ReactionKey) => void;
};

export default function ReactionBar({ reactions, activeKeys, onReact }: Props) {
    return (
        <View style={styles.container}>
            {REACTION_CONFIG.map(({ key, emoji, label }) => {
                const isActive = activeKeys.has(key);
                return (
                    <TouchableOpacity
                        key={key}
                        style={[styles.btn, isActive && styles.btnActive]}
                        onPress={() => onReact(key)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.emoji}>{emoji}</Text>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {label}
                        </Text>
                        <Text style={[styles.count, isActive && styles.countActive]}>
                            {reactions[key]}
                        </Text>
                    </TouchableOpacity>
                );
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
    btnActive: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    emoji: {
        fontSize: 13,
    },
    label: {
        fontSize: 11,
        color: '#888',
    },
    labelActive: {
        color: '#f97316',
        fontWeight: 'bold',
    },
    count: {
        fontSize: 12,
        color: '#aaa',
        minWidth: 16,
        textAlign: 'right',
    },
    countActive: {
        color: '#f97316',
        fontWeight: 'bold',
    },
});