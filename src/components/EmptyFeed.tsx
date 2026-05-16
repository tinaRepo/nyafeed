import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    onPost: () => void;
};

export default function EmptyFeed({ onPost }: Props) {
    return (
        <View style={styles.container}>

            {/* イラスト部分 */}
            <View style={styles.illustration}>
                <Text style={styles.catIcon}>🐱</Text>
                <View style={styles.speechBubble}>
                    <Text style={styles.speechText}>にゃ？</Text>
                </View>
            </View>

            {/* メッセージ */}
            <Text style={styles.title}>まだ猫がいないにゃ…</Text>
            <Text style={styles.description}>
                ここはかわいい猫だけが流れる場所。{'\n'}
                あなたの猫を最初に投稿してみよう！
            </Text>

            {/* 投稿ボタン */}
            <TouchableOpacity style={styles.postBtn} onPress={onPost}>
                <Text style={styles.postBtnText}>🐾 最初の猫を投稿する</Text>
            </TouchableOpacity>

            {/* サブテキスト */}
            <Text style={styles.subText}>匿名で投稿できます</Text>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    illustration: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    catIcon: {
        fontSize: 80,
    },
    speechBubble: {
        position: 'absolute',
        top: -8,
        right: -24,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#f97316',
        paddingVertical: 4,
        paddingHorizontal: 10,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',  // Web
        elevation: 2,                                 // Android
    },
    speechText: {
        fontSize: 13,
        color: '#f97316',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    postBtn: {
        backgroundColor: '#f97316',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 28,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',  // Web
        elevation: 2,                                 // Android
    },
    postBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    subText: {
        fontSize: 12,
        color: '#bbb',
    },
})