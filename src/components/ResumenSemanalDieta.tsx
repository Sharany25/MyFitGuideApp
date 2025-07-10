import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDieta } from '../hooks/useDieta';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#00C27F',
  secondary: '#1C1C1E',
  bg: '#FAFAFA',
  card: '#FFFFFF',
  cal: '#4CAF50',
  prot: '#00BCD4',
  carb: '#3F51B5',
  fat: '#FFC107',
  text: '#333',
};

interface Params {
  userId: string;
}

const ResumenSemanalDieta = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
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

  const ProgressBar = ({
    label,
    value,
    max,
    color,
  }: {
    label: string;
    value: number;
    max: number;
    color: string;
  }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {value}/{max}
          {label === 'Calorías' ? ' kcal' : 'g'}
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${max > 0 ? Math.min(value / max, 1) * 100 : 0}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Cargando resumen semanal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!totales) {
    return (
      <View style={styles.centered}>
        <Text>No hay datos para mostrar.</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safeArea,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top },
      ]}
    >
      {/* Botón de regreso */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Ionicons name="pie-chart" size={22} color={COLORS.primary} /> Resumen Semanal
        </Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.card}>
          <ProgressBar label="Calorías" value={totales.calorias_total ?? 0} max={14000} color={COLORS.cal} />
          <ProgressBar label="Proteínas" value={totales.proteinas_total ?? 0} max={700} color={COLORS.prot} />
          <ProgressBar label="Carbohidratos" value={totales.carbohidratos_total ?? 0} max={2100} color={COLORS.carb} />
          <ProgressBar label="Grasas" value={totales.grasas_total ?? 0} max={350} color={COLORS.fat} />
          <Text style={styles.costoText}>💰 Costo total: ${totales.costo_total ?? 0} MXN</Text>
        </View>

        <Text style={styles.fecha}>🕒 Generada el: {fechaCreacion ? new Date(fechaCreacion).toLocaleString() : ''}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 9,
    paddingHorizontal: 13,
    paddingTop: 7,
  },
  backBtn: {
    padding: 4,
    borderRadius: 30,
    backgroundColor: "#fff",
    elevation: 3,
    marginRight: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTitle: {
    fontSize: 21,
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: 2,
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.secondary,
  },
  progressValue: {
    fontSize: 13,
    color: COLORS.text,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 6,
  },
  costoText: {
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  fecha: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
    marginTop: 20,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
});

export default ResumenSemanalDieta;
