import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutModal from "../components/LogoutModal";
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get("window");

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  danger: '#FF4757',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  pin_red: '#F44336',
  bmi_normal: '#2CFD89',
  bmi_overweight: '#FFC107',
  bmi_obese: '#F44336',
  bmi_underweight: '#00A3FF',
};

type NavigationProp = any;

const calculateBMI = (weight: string | null | undefined, height: string | null | undefined): { bmi: number, category: string, color: string } => {
    const w = parseFloat(weight || '0');
    const h = parseFloat(height || '0');

    if (w > 0 && h > 0) {
        const heightInMeters = h / 100;
        const bmi = w / (heightInMeters * heightInMeters);
        let category = "N/D";
        let color = PALETTE.text_secondary;

        if (bmi < 18.5) {
            category = "Bajo Peso";
            color = PALETTE.bmi_underweight;
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            category = "Peso Normal";
            color = PALETTE.bmi_normal;
        } else if (bmi >= 25 && bmi <= 29.9) {
            category = "Sobrepeso";
            color = PALETTE.bmi_overweight;
        } else {
            category = "Obesidad";
            color = PALETTE.bmi_obese;
        }
        return { bmi: parseFloat(bmi.toFixed(1)), category, color };
    }
    return { bmi: 0, category: "N/D", color: PALETTE.text_secondary };
};


const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useUser();
  const user = state.user;
  const [modalVisible, setModalVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
    }).start();
  }, []);

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('userProfile');
    dispatch({ type: 'CLEAR_USER' });
    navigation.replace('Login');
  };

  const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');
  const bmiData = calculateBMI(user?.peso, user?.altura);

  if (state.loading) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.centered}>
        <ActivityIndicator color={PALETTE.primary} size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{flex: 1}}>
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{opacity: fadeAnim}}>
                    <Header user={user} onLogoutPress={() => setModalVisible(true)} />
                    
                    <Dashboard user={user} bmiData={bmiData} />

                    <View style={styles.actionsRow}>
                        <ActionButton 
                            icon={<MaterialCommunityIcons name="pin-outline" size={22} color={PALETTE.pin_red} />} 
                            label="Favoritos" 
                            onPress={() => navigation.navigate('Favoritos', { userId: user?.userId })} 
                        />
                        <ActionButton 
                            icon={<Ionicons name="time-outline" size={22} color={PALETTE.primary} />} 
                            label="Historial" 
                            onPress={() => navigation.navigate('Historial', { userId: user?.userId })} 
                        />
                    </View>

                    <View style={styles.infoCardsRow}>
                        <InfoCard
                            icon={<MaterialCommunityIcons name="food-apple-outline" size={width * 0.08} color={PALETTE.primary} />}
                            title="Dietas Inteligentes"
                            desc="Planes de comidas personalizados y generados por IA."
                        />
                        <InfoCard
                            icon={<Ionicons name="barbell-outline" size={width * 0.08} color={PALETTE.primary} />}
                            title="Rutinas a tu Medida"
                            desc="Entrenamientos adaptados a tus objetivos y preferencias."
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.suggestionButton}
                        onPress={() => navigation.navigate('QuejaSugerencia', { userId: user?.userId })}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color={PALETTE.text_secondary} />
                        <Text style={styles.suggestionButtonText}>¿Tienes una queja o sugerencia?</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <LogoutModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={cerrarSesion}
            />
        </SafeAreaView>
    </LinearGradient>
  );
};

const Header = ({ user, onLogoutPress }: { user: any, onLogoutPress: () => void }) => {
    const navigation = useNavigation<NavigationProp>();
    return(
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Perfil', { userId: user?.userId })}>
                <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.avatar}>
                    <Ionicons name="person-outline" size={width * 0.1} color="#1D2A32" />
                </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
                <Text style={styles.greetingText}>¡Hola, {user?.nombre || 'Usuario'}!</Text>
                <Text style={styles.sloganText}>Tu bienestar es nuestra meta.</Text>
            </View>
            <TouchableOpacity onPress={onLogoutPress} style={styles.logoutButton}>
                <Ionicons name="exit-outline" size={28} color={PALETTE.danger} />
            </TouchableOpacity>
        </View>
    )
}

const Dashboard = ({ user, bmiData }: { user: any, bmiData: any }) => {
    const v = (valor: any) => (valor !== undefined && valor !== null && valor !== '' ? valor : 'N/D');
    return (
        <BlurView intensity={50} tint="dark" style={styles.dashboardContainer}>
            <Text style={styles.dashboardTitle}>Tu Progreso</Text>
            
            <View style={styles.bmiSection}>
                <View style={[styles.bmiRing, { borderColor: bmiData.color }]}>
                    <Text style={styles.bmiValue}>{bmiData.bmi > 0 ? bmiData.bmi : "--"}</Text>
                </View>
                <View style={styles.bmiInfo}>
                    <Text style={styles.bmiLabel}>Índice de Masa Corporal (IMC)</Text>
                    <Text style={[styles.bmiCategoryText, { color: bmiData.color }]}>{bmiData.category}</Text>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <StatItem label="Edad" value={v(user?.edad)} />
                <StatItem label="Altura" value={user?.altura ? `${user.altura} cm` : 'N/D'} />
                <StatItem label="Peso" value={user?.peso ? `${user.peso} kg` : 'N/D'} />
                <StatItem label="Objetivo" value={v(user?.objetivo)} />
            </View>
        </BlurView>
    );
};

const InfoCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <View style={styles.infoCardWrapper}>
        <BlurView intensity={50} tint="dark" style={styles.infoCard}>
            {icon}
            <View style={styles.infoCardTextContainer}>
                <Text style={styles.infoCardTitle}>{title}</Text>
                <Text style={styles.infoCardDesc}>{desc}</Text>
            </View>
        </BlurView>
    </View>
);

const ActionButton = ({ icon, label, onPress }: { icon: React.ReactNode, label: string, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionButtonWrapper}>
        <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']} style={styles.actionButtonBorder}>
            <BlurView intensity={50} tint="dark" style={styles.actionButton}>
                {icon}
                <Text style={[styles.actionButtonText, { color: label === 'Favoritos' ? PALETTE.pin_red : PALETTE.primary }]}>{label}</Text>
            </BlurView>
        </LinearGradient>
    </TouchableOpacity>
);

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { 
      flex: 1, 
      paddingHorizontal: width * 0.05,
  },
  centered: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 25,
      marginTop: 10,
  },
  avatar: {
      width: width * 0.15,
      height: width * 0.15,
      borderRadius: (width * 0.15) / 2,
      justifyContent: 'center',
      alignItems: 'center',
  },
  headerTextContainer: {
      flex: 1,
      marginLeft: 15,
  },
  greetingText: {
      color: PALETTE.text_primary,
      fontSize: width * 0.065,
      fontWeight: 'bold',
  },
  sloganText: {
      color: PALETTE.text_secondary,
      fontSize: width * 0.04,
      marginTop: 2,
  },
  logoutButton: {
      padding: 8,
      backgroundColor: PALETTE.inactive,
      borderRadius: 50,
  },
  dashboardContainer: {
      borderRadius: 25,
      padding: 20,
      borderWidth: 1,
      borderColor: PALETTE.border,
      overflow: 'hidden',
      marginVertical: 10,
  },
  dashboardTitle: {
      color: PALETTE.text_primary,
      fontSize: width * 0.05,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
  },
  bmiSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 20,
  },
  bmiRing: {
      width: width * 0.28,
      height: width * 0.28,
      borderRadius: (width * 0.28) / 2,
      borderWidth: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  bmiValue: {
      color: PALETTE.text_primary,
      fontSize: width * 0.08,
      fontWeight: 'bold',
  },
  bmiInfo: {
      flex: 1,
  },
  bmiLabel: {
      color: PALETTE.text_secondary,
      fontSize: width * 0.04,
  },
  bmiCategoryText: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      marginTop: 5,
  },
  statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: PALETTE.border,
      marginTop: 20,
      paddingTop: 20,
  },
  statItem: {
      width: '48%',
      alignItems: 'center',
      marginBottom: 20,
  },
  statLabel: {
      color: PALETTE.text_secondary,
      fontSize: width * 0.038,
  },
  statValue: {
      color: PALETTE.text_primary,
      fontSize: width * 0.05,
      fontWeight: 'bold',
      marginTop: 5,
  },
  actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 15,
      marginVertical: 25,
  },
  actionButtonWrapper: {
      flex: 1,
  },
  actionButtonBorder: {
      borderRadius: 50,
      padding: 1,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 50,
      paddingVertical: 15,
      overflow: 'hidden',
  },
  actionButtonText: {
      fontWeight: 'bold',
      marginLeft: 10,
      fontSize: width * 0.038,
  },
  infoCardsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 15,
      marginVertical: 10,
  },
  infoCardWrapper: {
      flex: 1,
  },
  infoCard: {
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: PALETTE.border,
      overflow: 'hidden',
      height: height * 0.22,
      justifyContent: 'center',
  },
  infoCardTextContainer: {
      alignItems: 'center',
      marginTop: 15,
  },
  infoCardTitle: {
      color: PALETTE.text_primary,
      fontSize: width * 0.042,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  infoCardDesc: {
      color: PALETTE.text_secondary,
      fontSize: width * 0.032,
      textAlign: 'center',
      marginTop: 5,
  },
  suggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PALETTE.inactive,
      borderRadius: 15,
      padding: 15,
      marginTop: 15,
  },
  suggestionButtonText: {
      color: PALETTE.text_secondary,
      fontWeight: '600',
      marginLeft: 8,
      fontSize: width * 0.035,
  },
});

export default HomeScreen;
