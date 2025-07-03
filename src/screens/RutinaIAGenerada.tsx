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
  bg: "#F7F9FA",
  text: "#232946",
  card: "#fff",
  accent: "#e0f4eb",
  soft: "#f6fff9",
  sombra: "#00c27f25",
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        style={{ flex: 1 }}
      >
        <Text style={styles.header}>Mi Rutina</Text>
        <View style={styles.diasWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.diasScroll}
          >
            {rutinaData.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedDiaIndex(idx)}
                activeOpacity={0.9}
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
        <View style={styles.card}>
          {rutinaDelDia ? (
            <>
              <Text style={styles.diaTitulo}>
                {rutinaDelDia.dia} ·{" "}
                <Text style={styles.grupo}>{rutinaDelDia.grupo}</Text>
              </Text>
              {rutinaDelDia.ejercicios.map((ejercicio: any, i: number) => (
                <View key={i} style={styles.ejercicioCard}>
                  <View style={styles.headerRow}>
                    <View style={styles.ejercicioInfo}>
                      <Ionicons
                        name="barbell-outline"
                        size={22}
                        color={COLORS.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.ejercicioNombre}>{ejercicio.nombre}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorito(ejercicio.nombre)}
                      activeOpacity={0.7}
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
                      <Ionicons name="repeat" size={16} color={COLORS.primary} style={{ marginBottom: 1 }} />
                      <Text style={styles.statLabel}>Series</Text>
                      <Text style={styles.statValue}>{ejercicio.series}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="barbell" size={16} color={COLORS.primary} style={{ marginBottom: 1 }} />
                      <Text style={styles.statLabel}>Reps</Text>
                      <Text style={styles.statValue}>{ejercicio.repeticiones}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="timer-outline" size={16} color={COLORS.primary} style={{ marginBottom: 1 }} />
                      <Text style={styles.statLabel}>Descanso</Text>
                      <Text style={styles.statValue}>{ejercicio.descanso}</Text>
                    </View>
                  </View>
                  <View style={styles.propositoBox}>
                    <Ionicons
                      name="radio-button-on"
                      size={17}
                      color={COLORS.primary}
                      style={{ marginRight: 6, opacity: 0.85 }}
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 20) + 12 : 38,
  },
  header: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 15,
    marginTop: 6,
    letterSpacing: 1,
  },
  diasWrapper: {
    marginBottom: 2,
  },
  diasScroll: {
    paddingVertical: 6,
    paddingHorizontal: 7,
    gap: 7,
  },
  diaButton: {
    paddingVertical: 9,
    paddingHorizontal: 19,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    minWidth: 80,
    elevation: 2,
    shadowColor: COLORS.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 5,
  },
  diaButtonActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowOpacity: 0.16,
  },
  diaButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 15.2,
    letterSpacing: 0.18,
  },
  diaButtonTextActivo: {
    color: "#fff",
  },
  card: {
    marginHorizontal: 8,
    marginTop: 7,
    marginBottom: 28,
    padding: width > 400 ? 27 : 18,
    backgroundColor: COLORS.card,
    borderRadius: 19,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  diaTitulo: {
    fontSize: width > 400 ? 22 : 19,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 17,
    letterSpacing: 0.12,
  },
  grupo: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: width > 400 ? 18.5 : 16.7,
  },
  ejercicioCard: {
    marginBottom: 20,
    backgroundColor: COLORS.soft,
    borderRadius: 14,
    padding: width > 400 ? 18 : 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.10,
    shadowRadius: 7,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5f7ef",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  ejercicioInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    maxWidth: width * 0.57,
  },
  ejercicioNombre: {
    fontSize: width > 400 ? 15.7 : 14.4,
    fontWeight: "bold",
    color: COLORS.text,
    flexShrink: 1,
    letterSpacing: 0.09,
  },
  favBtn: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#f3f7f5",
    borderWidth: 1,
    borderColor: "#e1efe7",
    elevation: 1,
  },
  favBtnActive: {
    backgroundColor: "#d0f9e5",
    borderColor: COLORS.primary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 2,
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#e0f4eb",
    paddingVertical: 7,
    marginHorizontal: 3,
    borderRadius: 9,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#599",
    marginTop: 1,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 1,
  },
  propositoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8fbf2",
    borderRadius: 7,
    paddingVertical: 7,
    paddingHorizontal: 11,
    marginTop: 10,
    alignSelf: "flex-start",
    minWidth: 98,
    shadowColor: "#00c27f44",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  proposito: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    fontStyle: "italic",
    marginLeft: 1,
    letterSpacing: 0.02,
    flexShrink: 1,
    maxWidth: width > 400 ? 235 : 145,
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
