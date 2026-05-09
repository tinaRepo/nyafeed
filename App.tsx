import { ScrollView, StyleSheet, View } from 'react-native';
import Header from './src/components/Header';
import CatCard from './src/components/CatCard';
import { dummyCats } from './src/data/dummyCats';

export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
      >
        {dummyCats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </ScrollView>
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