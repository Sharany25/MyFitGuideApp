import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const  RutinaSemanalImage = require ('../../assets/RutinaSemanal.jpg');

export default function WeeklyRoutineCard() {
  return (
    <View style={styles.card}>
      <Image
        source={RutinaSemanalImage}
        style={styles.backgroundImage}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Plan de 5 días</Text>
        <Text style={styles.subtitle}>Lun-Vie · Entrenamiento completo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'transparent',
    elevation: 3,
    position: 'relative',
    height: 200,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  content: {
    padding: 10,
    zIndex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
  },
});