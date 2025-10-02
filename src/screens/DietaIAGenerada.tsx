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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDieta } from '../hooks/useDieta';
import { useFavoritos } from '../hooks/useFavoritos';
import { API_URL } from '../api/api';
import DownloadDietPdfButton from '../components/DownloadDietPdfButton';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  danger: '#FF4757',
  border: 'rgba(255, 255, 255, 0.2)',
  protein: '#00A3FF',
  carbs: '#FFC107',
  fats: '#E91E63',
  inactive: 'rgba(255, 255, 255, 0.1)',
  pin_red: '#F44336',
};

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const alimentos = ['food-variant', 'food-apple', 'food-drumstick', 'food-fork-drink', 'water'] as const;

// ------------------------------------
// 1. STYLES DEFINITION (MOVED UP)
// ------------------------------------

const styles = StyleSheet.create({
  base: { flex: 1 },
  centeredScreen: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: width * 0.05
  },
  loadingText: {
    color: PALETTE.text_primary,
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center'
  },
  loadingSubText: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.04,
    marginTop: 8,
    textAlign: 'center'
  },
  errorText: {
    color: PALETTE.danger,
    fontSize: width * 0.045,
    textAlign: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  // Nuevo estilo para el botón PDF, asegurando visibilidad y color
  pdfButtonVisible: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.primary, 
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
  daySelectorContainer: {
    backgroundColor: PALETTE.inactive,
    borderRadius: 50,
    padding: 5,
    marginBottom: 25
  },
  daySelectorContent: {
    alignItems: 'center'
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: width * 0.05,
    borderRadius: 50
  },
  dayButtonSelected: {
    backgroundColor: PALETTE.primary
  },
  dayText: {
    color: PALETTE.text_secondary,
    fontWeight: '700',
    fontSize: width * 0.038
  },
  dayTextSelected: { color: '#1D2A32' },
  sectionTitle: {
    color: PALETTE.text_primary,
    fontSize: width * 0.065,
    fontWeight: 'bold',
    marginBottom: 15
  },
  cardBorder: {
    borderRadius: 22,
    marginBottom: 20,
    padding: 1
  },
  card: {
    borderRadius: 20,
    padding: width * 0.05,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  mealType: {
    color: PALETTE.primary,
    fontSize: width * 0.04,
    fontWeight: 'bold',
    letterSpacing: 1.5
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mealName: {
    color: PALETTE.text_primary,
    fontSize: width * 0.055,
    fontWeight: 'bold',
    marginBottom: 15
  },
  editContainer: { marginTop: 10 },
  input: {
    backgroundColor: PALETTE.inactive,
    color: PALETTE.text_primary,
    borderRadius: 10,
    padding: 15,
    fontSize: width * 0.04,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: PALETTE.border
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10
  },
  actionButtonText: {
    color: PALETTE.text_primary,
    fontWeight: 'bold',
    fontSize: width * 0.038
  },
  ingredientTitle: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.038,
    marginBottom: 5,
    fontWeight: '600'
  },
  ingredientItem: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.038,
    marginLeft: 10,
    lineHeight: width * 0.055
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
    paddingTop: 15
  },
  macrosText: {
    color: PALETTE.text_primary,
    fontSize: width * 0.038,
    fontWeight: '600',
    alignItems: 'center'
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  caloriesText: {
    color: PALETTE.primary,
    fontSize: width * 0.045,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15
  },
  footerText: {
    color: PALETTE.text_secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: width * 0.03,
    marginTop: 10
  },
});

// ------------------------------------
// 2. SUB-COMPONENTS (USE DEFINED STYLES)
// ------------------------------------

const LoadingDieta = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [iconIdx, setIconIdx] = useState(0);
  useEffect(() => {
    Animated.loop(Animated.timing(spinValue, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true })).start();
    const interval = setInterval(() => setIconIdx(i => (i + 1) % alimentos.length), 850);
    return () => clearInterval(interval);
  }, []);
  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.centeredScreen}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name={alimentos[iconIdx]} size={width * 0.19} color={PALETTE.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>Generando tu plan...</Text>
      <Text style={styles.loadingSubText}>Por favor espera unos segundos.</Text>
    </View>
  );
};

const HeaderActions = ({ onSummaryPress, onPdfPress, data, nombreUsuario }: any) => (
  <View style={styles.headerRow}>
    <TouchableOpacity style={styles.headerButton} onPress={onSummaryPress}>
      <Ionicons name="stats-chart-outline" size={width * 0.05} color={PALETTE.text_primary} />
      <Text style={styles.headerButtonText}>Resumen</Text>
    </TouchableOpacity>
    
    <DownloadDietPdfButton 
      data={data} 
      nombreUsuario={nombreUsuario} 
      style={styles.pdfButtonVisible} 
    />
  </View>
);

const DaySelector = ({ semana, selectedDayIndex, onSelectDay }: any) => (
  <View style={styles.daySelectorContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorContent}>
      {semana.map((_day: any, index: number) => (
        <TouchableOpacity key={index} style={[styles.dayButton, selectedDayIndex === index && styles.dayButtonSelected]} onPress={() => onSelectDay(index)}>
          <Text style={[styles.dayText, selectedDayIndex === index && styles.dayTextSelected]}>{DIAS_SEMANA[index]}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const MealCard = ({ comida, index, editState, favoritoState, handlers, animation }: any) => {
  const { editIndex, nuevoPlatillo, platilloLoading, platilloError } = editState;
  const { favoritosLocal } = favoritoState;
  const { onToggleFavorito, onEdit, onSave, onCancel, onSetNuevoPlatillo } = handlers;

  const nombrePlatillo = typeof comida.platillo === 'string' ? comida.platillo : (comida.platillo?.platillo ?? '');
  const ingredientes = typeof comida.platillo === 'string' ? comida.ingredientes : comida.platillo?.ingredientes;
  const macros = typeof comida.platillo === 'string' ? comida.macros : comida.platillo?.macros;
  const calorias = typeof comida.platillo === 'string' ? comida.calorias : comida.platillo?.calorias;

  return (
    <Animated.View style={{ opacity: animation, transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }}>
      <LinearGradient colors={['rgba(44, 253, 137, 0.15)', 'rgba(0, 163, 255, 0.05)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
        <BlurView intensity={70} tint="dark" style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.mealType}>{comida.tipo.toUpperCase()}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => onToggleFavorito(nombrePlatillo)}>
                <MaterialCommunityIcons name={favoritosLocal[nombrePlatillo] ? 'pin' : 'pin-outline'} size={width * 0.06} color={favoritosLocal[nombrePlatillo] ? PALETTE.pin_red : PALETTE.text_secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => onEdit(index, comida.tipo)}>
                <Feather name="edit-3" size={width * 0.05} color={PALETTE.text_secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {editIndex === index ? (
            <View style={styles.editContainer}>
              <TextInput
                placeholder="Nuevo platillo..."
                placeholderTextColor={PALETTE.text_secondary}
                style={styles.input}
                value={nuevoPlatillo}
                onChangeText={onSetNuevoPlatillo}
                editable={!platilloLoading}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={onSave}
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: PALETTE.primary }]} onPress={onSave} disabled={platilloLoading}>
                  <Text style={[styles.actionButtonText, { color: '#1D2A32' }]}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: PALETTE.inactive }]} onPress={onCancel} disabled={platilloLoading}>
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
              {platilloError && <Text style={styles.errorText}>{platilloError}</Text>}
            </View>
          ) : (
            <>
              <Text style={styles.mealName}>{nombrePlatillo}</Text>
              <Text style={styles.ingredientTitle}>Ingredientes:</Text>
              {Array.isArray(ingredientes) && ingredientes.map((ing: any, i: number) => (
                <Text key={i} style={styles.ingredientItem}>- {ing.nombre}: {ing.cantidad}</Text>
              ))}
              <View style={styles.macrosContainer}>
                <Text style={styles.macrosText}><View style={[styles.macroDot, { backgroundColor: PALETTE.protein }]} /> P: {macros?.proteinas ?? 0}g</Text>
                <Text style={styles.macrosText}><View style={[styles.macroDot, { backgroundColor: PALETTE.carbs }]} /> C: {macros?.carbohidratos ?? 0}g</Text>
                <Text style={styles.macrosText}><View style={[styles.macroDot, { backgroundColor: PALETTE.fats }]} /> G: {macros?.grasas ?? 0}g</Text>
              </View>
              <Text style={styles.caloriesText}>{calorias ?? 0} kcal</Text>
            </>
          )}
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
};

// ------------------------------------
// 3. MAIN COMPONENT
// ------------------------------------

const DietaIAGenerada: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { userId, nombre: nombreFromRoute } = route.params as { userId: string; nombre: string };
  const { obtenerDietaPorUsuario, loading, error } = useDieta();
  const { ComidasFavoritas } = useFavoritos();
  const { state: userContextState } = useUser();

  const [data, setData] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [favoritosLocal, setFavoritosLocal] = useState<{ [key: string]: boolean }>({});
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [nuevoPlatillo, setNuevoPlatillo] = useState('');
  const [editTipoComida, setEditTipoComida] = useState('');
  const [platilloLoading, setPlatilloLoading] = useState(false);
  const [platilloError, setPlatilloError] = useState<string | null>(null);
  const cardAnimations = useRef<Animated.Value[]>([]).current;

  const FAVORITOS_KEY = `favoritosComidas_${userId}`;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const result = await obtenerDietaPorUsuario(userId);
      if (result) {
        setData(result);
        if (result.resultado?.semana?.[0]?.comidas) {
          cardAnimations.splice(0, cardAnimations.length);
          result.resultado.semana[0].comidas.forEach(() => cardAnimations.push(new Animated.Value(0)));
          animateCards();
        }
      }

      let favsLocal: string[] = [];
      try {
        const favs = await AsyncStorage.getItem(FAVORITOS_KEY);
        if (favs) favsLocal = JSON.parse(favs);
      } catch {}
      
      const favMap: { [key: string]: boolean } = {};
      favsLocal.forEach((item: string) => (favMap[item] = true));
      setFavoritosLocal(favMap);
    })();
  }, [userId]);

  const animateCards = () => {
    const animations = cardAnimations.map(anim => Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }));
    Animated.stagger(100, animations).start();
  };

  useEffect(() => {
    if (data?.resultado?.semana?.[selectedDayIndex]?.comidas) {
      cardAnimations.splice(0, cardAnimations.length);
      data.resultado.semana[selectedDayIndex].comidas.forEach(() => cardAnimations.push(new Animated.Value(0)));
      animateCards();
    }
  }, [selectedDayIndex, data]);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(Object.keys(favoritosLocal).filter(k => favoritosLocal[k])));
  }, [favoritosLocal]);

  const toggleComidaFavorita = async (platillo: string) => {
    const marcado = !favoritosLocal[platillo];
    setFavoritosLocal(prev => ({ ...prev, [platillo]: marcado }));
    await ComidasFavoritas(userId, platillo, marcado);
  };

  const handleEditarPlatillo = (index: number, tipo: string) => {
    setEditIndex(index);
    setEditTipoComida(tipo);
    setNuevoPlatillo('');
    setPlatilloError(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setNuevoPlatillo('');
    setPlatilloError(null);
    Keyboard.dismiss();
  };

  const handleGuardarPlatillo = async () => {
    if (!nuevoPlatillo.trim()) {
      setPlatilloError('Ingresa un nuevo platillo');
      return;
    }
    setPlatilloLoading(true);
    setPlatilloError(null);
    const payload = { dia: data.resultado.semana[selectedDayIndex].dia, tipoComida: editTipoComida, platillo: nuevoPlatillo.trim() };
    try {
      const res = await fetch(`${API_URL}dieta-ia/${userId}/platillo`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) setPlatilloError(result.message || 'No se pudo modificar');
      else {
        handleCancelEdit();
        const updated = await obtenerDietaPorUsuario(userId);
        if (updated) setData(updated);
      }
    } catch {
      setPlatilloError('Error de conexión');
    } finally {
      setPlatilloLoading(false);
    }
  };

  if (loading || platilloLoading) {
    return <LinearGradient colors={PALETTE.background_gradient} style={styles.base}><LoadingDieta /></LinearGradient>;
  }
  if (error || !data?.resultado) {
    return <LinearGradient colors={PALETTE.background_gradient} style={styles.base}><View style={styles.centeredScreen}><Text style={styles.errorText}>Error: {error || 'Dieta no encontrada'}</Text></View></LinearGradient>;
  }

  const { semana } = data.resultado;
  const diaActual = semana[selectedDayIndex];
  
  const nombreUsuarioParaPdf = userContextState.user?.nombre || nombreFromRoute || 'Usuario';
  
  return (
    <LinearGradient colors={PALETTE.background_gradient} style={styles.base}>
      <KeyboardAvoidingView style={styles.base} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.base}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeaderActions onSummaryPress={() => navigation.navigate('ResumenSemanalDieta', { userId })} data={data} nombreUsuario={nombreUsuarioParaPdf} />
          <DaySelector semana={semana} selectedDayIndex={selectedDayIndex} onSelectDay={setSelectedDayIndex} />
          <Text style={styles.sectionTitle}>Comidas del día</Text>

          {diaActual.comidas.map((comida: any, index: number) => (
            <MealCard
              key={`${selectedDayIndex}-${index}`}
              comida={comida}
              index={index}
              animation={cardAnimations[index] || new Animated.Value(1)}
              editState={{ editIndex, nuevoPlatillo, platilloLoading, platilloError }}
              favoritoState={{ favoritosLocal }}
              handlers={{
                onToggleFavorito: toggleComidaFavorita,
                onEdit: handleEditarPlatillo,
                onSave: handleGuardarPlatillo,
                onCancel: handleCancelEdit,
                onSetNuevoPlatillo: setNuevoPlatillo,
              }}
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default DietaIAGenerada;
