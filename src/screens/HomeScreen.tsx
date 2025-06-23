import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  ColorValue,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../components/LogoutModal';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const GRADIENT_COLORS: [ColorValue, ColorValue] = ['#22C55E', '#16A34A'];

type NavigationProp = StackNavigationProp<any, any>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useUser();
  const user = state.user;

  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header animado */}
        <Animated.View style={{ marginBottom: 16, opacity: fadeAnim }}>
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
                <Text style={styles.hello}>
                  ¡Hola, <Text style={styles.helloName}>{v(user?.nombre)}</Text>!
                </Text>
                <Text style={styles.slogan}>Tu bienestar es nuestra meta</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Tags como tarjeta agrupada */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.tagsCard}>
            <TouchableOpacity
              style={styles.tagItem}
              onPress={() => navigation.navigate('Favoritos', { userId: user?.userId })}
            >
              <Ionicons name="star" size={18} color={PRIMARY_COLOR} />
              <Text style={styles.tagItemText}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tagItem}
              onPress={() => navigation.navigate('Historial', { userId: user?.userId })}
            >
              <Ionicons name="time-outline" size={18} color={PRIMARY_COLOR} />
              <Text style={styles.tagItemText}>Historial</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
            onPress={() => navigation.navigate('RutinaIAGenerada', { userId: user?.userId })}
            cardColor="#f7f9fa"
          />
        </View>

        {/* Información del perfil */}
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
      </ScrollView>

      {/* Botón logout */}
      <TouchableOpacity style={styles.fabLogout} onPress={() => setModalVisible(true)}>
        <Ionicons name="exit-outline" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <LogoutModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={cerrarSesion}
      />
    </SafeAreaView>
  );
};

// REUTILIZABLES
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
    <Text style={styles.quickCardTitle}>{title}</Text>
    <Text style={styles.quickCardDesc}>{desc}</Text>
  </TouchableOpacity>
);

const InfoLabel = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <View style={styles.infoBox}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 22 : 16,
  },
  container: { flex: 1, backgroundColor: '#F7F9FA', paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    backgroundColor: '#00C27F',
    marginTop: 10,
    elevation: 6,
    marginBottom: 10,
    shadowColor: '#00C27F',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerTexts: {
    flex: 1,
    marginLeft: 12,
  },
  hello: { fontSize: 23, color: '#fff', fontWeight: '700' },
  helloName: { fontWeight: 'bold', color: '#fff' },
  slogan: { fontSize: 15, color: '#e2ffe5', fontWeight: '600', opacity: 0.97, marginTop: 3 },

  tagsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 18,
    marginTop: 8,
    marginBottom: 26,
    shadowColor: '#00C27F',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagItemText: {
    marginLeft: 8,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    fontSize: 15,
  },

  quickAccessRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, marginBottom: 25 },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    marginHorizontal: 3,
    shadowColor: '#00C27F',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    minHeight: 140,
  },
  quickCardTitle: { fontWeight: 'bold', color: PRIMARY_COLOR, fontSize: 18, textAlign: 'center' },
  quickCardDesc: { color: '#274136', fontSize: 15, textAlign: 'center', opacity: 0.88, fontWeight: '400' },
  profileInfoBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#00C27F',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginTop: 20,
    marginBottom: 40,
  },
  infoBox: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e9f9f3',
    padding: 12,
    borderRadius: 12,
  },
  infoLabel: { color: '#4B5768', fontSize: 17, fontWeight: '700' },
  infoValue: { color: PRIMARY_COLOR, fontSize: 18, fontWeight: '800', maxWidth: '52%', textAlign: 'right' },
  fabLogout: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    backgroundColor: '#E53E3E',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});

export default HomeScreen;
