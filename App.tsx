import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Header from './src/components/Header';
import CatCard from './src/components/CatCard';
import PostModal from './src/components/PostModal';
import { dummyCats } from './src/data/dummyCats';
import { Cat } from './src/types/cat';

export default function App() {
  // フィードデータをApp管理（投稿追加のため引き上げ）
  const [cats, setCats] = useState<Cat[]>(dummyCats);
  const [modalVisible, setModalVisible] = useState(false);

  // 新規投稿をフィード先頭に追加
  const handleSubmit = (newCat: Cat) => {
    setCats((prev) => [newCat, ...prev]);
  };

  return (
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
  );
}

const styles = StyleSheet.create({
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