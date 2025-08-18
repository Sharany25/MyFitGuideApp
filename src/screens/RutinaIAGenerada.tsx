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
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { useRutina } from "../hooks/useRutina";
import { useFavoritos } from "../hooks/useFavoritos";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { useRoute } from '@react-navigation/native';
import DownloadRoutinePdfButton from "../components/DownloadRoutinePdfButton"; 

const { width } = Dimensions.get("window");

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  accent_blue: '#00A3FF',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  danger: '#FF4757',
  pin_red: '#F44336',
};

const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

const iconosLoader = [
  "barbell-outline", "fitness-outline", "body-outline", "flash-outline", "star-outline",
] as const;

const LoaderAlert = ({ text = "Cargando tu rutina...", sub = "Esto puede tardar unos segundos." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [iconIdx, setIconIdx] = useState(0);

  useEffect(() => {
    Animated.loop(Animated.timing(spinValue, { toValue: 1, duration: 1200, useNativeDriver: false })).start();
    const interval = setInterval(() => setIconIdx((prev) => (prev + 1) % iconosLoader.length), 650);
    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={styles.centeredScreen}>
      <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 20 }}>
        <Ionicons name={iconosLoader[iconIdx]} size={width * 0.17} color={PALETTE.primary} />
      </Animated.View>
      <Text style={styles.loaderText}>{text}</Text>
      <Text style={styles.loaderSubText}>{sub}</Text>
    </LinearGradient>
  );
};

const HeaderActions = ({ onPdfPress, rutinaData, nombreUsuario, fechaGeneracionRutina }: any) => (
  <View style={styles.headerRow}>
    <DownloadRoutinePdfButton 
        rutinaData={rutinaData} 
        nombreUsuario={nombreUsuario} 
        fechaGeneracionRutina={fechaGeneracionRutina}
        style={styles.headerButton} 
        title="PDF Rutina" 
        iconSize={width * 0.05} 
    />
  </View>
);

const RutinaIAGenerada: React.FC = () => {
  const { state: userContextState } = useUser();
  const userId = userContextState.user?.userId || "";
  const nombreUsuario = userContextState.user?.nombre || 'Usuario';
  const { obtenerRutinaPorId, loading, error } = useRutina();
  const { getFavoritos, EjerciciosFavoritos } = useFavoritos();
  const route = useRoute();

  const [rutinaData, setRutinaData] = useState<any[]>([]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [favoritosLocal, setFavoritosLocal] = useState<{ [key: string]: boolean }>({});
  const [fechaCreacionRutina, setFechaCreacionRutina] = useState<string | undefined>(undefined);


  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const result = await obtenerRutinaPorId(userId);
      if (result?.rutina?.rutina) {
        setRutinaData(result.rutina.rutina);
        setFechaCreacionRutina(result.creado ? new Date(result.creado).toLocaleString() : undefined);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }

      const favs = await getFavoritos(userId);
      const favMap: { [key: string]: boolean } = {};
      (favs.ejercicios || []).forEach((ej: string) => (favMap[ej] = true));
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
      <LinearGradient colors={PALETTE.background_gradient} style={styles.centeredScreen}>
        <Text style={styles.errorText}>Error al obtener la rutina.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.daySelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorContent}>
              {rutinaData.map((_, idx) => (
                <TouchableOpacity key={idx} style={[styles.dayButton, selectedDiaIndex === idx && styles.dayButtonSelected]} onPress={() => setSelectedDiaIndex(idx)}>
                  <Text style={[styles.dayText, selectedDiaIndex === idx && styles.dayTextSelected]}>{DIAS_SEMANA[idx] || `Día ${idx + 1}`}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
        </View>

        <View style={styles.pdfButtonContainer}>
            <HeaderActions 
                rutinaData={rutinaData} 
                nombreUsuario={nombreUsuario} 
                fechaGeneracionRutina={fechaCreacionRutina}
            />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {rutinaDelDia ? (
                <Animated.View style={{opacity: fadeAnim}}>
                    <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>{rutinaDelDia.dia}</Text>
                        <Text style={styles.muscleGroup}>{rutinaDelDia.grupo}</Text>
                    </View>

                    <View style={styles.infoBanner}>
                        <Ionicons name="information-circle-outline" size={22} color={PALETTE.text_secondary} />
                        <Text style={styles.infoBannerText}>Los pesos en cada ejercicio son independientes para cada persona.</Text>
                    </View>
                    {rutinaDelDia.ejercicios.map((ejercicio: any, i: number) => (
                        <LinearGradient key={i} colors={['rgba(44, 253, 137, 0.15)', 'rgba(0, 163, 255, 0.05)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
                            <BlurView intensity={50} tint="dark" style={styles.exerciseCard}>
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseName}>{ejercicio.nombre}</Text>
                                    <TouchableOpacity onPress={() => handleToggleFavorito(ejercicio.nombre)}>
                                        <MaterialCommunityIcons name={favoritosLocal[ejercicio.nombre] ? "pin" : "pin-outline"} size={28} color={favoritosLocal[ejercicio.nombre] ? PALETTE.pin_red : PALETTE.text_secondary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.statsRow}>
                                    <StatItem icon="repeat" label="Series" value={ejercicio.series} />
                                    <StatItem icon="barbell" label="Reps" value={ejercicio.repeticiones} />
                                    <StatItem icon="timer-outline" label="Descanso" value={ejercicio.descanso} />
                                </View>
                                <View style={styles.purposeContainer}>
                                    <Text style={styles.purposeText}>{ejercicio["propósito"]}</Text>
                                </View>
                            </BlurView>
                        </LinearGradient>
                    ))}
                </Animated.View>
            ) : (
                <View style={styles.centeredScreen}>
                    <Text style={styles.errorText}>No hay rutina disponible para este día.</Text>
                </View>
            )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const StatItem = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap, label: string, value: string | number }) => (
    <View style={styles.statItem}>
        {icon === "repeat" || icon === "barbell" || icon === "timer-outline" ? (
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={PALETTE.text_secondary} />
        ) : (
            <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color={PALETTE.text_secondary} />
        )}
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: PALETTE.text_primary,
    fontSize: width * 0.05,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loaderSubText: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.04,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: PALETTE.danger,
    fontSize: width * 0.045,
    textAlign: 'center',
  },
  pdfButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: width * 0.05,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20
  },
  headerButtonText: {
    color: PALETTE.text_primary,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: width * 0.035
  },
  daySelectorContainer: {
    backgroundColor: PALETTE.inactive,
    borderRadius: 50,
    padding: 5,
    marginVertical: 15,
    marginHorizontal: width * 0.05,
  },
  daySelectorContent: {
    alignItems: 'center',
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: width * 0.05,
    borderRadius: 50,
  },
  dayButtonSelected: {
    backgroundColor: PALETTE.primary,
  },
  dayText: {
    color: PALETTE.text_secondary,
    fontWeight: '700',
    fontSize: width * 0.038,
  },
  dayTextSelected: {
    color: '#1D2A32',
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 120,
  },
  dayHeader: {
    marginBottom: 15,
    alignItems: 'center',
  },
  dayTitle: {
    color: PALETTE.text_primary,
    fontSize: width * 0.07,
    fontWeight: 'bold',
  },
  muscleGroup: {
    color: PALETTE.accent_blue,
    fontSize: width * 0.05,
    fontWeight: '600',
    marginTop: 5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  infoBannerText: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.038,
    marginLeft: 10,
    flex: 1,
  },
  cardBorder: {
    borderRadius: 22,
    marginBottom: 20,
    padding: 1,
  },
  exerciseCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseName: {
    color: PALETTE.text_primary,
    fontSize: width * 0.05,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    padding: 15,
    width: width * 0.25,
  },
  statValue: {
    color: PALETTE.text_primary,
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.035,
  },
  purposeContainer: {
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    padding: 15,
  },
  purposeText: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.038,
    fontStyle: 'italic',
  },
});

export default RutinaIAGenerada;
