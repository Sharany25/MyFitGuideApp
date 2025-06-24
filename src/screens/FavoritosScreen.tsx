import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { useRoute } from "@react-navigation/native";  // Usamos useRoute para obtener los parámetros
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
  const route = useRoute();  // Usamos useRoute para obtener los parámetros
  const { userId } = route.params as { userId: string };  // Accedemos al userId

  const { getFavoritos, EjerciciosFavoritos, ComidasFavoritas } = useFavoritos();

  const [favoritosEjercicios, setFavoritosEjercicios] = useState<string[]>([]); // Estado para ejercicios favoritos
  const [favoritosComidas, setFavoritosComidas] = useState<string[]>([]); // Estado para comidas favoritas
  const [fadeAnim] = useState(new Animated.Value(0));

  const [dialogVisible, setDialogVisible] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<string | null>(null);
  const [tipoItemSeleccionado, setTipoItemSeleccionado] = useState<"ejercicio" | "comida">("ejercicio");

  // useEffect que se dispara cuando se carga la pantalla
  useEffect(() => {
    cargarFavoritos();
  }, [userId]);

  const cargarFavoritos = async () => {
    try {
      // Cargar todos los favoritos
      const data = await getFavoritos(userId); // Llamada al nuevo método GET
      setFavoritosEjercicios(data.ejercicios || []);
      setFavoritosComidas(data.comidas || []);

      // Animación de entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error al cargar los favoritos", error);
    }
  };

  const confirmarEliminar = (item: string, tipo: "ejercicio" | "comida") => {
    setItemSeleccionado(item);
    setTipoItemSeleccionado(tipo);
    setDialogVisible(true);
  };

  const ejecutarEliminacion = async () => {
    if (itemSeleccionado && tipoItemSeleccionado) {
      if (tipoItemSeleccionado === "ejercicio") {
        await EjerciciosFavoritos(userId, itemSeleccionado, false); // Eliminar ejercicio
        setFavoritosEjercicios(favoritosEjercicios.filter(ej => ej !== itemSeleccionado)); // Actualizar estado
      } else {
        await ComidasFavoritas(userId, itemSeleccionado, false); // Eliminar comida
        setFavoritosComidas(favoritosComidas.filter(c => c !== itemSeleccionado)); // Actualizar estado
      }

      setDialogVisible(false);
      setItemSeleccionado(null);
      setTipoItemSeleccionado("ejercicio"); // Default a "ejercicio" después de eliminar
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="star" size={36} color={COLORS.primary} />
        <Text style={styles.title}>Mis Favoritos</Text>
        <Text style={styles.subtitle}>¡Administra tus favoritos y mantente motivado!</Text>
      </View>

      {favoritosEjercicios.length === 0 && favoritosComidas.length === 0 ? (
        <Text style={styles.empty}>No has agregado favoritos aún.</Text>
      ) : (
        <>
          {/* Mostrar favoritos de ejercicios */}
          {favoritosEjercicios.map((item, index) => (
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
                    <Text style={styles.item}>{item}</Text>
                    <Text style={styles.cardText}>
                      ¡Este ejercicio está entre tus favoritos!
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmarEliminar(item, "ejercicio")}>
                    <Ionicons name="trash-outline" size={24} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}

          {/* Mostrar favoritos de comidas */}
          {favoritosComidas.map((item, index) => (
            <Animated.View key={index} style={[styles.card, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={["#e0fdf4", "#f0fff8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <View style={styles.cardRow}>
                  <Ionicons
                    name="fast-food"
                    size={30}
                    color={COLORS.primary}
                    style={styles.cardIcon}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.item}>{item}</Text>
                    <Text style={styles.cardText}>
                      ¡Esta comida está entre tus favoritos!
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmarEliminar(item, "comida")}>
                    <Ionicons name="trash-outline" size={24} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </>
      )}

      <ConfirmDialog
        visible={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onConfirm={ejecutarEliminacion}
        title={`Quitar de favoritos`}
        message={`¿Deseas quitar "${itemSeleccionado}" de tus favoritos?`}
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
  item: {
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
