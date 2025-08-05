import React, { useEffect, useState, useRef } from 'react';
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
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDieta } from '../hooks/useDieta';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  danger: '#FF4757', // Error color added
  cal: '#2CFD89',
  prot: '#00A3FF',
  carb: '#FFC107',
  fat: '#E91E63',
};

interface Params {
  userId: string;
}

const ResumenSemanalDieta = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userId } = route.params as Params;
  const { obtenerDietaPorUsuario, loading, error } = useDieta();
  const [totales, setTotales] = useState<any>(null);
  const [fechaCreacion, setFechaCreacion] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await obtenerDietaPorUsuario(userId);
      if (result?.resultado?.totales_semana) {
        setTotales(result.resultado.totales_semana);
        setFechaCreacion(result.creado);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.centered}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </LinearGradient>
    );
  }

  if (error || !totales) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.centered}>
        <Text style={{ color: PALETTE.danger, fontWeight: 'bold' }}>
          {error || 'No hay datos para mostrar.'}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{flex: 1}}>
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={PALETTE.text_primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resumen Semanal</Text>
                <View style={{width: 44}} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <LinearGradient colors={['rgba(44, 253, 137, 0.15)', 'rgba(0, 163, 255, 0.05)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
                    <BlurView intensity={50} tint="dark" style={styles.card}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Total Semanal de Calorías</Text>
                            <Text style={styles.totalValue}>{totales.calorias_total?.toLocaleString('en-US') ?? 0} kcal</Text>
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Resumen de Macronutrientes</Text>
                        <ProgressBar label="Proteínas" value={totales.proteinas_total ?? 0} max={1050} color={PALETTE.prot} unit="g" />
                        <ProgressBar label="Carbohidratos" value={totales.carbohidratos_total ?? 0} max={1750} color={PALETTE.carb} unit="g" />
                        <ProgressBar label="Grasas" value={totales.grasas_total ?? 0} max={450} color={PALETTE.fat} unit="g" />
                        <View style={styles.divider} />
                        <View style={styles.costContainer}>
                            <Ionicons name="cash-outline" size={24} color={PALETTE.primary} />
                            <Text style={styles.costoText}>Costo total estimado: ${totales.costo_total?.toFixed(2) ?? 0} MXN</Text>
                        </View>
                    </BlurView>
                </LinearGradient>
            </ScrollView>
        </SafeAreaView>
    </LinearGradient>
  );
};

const ProgressBar = ({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string; }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: max > 0 ? Math.min(value / max, 1) : 0,
            duration: 1000,
            useNativeDriver: false, // width animation not supported by native driver
        }).start();
    }, [value, max]);

    const widthInterpolation = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={styles.progressValue}>{value} / {max}{unit}</Text>
            </View>
            <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBarFill, { width: widthInterpolation, backgroundColor: color }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: width * 0.055,
    color: PALETTE.text_primary,
    fontWeight: "bold",
  },
  container: {
    padding: 20,
  },
  cardBorder: {
    borderRadius: 22,
    padding: 1,
  },
  card: {
    borderRadius: 20,
    padding: 25,
    overflow: 'hidden',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.04,
  },
  totalValue: {
    color: PALETTE.primary,
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginVertical: 20,
  },
  sectionTitle: {
    color: PALETTE.text_primary,
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
    color: PALETTE.text_primary,
  },
  progressValue: {
    fontSize: width * 0.035,
    color: PALETTE.text_secondary,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: PALETTE.inactive,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  costoText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: PALETTE.text_primary,
  },
  fecha: {
    textAlign: 'center',
    fontSize: width * 0.035,
    color: PALETTE.text_secondary,
    marginTop: 20,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResumenSemanalDieta;
