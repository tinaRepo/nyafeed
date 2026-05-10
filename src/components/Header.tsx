import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onPost: () => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
};

export default function Header({ onPost, onRefresh, isRefreshing }: Props) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>🐾 NyaFeed</Text>

            <View style={styles.actions}>
                {/* 更新ボタン */}
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={onRefresh}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <ActivityIndicator size="small" color="#f97316" />
                    ) : (
                        <Text style={styles.refreshBtnText}>↺</Text>
                    )}
                </TouchableOpacity>

                {/* 投稿ボタン */}
                <TouchableOpacity style={styles.postBtn} onPress={onPost}>
                    <Text style={styles.postBtnText}>+ 投稿</Text>
                </TouchableOpacity>
            </View>
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    refreshBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
    },
    refreshBtnText: {
        fontSize: 18,
        color: '#f97316',
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