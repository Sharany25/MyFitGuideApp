import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Animated,
} from "react-native";
import { useRoute, useNavigation, RouteProp, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import CustomToast from "../components/CustomToast";
import { useRutina } from "../hooks/useRutina";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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

const opcionesPreferencia = [
  { label: "Gimnasio", value: "gimnasio", icon: "barbell-outline" as const },
  { label: "Casa", value: "casa", icon: "home-outline" as const },
  { label: "Calistenia", value: "calistenia", icon: "walk-outline" as const },
];

type RutinaRouteProp = RouteProp<RootStackParamList, "Rutina">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Rutina">;

const RutinaScreen: React.FC = () => {
  const route = useRoute<RutinaRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { userId, nombre, objetivo } = route.params || { userId: "", nombre: "", objetivo: "" };

  const [edad, setEdad] = useState("");
  const [preferenciaSeleccionada, setPreferenciaSeleccionada] = useState("");
  const [dias, setDias] = useState<number | null>(null);
  const [lesiones, setLesiones] = useState("");

  const { state, dispatch } = useUser();
  const {
    generarRutina,
    loading: isSubmitting,
    success: showSuccess,
    error: showError,
    setSuccess: setShowSuccess,
    setError: setShowError,
  } = useRutina();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
    }).start();
  }, []);

  const handleEdadChange = (text: string) => {
    setEdad(text.replace(/[^0-9]/g, ""));
  };

  const onGenerarRutina = async () => {
    if (!userId || !nombre || !edad || !objetivo || !preferenciaSeleccionada || !dias) {
      setShowError(true);
      return;
    }

    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum <= 0 || dias < 1 || dias > 7 || isSubmitting) {
      setShowError(true);
      return;
    }

    const result = await generarRutina({
      userId,
      nombre,
      edad: edadNum,
      objetivo,
      preferencias: [preferenciaSeleccionada],
      dias,
      lesiones,
    });

    if (result) {
      const updatedUser = {
        ...state.user,
        edad,
        preferencias: [preferenciaSeleccionada],
        dias: dias?.toString(),
        lesiones,
      };
      dispatch({ type: "SET_USER", payload: updatedUser as any });
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "Tabs",
                params: { screen: "RutinaIAGenerada", params: { userId } },
              },
            ],
          })
        );
      }, 1200);
    }
  };

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <CustomToast message="¡Rutina generada con éxito!" visible={showSuccess} onHide={() => setShowSuccess(false)} type="success" />
          <CustomToast message="Error: verifica tus datos" visible={showError} onHide={() => setShowError(false)} type="error" />
          

          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Animated.View style={{opacity: fadeAnim}}>
                <BlurView intensity={50} tint="dark" style={styles.card}>
                  <Text style={styles.title}>MyFitGuide</Text>
                  <ProgressStepper currentStep="Rutina" />
                  <Text style={styles.subtitle}>Diseñemos tu rutina ideal</Text>

                  <StaticInfo label="Nombre" value={nombre} icon="person-outline" />
                  <StaticInfo label="Objetivo" value={objetivo} icon="flag-outline" />

                  <CustomInput label="Edad" value={edad} onChangeText={handleEdadChange} placeholder="Ej: 22" keyboardType="numeric" maxLength={2} icon="calendar-outline" />

                  <Text style={styles.label}>¿Dónde prefieres entrenar?</Text>
                  <View style={styles.preferenceContainer}>
                    {opcionesPreferencia.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[styles.preferenceCard, preferenciaSeleccionada === item.value && { borderColor: PALETTE.primary }]}
                        onPress={() => setPreferenciaSeleccionada(item.value)}
                      >
                        <Ionicons name={item.icon} size={width * 0.08} color={preferenciaSeleccionada === item.value ? PALETTE.primary : PALETTE.text_secondary} />
                        <Text style={[styles.preferenceText, preferenciaSeleccionada === item.value && { color: PALETTE.primary }]}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>¿Cuántos días quieres entrenar?</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[styles.dayCircle, dias === num && { backgroundColor: PALETTE.primary }]}
                        onPress={() => setDias(num)}
                      >
                        <Text style={[styles.dayText, dias === num && { color: PALETTE.dark }]}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <CustomInput
                    label="¿Tienes lesiones? (Opcional)"
                    value={lesiones}
                    onChangeText={setLesiones}
                    placeholder="Ej: Dolor en rodilla derecha..."
                    icon="medkit-outline"
                    multiline
                    height={100}
                  />

                  <TouchableOpacity
                    style={{ opacity: isSubmitting ? 0.6 : 1 }}
                    onPress={onGenerarRutina}
                    disabled={isSubmitting}
                  >
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.generateButton}>
                        {isSubmitting ? <ActivityIndicator color={PALETTE.dark} /> : <Text style={styles.generateButtonText}>Generar Rutina</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const CustomInput = ({ label, icon, ...props }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={{marginBottom: 15}}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
                {icon && <Ionicons name={icon} size={22} color={isFocused ? PALETTE.primary : PALETTE.text_secondary} style={styles.leftIcon} />}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={PALETTE.text_secondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
        </View>
    );
};

const StaticInfo = ({ label, value, icon }: { label: string, value: string, icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={{marginBottom: 15}}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.staticInfoWrapper}>
            <Ionicons name={icon} size={22} color={PALETTE.text_secondary} style={styles.leftIcon} />
            <Text style={styles.staticInfoText}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: PALETTE.inactive,
    borderRadius: 50,
    padding: 8,
  },
  card: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
  },
  title: {
    fontWeight: "800",
    color: PALETTE.primary,
    textAlign: "center",
    fontSize: width * 0.08,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: width * 0.045,
    color: PALETTE.text_secondary,
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "600",
    color: PALETTE.text_secondary,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    color: PALETTE.text_primary,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: PALETTE.primary,
  },
  staticInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
    height: 55,
  },
  staticInfoText: {
    flex: 1,
    paddingHorizontal: 15,
    color: PALETTE.text_secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  leftIcon: {
    paddingLeft: 15,
  },
  preferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 25,
  },
  preferenceCard: {
    flex: 1,
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 100,
  },
  preferenceText: {
    marginTop: 10,
    color: PALETTE.text_secondary,
    fontWeight: 'bold',
    fontSize: width * 0.038,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
    paddingVertical: 5,
  },
  dayCircle: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: (width * 0.12) / 2,
    backgroundColor: PALETTE.inactive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: PALETTE.text_secondary,
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  generateButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 20,
  },
  generateButtonText: {
    color: PALETTE.dark,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RutinaScreen;
