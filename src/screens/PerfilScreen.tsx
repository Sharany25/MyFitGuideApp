import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';

type PerfilRouteProp = RouteProp<RootStackParamList, 'Perfil'>;

const PerfilScreen: React.FC = () => {
  const route = useRoute<PerfilRouteProp>();
  const [loading, setLoading] = useState(true);

  // Estado para todos los datos completos
  const [perfilCompleto, setPerfilCompleto] = useState<{
    usuario?: any;
    dieta?: any;
    rutina?: any;
  }>({});

  useEffect(() => {
    const fetchPerfilCompleto = async () => {
      setLoading(true);

      try {
        let userId: string | undefined = route.params?.userId;
        if (!userId) {
          // Busca en AsyncStorage si no viene por params
          const stored = await AsyncStorage.getItem('user');
          if (stored) {
            const user = JSON.parse(stored);
            userId = user._id || user.idUsuario || user.id;
          }
        }
        if (!userId) {
          setLoading(false);
          return;
        }

        // Llama a tu endpoint unificado
        const res = await fetch(`http://192.168.1.5:3000/MyFitGuide/usuario-completo/${userId}`);
        if (res.ok) {
          const json = await res.json();
          setPerfilCompleto(json);
        }
      } catch (err) {
        // Si hay error, deja datos vacíos
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilCompleto();
  }, [route.params?.userId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  const { usuario, dieta, rutina } = perfilCompleto || {};

  // Utilidad para mostrar valores o "N/D"
  const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Mi Perfil Completo</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos Personales</Text>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{v(usuario?.nombre)}</Text>
        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{v(usuario?.correoElectronico)}</Text>
        <Text style={styles.label}>Fecha Nacimiento:</Text>
        <Text style={styles.value}>
          {usuario?.fechaNacimiento
            ? new Date(usuario.fechaNacimiento).toLocaleDateString()
            : 'N/D'}
        </Text>
        <Text style={styles.label}>Ubicación:</Text>
        <Text style={styles.value}>{v(usuario?.ubicacion)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos de Dieta</Text>
        <Text style={styles.label}>Género:</Text>
        <Text style={styles.value}>{v(dieta?.genero)}</Text>
        <Text style={styles.label}>Altura (cm):</Text>
        <Text style={styles.value}>{v(dieta?.altura)}</Text>
        <Text style={styles.label}>Peso (kg):</Text>
        <Text style={styles.value}>{v(dieta?.peso)}</Text>
        <Text style={styles.label}>Objetivo:</Text>
        <Text style={styles.value}>{v(dieta?.objetivo)}</Text>
        <Text style={styles.label}>Alergias:</Text>
        <Text style={styles.value}>
          {Array.isArray(dieta?.alergias) && dieta?.alergias.length > 0
            ? dieta.alergias.join(', ')
            : 'N/D'}
        </Text>
        <Text style={styles.label}>Presupuesto:</Text>
        <Text style={styles.value}>{v(dieta?.presupuesto)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos de Rutina</Text>
        <Text style={styles.label}>Edad:</Text>
        <Text style={styles.value}>{v(rutina?.edad)}</Text>
        <Text style={styles.label}>Objetivo:</Text>
        <Text style={styles.value}>{v(rutina?.objetivo)}</Text>
        <Text style={styles.label}>Preferencias:</Text>
        <Text style={styles.value}>
          {Array.isArray(rutina?.preferencias) && rutina?.preferencias.length > 0
            ? rutina.preferencias.join(', ')
            : 'N/D'}
        </Text>
        <Text style={styles.label}>Días de Entrenamiento:</Text>
        <Text style={styles.value}>{v(rutina?.dias)}</Text>
        <Text style={styles.label}>Lesiones:</Text>
        <Text style={styles.value}>{v(rutina?.lesiones)}</Text>
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
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 7,
    marginTop: -10,
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
