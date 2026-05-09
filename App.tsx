import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import Header from './src/components/Header';
import CatCard from './src/components/CatCard';
import PostModal from './src/components/PostModal';
import { dummyCats } from './src/data/dummyCats';
import { Cat } from './src/types/cat';

export default function App() {
  const [cats, setCats] = useState<Cat[]>(dummyCats);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = (newCat: Cat) => {
    setCats((prev) => [newCat, ...prev]);
  };

  return (
    // SafeAreaProvider：アプリ全体をラップ（1箇所のみ）
    <SafeAreaProvider>
      {/* SafeAreaView：上下のセーフエリアを自動確保 */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Header onPost={() => setModalVisible(true)} />

          <ScrollView
            style={styles.feed}
            contentContainerStyle={styles.feedContent}
          >
            {cats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </ScrollView>

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
    backgroundColor: '#fff', // ステータスバー背景色（ヘッダーと統一）
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
});