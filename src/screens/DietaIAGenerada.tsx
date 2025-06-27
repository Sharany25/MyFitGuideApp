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
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '../hooks/useFavoritos';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { ComidasFavoritas } = useFavoritos();

  const [data, setData] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const FAVORITOS_KEY = `favoritosComidas_${userId}`;

  // Carga datos y favoritos locales al inicio
  useEffect(() => {
    const fetchData = async () => {
      const result = await obtenerDietaPorUsuario(userId);
      if (result) setData(result);
      try {
        const favs = await AsyncStorage.getItem(FAVORITOS_KEY);
        if (favs) setFavoritos(JSON.parse(favs));
      } catch (e) {}
    };
    fetchData();
  }, [userId]);

  // Cada vez que cambian los favoritos, se guardan localmente
  useEffect(() => {
    AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleComidaFavorita = async (comida: string) => {
    const yaEsFavorita = favoritos.includes(comida);
    const nuevosFavs = yaEsFavorita
      ? favoritos.filter(item => item !== comida)
      : [...favoritos, comida];
    setFavoritos(nuevosFavs);
    await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(nuevosFavs));
    await ComidasFavoritas(userId, comida, !yaEsFavorita); // sigue mandando a la API
  };

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
        <Text style={styles.progressValue}>
          {value}/{max}{label === 'Calorías' ? ' kcal' : 'g'}
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <TouchableOpacity
          style={styles.resumenButton}
          onPress={() => navigation.navigate('ResumenSemanalDieta', { userId })}
        >
          <Text style={styles.resumenButtonText}>🔍 Ver resumen semanal</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {semana.map((_day: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayButton, selectedDayIndex === index && styles.dayButtonSelected]}
              onPress={() => setSelectedDayIndex(index)}
              activeOpacity={0.85}
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
            <View style={styles.cardHeaderRow}>
              <Text style={styles.comidaTipo}>🍽️ {comida.tipo.toUpperCase()}</Text>
              <TouchableOpacity
                style={[
                  styles.favoriteButton,
                  favoritos.includes(comida.platillo) && styles.favoriteButtonActive
                ]}
                onPress={() => toggleComidaFavorita(comida.platillo)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={favoritos.includes(comida.platillo) ? 'star' : 'star-outline'}
                  size={22}
                  color={favoritos.includes(comida.platillo) ? COLORS.primary : '#bdbdbd'}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.comidaPlatillo}>{comida.platillo}</Text>
            <View style={styles.comidaDetalle}>
              <Text style={styles.comidaSub}>Ingredientes:</Text>
              {comida.ingredientes.map((ing: any, i: number) => (
                <Text key={i} style={styles.ingrediente}>
                  - {ing.nombre}: {ing.cantidad}
                </Text>
              ))}
              <Text style={styles.comidaSub}>
                Macros: <Text style={{ color: COLORS.prot }}>P: {comida.macros.proteinas}g</Text>,
                <Text style={{ color: COLORS.carb }}> C: {comida.macros.carbohidratos}g</Text>,
                <Text style={{ color: COLORS.fat }}> G: {comida.macros.grasas}g</Text>
              </Text>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 35) : 38,
  },
  container: {
    flex: 1,
    padding: 14,
  },
  resumenButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 17,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  resumenButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  daySelector: {
    flexDirection: 'row',
    marginBottom: 18,
    paddingVertical: 7,
    paddingHorizontal: 2,
    backgroundColor: COLORS.soft,
    borderRadius: 17,
  },
  dayButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 1,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontWeight: '700',
    fontSize: 15,
    color: COLORS.primary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginVertical: 10,
    marginTop: 16,
    letterSpacing: 0.04,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 17,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  progressLabel: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  progressBarBackground: {
    height: 11,
    backgroundColor: '#ddd',
    borderRadius: 7,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 11,
    borderRadius: 7,
  },
  progressValue: {
    fontSize: 12,
    color: '#555',
    textAlign: 'right',
  },
  comidaCard: {
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d5f6ea',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  comidaTipo: {
    fontWeight: '700',
    fontSize: 15.5,
    color: COLORS.primary,
    marginBottom: 0,
    letterSpacing: 0.04,
  },
  comidaPlatillo: {
    fontSize: 16.5,
    fontWeight: '500',
    marginBottom: 7,
    color: COLORS.secondary,
    letterSpacing: 0.06,
  },
  comidaDetalle: {
    marginLeft: 6,
    marginTop: 2,
  },
  comidaSub: {
    fontSize: 13,
    marginTop: 3,
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
    marginTop: 14,
    marginBottom: 8,
  },
  favoriteButton: {
    marginLeft: 9,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#f3f7f5',
    borderWidth: 1,
    borderColor: '#e1efe7',
    elevation: 1,
  },
  favoriteButtonActive: {
    backgroundColor: '#d0f9e5',
    borderColor: COLORS.primary,
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
