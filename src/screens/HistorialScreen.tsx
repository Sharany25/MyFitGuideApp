import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useUserPerfil } from '../hooks/usePerfil';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  danger: '#FF4757',
  dark: '#1D2A32',
};

type NavigationProp = any;
type HistorialRouteProp = RouteProp<RootStackParamList, 'Historial'>;

type DietaType = {
  genero?: string;
  altura?: number;
  peso?: number;
  objetivo?: string;
  alergias?: string[];
  presupuesto?: number;
  createdAt?: string;
};
type RutinaType = {
  edad?: number;
  objetivo?: string;
  preferencias?: string[];
  dias?: number;
  lesiones?: string;
  createdAt?: string;
};

const HistorialScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HistorialRouteProp>();
  const userId = route.params?.userId;

  const { perfilCompleto, loading, error } = useUserPerfil(userId);

  const [tab, setTab] = useState<'dietas' | 'rutinas'>('dietas');

  const dietas: DietaType[] = perfilCompleto.dieta ? (Array.isArray(perfilCompleto.dieta) ? perfilCompleto.dieta : [perfilCompleto.dieta]) : [];
  const rutinas: RutinaType[] = perfilCompleto.rutina ? (Array.isArray(perfilCompleto.rutina) ? perfilCompleto.rutina : [perfilCompleto.rutina]) : [];

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={28} color={PALETTE.text_primary} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Ionicons name="time-outline" size={32} color={PALETTE.primary} />
                <Text style={styles.title}>Historial</Text>
            </View>
            <View style={{width: 44}} /> 
        </View>

        <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabBtn, tab === 'dietas' && styles.tabBtnActive]} onPress={() => setTab('dietas')}>
                <Text style={[styles.tabText, tab === 'dietas' && styles.tabTextActive]}>Dietas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, tab === 'rutinas' && styles.tabBtnActive]} onPress={() => setTab('rutinas')}>
                <Text style={[styles.tabText, tab === 'rutinas' && styles.tabTextActive]}>Rutinas</Text>
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 50 }}>
          {loading ? (
            <ActivityIndicator color={PALETTE.primary} size="large" style={{marginTop: 50}} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {tab === 'dietas' && (
                dietas.length === 0 ? (
                  <Text style={styles.emptyText}>Sin registros de dietas.</Text>
                ) : (
                  <AnimatedList items={dietas} type="dieta" />
                )
              )}
              {tab === 'rutinas' && (
                rutinas.length === 0 ? (
                  <Text style={styles.emptyText}>Sin registros de rutinas.</Text>
                ) : (
                  <AnimatedList items={rutinas} type="rutina" />
                )
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const AnimatedList = ({ items, type }: { items: any[], type: 'dieta' | 'rutina' }) => {
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
        <>
            {items.map((item, idx) => {
                const animStyle = {
                    opacity: animations[idx],
                    transform: [{
                        translateY: animations[idx].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                        })
                    }]
                };
                return (
                    <Animated.View key={idx} style={animStyle}>
                        <HistorialCard item={item} index={idx} type={type} total={items.length} />
                    </Animated.View>
                );
            })}
        </>
    );
};

const HistorialCard = ({ item, index, type, total }: { item: any, index: number, type: 'dieta' | 'rutina', total: number }) => {
    const isDieta = type === 'dieta';
    const title = isDieta ? `Dieta ${total > 1 ? total - index : ''}` : `Rutina ${total > 1 ? total - index : ''}`;
    
    const dietaItems = [
        { label: "Género", value: item.genero || 'N/D', icon: "male-female-outline" as const },
        { label: "Altura", value: item.altura ? `${item.altura} cm` : 'N/D', icon: "swap-vertical-outline" as const },
        { label: "Peso", value: item.peso ? `${item.peso} kg` : 'N/D', icon: "fitness-outline" as const },
        { label: "Objetivo", value: item.objetivo || 'N/D', icon: "star-outline" as const },
        { label: "Alergias", value: Array.isArray(item.alergias) && item.alergias.length > 0 ? item.alergias.join(', ') : 'Ninguna', icon: "alert-circle-outline" as const },
        { label: "Presupuesto", value: item.presupuesto ? `$${item.presupuesto}` : 'N/D', icon: "cash-outline" as const },
    ];

    const rutinaItems = [
        { label: "Edad", value: item.edad ? item.edad.toString() : 'N/D', icon: "calendar-outline" as const },
        { label: "Objetivo", value: item.objetivo || 'N/D', icon: "flag-outline" as const },
        { label: "Preferencias", value: Array.isArray(item.preferencias) && item.preferencias.length > 0 ? item.preferencias.join(', ') : 'N/D', icon: "list-outline" as const },
        { label: "Días", value: item.dias ? item.dias.toString() : 'N/D', icon: "calendar-number-outline" as const },
        { label: "Lesiones", value: item.lesiones || 'N/D', icon: "medkit-outline" as const },
    ];

    const itemsToRender = isDieta ? dietaItems : rutinaItems;

    return (
        <LinearGradient colors={['rgba(44, 253, 137, 0.15)', 'rgba(0, 163, 255, 0.05)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
            <BlurView intensity={50} tint="dark" style={styles.card}>
                <Text style={styles.cardTitle}>{title}</Text>
                {item.createdAt && (
                    <Text style={styles.cardDate}>Registrado el: {new Date(item.createdAt).toLocaleDateString()}</Text>
                )}
                <View style={styles.divider} />
                {itemsToRender.map((detail, idx) => (
                    <HistorialItem key={idx} label={detail.label} value={detail.value} icon={detail.icon} />
                ))}
            </BlurView>
        </LinearGradient>
    );
};

const HistorialItem: React.FC<{ label: string; value: string; icon: keyof typeof Ionicons.glyphMap }> = ({ label, value, icon }) => (
  <View style={styles.historialItemRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={icon} size={20} color={PALETTE.text_secondary} />
      <Text style={styles.historialItemLabel}>{label}</Text>
    </View>
    <Text style={styles.historialItemValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: PALETTE.inactive,
    borderRadius: 50,
    padding: 5,
    marginVertical: 15,
    marginHorizontal: width * 0.05,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: PALETTE.primary,
  },
  tabText: {
    color: PALETTE.text_secondary,
    fontWeight: "bold",
    fontSize: 15,
  },
  tabTextActive: {
    color: PALETTE.dark,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  errorText: {
    color: PALETTE.danger,
    fontSize: 17,
    textAlign: 'center',
    marginTop: 35,
  },
  emptyText: {
    color: PALETTE.text_secondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    fontStyle: 'italic',
  },
  cardBorder: {
    borderRadius: 22,
    marginBottom: 20,
    padding: 1,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: PALETTE.text_primary,
  },
  cardDate: {
    fontSize: width * 0.035,
    color: PALETTE.text_secondary,
    marginBottom: 15,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginBottom: 10,
  },
  historialItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historialItemLabel: {
    color: PALETTE.text_secondary,
    fontSize: 16,
  },
  historialItemValue: {
    color: PALETTE.text_primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
});

export default HistorialScreen;
