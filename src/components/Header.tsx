import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onPost: () => void;
};

export default function Header({ onPost }: Props) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>🐾 NyaFeed</Text>
            <TouchableOpacity style={styles.postBtn} onPress={onPost}>
                <Text style={styles.postBtnText}>+ 投稿</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    postBtn: {
        backgroundColor: '#f97316',
        paddingVertical: 7,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    postBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
});