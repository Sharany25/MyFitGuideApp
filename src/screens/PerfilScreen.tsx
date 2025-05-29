import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';

type PerfilRouteProp = RouteProp<RootStackParamList, 'Perfil'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'Perfil'>;

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';

const PerfilScreen: React.FC = () => {
  const route = useRoute<PerfilRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  const {
    nombre = 'Sin nombre',
    edad = 'N/D',
    objetivo = 'N/D',
    genero = 'N/D',
    altura = 'N/D',
    peso = 'N/D',
    tipoRegistro = 'N/D',
  } = route.params || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Mi Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{nombre}</Text>

        <Text style={styles.label}>Edad:</Text>
        <Text style={styles.value}>{edad}</Text>

        <Text style={styles.label}>Género:</Text>
        <Text style={styles.value}>{genero}</Text>

        <Text style={styles.label}>Altura (cm):</Text>
        <Text style={styles.value}>{altura}</Text>

        <Text style={styles.label}>Peso (kg):</Text>
        <Text style={styles.value}>{peso}</Text>

        <Text style={styles.label}>Objetivo:</Text>
        <Text style={styles.value}>{objetivo}</Text>

        <Text style={styles.label}>Tipo de registro:</Text>
        <Text style={styles.value}>{tipoRegistro === 'nuevo' ? 'Registro nuevo' : 'Inicio de sesión'}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home', {
          nombre,
          edad,
          objetivo,
          genero,
          altura,
          peso,
          tipoRegistro,
        })}
      >
        <Text style={styles.buttonText}>Volver al Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
  },
  header: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#374151',
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilScreen;
