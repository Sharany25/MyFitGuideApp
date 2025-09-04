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
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useUserPerfil } from '../hooks/usePerfil';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  accent_blue: '#00A3FF',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  white: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.2)',
  danger: '#FF4757',
  glass_tint: 'rgba(0,0,0,0.4)',
};

type PerfilRouteProp = RouteProp<RootStackParamList, 'Perfil'>;

const InfoRow = ({ label, value, isLast }: { label: string; value: string | number, isLast: boolean }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const InfoCard = ({ title, icon, color, data, emptyMessage, animation }: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  data: { label: string; value: any }[];
  emptyMessage: string;
  animation: any;
}) => (
  <Animated.View style={[{ transform: [{ translateY: animation }] }]}>
    <BlurView intensity={50} tint="dark" style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={22} color={color} style={styles.cardIcon} />
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
      </View>
      {data.length > 0 ? (
        data.map((item, index) => (
          <InfoRow
            key={item.label}
            label={item.label}
            value={item.value}
            isLast={index === data.length - 1}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      )}
    </BlurView>
  </Animated.View>
);

const PerfilScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PerfilRouteProp>();
  const userId = route.params?.userId;
  const { perfilCompleto, loading, error } = useUserPerfil(userId);

  const usuario = perfilCompleto?.usuario || null;
  const dieta = perfilCompleto?.dieta || null;
  const rutina = perfilCompleto?.rutina || null;

  const headerAnim = useRef(new Animated.Value(50)).current;
  const card1Anim = useRef(new Animated.Value(50)).current;
  const card2Anim = useRef(new Animated.Value(50)).current;
  const card3Anim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(headerAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(card1Anim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(card2Anim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(card3Anim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ];
    Animated.stagger(100, animations).start();
  }, []);

  const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');

  if (loading) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.centeredScreen}>
        <Ionicons name="cloud-offline-outline" size={48} color={PALETTE.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </LinearGradient>
    );
  }

  const personalData = usuario ? [
    { label: "Correo", value: v(usuario.correoElectronico) },
    { label: "Nacimiento", value: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toLocaleDateString() : 'N/D' },
  ] : [];

  const dietData = dieta ? [
    { label: "Género", value: v(dieta.genero) },
    { label: "Altura (cm)", value: v(dieta.altura) },
    { label: "Peso (kg)", value: v(dieta.peso) },
    { label: "Objetivo", value: v(dieta.objetivo) },
    { label: "Alergias", value: Array.isArray(dieta.alergias) && dieta.alergias.length > 0 ? dieta.alergias.join(', ') : 'Ninguna' },
    { label: "Presupuesto", value: v(dieta.presupuesto) },
  ] : [];

  const routineData = rutina ? [
    { label: "Edad", value: v(rutina.edad) },
    { label: "Objetivo", value: v(rutina.objetivo) },
    { label: "Preferencias", value: Array.isArray(rutina.preferencias) && rutina.preferencias.length > 0 ? rutina.preferencias.join(', ') : 'N/D' },
    { label: "Días/semana", value: v(rutina.dias) },
    { label: "Lesiones", value: v(rutina.lesiones) },
  ] : [];

  // Función para manejar la edición de la foto de perfil
  const handleEditPhoto = () => {
    console.log("¡Editar foto de perfil!");
  };

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={28} color={PALETTE.white} />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}>
          <TouchableOpacity onPress={handleEditPhoto} activeOpacity={0.8} style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {usuario?.foto ? (
                <Image source={{ uri: usuario.foto }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={width * 0.15} color={PALETTE.primary} />
              )}
            </View>
            <TouchableOpacity onPress={handleEditPhoto} style={styles.cameraIconContainer}>
              <Ionicons name="camera-outline" size={width * 0.05} color={PALETTE.white} />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={styles.headerName}>
            {usuario?.nombre || 'Mi Perfil'}
          </Text>
          <Text style={styles.headerSubtitle}>Consulta toda tu información</Text>
        </Animated.View>
        
        <InfoCard
          title="Datos Personales"
          icon="person-outline"
          color={PALETTE.primary}
          data={personalData}
          emptyMessage="Sin datos personales registrados."
          animation={card1Anim}
        />

        <InfoCard
          title="Datos de Dieta"
          icon="nutrition-outline"
          color={PALETTE.primary}
          data={dietData}
          emptyMessage="Sin datos de dieta registrados."
          animation={card2Anim}
        />

        <InfoCard
          title="Datos de Rutina"
          icon="barbell-outline"
          color={PALETTE.accent_blue}
          data={routineData}
          emptyMessage="Sin datos de rutina registrados."
          animation={card3Anim}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 45 : 60,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 70,
    paddingBottom: 40,
  },
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: PALETTE.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 50, 
  },
  avatarWrapper: {
    position: 'relative',
    width: width * 0.28,
    height: width * 0.28,
    marginBottom: 15,
  },
  avatarContainer: {
    width: '100%', 
    height: '100%',
    borderRadius: (width * 0.28) / 2,
    backgroundColor: 'rgba(44, 253, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PALETTE.primary,
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.28) / 2,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    borderRadius: (width * 0.08) / 2,
    padding: 5,
    borderWidth: 1,
    borderColor: PALETTE.primary,
  },
  headerName: {
    fontSize: width * 0.08,
    fontWeight: '700',
    color: PALETTE.text_primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 17,
    color: PALETTE.text_secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  infoLabel: {
    fontSize: 16,
    color: PALETTE.text_secondary,
  },
  infoValue: {
    fontSize: 16,
    color: PALETTE.text_primary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  emptyText: {
    color: PALETTE.text_secondary,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default PerfilScreen;