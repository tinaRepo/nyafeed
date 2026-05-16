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

export default function PrivacyScreen({ onBack }: Props) {
    return (
        <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← 戻る</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>プライバシーポリシー</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.updatedAt}>最終更新日：2026年5月1日</Text>

                <Text style={styles.intro}>
                    NyaFeed（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
                    個人情報の保護に努めます。
                    本ポリシーは本サービスにおける情報の取り扱いについて説明します。
                </Text>

                <Text style={styles.sectionTitle}>1. 収集する情報</Text>
                <Text style={styles.body}>
                    本サービスでは以下の情報を収集します。{'\n\n'}
                    【自動的に収集される情報】{'\n'}
                    ・アクセスログ（IPアドレス・アクセス日時・ブラウザ情報）{'\n'}
                    ・利用端末情報{'\n\n'}
                    【ユーザーが提供する情報】{'\n'}
                    ・投稿した画像データ{'\n'}
                    ・投稿したコメント{'\n\n'}
                    ※ユーザー登録は不要であり、氏名・メールアドレス等の個人情報は収集しません。
                </Text>

                <Text style={styles.sectionTitle}>2. 画像データの保存</Text>
                <Text style={styles.body}>
                    投稿された画像はCloudflare R2（オブジェクトストレージ）に保存されます。
                    投稿画像は本サービスの表示目的のみに使用し、第三者への提供は行いません。
                    不適切と判断された画像は運営の判断により削除される場合があります。
                </Text>

                <Text style={styles.sectionTitle}>3. アクセスログの利用目的</Text>
                <Text style={styles.body}>
                    収集したアクセスログは以下の目的で利用します。{'\n\n'}
                    ・サービスの安定運用{'\n'}
                    ・不正アクセス・スパムの検知・対応{'\n'}
                    ・サービス改善のための統計分析
                </Text>

                <Text style={styles.sectionTitle}>4. Cookieの使用</Text>
                <Text style={styles.body}>
                    本サービスは現時点でCookieを使用していません。
                    将来的にCookieを使用する場合は、本ポリシーを更新してお知らせします。
                </Text>

                <Text style={styles.sectionTitle}>5. 第三者サービスの利用</Text>
                <Text style={styles.body}>
                    本サービスは以下の第三者サービスを利用しています。{'\n\n'}
                    ・Cloudflare R2（画像ストレージ）{'\n'}
                    ・Neon（データベース）{'\n'}
                    ・Google Cloud Vision API（画像解析）{'\n\n'}
                    各サービスのプライバシーポリシーについては、各社のウェブサイトをご参照ください。
                </Text>

                <Text style={styles.sectionTitle}>6. 情報の第三者提供</Text>
                <Text style={styles.body}>
                    運営は以下の場合を除き、収集した情報を第三者に提供しません。{'\n\n'}
                    ・法令に基づく場合{'\n'}
                    ・人の生命・身体・財産の保護のために必要な場合{'\n'}
                    ・公共の利益のために必要な場合
                </Text>

                <Text style={styles.sectionTitle}>7. お問い合わせ</Text>
                <Text style={styles.body}>
                    本ポリシーに関するお問い合わせは、サービス内の通報機能をご利用ください。
                </Text>

                <Text style={styles.sectionTitle}>8. ポリシーの変更</Text>
                <Text style={styles.body}>
                    運営は必要に応じて本ポリシーを変更する場合があります。
                    変更後は本ページにて公開します。
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