import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/StackNavigator';
import type { RouteProp } from '@react-navigation/native';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type RouteProps = RouteProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const userParams = route.params;

  const nombre = userParams?.nombre ?? 'Usuario';
  const edad = userParams?.edad ?? '';
  const objetivo = userParams?.objetivo ?? '';
  const genero = userParams?.genero ?? '';
  const altura = userParams?.altura ?? '';
  const peso = userParams?.peso ?? '';
  const tipoRegistro = userParams?.tipoRegistro ?? 'login';

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.welcome}>Hola, {nombre}</Text>

      <TextInput style={styles.searchInput} placeholder="Buscar" />

      <View style={styles.tagsContainer}>
        <Text style={styles.tag}>⭐ Favoritos</Text>
        <Text style={styles.tag}>📜 Historial</Text>
        <Text style={styles.tag}>⚙️ Personalización</Text>
      </View>

      <TouchableOpacity
        style={styles.perfilButton}
        onPress={() => {
          navigation.navigate('Perfil', {
            nombre,
            edad,
            objetivo,
            genero,
            altura,
            peso,
            tipoRegistro,
          });
        }}
      >
        <Text style={styles.perfilButtonText}>Ver Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Comidas de la semana</Text>
      <Text style={styles.sectionTitle}>Rutina semanal</Text>
    </ScrollView>
  );
};

const PRIMARY_COLOR = '#00C27F';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
  },
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
  perfilButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  perfilButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default HomeScreen;
