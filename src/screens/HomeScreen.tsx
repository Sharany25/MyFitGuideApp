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
const PRIMARY_COLOR = '#06b6d4';
const SECONDARY_COLOR = '#22d3ee';
const ACCENT_COLOR = '#fde68a';
const BACKGROUND_COLOR = '#f7fafd';
const CARD_GRADIENT: [ColorValue, ColorValue] = ['#e0f2fe', '#f0fdfa'];
const BUTTON_GRADIENT: [ColorValue, ColorValue] = ['#fde68a', '#fbbf24'];
const PLUS_SHADOW = '#fbbf24';

type NavigationProp = StackNavigationProp<any, any>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useUser();
  const user = state.user;
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    Animated.spring(scaleAnim, {
      toValue: 1.08,
      friction: 3,
      useNativeDriver: true,
      delay: 650,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    });
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
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ marginBottom: 22, opacity: fadeAnim }}>
          <LinearGradient
            colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
            style={styles.headerCard}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.headerContent}
              activeOpacity={0.82}
              onPress={() => navigation.navigate('Perfil', { userId: user?.userId })}
            >
              <Ionicons name="person-circle-outline" size={84} color="#fff" style={{ marginRight: 10 }} />
              <View style={styles.headerTexts}>
                <Text style={styles.hello}>
                  ¡Hola, <Text style={styles.helloName}>{v(user?.nombre)}</Text>!
                </Text>
                <Text style={styles.slogan}>Tu bienestar es nuestra meta</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ alignItems: 'center', marginBottom: 18, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.90}
            style={styles.plusBtnShadow}
            onPress={() => navigation.navigate('Payment')}
          >
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0.1, y: 0.5 }}
              end={{ x: 0.9, y: 0.5 }}
              style={styles.plusBtn}
            >
              <MaterialCommunityIcons name="crown" size={27} color="#fff" style={{ marginRight: 13 }} />
              <Text style={styles.plusBtnText}>Suscripción Plus</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.tagsCard}>
            <TouchableOpacity
              style={styles.tagItem}
              onPress={() => navigation.navigate('Favoritos', { userId: user?.userId })}
            >
              <Ionicons name="star" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.tagItemText}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tagItem}
              onPress={() => navigation.navigate('Historial', { userId: user?.userId })}
            >
              <Ionicons name="time-outline" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.tagItemText}>Historial</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.quickAccessRow}>
          <QuickAccessCard
            icon={
              <LinearGradient
                colors={CARD_GRADIENT}
                style={styles.quickCardIconBg}
                start={{ x: 0, y: 0.7 }}
                end={{ x: 1, y: 0.3 }}
              >
                <MaterialCommunityIcons name="food-apple" size={38} color={PRIMARY_COLOR} />
              </LinearGradient>
            }
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
            icon={
              <LinearGradient
                colors={CARD_GRADIENT}
                style={styles.quickCardIconBg}
                start={{ x: 1, y: 0.5 }}
                end={{ x: 0, y: 1 }}
              >
                <Ionicons name="barbell" size={38} color={PRIMARY_COLOR} />
              </LinearGradient>
            }
            title="Rutina semanal"
            desc="Verifica o edita tu entrenamiento."
            onPress={() => navigation.navigate('RutinaIAGenerada', { userId: user?.userId })}
          />
        </View>

        <View style={styles.profileInfoBox}>
          <InfoLabel
            label="Edad"
            value={v(user?.edad)}
            icon={<Ionicons name="calendar-outline" size={20} color={PRIMARY_COLOR} />}
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
                size={20}
                color={PRIMARY_COLOR}
              />
            }
          />
          <InfoLabel
            label="Altura"
            value={user?.altura ? `${user?.altura} cm` : 'N/D'}
            icon={<FontAwesome5 name="ruler-vertical" size={18} color={PRIMARY_COLOR} />}
          />
          <InfoLabel
            label="Peso"
            value={user?.peso ? `${user?.peso} kg` : 'N/D'}
            icon={<MaterialCommunityIcons name="weight-kilogram" size={20} color={PRIMARY_COLOR} />}
          />
          <InfoLabel
            label="Objetivo"
            value={v(user?.objetivo)}
            icon={<Ionicons name="trophy-outline" size={20} color={PRIMARY_COLOR} />}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fabLogout} onPress={() => setModalVisible(true)}>
        <Ionicons name="exit-outline" size={31} color="#fff" />
      </TouchableOpacity>

      <LogoutModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={cerrarSesion}
      />
    </SafeAreaView>
  );
};

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
  <TouchableOpacity
    style={styles.quickCard}
    onPress={onPress}
    activeOpacity={0.87}
  >
    <View style={{ marginBottom: 15 }}>{icon}</View>
    <Text style={styles.quickCardTitle}>{title}</Text>
    <Text style={styles.quickCardDesc}>{desc}</Text>
  </TouchableOpacity>
);

const InfoLabel = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <View style={styles.infoBox}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
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
    backgroundColor: BACKGROUND_COLOR,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 22 : 14,
  },
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR, paddingHorizontal: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    borderRadius: 32,
    padding: 22,
    marginHorizontal: 2,
    marginTop: 15,
    elevation: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  headerTexts: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  hello: { fontSize: 25, color: '#fff', fontWeight: '700', letterSpacing: 0.4 },
  helloName: { fontWeight: 'bold', color: '#fff' },
  slogan: { fontSize: 15, color: '#e0f7fa', fontWeight: '600', opacity: 0.98, marginTop: 4, letterSpacing: 0.2 },

  plusBtnShadow: {
    shadowColor: PLUS_SHADOW,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
    borderRadius: 35,
  },
  plusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 35,
    backgroundColor: BUTTON_GRADIENT[0],
  },
  plusBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.7,
    textShadowColor: '#0003',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  tagsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginHorizontal: 3,
    borderRadius: 26,
    marginTop: 6,
    marginBottom: 28,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0fdfa',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
  },
  tagItemText: {
    marginLeft: 8,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    fontSize: 16,
    letterSpacing: 0.3,
  },

  quickAccessRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, marginBottom: 25, marginTop: 7 },
  quickCard: {
    flex: 1,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 5,
    marginHorizontal: 2,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.11,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    minHeight: 160,
  },
  quickCardIconBg: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
  },
  quickCardTitle: { fontWeight: 'bold', color: PRIMARY_COLOR, fontSize: 19, textAlign: 'center', letterSpacing: 0.3, marginBottom: 2 },
  quickCardDesc: { color: '#64748b', fontSize: 15, textAlign: 'center', opacity: 0.93, fontWeight: '400', marginTop: 2 },

  profileInfoBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    padding: 20,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.93)',
    elevation: 2,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.04,
    shadowRadius: 9,
    marginTop: 27,
    marginBottom: 42,
  },
  infoBox: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0f9f3',
    padding: 15,
    borderRadius: 14,
    marginBottom: 3,
  },
  infoLabel: { color: '#4B5768', fontSize: 17, fontWeight: '700' },
  infoValue: { color: PRIMARY_COLOR, fontSize: 18, fontWeight: '800', maxWidth: '54%', textAlign: 'right' },
  fabLogout: {
    position: 'absolute',
    bottom: 34,
    right: 20,
    backgroundColor: '#E53E3E',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.23,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
  },
});

export default HomeScreen;
