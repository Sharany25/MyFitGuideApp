import React from 'react';
import { FlatList, View, Text, Image, StyleSheet } from 'react-native';

const  Lunes = require ('../../assets/Lunes.jpg');
const Martes = require ('../../assets/Martes.jpg');
const  Miercoles = require ('../../assets/Miercoles.jpg');

const days = [
  { name: 'Lunes', image: Lunes },
  { name: 'Martes', image: Martes },
  { name: 'Miércoles', image: Miercoles },
  { name: 'Jueves', image: Lunes },
  { name: 'Viernes', image: Martes},
];

export default function FoodCarousel() {
  return (
    <FlatList
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image
            source={item.image}
            style={styles.image}
          />
          <Text style={styles.label}>{item.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
  },
});