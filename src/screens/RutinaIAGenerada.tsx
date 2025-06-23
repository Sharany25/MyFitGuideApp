import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
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
  card: "#ffffff",
  accent: "#d0f0e3",
};

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const RutinaIAGenerada: React.FC = () => {
  const { state } = useUser();
  const userId = state.user?.userId || "";
  const { obtenerRutinaPorId, loading, error } = useRutina();
  const { favoritos, getFavoritos, toggleFavorito } = useFavoritos();

  const [rutinaData, setRutinaData] = useState<any[]>([]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [favoritosLocal, setFavoritosLocal] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const result = await obtenerRutinaPorId(userId);
      if (result?.rutina?.rutina) {
        setRutinaData(result.rutina.rutina);
      }

      const favs = await getFavoritos(userId);
      const favMap: { [key: string]: boolean } = {};
      favs.forEach((ej: string) => (favMap[ej] = true));
      setFavoritosLocal(favMap);
    };

    fetchData();
  }, [userId]);

  const handleToggleFavorito = async (nombre: string) => {
    const marcado = !favoritosLocal[nombre];
    setFavoritosLocal((prev) => ({ ...prev, [nombre]: marcado }));
    await toggleFavorito(userId, nombre, marcado);
  };

  const rutinaDelDia = rutinaData.length > 0 ? rutinaData[selectedDiaIndex] : null;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Cargando rutina personalizada...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Error al obtener rutina. Intenta más tarde.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.diasWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasScroll}>
          {rutinaData.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedDiaIndex(idx)}
              style={[styles.diaButton, selectedDiaIndex === idx && styles.diaButtonActivo]}
            >
              <Text style={[styles.diaButtonText, selectedDiaIndex === idx && styles.diaButtonTextActivo]}>
                {DIAS_SEMANA[idx] || `Día ${idx + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {rutinaDelDia ? (
          <View style={styles.card}>
            <Text style={styles.diaTitulo}>
              {rutinaDelDia.dia} - {rutinaDelDia.grupo}
            </Text>
            {rutinaDelDia.ejercicios.map((ejercicio: any, i: number) => (
              <View key={i} style={styles.ejercicioBox}>
                <View style={styles.headerRow}>
                  <Text style={styles.ejercicioNombre}>🏋️‍♀️ {ejercicio.nombre}</Text>
                  <TouchableOpacity onPress={() => handleToggleFavorito(ejercicio.nombre)}>
                    <Ionicons
                      name={favoritosLocal[ejercicio.nombre] ? "star" : "star-outline"}
                      size={24}
                      color={favoritosLocal[ejercicio.nombre] ? COLORS.primary : "#ccc"}
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Series</Text>
                    <Text style={styles.statValue}>{ejercicio.series}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Reps</Text>
                    <Text style={styles.statValue}>{ejercicio.repeticiones}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Descanso</Text>
                    <Text style={styles.statValue}>{ejercicio.descanso}</Text>
                  </View>
                </View>
                <Text style={styles.proposito}>🎯 {ejercicio["propósito"]}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.loaderContainer}>
            <Text style={styles.loaderText}>No hay rutina disponible para mostrar.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 20) + 10 : 30,
  },
  diasWrapper: { marginBottom: 4 },
  diasScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#e0f4eb",
  },
  diaButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
  },
  diaButtonActivo: { backgroundColor: COLORS.primary },
  diaButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  diaButtonTextActivo: { color: "#fff" },
  content: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  diaTitulo: {
    fontSize: 21,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  ejercicioBox: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ejercicioNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  proposito: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
    paddingHorizontal: 4,
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

export default RutinaIAGenerada;
