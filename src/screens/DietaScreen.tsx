import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import CustomToast from "../components/CustomToast";
import { useDieta } from "../hooks/useDieta";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from 'react-native-safe-area-context';

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
  male: '#00A3FF',
  female: '#E91E63',
};

type DietaRouteProp = RouteProp<RootStackParamList, "Dieta">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Dieta">;

const DietaScreen: React.FC = () => {
  const route = useRoute<DietaRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { userId, nombre } = route.params || { userId: "", nombre: "" };

  const { state, dispatch } = useUser();

  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [genero, setGenero] = useState<"masculino" | "femenino" | "">("");
  const [presupuesto, setPresupuesto] = useState("");
  const [alergiaInput, setAlergiaInput] = useState("");
  const [alergias, setAlergias] = useState<string[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const { enviarDieta, loading, error } = useDieta();

  const handleAddAlergia = () => {
    if (alergiaInput.trim()) {
      setAlergias([...alergias, alergiaInput.trim()]);
      setAlergiaInput("");
    }
  };

  const handleRemoveAlergia = (index: number) => {
    setAlergias(alergias.filter((_, i) => i !== index));
  };

  const handleSiguiente = async () => {
    if (!peso || !altura || !objetivo || !genero || !presupuesto) {
      setShowError(true);
      return;
    }
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const presupuestoNum = parseFloat(presupuesto);
    if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(presupuestoNum)) {
      setShowError(true);
      return;
    }
    const result = await enviarDieta({
      userId,
      genero: genero as "masculino" | "femenino",
      altura: alturaNum,
      peso: pesoNum,
      objetivo,
      alergias,
      presupuesto: presupuestoNum,
    });

    if (result) {
      const updatedUser = {
        ...state.user,
        userId: state.user?.userId || userId,
        nombre: state.user?.nombre || nombre,
        correoElectronico: state.user?.correoElectronico || '',
        genero,
        altura,
        peso,
        objetivo,
        alergias,
        presupuesto,
      };
      dispatch({ type: "SET_USER", payload: updatedUser as any });
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace("Rutina", { userId, nombre, objetivo });
      }, 1200);
    } else {
      setShowError(true);
    }
  };

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <CustomToast message="¡Datos de dieta guardados!" visible={showSuccess} onHide={() => setShowSuccess(false)} type="success" />
          <CustomToast message={error || "Verifica tus datos."} visible={showError} onHide={() => setShowError(false)} type="error" />

          <ScrollView contentContainerStyle={[styles.scrollContainer, {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20}]} keyboardShouldPersistTaps="handled">
            <BlurView intensity={50} tint="dark" style={styles.card}>
              <Text style={styles.title}>MyFitGuide</Text>
              <ProgressStepper currentStep="Dieta" />
              <Text style={styles.subtitle}>Tu información corporal y dieta</Text>

              <CustomInput label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="Ej: 70" keyboardType="numeric" icon="barbell-outline" />
              <CustomInput label="Altura (cm)" value={altura} onChangeText={setAltura} placeholder="Ej: 170" keyboardType="numeric" icon="body-outline" />
              <CustomInput label="Objetivo" value={objetivo} onChangeText={setObjetivo} placeholder="Ej: Bajar grasa, ganar masa" icon="trophy-outline" />

              <Text style={styles.label}>Género</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderOption, genero === "masculino" && { borderColor: PALETTE.male }]}
                  onPress={() => setGenero("masculino")}
                >
                  <Ionicons name="male" size={width * 0.1} color={genero === "masculino" ? PALETTE.male : PALETTE.text_secondary} />
                  <Text style={[styles.genderText, genero === "masculino" && { color: PALETTE.male }]}>Masculino</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, genero === "femenino" && { borderColor: PALETTE.female }]}
                  onPress={() => setGenero("femenino")}
                >
                  <Ionicons name="female" size={width * 0.1} color={genero === "femenino" ? PALETTE.female : PALETTE.text_secondary} />
                  <Text style={[styles.genderText, genero === "femenino" && { color: PALETTE.female }]}>Femenino</Text>
                </TouchableOpacity>
              </View>

              <CustomInput label="Presupuesto Semanal (MXN)" value={presupuesto} onChangeText={setPresupuesto} placeholder="Ej: 500" keyboardType="numeric" icon="cash-outline" />
              
              <View>
                <CustomInput
                  label="Alergias alimenticias"
                  value={alergiaInput}
                  onChangeText={setAlergiaInput}
                  placeholder="Ej: Gluten, lactosa..."  //En caso de no ser nada, dejar este apartado vacio --Pendiente x colocar
                  icon="alert-circle-outline"
                  rightIcon={
                    <TouchableOpacity onPress={handleAddAlergia} style={styles.addBtn}>
                      <Feather name="plus" size={22} color={PALETTE.dark} />
                    </TouchableOpacity>
                  }
                />
                <View style={styles.allergyList}>
                  {alergias.map((a, idx) => (
                    <TouchableOpacity key={idx} style={styles.allergyChip} onPress={() => handleRemoveAlergia(idx)}>
                      <Text style={styles.allergyText}>{a}</Text>
                      <Ionicons name="close" size={16} color={PALETTE.dark} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity
                style={{ opacity: loading ? 0.6 : 1, marginTop: 10 }}
                onPress={handleSiguiente}
                disabled={loading}
              >
                <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.nextButton}>
                    {loading ? <ActivityIndicator color={PALETTE.dark} /> : <Text style={styles.nextButtonText}>Siguiente</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const CustomInput = ({ label, rightIcon, icon, ...props }: any) => {
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
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: "800",
    color: PALETTE.primary,
    fontSize: width * 0.08,
    textAlign: 'center',
    marginBottom: 15,
  },
  card: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
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
    marginBottom: 8,
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
  leftIcon: {
    paddingLeft: 15,
  },
  rightIcon: {
    paddingRight: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 15,
  },
  genderOption: {
    flex: 1,
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  genderText: {
    marginTop: 10,
    color: PALETTE.text_secondary,
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  addBtn: {
    backgroundColor: PALETTE.primary,
    borderRadius: 12,
    padding: 8,
  },
  allergyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.primary,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 5,
  },
  allergyText: {
    color: PALETTE.dark,
    fontWeight: 'bold',
  },
  nextButton: {
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
  nextButtonText: {
    color: PALETTE.dark,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DietaScreen;
