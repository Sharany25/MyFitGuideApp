import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';

type PerfilRouteProp = RouteProp<RootStackParamList, 'Perfil'>;

const PerfilScreen: React.FC = () => {
  const route = useRoute<PerfilRouteProp>();
  const params = route.params || {};

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({
    nombre: 'Sin nombre',
    edad: 'N/D',
    objetivo: 'N/D',
    genero: 'N/D',
    altura: 'N/D',
    peso: 'N/D',
    tipoRegistro: 'N/D',
  });

  // Calcula edad si sólo tienes fechaNacimiento
  const calcularEdad = (fechaNac: string | undefined) => {
    if (!fechaNac) return 'N/D';
    const fechaNacimiento = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
    return edad.toString();
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        // 1. Si viene todo por params (flujo de registro/rutina), úsalo
        if (
          typeof params === 'object' &&
          params.nombre &&
          params.edad &&
          params.objetivo &&
          params.genero &&
          params.altura &&
          params.peso
        ) {
          setPerfil({
            nombre: String(params.nombre),
            edad: String(params.edad),
            objetivo: String(params.objetivo),
            genero: String(params.genero),
            altura: String(params.altura),
            peso: String(params.peso),
            tipoRegistro: params.tipoRegistro || 'nuevo',
          });
          setLoading(false);
          return;
        }

        // 2. Si no, busca datos del usuario autenticado en AsyncStorage (flujo de login)
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);

          let perfilData = {
            nombre: user.nombre || 'Sin nombre',
            edad: user.edad || calcularEdad(user.fechaNacimiento) || 'N/D',
            objetivo: user.objetivo || 'N/D',
            genero: user.genero || 'N/D',
            altura: user.altura ? String(user.altura) : 'N/D',
            peso: user.peso ? String(user.peso) : 'N/D',
            tipoRegistro: 'login',
          };

          // Si faltan datos, busca por API
          if (!user.objetivo || !user.genero || !user.altura || !user.peso) {
            try {
              const resp = await fetch(
                `http://192.168.1.5:3000/MyFitGuide/Usuarios/${user._id}`
              );
              if (resp.ok) {
                const apiUser = await resp.json();
                perfilData = {
                  ...perfilData,
                  objetivo: apiUser.objetivo || perfilData.objetivo,
                  genero: apiUser.genero || perfilData.genero,
                  altura: apiUser.altura ? String(apiUser.altura) : perfilData.altura,
                  peso: apiUser.peso ? String(apiUser.peso) : perfilData.peso,
                };
              }
            } catch (error) {
              // Si falla la API, sigue con los datos locales
            }
          }

          setPerfil(perfilData);
          setLoading(false);
          return;
        }

        // 3. Si no hay nada, deja defaults
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };

    cargarPerfil();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Mi Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{perfil.nombre}</Text>
        <Text style={styles.label}>Edad:</Text>
        <Text style={styles.value}>{perfil.edad}</Text>
        <Text style={styles.label}>Género:</Text>
        <Text style={styles.value}>{perfil.genero}</Text>
        <Text style={styles.label}>Altura (cm):</Text>
        <Text style={styles.value}>{perfil.altura}</Text>
        <Text style={styles.label}>Peso (kg):</Text>
        <Text style={styles.value}>{perfil.peso}</Text>
        <Text style={styles.label}>Objetivo:</Text>
        <Text style={styles.value}>{perfil.objetivo}</Text>
        <Text style={styles.label}>Tipo de registro:</Text>
        <Text style={styles.value}>
          {perfil.tipoRegistro === 'nuevo'
            ? 'Registro nuevo'
            : perfil.tipoRegistro === 'login'
            ? 'Inicio de sesión'
            : perfil.tipoRegistro}
        </Text>
      </View>
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
});

export default PerfilScreen;
