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
  StatusBar,
  ActivityIndicator,
  TextInput,
  Animated,
  Image,
  NativeSyntheticEvent,
} from "react-native";
import { Checkbox } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import CustomToast from "../components/CustomToast";
import { useRegistro } from "../hooks/useRegistro";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from "react-native";

const { width } = Dimensions.get("window");

// URL DE TERMINOS Y CONDICIONES
const TérminosCondiciones = () => {
  const url = "https://myfitguideapp-f48a8.web.app/projects/myfitguide";
  Linking.openURL(url).catch(err => console.error('Error al abrir el enlace:', err));
};

// PALETA DE COLORES - Tipado como 'as const' para inmutabilidad
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

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Registro">;

// --- NUEVO COMPONENTE: INPUT DE FECHA DE NACIMIENTO ---

interface DateOfBirthInputProps {
  label: string;
  date: Date | null;
  setDate: (date: Date) => void;
  setFormattedDate: (formatted: string) => void;
}

/**
 * Componente que encapsula el input visual de la fecha y el selector nativo (DateTimePicker).
 * Ofrece una experiencia consistente y limpia en iOS y Android.
 */
const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({ label, date, setDate, setFormattedDate }) => {
  const [showPicker, setShowPicker] = useState(false);
  const formattedValue = date ? formatDate(date) : "";
  // Fecha a mostrar en el selector (por defecto 1 de Enero del 2000)
  const displayDate = date || new Date(2000, 0, 1);

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    // Es necesario ocultar el picker inmediatamente, especialmente en Android.
    // Usamos event.type para manejar la cancelación en Android si display='default'
    if (Platform.OS === 'ios' || (event.type as string) === 'set') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      setFormattedDate(formatDate(selectedDate));
    }
  };

  const handleOpenPicker = () => {
    // Abrir el selector
    setShowPicker(true);
  };

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      {/* El input visual es un TouchableOpacity para abrir el selector */}
      <TouchableOpacity
        onPress={handleOpenPicker}
        style={styles.dateInputWrapper}
        activeOpacity={0.7}
      >
        <Feather name="calendar" size={20} color={PALETTE.text_secondary} style={styles.leftIcon} />
        {/* Usamos un TextInput simulado para mostrar el valor */}
        <TextInput
          style={[styles.input, { paddingHorizontal: 0 }]}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={PALETTE.text_secondary}
          value={formattedValue}
          editable={false} // No debe ser editable por teclado
        />
        <Feather name="chevron-down" size={20} color={PALETTE.text_secondary} style={styles.rightIcon} />
      </TouchableOpacity>

      {/* Selector de fecha nativo */}
      {showPicker && (
        <DateTimePicker
          value={displayDate}
          mode="date"
          // 'spinner' en iOS es más limpio, 'default' o 'calendar' en Android son estándares
          // Usaremos 'default' para Android para el selector modal nativo y 'spinner' para iOS
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          onTouchCancel={() => setShowPicker(false)} // Permite cancelar la acción en Android/iOS si el display lo permite
          maximumDate={new Date()} // No permitir fechas futuras
          // Estilo de texto para Android
          accentColor={PALETTE.primary} 
        />
      )}
    </View>
  );
};

// --- FIN NUEVO COMPONENTE ---


const RegistroScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Registro">>();
  const { dispatch } = useUser();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [contrasenaError, setContrasenaError] = useState<string | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState<string>(""); // Formato DD/MM/YYYY
  const [fechaDate, setFechaDate] = useState<Date | null>(null); // Objeto Date
  // showDatePicker state is now managed inside DateOfBirthInput
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [foto, setFoto] = useState<string>('');

  const {
    registrar,
    loading,
    success: showSuccess,
    error: showError,
    setSuccess: setShowSuccess,
    setError: setShowError,
  } = useRegistro();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería de fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5, 
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFoto(result.assets[0].uri);
    }
  };

  const handleRegistro = async () => {
    if (contrasena.length < 8) {
      setContrasenaError("La contraseña debe tener al menos 8 caracteres.");
      setShowError(true);
      return;
    } else {
      setContrasenaError(null);
    }

    if (!aceptoTerminos || !nombre || !correo || !contrasena || !fechaNacimiento) {
      setShowError(true);
      return;
    }

    // Convert DD/MM/YYYY to ISO YYYY-MM-DD for backend consistency
    const fechaParts = fechaNacimiento.split("/");
    if (fechaParts.length !== 3) {
      setShowError(true);
      return;
    }
    const fechaISO = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
    if (isNaN(new Date(fechaISO).getTime())) {
      setShowError(true);
      return;
    }

    const emailToSend = correo.toLowerCase();

    const userId = await registrar({
      nombre,
      correoElectronico: emailToSend,
      contraseña: contrasena,
      fechaNacimiento: fechaISO,
      foto,
    });

    if (userId) {
      const userProfile = {
        userId,
        nombre,
        correoElectronico: emailToSend,
        fechaNacimiento: fechaISO,
        foto,
      };

      dispatch({ type: "SET_USER", payload: userProfile });
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace("Dieta", { nombre, userId });
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
          <CustomToast message="¡Registro guardado!" visible={showSuccess} onHide={() => setShowSuccess(false)} type="success" />
          <CustomToast message="Error, revisa tus datos." visible={showError} onHide={() => setShowError(false)} type="error" />
          
          <ScrollView 
            contentContainerStyle={[styles.scrollContainer, {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20}]} 
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{opacity: fadeAnim}}>
                <BlurView intensity={50} tint="dark" style={styles.card}>
                  <Text style={styles.title}>MyFitGuide</Text>
                  <ProgressStepper currentStep="Registro" />
                  <Text style={styles.subtitle}>Bienvenido, registra tu información</Text>

                  <CustomInput label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Tu nombre" icon="user" />
                  <CustomInput label="Correo electrónico" value={correo} onChangeText={setCorreo} placeholder="nombre@gmail.com" keyboardType="email-address" autoCapitalize="none" icon="mail" />
                  
                  <View>
                    <CustomInput
                      label="Contraseña"
                      value={contrasena}
                      onChangeText={(text: string) => {
                        setContrasena(text);
                        if (text.length > 0 && text.length < 8) {
                          setContrasenaError("Mínimo 8 caracteres.");
                        } else {
                          setContrasenaError(null);
                        }
                      }}
                      placeholder="Crea una contraseña segura"
                      secureTextEntry={!passwordVisible}
                      icon="lock"
                      rightIcon={
                        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                          <Feather name={passwordVisible ? "eye-off" : "eye"} size={22} color={PALETTE.text_secondary} />
                        </TouchableOpacity>
                      }
                    />
                    {contrasenaError && <Text style={styles.errorText}>{contrasenaError}</Text>}
                  </View>

                  <DateOfBirthInput
                    label="Fecha de nacimiento"
                    date={fechaDate}
                    setDate={setFechaDate}
                    setFormattedDate={setFechaNacimiento}
                  />

                  {/* Campo para seleccionar la foto */}
                  <View style={styles.photoPickerContainer}>
                    <Text style={styles.label}>Foto de Perfil (opcional)</Text>
                    <TouchableOpacity onPress={pickImage} style={styles.photoPickerButton}>
                      {foto ? (
                        <Image source={{ uri: foto }} style={styles.photoPreview} />
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Ionicons name="camera-outline" size={40} color={PALETTE.text_secondary} />
                          <Text style={styles.photoPlaceholderText}>Seleccionar Foto</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <Checkbox.Android status={aceptoTerminos ? "checked" : "unchecked"} onPress={() => setAceptoTerminos(!aceptoTerminos)} color={PALETTE.primary} uncheckedColor={PALETTE.text_secondary} />
                    <Text style={styles.checkboxLabel}>Acepto los <Text style={{ textDecorationLine: "underline", color: PALETTE.primary }} onPress={TérminosCondiciones}>términos y condiciones</Text></Text>
                  </View>

                  <TouchableOpacity
                    style={{ opacity: !aceptoTerminos || loading ? 0.6 : 1 }}
                    onPress={handleRegistro}
                    disabled={!aceptoTerminos || loading}
                  >
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.registerButton}>
                        {loading ? <ActivityIndicator color={PALETTE.dark} /> : <Text style={styles.registerButtonText}>Registrarse</Text>}
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

/**
 * FIX DE TIPADO: Se reemplaza la interface 'extends TextInput['props']' por un tipo 'type' 
 * que usa la intersección (&) con TextInput['props'] para resolver los errores 2322 y 2499.
 * Esto asegura que todas las props estándar de TextInput (como value y onChangeText) 
 * sean reconocidas por TypeScript.
 */
type CustomInputProps = TextInput['props'] & {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    rightIcon?: React.ReactNode;
};

const CustomInput: React.FC<CustomInputProps> = ({ label, rightIcon, icon, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={{marginBottom: 15}}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
                {icon && <Feather name={icon} size={20} color={isFocused ? PALETTE.primary : PALETTE.text_secondary} style={styles.leftIcon} />}
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
    justifyContent: "center",
    paddingHorizontal: 20,
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
    marginBottom: 25,
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
  // Nuevo estilo para el input de fecha, consistente con inputWrapper
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 55,
    paddingRight: 15, // Añadido para espacio del icono derecho
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
    paddingRight: 15,
  },
  errorText: {
    color: PALETTE.danger,
    fontSize: 13,
    marginTop: 5,
    marginLeft: 5,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: PALETTE.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  outlineButtonText: {
    color: PALETTE.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: width * 0.038,
    color: PALETTE.text_secondary,
    marginLeft: 8,
    flex: 1,
  },
  registerButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  registerButtonText: {
    color: PALETTE.dark,
    fontSize: 18,
    fontWeight: "bold",
  },

  photoPickerContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  photoPickerButton: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: PALETTE.inactive,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: PALETTE.text_secondary,
    fontSize: 14,
    marginTop: 5,
  },
});
export default RegistroScreen;
