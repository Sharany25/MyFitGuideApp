import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, RefreshControl } from 'react-native';


export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar"
      />

      <View style={styles.tagsContainer}>
        <Text style={styles.tag}>⭐ Favoritos</Text>
        <Text style={styles.tag}>📜 Historial</Text>
        <Text style={styles.tag}>⚙️ Personalización</Text>
      </View>

      <Text style={styles.sectionTitle}>Comidas de la semana</Text>

      <Text style={styles.sectionTitle}>Rutina semanal</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  searchInput: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});