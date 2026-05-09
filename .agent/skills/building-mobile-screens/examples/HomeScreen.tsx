import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock component - in a real app, import from your components folder
const Card = ({ title }: { title: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardText}>{title}</Text>
  </View>
);

export default function HomeScreen() {
  const [data, setData] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setData([
        { id: '1', title: 'Explore Features' }, 
        { id: '2', title: 'Account Settings' }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.header}>Welcome Home</Text>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Card title={item.title} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F7' 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    paddingHorizontal: 16,
    paddingVertical: 20,
    color: '#000',
  },
  listContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: { 
    padding: 20, 
    backgroundColor: 'white', 
    marginBottom: 12, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  }
});
