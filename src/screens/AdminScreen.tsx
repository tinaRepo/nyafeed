import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    AdminReportItem,
    AdminPostItem,
    getAdminReports,
    getAdminPosts,
    deleteAdminPost,
} from '../lib/api';
import { Platform } from 'react-native'

type Tab = 'reports' | 'all'
type Props = { onBack: () => void }

export default function AdminScreen({ onBack }: Props) {
    const [tab, setTab] = useState<Tab>('reports')
    const [isLoading, setIsLoading] = useState(false)
    const [reports, setReports] = useState<AdminReportItem[]>([])
    const [allPosts, setAllPosts] = useState<AdminPostItem[]>([])
    const [password, setPassword] = useState('')
    const [authed, setAuthed] = useState(false)
    const [authError, setAuthError] = useState('')

    const handleLogin = async () => {
        setIsLoading(true)
        setAuthError('')
        try {
            await getAdminReports()
            setAuthed(true)
        } catch {
            setAuthError('パスワードが違います')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        try {
            if (tab === 'reports') {
                const data = await getAdminReports()
                setReports(data)
            } else {
                const data = await getAdminPosts()
                setAllPosts(data)
            }
        } catch (e) {
            console.warn('fetch failed:', e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (authed) fetchData()
    }, [authed, tab])

    const handleDelete = (postId: string) => {
        // Web: window.confirm を使用
        // ネイティブ: Alert.alert を使用
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('この投稿を完全に削除しますか？')
            if (!confirmed) return
            deletePost(postId)
            return
        }

        // ネイティブ（iOS / Android）
        Alert.alert(
            '投稿を削除',
            'この投稿を完全に削除しますか？',
            [
                { text: 'キャンセル', style: 'cancel' },
                {
                    text: '削除する',
                    style: 'destructive',
                    onPress: () => deletePost(postId),
                },
            ]
        )
    }

    const deletePost = async (postId: string) => {
        try {
            await deleteAdminPost(postId)
            setReports((prev) => prev.filter((r) => r.postId !== postId))
            setAllPosts((prev) => prev.filter((p) => p.id !== postId))
        } catch (e) {
            if (Platform.OS === 'web') {
                window.alert('削除に失敗しました')
            } else {
                Alert.alert('エラー', '削除に失敗しました')
            }
        }
    }

    // ── ログイン画面 ──────────────────────────
    if (!authed) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← 戻る</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>管理者ログイン</Text>
                    <View style={styles.headerRight} />
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginTitle}>🔐 管理者パスワード</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="パスワードを入力"
                        secureTextEntry
                        placeholderTextColor="#bbb"
                    />
                    {authError ? (
                        <Text style={styles.authError}>{authError}</Text>
                    ) : null}
                    <TouchableOpacity
                        style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.loginBtnText}>ログイン</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    // ── 管理画面 ──────────────────────────────
    return (
        <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← 戻る</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>管理者画面</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <Text style={styles.refreshBtnText}>↺</Text>
                </TouchableOpacity>
            </View>

            {/* タブ */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'reports' && styles.tabActive]}
                    onPress={() => setTab('reports')}
                >
                    <Text style={[styles.tabText, tab === 'reports' && styles.tabTextActive]}>
                        🚩 通報一覧（{reports.length}）
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'all' && styles.tabActive]}
                    onPress={() => setTab('all')}
                >
                    <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
                        📋 全投稿
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#f97316" />
                </View>
            ) : (
                <ScrollView style={styles.list}>

                    {/* 通報一覧 */}
                    {tab === 'reports' && (
                        reports.length === 0 ? (
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>通報はありません ✅</Text>
                            </View>
                        ) : (
                            reports.map((item) => (
                                <View key={item.postId} style={styles.card}>
                                    {item.post ? (
                                        <Image
                                            source={{ uri: item.post.imageUrl }}
                                            style={styles.thumbnail}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.thumbnail, styles.thumbnailDeleted]}>
                                            <Text style={styles.thumbnailDeletedText}>削除済み</Text>
                                        </View>
                                    )}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.reportCount}>
                                            🚩 {item.reportCount}件の通報
                                        </Text>
                                        <Text style={styles.comment} numberOfLines={2}>
                                            {item.post?.comment ?? '（投稿削除済み）'}
                                        </Text>
                                        <Text style={styles.reasons}>
                                            理由: {[...new Set(item.reasons.map((r) => r.reason))].join(' / ')}
                                        </Text>
                                        {item.post && (
                                            <TouchableOpacity
                                                style={styles.deleteBtn}
                                                onPress={() => handleDelete(item.postId)}
                                            >
                                                <Text style={styles.deleteBtnText}>🗑 削除する</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))
                        )
                    )}

                    {/* 全投稿一覧 */}
                    {tab === 'all' && (
                        allPosts.length === 0 ? (
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>投稿がありません</Text>
                            </View>
                        ) : (
                            allPosts.map((post) => (
                                <View key={post.id} style={styles.card}>
                                    <Image
                                        source={{ uri: post.imageUrl }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.cardContent}>
                                        <Text style={styles.comment} numberOfLines={2}>
                                            {post.comment}
                                        </Text>
                                        <Text style={styles.postDate}>
                                            {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDelete(post.id)}
                                        >
                                            <Text style={styles.deleteBtnText}>🗑 削除する</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
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
    headerRight: { width: 40 },
    refreshBtn: { padding: 4 },
    refreshBtnText: { fontSize: 20, color: '#f97316' },
    loginContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    loginTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fafafa',
        marginBottom: 8,
    },
    authError: { fontSize: 12, color: '#ef4444', marginBottom: 12 },
    loginBtn: {
        width: '100%',
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    loginBtnDisabled: { backgroundColor: '#fbd5b5' },
    loginBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: { borderBottomWidth: 2, borderBottomColor: '#f97316' },
    tabText: { fontSize: 13, color: '#999' },
    tabTextActive: { color: '#f97316', fontWeight: 'bold' },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    list: { flex: 1 },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    thumbnailDeleted: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnailDeletedText: { fontSize: 10, color: '#bbb' },
    cardContent: { flex: 1, gap: 4 },
    reportCount: { fontSize: 13, fontWeight: 'bold', color: '#ef4444' },
    comment: { fontSize: 13, color: '#555', lineHeight: 18 },
    reasons: { fontSize: 11, color: '#888' },
    postDate: { fontSize: 11, color: '#aaa' },
    deleteBtn: {
        alignSelf: 'flex-start',
        marginTop: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    deleteBtnText: { fontSize: 12, color: '#ef4444' },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: { fontSize: 14, color: '#aaa' },
})