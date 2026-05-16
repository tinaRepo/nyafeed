import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onTerms: () => void;
    onPrivacy: () => void;
    onAdmin: () => void;
};

export default function Footer({ onTerms, onPrivacy, onAdmin }: Props) {
    // 本番環境では管理者リンクを非表示
    const isProduction = process.env.EXPO_PUBLIC_NODE_ENV === 'production'

    return (
        <View style={styles.footer}>
            <Text style={styles.copy}>© 2026 NyaFeed</Text>
            <View style={styles.links}>
                <TouchableOpacity onPress={onTerms}>
                    <Text style={styles.link}>利用規約</Text>
                </TouchableOpacity>
                <Text style={styles.separator}>|</Text>
                <TouchableOpacity onPress={onPrivacy}>
                    <Text style={styles.link}>プライバシーポリシー</Text>
                </TouchableOpacity>
                {/* 本番環境では非表示 */}
                {!isProduction && (
                    <>
                        <Text style={styles.separator}>|</Text>
                        <TouchableOpacity onPress={onAdmin}>
                            <Text style={[styles.link, { color: '#ccc' }]}>管理</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fafafa',
        alignItems: 'center',
        gap: 6,
    },
    copy: {
        fontSize: 11,
        color: '#bbb',
    },
    links: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    link: {
        fontSize: 12,
        color: '#f97316',
    },
    separator: {
        fontSize: 12,
        color: '#ddd',
    },
})