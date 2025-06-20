import React, { useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  View,
  Animated,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useUserPerfil } from '../hooks/usePerfil';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const BG_COLOR = '#F3F8F6';
const TEXT_COLOR = '#232946';
const LABEL_COLOR = '#7a8797';

type PerfilRouteProp = RouteProp<RootStackParamList, 'Perfil'>;

const PerfilScreen: React.FC = () => {
  const route = useRoute<PerfilRouteProp>();
  const userId = route.params?.userId;
  const { perfilCompleto, loading, error } = useUserPerfil(userId);

  const usuario = perfilCompleto?.usuario || null;
  const dieta = perfilCompleto?.dieta || null;
  const rutina = perfilCompleto?.rutina || null;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  }, []);

  const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');

  if (loading) {
    return (
      <View style={[styles.loadingBox]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingBox]}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View style={[styles.headerBox, { opacity: fadeAnim }]}>
        <View style={styles.iconShadow}>
          <Ionicons
            name="person-circle"
            size={width * 0.19}
            color={PRIMARY_COLOR}
          />
        </View>
        <Text style={styles.header}>
          {usuario?.nombre ? usuario.nombre : 'Mi Perfil'}
        </Text>
        <Text style={styles.subHeader}>Consulta toda tu información</Text>
      </Animated.View>

      {/* CARD DATOS PERSONALES */}
      <BlurView intensity={26} tint="light" style={styles.cardBlur}>
        <View style={styles.cardContent}>
          <SectionHeader icon="person" color="#27b77e" title="Datos Personales" />
          {usuario && Object.keys(usuario).length > 0 ? (
            <>
              <PerfilLabel label="Nombre" value={v(usuario?.nombre)} />
              <PerfilLabel label="Correo" value={v(usuario?.correoElectronico)} />
              <PerfilLabel
                label="Fecha Nacimiento"
                value={
                  usuario?.fechaNacimiento
                    ? new Date(usuario.fechaNacimiento).toLocaleDateString()
                    : 'N/D'
                }
              />
              <PerfilLabel label="Ubicación" value={v(usuario?.ubicacion)} />
            </>
          ) : (
            <Text style={styles.emptyText}>Sin datos personales registrados.</Text>
          )}
        </View>
      </BlurView>

      <View style={styles.cardSeparator} />

      {/* CARD DIETA */}
      <BlurView intensity={20} tint="light" style={styles.cardBlur}>
        <View style={styles.cardContent}>
          <SectionHeader icon="fast-food" color="#33d17a" title="Datos de Dieta" />
          {dieta && Object.keys(dieta).length > 0 ? (
            <>
              <PerfilLabel label="Género" value={v(dieta?.genero)} />
              <PerfilLabel label="Altura (cm)" value={v(dieta?.altura)} />
              <PerfilLabel label="Peso (kg)" value={v(dieta?.peso)} />
              <PerfilLabel label="Objetivo" value={v(dieta?.objetivo)} />
              <PerfilLabel
                label="Alergias"
                value={
                  Array.isArray(dieta?.alergias) && dieta?.alergias.length > 0
                    ? dieta.alergias.join(', ')
                    : 'N/D'
                }
              />
              <PerfilLabel label="Presupuesto" value={v(dieta?.presupuesto)} />
            </>
          ) : (
            <Text style={styles.emptyText}>Sin datos de dieta registrados.</Text>
          )}
        </View>
      </BlurView>

      <View style={styles.cardSeparator} />

      {/* CARD RUTINA */}
      <BlurView intensity={15} tint="light" style={styles.cardBlur}>
        <View style={styles.cardContent}>
          <SectionHeader icon="barbell" color="#4780f5" title="Datos de Rutina" />
          {rutina && Object.keys(rutina).length > 0 ? (
            <>
              <PerfilLabel label="Edad" value={v(rutina?.edad)} />
              <PerfilLabel label="Objetivo" value={v(rutina?.objetivo)} />
              <PerfilLabel
                label="Preferencias"
                value={
                  Array.isArray(rutina?.preferencias) && rutina?.preferencias.length > 0
                    ? rutina.preferencias.join(', ')
                    : 'N/D'
                }
              />
              <PerfilLabel label="Días de Entrenamiento" value={v(rutina?.dias)} />
              <PerfilLabel label="Lesiones" value={v(rutina?.lesiones)} />
            </>
          ) : (
            <Text style={styles.emptyText}>Sin datos de rutina registrados.</Text>
          )}
        </View>
      </BlurView>
      <View style={{ height: 28 }} />
    </ScrollView>
  );
};

const SectionHeader = ({
  icon,
  title,
  color,
}: {
  icon: any;
  title: string;
  color?: string;
}) => (
  <View
    style={[
      styles.sectionHeader,
      { borderBottomColor: color || PRIMARY_COLOR, borderBottomWidth: 1.3 },
    ]}
  >
    <Ionicons name={icon} size={21} color={color || PRIMARY_COLOR} style={styles.sectionIcon} />
    <Text style={[styles.sectionTitle, { color: color || PRIMARY_COLOR }]}>{title}</Text>
  </View>
);

const PerfilLabel = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.labelRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    padding: 18,
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 44,
    backgroundColor: BG_COLOR,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconShadow: {
    borderRadius: 999,
    backgroundColor: '#e1faef',
    padding: 7,
    elevation: 10,
    marginBottom: 2,
  },
  header: {
    fontSize: width * 0.077,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 1,
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 16,
    color: LABEL_COLOR,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 7,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  cardBlur: {
    marginBottom: 15,
    borderRadius: 17,
  },
  cardContent: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  cardSeparator: {
    height: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 10,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: LABEL_COLOR,
    flex: 2,
  },
  emptyText: {
    color: LABEL_COLOR,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PerfilScreen;
