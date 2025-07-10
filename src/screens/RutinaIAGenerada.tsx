import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { useRutina } from "../hooks/useRutina";
import { useFavoritos } from "../hooks/useFavoritos";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#00C27F",
  primaryDark: "#029865",
  bg: "#F7F9FA",
  card: "#fff",
  accent: "#e0f4eb",
  soft: "#f6fff9",
  shadow: "#00c27f24",
  grey: "#ECEFF1",
  statBg: "#e0f7ef",
  text: "#232946",
  sub: "#7C98B3",
  border: "#dafbe6",
  statValue: "#087758"
};

const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

const iconosLoader = [
  "barbell-outline",
  "fitness-outline",
  "body-outline",
  "flash-outline",
  "star-outline",
];

const LoaderAlert = ({
  text = "Cargando rutina personalizada...",
  sub = "Esto puede tardar unos segundos.",
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [iconIdx, setIconIdx] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setIconIdx((prev) => (prev + 1) % iconosLoader.length);
    }, 650);

    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={loaderAlertStyles.container}>
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
          marginBottom: 18,
        }}
      >
        <Ionicons name={iconosLoader[iconIdx] as any} size={width * 0.17} color={COLORS.primary} />
      </Animated.View>
      <Text style={loaderAlertStyles.text}>{text}</Text>
      <Text style={loaderAlertStyles.sub}>{sub}</Text>
    </View>
  );
};

const RutinaIAGenerada: React.FC = () => {
  const { state } = useUser();
  const userId = state.user?.userId || "";
  const { obtenerRutinaPorId, loading, error } = useRutina();
  const { getFavoritos, EjerciciosFavoritos } = useFavoritos();

  const [rutinaData, setRutinaData] = useState<any[]>([]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [favoritosLocal, setFavoritosLocal] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const result = await obtenerRutinaPorId(userId);
      if (result?.rutina?.rutina) setRutinaData(result.rutina.rutina);

      const favs = await getFavoritos(userId);
      const favMap: { [key: string]: boolean } = {};
      favs.ejercicios.forEach((ej: string) => (favMap[ej] = true));
      setFavoritosLocal(favMap);
    };
    fetchData();
  }, [userId]);

  const handleToggleFavorito = async (nombre: string) => {
    const marcado = !favoritosLocal[nombre];
    setFavoritosLocal((prev) => ({ ...prev, [nombre]: marcado }));
    await EjerciciosFavoritos(userId, nombre, marcado);
  };

  const rutinaDelDia = rutinaData.length > 0 ? rutinaData[selectedDiaIndex] : null;

  if (loading) {
    return <LoaderAlert />;
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Error al obtener rutina. Intenta más tarde.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      {/* Tabs de días de la semana */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.diasScroll}
        >
          {rutinaData.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedDiaIndex(idx)}
              activeOpacity={0.93}
              style={[
                styles.diaButton,
                selectedDiaIndex === idx && styles.diaButtonActivo,
              ]}
            >
              <Text
                style={[
                  styles.diaButtonText,
                  selectedDiaIndex === idx && styles.diaButtonTextActivo,
                ]}
              >
                {DIAS_SEMANA[idx] || `Día ${idx + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {rutinaDelDia ? (
            <>
              <Text style={styles.diaTitulo}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primaryDark} />{" "}
                {rutinaDelDia.dia} ·{" "}
                <Text style={styles.grupo}>{rutinaDelDia.grupo}</Text>
              </Text>
              <View style={{ height: 8 }} />
              {rutinaDelDia.ejercicios.map((ejercicio: any, i: number) => (
                <View key={i} style={styles.ejercicioCard}>
                  <View style={styles.headerRow}>
                    <View style={styles.ejercicioInfo}>
                      <Ionicons
                        name="barbell-outline"
                        size={width * 0.055}
                        color={COLORS.primaryDark}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={styles.ejercicioNombre}>{ejercicio.nombre}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorito(ejercicio.nombre)}
                      activeOpacity={0.75}
                      style={[
                        styles.favBtn,
                        favoritosLocal[ejercicio.nombre] && styles.favBtnActive,
                      ]}
                    >
                      <Ionicons
                        name={favoritosLocal[ejercicio.nombre] ? "star" : "star-outline"}
                        size={25}
                        color={favoritosLocal[ejercicio.nombre] ? COLORS.primary : "#c5c5c5"}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="repeat" size={17} color={COLORS.primaryDark} style={{ marginBottom: 2 }} />
                      <Text style={styles.statLabel}>Series</Text>
                      <Text style={styles.statValue}>{ejercicio.series}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="barbell" size={17} color={COLORS.primaryDark} style={{ marginBottom: 2 }} />
                      <Text style={styles.statLabel}>Reps</Text>
                      <Text style={styles.statValue}>{ejercicio.repeticiones}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="timer-outline" size={17} color={COLORS.primaryDark} style={{ marginBottom: 2 }} />
                      <Text style={styles.statLabel}>Descanso</Text>
                      <Text style={styles.statValue}>{ejercicio.descanso}</Text>
                    </View>
                  </View>
                  <View style={styles.propositoBox}>
                    <Ionicons
                      name="radio-button-on"
                      size={18}
                      color={COLORS.primary}
                      style={{ marginRight: 8, opacity: 0.9 }}
                    />
                    <Text style={styles.proposito}>{ejercicio["propósito"]}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.loaderContainer}>
              <Text style={styles.loaderText}>No hay rutina disponible para mostrar.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 20) + 10 : 36,
  },
  tabsContainer: {
    backgroundColor: COLORS.bg,
    borderBottomWidth: 0,
    paddingBottom: 5,
    marginBottom: 2,
    zIndex: 10,
    paddingTop: 2,
  },
  diasScroll: {
    paddingVertical: 9,
    paddingHorizontal: 7,
    alignItems: "center",
    gap: 11,
    minHeight: 56,
  },
  diaButton: {
    paddingVertical: 11,
    paddingHorizontal: width * 0.10,
    marginHorizontal: 4,
    borderRadius: 25,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.7,
    borderColor: "transparent",
    minWidth: 90,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 7,
  },
  diaButtonActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    shadowOpacity: 0.17,
    shadowColor: COLORS.primaryDark,
  },
  diaButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: width * 0.045,
    letterSpacing: 0.14,
  },
  diaButtonTextActivo: {
    color: "#fff",
  },
  card: {
    marginHorizontal: 9,
    marginTop: 10,
    marginBottom: 32,
    padding: width > 400 ? 28 : 15,
    backgroundColor: COLORS.card,
    borderRadius: 27,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.19,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
  },
  diaTitulo: {
    fontSize: width > 400 ? 22 : 18.8,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginBottom: 7,
    letterSpacing: 0.09,
    marginTop: 0,
  },
  grupo: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: width > 400 ? 17.5 : 15.7,
  },
  ejercicioCard: {
    marginBottom: 27,
    marginTop: 9,
    backgroundColor: COLORS.soft,
    borderRadius: 19,
    padding: width > 400 ? 20 : 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1.3,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
    gap: 7,
  },
  ejercicioInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    maxWidth: width * 0.60,
  },
  ejercicioNombre: {
    fontSize: width > 400 ? 17.6 : 15.6,
    fontWeight: "bold",
    color: COLORS.text,
    flexShrink: 1,
    letterSpacing: 0.09,
  },
  favBtn: {
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: "#e2faf3",
    borderWidth: 1.7,
    borderColor: "#cdf3e6",
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.13,
    shadowRadius: 7,
  },
  favBtnActive: {
    backgroundColor: "#b5ffe3",
    borderColor: COLORS.primaryDark,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
    marginTop: 1,
    gap: 13,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: COLORS.statBg,
    paddingVertical: 11,
    marginHorizontal: 3,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 0.8,
    borderColor: "#b7f4e0",
  },
  statLabel: {
    fontSize: width * 0.032,
    color: "#009664",
    marginTop: 2,
    fontWeight: "700",
  },
  statValue: {
    fontSize: width * 0.044,
    fontWeight: "bold",
    color: COLORS.statValue,
    marginTop: 2,
  },
  propositoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6fff6",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 17,
    marginTop: 11,
    alignSelf: "flex-start",
    minWidth: 112,
    shadowColor: "#00c27f44",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  proposito: {
    fontSize: width * 0.041,
    color: COLORS.primaryDark,
    fontWeight: "700",
    fontStyle: "italic",
    marginLeft: 2,
    letterSpacing: 0.04,
    flexShrink: 1,
    maxWidth: width > 400 ? 240 : 145,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});

const loaderAlertStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    flex: 1,
  },
  text: {
    marginTop: 0,
    fontWeight: "bold",
    fontSize: width * 0.054,
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  sub: {
    marginTop: 8,
    fontSize: width * 0.042,
    color: COLORS.text,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default RutinaIAGenerada;
