import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useUserPerfil } from '../hooks/usePerfil';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const BG_COLOR = '#F8FEF7';

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

  const dietas: DietaType[] = perfilCompleto.dieta
    ? Array.isArray(perfilCompleto.dieta)
      ? perfilCompleto.dieta
      : [perfilCompleto.dieta]
    : [];
  const rutinas: RutinaType[] = perfilCompleto.rutina
    ? Array.isArray(perfilCompleto.rutina)
      ? perfilCompleto.rutina
      : [perfilCompleto.rutina]
    : [];

  return (
    <View style={styles.bg}>
      {/* Barra superior con botón atrás */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={27} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Ionicons name="time-outline" size={22} color={PRIMARY_COLOR} /> Historial
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            tab === 'dietas' && styles.tabBtnActive,
          ]}
          onPress={() => setTab('dietas')}
        >
          <Ionicons name="nutrition-outline" size={18} color={tab === 'dietas' ? '#fff' : PRIMARY_COLOR} />
          <Text style={[styles.tabText, tab === 'dietas' && styles.tabTextActive]}>Dietas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            tab === 'rutinas' && styles.tabBtnActive,
          ]}
          onPress={() => setTab('rutinas')}
        >
          <Ionicons name="barbell-outline" size={18} color={tab === 'rutinas' ? '#fff' : PRIMARY_COLOR} />
          <Text style={[styles.tabText, tab === 'rutinas' && styles.tabTextActive]}>Rutinas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 50 }}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* Historial de Dietas */}
            {tab === 'dietas' ? (
              dietas.length === 0 ? (
                <Text style={styles.emptyText}>Sin registros de dietas.</Text>
              ) : (
                dietas.map((dieta, idx) => (
                  <View style={styles.card} key={idx}>
                    <Text style={styles.cardTitle}>
                      <Ionicons name="nutrition-outline" size={18} color={PRIMARY_COLOR} /> Dieta {dietas.length > 1 ? idx + 1 : ''}
                    </Text>
                    <HistorialItem label="Género" value={dieta.genero || 'N/D'} icon="male-female-outline" />
                    <HistorialItem label="Altura (cm)" value={dieta.altura ? dieta.altura.toString() : 'N/D'} icon="swap-vertical-outline" />
                    <HistorialItem label="Peso (kg)" value={dieta.peso ? dieta.peso.toString() : 'N/D'} icon="fitness-outline" />
                    <HistorialItem label="Objetivo" value={dieta.objetivo || 'N/D'} icon="star-outline" />
                    <HistorialItem
                      label="Alergias"
                      value={Array.isArray(dieta.alergias) && dieta.alergias.length > 0
                        ? dieta.alergias.join(', ')
                        : 'N/D'}
                      icon="alert-circle-outline"
                    />
                    <HistorialItem label="Presupuesto" value={dieta.presupuesto ? dieta.presupuesto.toString() : 'N/D'} icon="cash-outline" />
                    {dieta.createdAt && (
                      <HistorialItem
                        label="Fecha de registro"
                        value={new Date(dieta.createdAt).toLocaleDateString()}
                        icon="calendar-outline"
                      />
                    )}
                  </View>
                ))
              )
            ) : null}

            {/* Historial de Rutinas */}
            {tab === 'rutinas' ? (
              rutinas.length === 0 ? (
                <Text style={styles.emptyText}>Sin registros de rutinas.</Text>
              ) : (
                rutinas.map((rutina, idx) => (
                  <View style={styles.card} key={idx}>
                    <Text style={styles.cardTitle}>
                      <Ionicons name="barbell-outline" size={18} color={PRIMARY_COLOR} /> Rutina {rutinas.length > 1 ? idx + 1 : ''}
                    </Text>
                    <HistorialItem label="Edad" value={rutina.edad ? rutina.edad.toString() : 'N/D'} icon="calendar-outline" />
                    <HistorialItem label="Objetivo" value={rutina.objetivo || 'N/D'} icon="flag-outline" />
                    <HistorialItem
                      label="Preferencias"
                      value={Array.isArray(rutina.preferencias) && rutina.preferencias.length > 0
                        ? rutina.preferencias.join(', ')
                        : 'N/D'}
                      icon="list-outline"
                    />
                    <HistorialItem label="Días" value={rutina.dias ? rutina.dias.toString() : 'N/D'} icon="calendar-outline" />
                    <HistorialItem label="Lesiones" value={rutina.lesiones || 'N/D'} icon="medkit-outline" />
                    {rutina.createdAt && (
                      <HistorialItem
                        label="Fecha de registro"
                        value={new Date(rutina.createdAt).toLocaleDateString()}
                        icon="calendar-outline"
                      />
                    )}
                  </View>
                ))
              )
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};

type HistorialItemProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};
const HistorialItem: React.FC<HistorialItemProps> = ({ label, value, icon }) => (
  <View style={styles.historialItemRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={18} color={PRIMARY_COLOR} style={{ marginRight: 7 }} />
      <Text style={styles.historialItemLabel}>{label}</Text>
    </View>
    <Text style={styles.historialItemValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: BG_COLOR,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 16) + 8
        : 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    paddingTop: 5,
    gap: 8,
  },
  backBtn: {
    padding: 4,
    marginRight: 3,
    borderRadius: 30,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 22,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 13,
    marginBottom: 16,
    marginTop: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: '#e6f7f0',
    borderRadius: 15,
    marginHorizontal: 3,
    borderWidth: 1.3,
    borderColor: PRIMARY_COLOR,
    gap: 7,
  },
  tabBtnActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  tabText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 14,
  },
  loadingText: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    color: 'red',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 35,
  },
  emptyText: {
    color: '#9fa4ab',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 25,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 19,
    padding: 17,
    elevation: 4,
    shadowColor: '#7fe5be',
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    borderColor: PRIMARY_COLOR + '22',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 7,
    letterSpacing: 0.09,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historialItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 4,
    borderBottomColor: '#F4F4F4',
    borderBottomWidth: 1,
  },
  historialItemLabel: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
  historialItemValue: {
    color: '#2e8062',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    maxWidth: '60%',
  },
});

export default HistorialScreen;
