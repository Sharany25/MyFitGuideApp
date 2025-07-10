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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDieta } from '../hooks/useDieta';
import { useFavoritos } from '../hooks/useFavoritos';
import { API_URL } from '../api/api';
import DownloadDietPdfButton from '../components/DownloadDietPdfButton';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLORS = {
  primary: '#00C27F', primaryDark: '#029865', bg: '#FAFAFA', card: '#fff', 
  text: '#232946', soft: '#eef3f8', border: '#b8f2e6', borderCard: '#d7f6e9',
  inputBg: '#f7fefb', error: '#D21F3C', sub: '#777', white: '#fff'
};
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const alimentos = [
  'food-variant',
  'food-apple',
  'food-drumstick',
  'food-fork-drink',
  'water'
] as const;

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
    const interval = setInterval(() => setIconIdx(i => (i + 1) % alimentos.length), 850);
    return () => clearInterval(interval);
  }, []);
  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name={alimentos[iconIdx]} size={SCREEN_WIDTH * 0.19} color={COLORS.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>{text}</Text>
      <Text style={styles.loadingSub}>Por favor espera unos segundos...</Text>
    </View>
  );
};

const DietaIAGenerada: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userId, nombre } = route.params as { userId: string; nombre: string };
  const { obtenerDietaPorUsuario, loading, error } = useDieta();
  const { ComidasFavoritas, getFavoritos } = useFavoritos();

  const [data, setData] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // --- Nueva lógica de favoritos tipo diccionario (como en rutinas) ---
  const [favoritosLocal, setFavoritosLocal] = useState<{ [key: string]: boolean }>({});

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [nuevoPlatillo, setNuevoPlatillo] = useState('');
  const [editTipoComida, setEditTipoComida] = useState('');
  const [platilloLoading, setPlatilloLoading] = useState(false);
  const [platilloError, setPlatilloError] = useState<string | null>(null);

  const FAVORITOS_KEY = `favoritosComidas_${userId}`;
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const result = await obtenerDietaPorUsuario(userId);
      if (result) setData(result);

      // Cargar favoritos desde API (si tienes) o localStorage (si no)
      let favsLocal: string[] = [];
      try {
        const favs = await AsyncStorage.getItem(FAVORITOS_KEY);
        if (favs) favsLocal = JSON.parse(favs);
      } catch {}
      // Si tienes getFavoritos() para comidas, puedes usarlo también aquí
      // const apiFavs = await getFavoritos(userId); // Si tu backend regresa comidas favoritas
      // favsLocal = apiFavs.comidas || [];

      // Mapeo a diccionario para respuesta rápida
      const favMap: { [key: string]: boolean } = {};
      favsLocal.forEach((item: string) => (favMap[item] = true));
      setFavoritosLocal(favMap);
    })();
  }, [userId]);

  useEffect(() => {
    // Guarda los favoritos actualizados en storage
    AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(Object.keys(favoritosLocal).filter(k => favoritosLocal[k])));
  }, [favoritosLocal]);

  useEffect(() => {
    if (editIndex !== null && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 320 + editIndex * 240, animated: true });
        inputRef.current?.focus();
      }, 320);
    }
  }, [editIndex]);

  // --- Lógica igual que en rutinas para marcar/desmarcar favorito ---
  const toggleComidaFavorita = async (platillo: string) => {
    const marcado = !favoritosLocal[platillo];
    setFavoritosLocal(prev => ({ ...prev, [platillo]: marcado }));
    // Esto guarda el cambio en el backend o donde lo manejes
    await ComidasFavoritas(userId, platillo, marcado);
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
      if (!res.ok) setPlatilloError(result.message || 'No se pudo modificar el platillo');
      else {
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
  const nombreUsuario = data?.usuario?.nombre ?? 'Usuario';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 26, alignItems: 'center' }}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.resumenButton}
              onPress={() => navigation.navigate('ResumenSemanalDieta', { userId })}
              activeOpacity={0.87}
            >
              <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="#fff" style={{ marginRight: 7 }} />
              <Text style={styles.resumenButtonText}>Ver resumen semanal</Text>
            </TouchableOpacity>
            <DownloadDietPdfButton
              data={data}
              nombreUsuario={nombre ?? 'Usuario'}
              style={styles.pdfBtnSmall}
              title=""
              iconSize={22}
            />
          </View>
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
                activeOpacity={0.88}
              >
                <Text style={[styles.dayText, selectedDayIndex === index && styles.dayTextSelected]}>
                  {DIAS_SEMANA[index]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="x" color="transparent" size={22} />
                    <Text style={styles.comidaTipo}>
                      <MaterialCommunityIcons name="silverware-fork-knife" size={21} color={COLORS.primaryDark} style={{marginRight: 3}} />
                      <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.044, marginLeft: 4 }}>
                        {' '}{comida.tipo.toUpperCase()}
                      </Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity
                      style={[styles.iconButton, favoritosLocal[nombrePlatillo] && styles.favoriteButtonActive]}
                      onPress={() => toggleComidaFavorita(nombrePlatillo)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={favoritosLocal[nombrePlatillo] ? 'star' : 'star-outline'}
                        size={22}
                        color={favoritosLocal[nombrePlatillo] ? COLORS.primaryDark : '#bdbdbd'}
                        style={favoritosLocal[nombrePlatillo]
                          ? { textShadowColor: '#00c27f66', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }
                          : {}}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButtonEdit}
                      onPress={() => handleEditarPlatillo(index, comida.tipo, nombrePlatillo)}
                      activeOpacity={0.88}
                    >
                      <Feather name="edit-3" size={18} color={COLORS.primaryDark} />
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
                        <Text style={{ color: '#2196F3' }}> P: {macros?.proteinas ?? 0}g</Text>,
                        <Text style={{ color: '#FFA000' }}> C: {macros?.carbohidratos ?? 0}g</Text>,
                        <Text style={{ color: '#E64A19' }}> G: {macros?.grasas ?? 0}g</Text>
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
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, width: '100%', backgroundColor: 'transparent' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, width: '100%', paddingHorizontal: 14, marginTop: 8,
  },
  pdfBtnSmall: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
    elevation: 3, shadowColor: '#00c27f77', shadowOpacity: 0.18, shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 }, marginLeft: 10, alignSelf: 'flex-end',
    flexDirection: 'row', alignItems: 'center', minWidth: 36,
  },
  resumenButton: {
    flexDirection: 'row', backgroundColor: COLORS.primary,
    paddingVertical: 12, paddingHorizontal: SCREEN_WIDTH * 0.14,
    borderRadius: 34, alignItems: 'center', marginBottom: 0, alignSelf: 'center',
    elevation: 5, shadowColor: COLORS.primary, shadowOpacity: 0.14,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  resumenButtonText: {
    color: COLORS.white, fontWeight: '700', fontSize: SCREEN_WIDTH * 0.044, letterSpacing: 0.13,
  },
  daySelector: {
    marginBottom: 15, paddingVertical: 7, backgroundColor: COLORS.soft,
    borderRadius: 23, paddingHorizontal: 5, width: '98%', alignSelf: 'center',
  },
  dayButton: {
    paddingVertical: 9, paddingHorizontal: 16, borderRadius: 19, backgroundColor: COLORS.bg,
    marginHorizontal: 2, borderWidth: 1.3, borderColor: 'transparent', elevation: 1,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark,
    shadowColor: COLORS.primary, shadowOpacity: 0.14, shadowRadius: 10, elevation: 2,
  },
  dayText: {
    fontWeight: '700', fontSize: SCREEN_WIDTH * 0.041, color: COLORS.primaryDark, letterSpacing: 0.04,
  },
  dayTextSelected: { color: COLORS.white },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.053, fontWeight: 'bold', color: COLORS.text,
    marginVertical: 10, marginTop: 16, letterSpacing: 0.07, width: '100%', paddingLeft: 6,
  },
  comidaCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: SCREEN_WIDTH * 0.045,
    marginBottom: 13, width: SCREEN_WIDTH * 0.98, alignSelf: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.10, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2, borderWidth: 1.2, borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  comidaTipo: {
    fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045, color: COLORS.primary, marginBottom: 0,
    letterSpacing: 0.07, alignItems: 'center', flexDirection: 'row'
  },
  comidaPlatillo: {
    fontSize: SCREEN_WIDTH * 0.048, fontWeight: 'bold', marginBottom: 7,
    color: COLORS.text, letterSpacing: 0.10, marginTop: 2
  },
  comidaDetalle: { marginLeft: 8, marginTop: 2 },
  comidaSub: { fontSize: SCREEN_WIDTH * 0.037, marginTop: 2, color: COLORS.text },
  macrosRow: { fontSize: SCREEN_WIDTH * 0.039, marginTop: 5, color: COLORS.text, fontWeight: 'bold' },
  ingrediente: { fontSize: SCREEN_WIDTH * 0.033, marginLeft: 12, color: COLORS.sub },
  fecha: {
    textAlign: 'center', fontSize: SCREEN_WIDTH * 0.033, fontStyle: 'italic',
    color: COLORS.sub, marginTop: 12, marginBottom: 7,
  },
  iconButton: {
    alignItems: 'center', justifyContent: 'center', height: 36, width: 36, borderRadius: 18,
    backgroundColor: '#eafaf2', borderWidth: 1.1, borderColor: '#c8f5e4', marginHorizontal: 2,
    shadowColor: '#00C27F33', shadowOpacity: 0.13, shadowRadius: 6, elevation: 1,
  },
  iconButtonEdit: {
    alignItems: 'center', justifyContent: 'center', height: 36, width: 36, borderRadius: 18,
    backgroundColor: '#e6fbf5', borderWidth: 1.1, borderColor: '#c0efe0', marginLeft: 6,
    shadowColor: '#2ef2a8', shadowOpacity: 0.11, shadowRadius: 6, elevation: 1,
  },
  favoriteButtonActive: {
    backgroundColor: '#c8ffe3', borderColor: COLORS.primaryDark,
    shadowColor: COLORS.primary, shadowOpacity: 0.12, shadowRadius: 7, elevation: 2,
  },
  input: {
    borderWidth: 2, backgroundColor: COLORS.inputBg, borderRadius: 13, padding: 14,
    fontSize: SCREEN_WIDTH * 0.045, color: COLORS.text, marginBottom: 3, width: '100%', fontWeight: '600'
  },
  saveButton: {
    paddingHorizontal: 20, paddingVertical: 9, borderRadius: 11, alignItems: 'center',
    justifyContent: 'center', marginTop: 0,
  },
  saveButtonText: { color: COLORS.white, fontWeight: '700', fontSize: SCREEN_WIDTH * 0.041 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  error: {
    color: COLORS.error, fontSize: SCREEN_WIDTH * 0.039, textAlign: 'center', marginTop: 8, fontWeight: '600',
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 28, fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.056,
    color: COLORS.text, textAlign: 'center', letterSpacing: 0.1,
  },
  loadingSub: {
    marginTop: 10, fontSize: SCREEN_WIDTH * 0.041, color: COLORS.sub,
    fontWeight: '500', textAlign: 'center', letterSpacing: 0.04,
  },
});

export default DietaIAGenerada;
