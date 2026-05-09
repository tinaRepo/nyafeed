import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cat } from '../types/cat';

type Props = {
    cat: Cat;
};

export default function CatCard({ cat }: Props) {
    const [reactions, setReactions] = useState(cat.reactions);
    const [reacted, setReacted] = useState(false);

    const handleReaction = () => {
        if (reacted) {
            setReactions((prev) => prev - 1);
            setReacted(false);
        } else {
            setReactions((prev) => prev + 1);
            setReacted(true);
        }
    };

    return (
        <View style={styles.card}>
            <Image
                source={{ uri: cat.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.body}>
                <Text style={styles.comment}>{cat.comment}</Text>
                <TouchableOpacity
                    style={[styles.reactionBtn, reacted && styles.reactionBtnActive]}
                    onPress={handleReaction}
                >
                    <Text style={[styles.reactionText, reacted && styles.reactionTextActive]}>
                        🐾 {reactions}
                    </Text>
                </TouchableOpacity>
            </View>
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
        // Web向けdrop shadow
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 220,
        backgroundColor: '#f0f0f0',
    },
    body: {
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    comment: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginRight: 12,
        lineHeight: 20,
    },
    reactionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fafafa',
    },
    reactionBtnActive: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    reactionText: {
        fontSize: 14,
        color: '#888',
    },
    reactionTextActive: {
        color: '#f97316',
        fontWeight: 'bold',
    },
});