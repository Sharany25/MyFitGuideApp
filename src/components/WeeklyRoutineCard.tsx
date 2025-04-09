import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const  RutinaSemanalImage = require ('../../assets/RutinaSemanal.jpg');

export default function WeeklyRoutineCard() {
  return (
    <View style={styles.card}>
      <Image
        source={RutinaSemanalImage} // Usar la imagen importada como fondo
        style={styles.backgroundImage} // Estilo para la imagen de fondo
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
    backgroundColor: 'transparent', // Hacer el fondo transparente para ver la imagen
    elevation: 3,
    position: 'relative', // Para posicionar la imagen de fondo
    height: 200, // Aumentar la altura de la tarjeta
  },
  backgroundImage: {
    width: '100%',
    height: '100%', // Hacer que la imagen ocupe todo el contenedor
    position: 'absolute', // Posicionar la imagen de fondo
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12, // Asegurarse de que la imagen tenga bordes redondeados
  },
  content: {
    padding: 10,
    zIndex: 1, // Asegurarse de que el contenido esté por encima de la imagen
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18, // Aumentar el tamaño de la fuente del título
    color: '#fff', // Cambiar el color del texto para que sea legible sobre la imagen
  },
  subtitle: {
    color: '#fff', // Cambiar el color del texto para que sea legible sobre la imagen
    fontSize: 16, // Aumentar el tamaño de la fuente del subtítulo
  },
});