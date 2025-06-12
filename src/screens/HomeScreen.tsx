import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const GRADIENT_COLORS: ReadonlyArray<string> = ['#22C55E', '#16A34A'];

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

  const v = (valor: any) => valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D';

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
        {/* Header bienvenido con gradiente e icono perfil como botón */}
        <View style={{ marginBottom: 16 }}>
          <LinearGradient
            colors={GRADIENT_COLORS}
            style={styles.headerCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.headerContent}
              activeOpacity={0.78}
              onPress={() => navigation.navigate('Perfil', { userId: user?.userId })}
            >
              <Ionicons name="person-circle-outline" size={67} color="#fff" />
              <View style={styles.headerTexts}>
                <Text style={styles.hello} numberOfLines={1} ellipsizeMode="tail">
                  ¡Hola, <Text style={styles.helloName}>{v(user?.nombre) || 'Usuario'}</Text>!
                </Text>
                <Text style={styles.slogan}>Tu bienestar es nuestra meta</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <TagButton icon="star" text="Favoritos" />
          <TagButton
            icon="time-outline"
            text="Historial"
            onPress={() => navigation.navigate('Historial', { userId: user?.userId })}
          />
          <TagButton icon="options-outline" text="Personalización" />
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickAccessRow}>
          <QuickAccessCard
            icon={<MaterialCommunityIcons name="food-apple" size={40} color={PRIMARY_COLOR} />}
            title="Comidas de la semana"
            desc="Revisa y ajusta tu plan alimenticio."
            onPress={() =>
              navigation.navigate('Dieta', {
                userId: user?.userId,
                nombre: v(user?.nombre),
              })
            }
            cardColor="#f0fdfa"
          />
          <QuickAccessCard
            icon={<Ionicons name="barbell" size={40} color={PRIMARY_COLOR} />}
            title="Rutina semanal"
            desc="Verifica o edita tu entrenamiento."
            onPress={() =>
              navigation.navigate('Rutina', {
                userId: user?.userId,
                nombre: v(user?.nombre),
                objetivo: v(user?.objetivo),
              })
            }
            cardColor="#f7f9fa"
          />
        </View>

        {/* Info usuario siempre visible */}
        <View style={styles.profileInfoBox}>
          <InfoLabel
            label="Edad"
            value={v(user?.edad)}
            icon={<Ionicons name="calendar-outline" size={18} color={PRIMARY_COLOR} />}
          />
          <InfoLabel
            label="Género"
            value={v(user?.genero)}
            icon={
              <Ionicons
                name={
                  user?.genero?.toLowerCase() === 'masculino'
                    ? 'male'
                    : user?.genero?.toLowerCase() === 'femenino'
                    ? 'female'
                    : 'help-outline'
                }
                size={18}
                color={PRIMARY_COLOR}
              />
            }
          />
          <InfoLabel
            label="Altura"
            value={user?.altura ? `${user?.altura} cm` : 'N/D'}
            icon={<FontAwesome5 name="ruler-vertical" size={16} color={PRIMARY_COLOR} />}
          />
          <InfoLabel
            label="Peso"
            value={user?.peso ? `${user?.peso} kg` : 'N/D'}
            icon={<MaterialCommunityIcons name="weight-kilogram" size={18} color={PRIMARY_COLOR} />}
          />
          <InfoLabel
            label="Objetivo"
            value={v(user?.objetivo)}
            icon={<Ionicons name="trophy-outline" size={18} color={PRIMARY_COLOR} />}
          />
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Tags
const TagButton = ({
  icon,
  text,
  onPress,
}: {
  icon: any;
  text: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.tagButton} activeOpacity={0.75} onPress={onPress}>
    <Ionicons name={icon} size={19} color={PRIMARY_COLOR} />
    <Text style={styles.tagText}>{text}</Text>
  </TouchableOpacity>
);

// Accesos rápidos
const QuickAccessCard = ({
  icon,
  title,
  desc,
  onPress,
  cardColor,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onPress: () => void;
  cardColor?: string;
}) => (
  <TouchableOpacity
    style={[styles.quickCard, { backgroundColor: cardColor }]}
    onPress={onPress}
    activeOpacity={0.87}
  >
    <View style={{ marginBottom: 12 }}>{icon}</View>
    <Text style={styles.quickCardTitle} numberOfLines={2} ellipsizeMode="tail">
      {title}
    </Text>
    <Text style={styles.quickCardDesc}>{desc}</Text>
  </TouchableOpacity>
);

// Datos usuario
const InfoLabel = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <View style={styles.infoBox}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
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
    borderRadius: 28,
    padding: 20,
    shadowColor: '#14b278',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    minHeight: 100,
    position: 'relative',
    overflow: 'visible',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    flex: 1,
    marginLeft: 12,
  },
  hello: {
    fontSize: 23,
    color: '#fff',
    marginBottom: 3,
    fontWeight: '700',
    letterSpacing: 0.13,
  },
  helloName: {
    fontWeight: 'bold',
    color: '#fff',
  },
  slogan: {
    fontSize: 15,
    color: '#e2ffe5',
    fontWeight: '600',
    opacity: 0.97,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    marginTop: 5,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F1',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    minWidth: 110,
    justifyContent: 'center',
  },
  tagText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 7,
    letterSpacing: 0.14,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 25,
  },
  quickCard: {
    flex: 1,
    borderRadius: 23,
    padding: 23,
    alignItems: 'center',
    marginHorizontal: 3,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
    minHeight: 156,
    maxWidth: (width - 50) / 2,
  },
  quickCardTitle: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    fontSize: 18,
    marginBottom: 3,
    textAlign: 'center',
    letterSpacing: 0.17,
  },
  quickCardDesc: {
    color: '#274136',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.88,
    fontWeight: '400',
  },
  profileInfoBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 21,
    paddingHorizontal: 17,
    marginBottom: 28,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 11,
  },
  infoBox: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    backgroundColor: '#e6f8f1',
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 15,
  },
  infoLabel: {
    color: '#4B5768',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 2,
  },
  infoValue: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '800',
    maxWidth: '52%',
    textAlign: 'right',
    marginLeft: 7,
    letterSpacing: 0.11,
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
    marginHorizontal: 7,
    shadowColor: '#E53E3E',
    shadowOpacity: 0.14,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.13,
  },
});

export default HomeScreen;
