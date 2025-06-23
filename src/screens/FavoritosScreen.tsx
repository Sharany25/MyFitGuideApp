import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ConfirmDialog from "../components/ConfirmDialog";

const COLORS = {
  primary: "#00C27F",
  bg: "#F7F9FA",
  card: "#ffffff",
  text: "#1A1A1A",
  gray: "#6B7280",
  softGreen: "#d1fae5",
};

const FavoritosScreen = () => {
  const { state } = useUser();
  const userId = state.user?.userId || "";
  const { getFavoritos, toggleFavorito } = useFavoritos();

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [dialogVisible, setDialogVisible] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    cargarFavoritos();
  }, [userId]);

  const cargarFavoritos = async () => {
    const data = await getFavoritos(userId);
    setFavoritos(data);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const confirmarEliminar = (ejercicio: string) => {
    setEjercicioSeleccionado(ejercicio);
    setDialogVisible(true);
  };

  const ejecutarEliminacion = async () => {
    if (ejercicioSeleccionado) {
      await toggleFavorito(userId, ejercicioSeleccionado, false);
      setDialogVisible(false);
      setEjercicioSeleccionado(null);
      cargarFavoritos();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="star" size={36} color={COLORS.primary} />
        <Text style={styles.title}>Mis Ejercicios Favoritos</Text>
        <Text style={styles.subtitle}>
          ¡Administra tus favoritos y mantente motivado!
        </Text>
      </View>

      {favoritos.length === 0 ? (
        <Text style={styles.empty}>No has agregado ejercicios favoritos aún.</Text>
      ) : (
        favoritos.map((ejercicio, index) => (
          <Animated.View key={index} style={[styles.card, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={["#e0fdf4", "#f0fff8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.cardRow}>
                <Ionicons
                  name="barbell"
                  size={30}
                  color={COLORS.primary}
                  style={styles.cardIcon}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.ejercicio}>{ejercicio}</Text>
                  <Text style={styles.cardText}>
                    ¡Este ejercicio está entre tus favoritos!
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmarEliminar(ejercicio)}>
                  <Ionicons name="trash-outline" size={24} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        ))
      )}

      <ConfirmDialog
        visible={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onConfirm={ejecutarEliminacion}
        title="Quitar de favoritos"
        message={`¿Deseas quitar "${ejercicioSeleccionado}" de tus favoritos?`}
        confirmText="Sí, quitar"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 20) + 10 : 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.bg,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 6,
  },
  empty: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 60,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  gradient: {
    padding: 16,
    borderRadius: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  ejercicio: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardText: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: "italic",
  },
});

export default FavoritosScreen;
