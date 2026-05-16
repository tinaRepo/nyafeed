import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    onBack: () => void;
};

export default function TermsScreen({ onBack }: Props) {
    return (
        <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← 戻る</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>利用規約</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.updatedAt}>最終更新日：2026年5月1日</Text>

                <Text style={styles.intro}>
                    NyaFeed（以下「本サービス」）をご利用いただく前に、
                    以下の利用規約をよくお読みください。
                    本サービスを利用した時点で、本規約に同意したものとみなします。
                </Text>

                <Text style={styles.sectionTitle}>第1条（サービスの概要）</Text>
                <Text style={styles.body}>
                    本サービスは、猫の画像を匿名で投稿・閲覧できる掲示板サービスです。
                    投稿はすべて匿名で行われ、ユーザー登録は不要です。
                </Text>

                <Text style={styles.sectionTitle}>第2条（禁止事項）</Text>
                <Text style={styles.body}>
                    ユーザーは以下の行為を行ってはなりません。{'\n\n'}
                    ・猫以外の画像の投稿{'\n'}
                    ・他者への誹謗中傷・侮辱{'\n'}
                    ・スパム・宣伝目的の投稿{'\n'}
                    ・わいせつ・暴力的・差別的な内容の投稿{'\n'}
                    ・個人情報の掲載{'\n'}
                    ・著作権を侵害するコンテンツの投稿{'\n'}
                    ・本サービスへの不正アクセス・攻撃行為{'\n'}
                    ・その他、法令または公序良俗に反する行為
                </Text>

                <Text style={styles.sectionTitle}>第3条（投稿コンテンツの責任）</Text>
                <Text style={styles.body}>
                    投稿コンテンツに関する責任は、投稿者本人に帰属します。
                    運営は投稿内容の正確性・適法性を保証しません。
                    不適切な投稿は運営の判断により削除する場合があります。
                </Text>

                <Text style={styles.sectionTitle}>第4条（運営の免責）</Text>
                <Text style={styles.body}>
                    運営は以下について一切の責任を負いません。{'\n\n'}
                    ・本サービスの利用によって生じた損害{'\n'}
                    ・投稿コンテンツの内容{'\n'}
                    ・サービスの中断・停止・終了{'\n'}
                    ・データの消失・破損
                </Text>

                <Text style={styles.sectionTitle}>第5条（サービスの変更・終了）</Text>
                <Text style={styles.body}>
                    運営は事前の通知なく、本サービスの内容の変更・停止・終了を行う場合があります。
                </Text>

                <Text style={styles.sectionTitle}>第6条（規約の変更）</Text>
                <Text style={styles.body}>
                    運営は必要に応じて本規約を変更する場合があります。
                    変更後も本サービスを利用した場合、変更後の規約に同意したものとみなします。
                </Text>

                <Text style={styles.sectionTitle}>第7条（準拠法）</Text>
                <Text style={styles.body}>
                    本規約は日本法に基づいて解釈されます。
                </Text>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: { padding: 4 },
    backBtnText: { fontSize: 14, color: '#f97316' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    headerRight: { width: 50 },
    content: { padding: 20 },
    updatedAt: { fontSize: 12, color: '#aaa', marginBottom: 16 },
    intro: { fontSize: 13, color: '#666', lineHeight: 22, marginBottom: 24 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 8 },
    body: { fontSize: 13, color: '#555', lineHeight: 22 },
    bottomPadding: { height: 40 },
})