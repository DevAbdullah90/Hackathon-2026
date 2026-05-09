import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

interface GridItem {
  id: string;
  title: string;
}

export function ResponsiveGrid({ items }: { items: GridItem[] }) {
  const { width } = useWindowDimensions();
  
  // Determine number of columns based on screen width
  let numColumns = 1; // Default to 1 column for phones
  if (width > 1024) {
    numColumns = 4; // Large tablet/desktop
  } else if (width > 768) {
    numColumns = 3; // Tablet
  } else if (width > 480) {
    numColumns = 2; // Large phone landscape
  }
  
  // Calculate percentage width for each item
  const itemWidth = `${100 / numColumns}%`;

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={[styles.itemWrapper, { width: itemWidth as any }]}>
          <View style={styles.item}>
            <Text style={styles.text}>{item.title}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  itemWrapper: {
    padding: 8,
  },
  item: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  }
});
