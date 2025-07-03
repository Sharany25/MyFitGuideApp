import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/StackNavigator';
import { useDieta } from '../hooks/useDieta';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '../hooks/useFavoritos';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#00C27F',
  secondary: '#1C1C1E',
  bg: '#FAFAFA',
  card: '#fff',
  cal: '#4CAF50',
  prot: '#2196F3',
  carb: '#FFA000',
  fat: '#E64A19',
  text: '#232946',
  soft: '#eef3f8',
  border: '#d7f6e9',
  sub: '#777',
  inputBg: '#f7fefb',
  error: '#D21F3C'
};

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// --- Loader bonito para "Cargando dieta generada..."
const alimentos = [
  'nutrition-outline',
  'restaurant',
  'fast-food-outline',
  'leaf-outline',
  'water-outline',
];

const LoadingDieta = ({ text = "Cargando dieta generada..." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [iconIdx, setIconIdx] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setIconIdx(prev => (prev + 1) % alimentos.length);
    }, 850);

    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }], alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={alimentos[iconIdx] as any} size={SCREEN_WIDTH * 0.19} color={COLORS.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>{text}</Text>
      <Text style={styles.loadingSub}>Por favor espera unos segundos...</Text>
    </View>
  );
};
// ---

interface Params {
  userId: string;
}

const DietaIAGenerada = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = route.params as Params;
  const { obtenerDietaPorUsuario, loading, error } = useDieta();
  const { ComidasFavoritas } = useFavoritos();

  const [data, setData] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [nuevoPlatillo, setNuevoPlatillo] = useState('');
  const [editTipoComida, setEditTipoComida] = useState('');
  const [platilloLoading, setPlatilloLoading] = useState(false);
  const [platilloError, setPlatilloError] = useState<string | null>(null);
  const FAVORITOS_KEY = `favoritosComidas_${userId}`;

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoritos]);

  useEffect(() => {
    if (editIndex !== null && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 320 + editIndex * 240, animated: true });
        inputRef.current?.focus();
      }, 320);
    }
  }, [editIndex]);

  const toggleComidaFavorita = async (platillo: string) => {
    const yaEsFavorita = favoritos.includes(platillo);
    const nuevosFavs = yaEsFavorita
      ? favoritos.filter(item => item !== platillo)
      : [...favoritos, platillo];
    setFavoritos(nuevosFavs);
    await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(nuevosFavs));
    await ComidasFavoritas(userId, platillo, !yaEsFavorita);
  };

  const handleEditarPlatillo = (index: number, tipo: string, platillo: string) => {
    setEditIndex(index);
    setEditTipoComida(tipo);
    setNuevoPlatillo('');
    setPlatilloError(null);
  };

  const handleGuardarPlatillo = async () => {
    if (!nuevoPlatillo.trim()) {
      setPlatilloError('Ingresa un nuevo platillo');
      return;
    }
    setPlatilloLoading(true);
    setPlatilloError(null);

    const payload = {
      dia: data.resultado.semana[selectedDayIndex].dia,
      tipoComida: editTipoComida,
      platillo: nuevoPlatillo.trim(),
    };

    try {
      const res = await fetch(`${API_URL}dieta-ia/${userId}/platillo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        setPlatilloError(result.message || 'No se pudo modificar el platillo');
      } else {
        setEditIndex(null);
        setNuevoPlatillo('');
        const updated = await obtenerDietaPorUsuario(userId);
        if (updated) setData(updated);
        Keyboard.dismiss();
      }
    } catch {
      setPlatilloError('Error de conexión');
    } finally {
      setPlatilloLoading(false);
    }
  };

  if (loading || platilloLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LoadingDieta />
      </SafeAreaView>
    );
  }

  if (error || !data?.resultado) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.error}>Error: {error || 'Dieta no encontrada'}</Text>
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 20, alignItems: 'center' }}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.resumenButton}
            onPress={() => navigation.navigate('ResumenSemanalDieta', { userId })}
            activeOpacity={0.87}
          >
            <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.resumenButtonText}>Ver resumen semanal</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.daySelector}
            contentContainerStyle={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
          >
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
          {diaActual.comidas.map((comida: any, index: number) => {
            const nombrePlatillo =
              typeof comida.platillo === 'string'
                ? comida.platillo
                : (comida.platillo && comida.platillo.platillo)
                  ? comida.platillo.platillo
                  : '';
            const ingredientes =
              typeof comida.platillo === 'string'
                ? comida.ingredientes
                : comida.platillo.ingredientes;
            const macros =
              typeof comida.platillo === 'string'
                ? comida.macros
                : comida.platillo.macros;
            const calorias =
              typeof comida.platillo === 'string'
                ? comida.calorias
                : comida.platillo.calorias;
            const costo =
              typeof comida.platillo === 'string'
                ? comida.costo
                : comida.platillo.costo;

            return (
              <View key={index} style={styles.comidaCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.comidaTipo}>
                    <Ionicons name="restaurant" size={SCREEN_WIDTH * 0.058} color={COLORS.primary} style={{marginRight: 2}} />
                    <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.044, marginLeft: 6 }}>
                      {' '}{comida.tipo.toUpperCase()}
                    </Text>
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[
                        styles.iconButton,
                        favoritos.includes(nombrePlatillo) && styles.favoriteButtonActive
                      ]}
                      onPress={() => toggleComidaFavorita(nombrePlatillo)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={favoritos.includes(nombrePlatillo) ? 'star' : 'star-outline'}
                        size={SCREEN_WIDTH * 0.055}
                        color={favoritos.includes(nombrePlatillo) ? COLORS.primary : '#bdbdbd'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleEditarPlatillo(index, comida.tipo, nombrePlatillo)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={SCREEN_WIDTH * 0.048} color="#656565" />
                    </TouchableOpacity>
                  </View>
                </View>
                {editIndex === index ? (
                  <View style={{ marginTop: 10 }}>
                    <TextInput
                      ref={inputRef}
                      placeholder="Nuevo nombre del platillo"
                      style={[
                        styles.input,
                        { borderColor: platilloError ? COLORS.error : COLORS.primary }
                      ]}
                      value={nuevoPlatillo}
                      onChangeText={setNuevoPlatillo}
                      editable={!platilloLoading}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleGuardarPlatillo}
                    />
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                      <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleGuardarPlatillo}
                        disabled={platilloLoading}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.saveButtonText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: '#bdbdbd', marginLeft: 10 }]}
                        onPress={() => { setEditIndex(null); setNuevoPlatillo(''); setPlatilloError(null); Keyboard.dismiss(); }}
                        disabled={platilloLoading}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.saveButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                    {platilloError && <Text style={styles.error}>{platilloError}</Text>}
                  </View>
                ) : (
                  <>
                    <Text style={styles.comidaPlatillo}>{nombrePlatillo}</Text>
                    <View style={styles.comidaDetalle}>
                      <Text style={styles.comidaSub}>Ingredientes:</Text>
                      {Array.isArray(ingredientes) && ingredientes.map((ing: any, i: number) => (
                        <Text key={i} style={styles.ingrediente}>
                          - {ing.nombre}: {ing.cantidad}
                        </Text>
                      ))}
                      <Text style={styles.macrosRow}>
                        Macros:
                        <Text style={{ color: COLORS.prot }}> P: {macros?.proteinas ?? 0}g</Text>,
                        <Text style={{ color: COLORS.carb }}> C: {macros?.carbohidratos ?? 0}g</Text>,
                        <Text style={{ color: COLORS.fat }}> G: {macros?.grasas ?? 0}g</Text>
                      </Text>
                      <Text style={styles.comidaSub}>Calorías: {calorias ?? 0} kcal</Text>
                      <Text style={styles.comidaSub}>Costo: ${costo ?? 0} MXN</Text>
                    </View>
                  </>
                )}
              </View>
            );
          })}
          <Text style={styles.fecha}>🕒 Generada el: {new Date(data.creado).toLocaleString()}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  resumenButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SCREEN_WIDTH * 0.032,
    paddingHorizontal: SCREEN_WIDTH * 0.09,
    borderRadius: 23,
    alignItems: 'center',
    marginBottom: 17,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  resumenButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: SCREEN_WIDTH * 0.046,
    letterSpacing: 0.14,
  },
  daySelector: {
    marginBottom: 15,
    paddingVertical: 9,
    backgroundColor: COLORS.soft,
    borderRadius: 25,
    paddingHorizontal: 5,
    width: '100%',
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 19,
    borderRadius: 21,
    backgroundColor: COLORS.bg,
    marginHorizontal: 2,
    borderWidth: 1.4,
    borderColor: 'transparent',
    elevation: 1,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontWeight: '700',
    fontSize: SCREEN_WIDTH * 0.041,
    color: COLORS.primary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.052,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginVertical: 10,
    marginTop: 16,
    letterSpacing: 0.07,
    width: '100%',
    paddingLeft: 2,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 23,
    padding: SCREEN_WIDTH * 0.055,
    marginBottom: 19,
    width: SCREEN_WIDTH * 0.97,
    elevation: 2,
    alignSelf: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  progressLabel: {
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.037,
    color: COLORS.text,
  },
  progressBarBackground: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 7,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 15,
    borderRadius: 7,
  },
  progressValue: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: COLORS.sub,
    textAlign: 'right',
    fontWeight: '500',
  },
  comidaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 23,
    padding: SCREEN_WIDTH * 0.053,
    marginBottom: 14,
    width: SCREEN_WIDTH * 0.97,
    alignSelf: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.10,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    borderWidth: 1.3,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  comidaTipo: {
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: COLORS.primary,
    marginBottom: 0,
    letterSpacing: 0.07,
    alignItems: 'center'
  },
  comidaPlatillo: {
    fontSize: SCREEN_WIDTH * 0.048,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.secondary,
    letterSpacing: 0.10,
  },
  comidaDetalle: {
    marginLeft: 7,
    marginTop: 2,
  },
  comidaSub: {
    fontSize: SCREEN_WIDTH * 0.037,
    marginTop: 3,
    color: COLORS.text,
  },
  macrosRow: {
    fontSize: SCREEN_WIDTH * 0.039,
    marginTop: 5,
    color: COLORS.text,
    fontWeight: 'bold'
  },
  ingrediente: {
    fontSize: SCREEN_WIDTH * 0.033,
    marginLeft: 12,
    color: COLORS.sub,
  },
  fecha: {
    textAlign: 'center',
    fontSize: SCREEN_WIDTH * 0.033,
    fontStyle: 'italic',
    color: COLORS.sub,
    marginTop: 15,
    marginBottom: 9,
  },
  iconButton: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: SCREEN_WIDTH * 0.105,
    width: SCREEN_WIDTH * 0.105,
    borderRadius: SCREEN_WIDTH * 0.0525,
    backgroundColor: '#f3f7f5',
    borderWidth: 1,
    borderColor: '#e1efe7',
    elevation: 1,
  },
  favoriteButtonActive: {
    backgroundColor: '#d0f9e5',
    borderColor: COLORS.primary,
  },
  input: {
    borderWidth: 2,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 15,
    fontSize: SCREEN_WIDTH * 0.045,
    color: COLORS.text,
    marginBottom: 3,
    width: '100%',
    fontWeight: '600'
  },
  saveButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: SCREEN_WIDTH * 0.041,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  error: {
    color: COLORS.error,
    fontSize: SCREEN_WIDTH * 0.039,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 28,
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.056,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  loadingSub: {
    marginTop: 10,
    fontSize: SCREEN_WIDTH * 0.041,
    color: COLORS.sub,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.04,
  },
});

export default DietaIAGenerada;
