import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Header from './src/components/Header';
import CatCard from './src/components/CatCard';
import PostModal from './src/components/PostModal';
import { usePosts } from './src/hooks/usePosts';
import { Cat } from './src/types/cat';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const { cats, fetchState, fetchPosts, addPost } = usePosts()

  const handleSubmit = (newCat: Cat) => {
    addPost(newCat)
  }

  const renderContent = () => {
    // 初回ローディング
    if (fetchState.status === 'loading' && cats.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>投稿を読み込み中…</Text>
        </View>
      )
    }

    // エラー
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

    // 投稿なし
    if (fetchState.status === 'success' && cats.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🐱</Text>
          <Text style={styles.emptyText}>まだ投稿がありません</Text>
          <Text style={styles.emptySubText}>最初の猫を投稿してみよう！</Text>
        </View>
      )
    }

    // フィード表示
    return (
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
      >
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
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
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingVertical: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#f97316',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: '#aaa',
  },
});