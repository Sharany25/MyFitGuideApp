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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/StackNavigator';
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
  soft: '#f0f0f0',
};

interface Params {
  userId: string;
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DietaIAGenerada = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = route.params as Params;
  const { obtenerDietaPorUsuario, loading, error } = useDieta();
  const [data, setData] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const result = await obtenerDietaPorUsuario(userId);
      if (result) setData(result);
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Cargando dieta generada...</Text>
      </View>
    );
  }

  if (error || !data?.resultado) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error || 'Dieta no encontrada'}</Text>
      </View>
    );
  }

  const { semana } = data.resultado;
  const diaActual = semana[selectedDayIndex];

  const ProgressBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}/{max}{label === 'Calorías' ? ' kcal' : 'g'}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${(value / max) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.resumenButton}
          onPress={() => navigation.navigate('ResumenSemanalDieta', { userId })}
        >
          <Text style={styles.resumenButtonText}>🔍 Ver solo resumen semanal</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {semana.map((_day: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayButton, selectedDayIndex === index && styles.dayButtonSelected]}
              onPress={() => setSelectedDayIndex(index)}
            >
              <Text style={[styles.dayText, selectedDayIndex === index && styles.dayTextSelected]}>
                {DIAS_SEMANA[index]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Resumen del día</Text>
        <View style={styles.summaryCard}>
          <ProgressBar label="Calorías" value={diaActual.totales_dia.calorias} max={2000} color={COLORS.cal} />
          <ProgressBar label="Proteínas" value={diaActual.totales_dia.proteinas} max={100} color={COLORS.prot} />
          <ProgressBar label="Carbohidratos" value={diaActual.totales_dia.carbohidratos} max={300} color={COLORS.carb} />
          <ProgressBar label="Grasas" value={diaActual.totales_dia.grasas} max={50} color={COLORS.fat} />
        </View>

        <Text style={styles.sectionTitle}>Comidas del día</Text>
        {diaActual.comidas.map((comida: any, index: number) => (
          <View key={index} style={styles.comidaCard}>
            <Text style={styles.comidaTipo}>🍽️ {comida.tipo.toUpperCase()}</Text>
            <Text style={styles.comidaPlatillo}>{comida.platillo}</Text>
            <View style={styles.comidaDetalle}>
              <Text style={styles.comidaSub}>Ingredientes:</Text>
              {comida.ingredientes.map((ing: any, i: number) => (
                <Text key={i} style={styles.ingrediente}>- {ing.nombre}: {ing.cantidad}</Text>
              ))}
              <Text style={styles.comidaSub}>Macros: P: {comida.macros.proteinas}g, C: {comida.macros.carbohidratos}g, G: {comida.macros.grasas}g</Text>
              <Text style={styles.comidaSub}>Calorías: {comida.calorias} kcal</Text>
              <Text style={styles.comidaSub}>Costo: ${comida.costo} MXN</Text>
            </View>
          </View>
        ))}

        <Text style={styles.fecha}>🕒 Generada el: {new Date(data.creado).toLocaleString()}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  resumenButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    elevation: 3,
  },
  resumenButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  daySelector: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.soft,
    marginHorizontal: 5,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.secondary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginVertical: 10,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontWeight: 'bold',
    fontSize: 13,
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
  progressValue: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    textAlign: 'right',
  },
  comidaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  comidaTipo: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: 4,
  },
  comidaPlatillo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.secondary,
  },
  comidaDetalle: {
    marginLeft: 6,
  },
  comidaSub: {
    fontSize: 13,
    marginTop: 4,
    color: COLORS.text,
  },
  ingrediente: {
    fontSize: 13,
    marginLeft: 10,
    color: '#555',
  },
  fecha: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    color: '#777',
    marginTop: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DietaIAGenerada;
