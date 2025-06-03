import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/StackNavigator';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [perfilCompleto, setPerfilCompleto] = useState<any>({});
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Tabs'>>();

  // Preferimos el userId desde route.params o desde el usuario almacenado
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      let id = route.params?.userId;
      if (!id) {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          id = user._id || user.idUsuario || user.id;
        }
      }
      if (!id) {
        setLoading(false);
        return;
      }
      setUserId(id);

      try {
        const res = await fetch(`http://192.168.1.5:3000/MyFitGuide/usuario-completo/${id}`);
        if (res.ok) {
          setPerfilCompleto(await res.json());
        }
      } catch (e) {}
      setLoading(false);
    };

    loadData();
  }, [route.params?.userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Vuelve a cargar info
    let id = route.params?.userId;
    if (!id) {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        id = user._id || user.idUsuario || user.id;
      }
    }
    if (id) {
      try {
        const res = await fetch(`http://192.168.1.5:3000/MyFitGuide/usuario-completo/${id}`);
        if (res.ok) {
          setPerfilCompleto(await res.json());
        }
      } catch (e) {}
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  const { usuario = {}, dieta = {}, rutina = {} } = perfilCompleto;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.headerBox}>
        <Ionicons name="person-circle-outline" size={60} color={PRIMARY_COLOR} />
        <View>
          <Text style={styles.welcome}>¡Hola, {v(usuario?.nombre) || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Tu bienestar es nuestra meta</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar en la app..."
        placeholderTextColor="#8E8E8E"
      />

      <View style={styles.tagsContainer}>
        <TouchableOpacity style={styles.tagButton}>
          <Ionicons name="star" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.tagText}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tagButton}>
          <Ionicons name="time-outline" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.tagText}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tagButton}>
          <Ionicons name="settings-outline" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.tagText}>Personalización</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardGrid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Dieta', { userId, nombre: v(usuario?.nombre) })}
        >
          <Ionicons name="fast-food-outline" size={32} color={PRIMARY_COLOR} style={{ marginBottom: 6 }} />
          <Text style={styles.cardTitle}>Comidas de la semana</Text>
          <Text style={styles.cardDesc}>Revisa y ajusta tu plan alimenticio.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('Rutina', { userId, nombre: v(usuario?.nombre), objetivo: v(dieta?.objetivo) })
          }
        >
          <Ionicons name="barbell-outline" size={32} color={PRIMARY_COLOR} style={{ marginBottom: 6 }} />
          <Text style={styles.cardTitle}>Rutina semanal</Text>
          <Text style={styles.cardDesc}>Verifica o edita tu entrenamiento.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfoBox}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <InfoLabel label="Edad" value={v(rutina?.edad)} />
          <InfoLabel label="Género" value={v(dieta?.genero)} />
          <InfoLabel label="Altura (cm)" value={v(dieta?.altura)} />
          <InfoLabel label="Peso (kg)" value={v(dieta?.peso)} />
          <InfoLabel label="Objetivo" value={v(dieta?.objetivo)} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.perfilButton}
        onPress={() => {
          navigation.navigate('Perfil', { userId });
        }}
      >
        <Ionicons name="person" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.perfilButtonText}>Ver Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoLabel = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/D'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 16,
  },
  welcome: {
    fontSize: 23,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#5B5B5B',
    fontWeight: '500',
    marginBottom: 3,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F1',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    color: PRIMARY_COLOR,
    fontSize: 13,
    fontWeight: '600',
  },
  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 130,
    gap: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  cardDesc: {
    color: '#374151',
    fontSize: 13,
    textAlign: 'center',
  },
  profileInfoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    marginBottom: 20,
    marginTop: 5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  infoBox: {
    marginRight: 14,
    marginBottom: 8,
  },
  infoLabel: {
    color: '#7C7C7C',
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    color: '#212121',
    fontSize: 15,
    fontWeight: '700',
  },
  perfilButton: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  perfilButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
