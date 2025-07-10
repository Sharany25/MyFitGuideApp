import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutModal from "../components/LogoutModal";

const { width } = Dimensions.get("window");
const COLORS = {
  primary: "#00C27F",
  bg: "#F7F9FA",
  text: "#232946",
  card: "#fff",
  accent: "#e0f4eb",
  soft: "#f6fff9",
  sombra: "#00c27f25",
  green: "#16a34a",
  greenLight: "#e6fff3",
  greenBorder: "#bbf7d0"
};

type NavigationProp = any;

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
        <Animated.View style={{ opacity: fadeAnim }}>
          <Ionicons name="pulse-outline" size={50} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 22, marginTop: 14 }}>Cargando...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Row de botones arriba */}
      <View style={styles.topRow}>
        {/* Botón de Quejas y Sugerencias (arriba a la izquierda) */}
        <TouchableOpacity
          activeOpacity={0.93}
          style={styles.quejaTopBtn}
          onPress={() => navigation.navigate('QuejaSugerencia', { userId: user?.userId })}
        >
          <LinearGradient
            colors={["#e0fbe9", "#00c27f33"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.9, y: 0.5 }}
            style={styles.quejaBtnGradient}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.green} style={{ marginRight: 8 }} />
            <Text style={styles.quejaBtnText}>¿Tienes una queja o sugerencia?</Text>
            <Ionicons name="arrow-forward-circle-outline" size={19} color={COLORS.green} style={{ marginLeft: 7 }} />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topLogout}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="exit-outline" size={28} color="#E53E3E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 70 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: usuario */}
        <Animated.View style={{ marginBottom: 20, opacity: fadeAnim }}>
          <LinearGradient
            colors={[COLORS.primary, "#00E5A3"]}
            style={styles.headerCard}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.headerContent}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Perfil', { userId: user?.userId })}
            >
              <Ionicons name="person-circle-outline" size={78} color="#fff" style={{ marginRight: 10 }} />
              <View style={styles.headerTexts}>
                <Text style={styles.hello}>
                  ¡Hola, <Text style={styles.helloName}>{v(user?.nombre)}</Text>!
                </Text>
                <Text style={styles.slogan}>Tu bienestar es nuestra meta</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Accesos rápidos */}
        <View style={styles.quickAccessRow}>
          <QuickAccessCard
            icon={
              <LinearGradient
                colors={["#d3fbe9", "#e0f4eb"]}
                style={styles.quickCardIconBg}
                start={{ x: 0, y: 0.7 }}
                end={{ x: 1, y: 0.3 }}
              >
                <MaterialCommunityIcons name="food-apple" size={34} color={COLORS.primary} />
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
                colors={["#d3fbe9", "#e0f4eb"]}
                style={styles.quickCardIconBg}
                start={{ x: 1, y: 0.5 }}
                end={{ x: 0, y: 1 }}
              >
                <Ionicons name="barbell" size={34} color={COLORS.primary} />
              </LinearGradient>
            }
            title="Rutina semanal"
            desc="Verifica o edita tu entrenamiento."
            onPress={() => navigation.navigate('RutinaIAGenerada', { userId: user?.userId })}
          />
        </View>

        {/* Favoritos / Historial */}
        <View style={styles.tagsCard}>
          <TouchableOpacity
            style={styles.tagItem}
            onPress={() => navigation.navigate('Favoritos', { userId: user?.userId })}
          >
            <Ionicons name="star" size={20} color={COLORS.primary} />
            <Text style={styles.tagItemText}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tagItem}
            onPress={() => navigation.navigate('Historial', { userId: user?.userId })}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.tagItemText}>Historial</Text>
          </TouchableOpacity>
        </View>

        {/* Info usuario */}
        <View style={styles.profileInfoBox}>
          <InfoLabel
            label="Edad"
            value={v(user?.edad)}
            icon={<Ionicons name="calendar-outline" size={20} color={COLORS.primary} />}
          />
          <InfoLabel
            label="Género"
            value={v(user?.genero)}
            icon={
              <Ionicons
                name={
                  user?.genero?.toLowerCase() === "masculino"
                    ? "male"
                    : user?.genero?.toLowerCase() === "femenino"
                    ? "female"
                    : "help-outline"
                }
                size={20}
                color={COLORS.primary}
              />
            }
          />
          <InfoLabel
            label="Altura"
            value={user?.altura ? `${user?.altura} cm` : "N/D"}
            icon={<FontAwesome5 name="ruler-vertical" size={18} color={COLORS.primary} />}
          />
          <InfoLabel
            label="Peso"
            value={user?.peso ? `${user?.peso} kg` : "N/D"}
            icon={<MaterialCommunityIcons name="weight-kilogram" size={20} color={COLORS.primary} />}
          />
          <InfoLabel
            label="Objetivo"
            value={v(user?.objetivo)}
            icon={<Ionicons name="trophy-outline" size={20} color={COLORS.primary} />}
          />
        </View>
      </ScrollView>

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
    <View style={{ marginBottom: 14 }}>{icon}</View>
    <Text style={styles.quickCardTitle}>{title}</Text>
    <Text style={styles.quickCardDesc}>{desc}</Text>
  </TouchableOpacity>
);

const InfoLabel = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <View style={styles.infoBox}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
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
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 22) : 16,
  },
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 2,
  },
  quejaTopBtn: {},
  quejaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: COLORS.soft,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  quejaBtnText: {
    color: COLORS.green,
    fontWeight: "bold",
    fontSize: width > 400 ? 15 : 13.7,
    letterSpacing: 0.13,
  },
  topLogout: {
    alignSelf: 'flex-end',
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 5,
    elevation: 4,
    shadowColor: COLORS.sombra,
    shadowOpacity: 0.13,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },

  headerCard: {
    borderRadius: 28,
    padding: 19,
    marginHorizontal: 2,
    marginTop: 6,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 2,
  },
  headerTexts: {
    flex: 1,
    marginLeft: 11,
    justifyContent: 'center',
  },
  hello: { fontSize: width * 0.064, color: COLORS.card, fontWeight: '700', letterSpacing: 0.4 },
  helloName: { fontWeight: 'bold', color: "#fff" },
  slogan: { fontSize: width * 0.040, color: COLORS.accent, fontWeight: '600', opacity: 0.98, marginTop: 4, letterSpacing: 0.2 },

  quickAccessRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 16, marginTop: 3 },
  quickCard: {
    flex: 1,
    borderRadius: 21,
    padding: width > 400 ? 18 : 13,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    elevation: 5,
    marginHorizontal: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.11,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    minHeight: 128,
  },
  quickCardIconBg: {
    borderRadius: 17,
    padding: 8,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  quickCardTitle: { fontWeight: 'bold', color: COLORS.primary, fontSize: 17, textAlign: 'center', letterSpacing: 0.28, marginBottom: 1 },
  quickCardDesc: { color: "#3e5769", fontSize: 13.5, textAlign: 'center', opacity: 0.93, fontWeight: '400', marginTop: 2 },

  tagsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 13,
    marginHorizontal: 2,
    borderRadius: 20,
    marginTop: 3,
    marginBottom: 18,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 4,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 21,
  },
  tagItemText: {
    marginLeft: 8,
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 15.5,
    letterSpacing: 0.26,
  },

  profileInfoBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
    padding: width > 400 ? 17 : 12,
    borderRadius: 22,
    backgroundColor: COLORS.soft,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    marginTop: 18,
    marginBottom: 28,
  },
  infoBox: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#e0fbe9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 3,
  },
  infoLabel: { color: "#3b5165", fontSize: 15, fontWeight: '700' },
  infoValue: { color: COLORS.primary, fontSize: 16, fontWeight: '800', maxWidth: '54%', textAlign: 'right' },
});

export default HomeScreen;
