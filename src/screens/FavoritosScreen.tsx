import React, { useEffect, useState, useRef } from "react";
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
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFavoritos } from "../hooks/useFavoritos";
import ConfirmDialog from "../components/ConfirmDialog";
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get("window");

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  danger: '#FF4757',
  pin_red: '#F44336',
};

const FavoritosScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userId } = route.params as { userId: string };

  const { getFavoritos, EjerciciosFavoritos, ComidasFavoritas } = useFavoritos();

  const [favoritosEjercicios, setFavoritosEjercicios] = useState<string[]>([]);
  const [favoritosComidas, setFavoritosComidas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<string | null>(null);
  const [tipoItemSeleccionado, setTipoItemSeleccionado] = useState<"ejercicio" | "comida">("ejercicio");

  useEffect(() => {
    cargarFavoritos();
  }, [userId]);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const data = await getFavoritos(userId);
      setFavoritosEjercicios(data.ejercicios || []);
      setFavoritosComidas(data.comidas ||[]);
    } catch (error) {
      console.error("Error al cargar los favoritos", error);
    } finally {
        setLoading(false);
    }
  };

  const confirmarEliminar = (item: string, tipo: "ejercicio" | "comida") => {
    setItemSeleccionado(item);
    setTipoItemSeleccionado(tipo);
    setDialogVisible(true);
  };

  const ejecutarEliminacion = async () => {
    if (itemSeleccionado) {
      if (tipoItemSeleccionado === "ejercicio") {
        await EjerciciosFavoritos(userId, itemSeleccionado, false);
        setFavoritosEjercicios(prev => prev.filter(ej => ej !== itemSeleccionado));
      } else {
        await ComidasFavoritas(userId, itemSeleccionado, false);
        setFavoritosComidas(prev => prev.filter(c => c !== itemSeleccionado));
      }
      setDialogVisible(false);
      setItemSeleccionado(null);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="pin-off-outline" size={width * 0.2} color={PALETTE.inactive} />
        <Text style={styles.emptyTitle}>Sin Favoritos</Text>
        <Text style={styles.emptySubtitle}>Añade tus comidas y ejercicios preferidos para verlos aquí.</Text>
    </View>
  );

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color={PALETTE.text_primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <MaterialCommunityIcons name="pin-outline" size={32} color={PALETTE.primary} />
                    <Text style={styles.title}>Mis Favoritos</Text>
                </View>
                <View style={{width: 44}} /> 
            </View>

            {loading ? (
                <ActivityIndicator color={PALETTE.primary} size="large" style={{flex: 1}} />
            ) : (
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    {favoritosEjercicios.length === 0 && favoritosComidas.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <>
                            {favoritosEjercicios.length > 0 && (
                                <Section title="Ejercicios" items={favoritosEjercicios} type="ejercicio" onRemove={confirmarEliminar} />
                            )}
                            {favoritosComidas.length > 0 && (
                                <Section title="Comidas" items={favoritosComidas} type="comida" onRemove={confirmarEliminar} />
                            )}
                        </>
                    )}
                </ScrollView>
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
        </SafeAreaView>
    </LinearGradient>
  );
};

const Section = ({ title, items, type, onRemove }: { title: string, items: string[], type: 'ejercicio' | 'comida', onRemove: (item: string, type: 'ejercicio' | 'comida') => void }) => {
    const animations = useRef(items.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const anims = items.map((_, i) => 
            Animated.timing(animations[i], {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        );
        Animated.stagger(100, anims).start();
    }, [items]);

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => {
                const animStyle = {
                    opacity: animations[index],
                    transform: [{
                        translateY: animations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                        })
                    }]
                };
                return (
                    <Animated.View key={`${type}-${index}`} style={animStyle}>
                        <LinearGradient colors={['rgba(44, 253, 137, 0.15)', 'rgba(0, 163, 255, 0.05)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
                            <BlurView intensity={50} tint="dark" style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Ionicons name={type === 'ejercicio' ? "barbell-outline" : "fast-food-outline"} size={30} color={PALETTE.primary} style={styles.cardIcon} />
                                    <View style={styles.itemTextContainer}>
                                        <Text style={styles.itemText} numberOfLines={1}>{item}</Text>
                                        <Text style={styles.cardSubtitle}>
                                            {type === 'ejercicio' ? 'Ejercicio favorito' : 'Comida favorita'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => onRemove(item, type)} style={styles.deleteButton}>
                                        <Ionicons name="trash-outline" size={24} color={PALETTE.danger} />
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </LinearGradient>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: PALETTE.text_primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: height * 0.2,
  },
  emptyTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: PALETTE.text_primary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: width * 0.04,
    color: PALETTE.text_secondary,
    textAlign: "center",
    marginTop: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: PALETTE.text_primary,
    marginBottom: 15,
  },
  cardBorder: {
    borderRadius: 22,
    marginBottom: 16,
    padding: 1,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: width * 0.042,
    fontWeight: "600",
    color: PALETTE.text_primary,
  },
  cardSubtitle: {
    fontSize: width * 0.032,
    color: PALETTE.text_secondary,
    marginTop: 3,
    fontStyle: 'italic',
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default FavoritosScreen;