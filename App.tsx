import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import Header from './src/components/Header';
import CatCard from './src/components/CatCard';
import PostModal from './src/components/PostModal';
import Toast from './src/components/Toast';
import { usePosts } from './src/hooks/usePosts';
import { Cat } from './src/types/cat';

const LOAD_MORE_THRESHOLD = 300

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { cats, fetchState, hasMore, fetchPosts, fetchMore, refreshPosts } = usePosts()
  const scrollViewRef = useRef<ScrollView>(null)

  const handleSubmit = async (newCat: Cat) => {
    setModalVisible(false)
    await refreshPosts()
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    setToastVisible(true)
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height
    if (distanceFromBottom < LOAD_MORE_THRESHOLD) fetchMore()
  }

  const renderFooter = () => {
    if (fetchState.status === 'loadingMore') {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#f97316" />
          <Text style={styles.footerText}>読み込み中…</Text>
        </View>
      )
    }
    if (!hasMore && cats.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>🐾 全部見たにゃ！</Text>
        </View>
      )
    }
    return null
  }

  const renderContent = () => {
    if (fetchState.status === 'loading') {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>投稿を読み込み中…</Text>
        </View>
      )
    }
    if (fetchState.status === 'error' && cats.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>😿</Text>
          <Text style={styles.errorText}>{fetchState.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPosts}>
            <Text style={styles.retryBtnText}>再読み込み</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (fetchState.status === 'success' && cats.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🐱</Text>
          <Text style={styles.emptyText}>まだ投稿がありません</Text>
          <Text style={styles.emptySubText}>最初の猫を投稿してみよう！</Text>
        </View>
      )
    }
    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        {fetchState.status === 'refreshing' && (
          <View style={styles.refreshingBar}>
            <ActivityIndicator size="small" color="#f97316" />
            <Text style={styles.refreshingText}>更新中…</Text>
          </View>
        )}
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
        {renderFooter()}
      </ScrollView>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Header onPost={() => setModalVisible(true)} />
          {renderContent()}
          <PostModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={handleSubmit}
          />
          {/* Toast：SafeAreaView内の最前面に配置 */}
          <Toast
            message="投稿しました 🐾"
            visible={toastVisible}
            onHide={() => setToastVisible(false)}
            duration={5000}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  feed: { flex: 1 },
  feedContent: { paddingVertical: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 14, color: '#ef4444', marginBottom: 16, textAlign: 'center' },
  retryBtn: { backgroundColor: '#f97316', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#aaa' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  footerText: { fontSize: 13, color: '#aaa' },
  refreshingBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#fff7ed', borderRadius: 8, marginHorizontal: 16, marginBottom: 8 },
  refreshingText: { fontSize: 13, color: '#f97316' },
});