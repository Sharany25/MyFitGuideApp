import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const SECONDARY_COLOR = '#F0FDF8';

type NavigationProp = StackNavigationProp<any, any>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useUser();
  const user = state.user;

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('userProfile');
    dispatch({ type: 'CLEAR_USER' });
    navigation.replace('Login');
  };

  const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');

  if (state.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header bienvenido */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={70} color={PRIMARY_COLOR} />
          </View>
          <View>
            <Text style={styles.hello}>
              ¡Hola, <Text style={{ fontWeight: 'bold' }}>{v(user?.nombre) || 'Usuario'}</Text>!
            </Text>
            <Text style={styles.slogan}>Tu bienestar es nuestra meta</Text>
          </View>
        </View>

        {/* Buscador */}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en la app..."
          placeholderTextColor="#8E8E8E"
          editable={false}
        />

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <TagButton icon="star" text="Favoritos" />
          <TagButton icon="time-outline" text="Historial" />
          <TagButton icon="options-outline" text="Personalización" />
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickAccessRow}>
          <QuickAccessCard
            icon={<MaterialCommunityIcons name="food-apple" size={34} color={PRIMARY_COLOR} />}
            title="Comidas de la semana"
            desc="Revisa y ajusta tu plan alimenticio."
            onPress={() =>
              navigation.navigate('Dieta', {
                userId: user?.userId,
                nombre: v(user?.nombre),
              })
            }
          />
          <QuickAccessCard
            icon={<Ionicons name="barbell-outline" size={34} color={PRIMARY_COLOR} />}
            title="Rutina semanal"
            desc="Verifica o edita tu entrenamiento."
            onPress={() =>
              navigation.navigate('Rutina', {
                userId: user?.userId,
                nombre: v(user?.nombre),
                objetivo: v(user?.objetivo),
              })
            }
          />
        </View>

        {/* Info usuario */}
        <View style={styles.profileInfoBox}>
          <InfoLabel label="Edad" value={v(user?.edad)} />
          <InfoLabel label="Género" value={v(user?.genero)} />
          <InfoLabel label="Altura" value={user?.altura ? `${user?.altura} cm` : 'N/D'} />
          <InfoLabel label="Peso" value={user?.peso ? `${user?.peso} kg` : 'N/D'} />
          <InfoLabel label="Objetivo" value={v(user?.objetivo)} />
        </View>

        {/* Acciones */}
        <TouchableOpacity
          style={styles.perfilButton}
          onPress={() => navigation.navigate('Perfil', { userId: user?.userId })}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.perfilButtonText}>Ver Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const TagButton = ({ icon, text }: { icon: any; text: string }) => (
  <TouchableOpacity style={styles.tagButton} activeOpacity={0.75}>
    <Ionicons name={icon} size={17} color={PRIMARY_COLOR} />
    <Text style={styles.tagText}>{text}</Text>
  </TouchableOpacity>
);

const QuickAccessCard = ({
  icon,
  title,
  desc,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.8}>
    <View style={{ marginBottom: 8 }}>{icon}</View>
    <Text style={styles.quickCardTitle}>{title}</Text>
    <Text style={styles.quickCardDesc}>{desc}</Text>
  </TouchableOpacity>
);

const InfoLabel = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{(value)}</Text> {/* Utilizar la función v para mostrar "N/D" */}
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FA',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 12
          : 22
        : 16,
  },
  container: { flex: 1, backgroundColor: '#F7F9FA', paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 18,
    marginBottom: 15,
    marginTop: 10,
    gap: 16,
    shadowColor: '#00C27F',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 6,
  },
  hello: {
    fontSize: 22,
    color: PRIMARY_COLOR,
    marginBottom: 2,
  },
  slogan: {
    fontSize: 13,
    color: '#4B5768',
    fontWeight: '500',
    opacity: 0.95,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    padding: 13,
    borderRadius: 13,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 7,
    minWidth: 98,
    justifyContent: 'center',
  },
  tagText: {
    color: PRIMARY_COLOR,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 17,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    minHeight: 132,
  },
  quickCardTitle: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    fontSize: 16,
    marginBottom: 1,
    textAlign: 'center',
  },
  quickCardDesc: {
    color: '#616161',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 1,
  },
  profileInfoBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#4B5768',
    fontSize: 15,
    fontWeight: '500',
  },
  infoValue: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  perfilButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 13,
    marginBottom: 10,
  },
  perfilButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 13,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
