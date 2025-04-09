import React from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import FoodCarousel from '../components/FoodCarousel';
import WeeklyRoutineCard from '../components/WeeklyRoutineCard';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
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
      <FoodCarousel />

      <Text style={styles.sectionTitle}>Rutina semanal</Text>
      <WeeklyRoutineCard />
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
