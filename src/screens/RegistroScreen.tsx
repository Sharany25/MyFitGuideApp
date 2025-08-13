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
  Image, // Importar Image para la previsualización
} from "react-native";
import { Checkbox } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomToast from "../components/CustomToast";
import { useRegistro } from "../hooks/useRegistro";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from "@expo/vector-icons"; // Importar Ionicons para el icono de cámara
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'; // Importar ImagePicker

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

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Registro">;

const RegistroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { dispatch } = useUser();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [contrasenaError, setContrasenaError] = useState<string | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaDate, setFechaDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [foto, setFoto] = useState<string>(''); // Estado para la URI de la foto seleccionada

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
  }, []);

  const pickImage = async () => {
    // Solicitar permisos de acceso a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería de fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Aspecto cuadrado para la foto de perfil
      quality: 0.5, // Reducir la calidad para un mejor rendimiento
      base64: false, // No necesitamos base64 si vamos a subir la imagen a un servicio de almacenamiento
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri); // Guardar la URI de la imagen seleccionada
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

    // Aquí, si necesitas subir la imagen a un servidor de almacenamiento de archivos (ej. Cloudinary, Firebase Storage)
    // antes de enviar la URI a tu backend NestJS, la lógica iría aquí.
    // Por ahora, solo se envía la URI local. Tu backend NestJS debería ser capaz de manejar
    // una URI de imagen (si es una URL pública) o un base64 si decides cambiarlo.
    // Si la foto es local (file://), tu backend NO la recibirá directamente.
    // Necesitarías subirla a un servicio de almacenamiento y obtener una URL pública.

    const userId = await registrar({
      nombre,
      correoElectronico: emailToSend,
      contraseña: contrasena,
      fechaNacimiento: fechaISO,
      foto, // Incluye la URI de la foto en el payload de registro
    });

    if (userId) {
      const userProfile = {
        userId,
        nombre,
        correoElectronico: emailToSend,
        fechaNacimiento: fechaISO,
        foto, // Incluye la foto en el perfil de usuario almacenado localmente
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
                  <CustomInput label="Correo electrónico" value={correo} onChangeText={setCorreo} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" icon="mail" />
                  
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

                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <CustomInput label="Fecha de nacimiento" value={fechaDate ? formatDate(fechaDate) : ""} placeholder="DD/MM/AAAA" editable={false} icon="calendar" />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={fechaDate || new Date(2000, 0, 1)}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setFechaDate(selectedDate);
                          setFechaNacimiento(formatDate(selectedDate));
                        }
                      }}
                    />
                  )}

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
                    <Text style={styles.checkboxLabel}>Acepto los <Text style={{ textDecorationLine: "underline", color: PALETTE.primary }}>términos y condiciones</Text></Text>
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

const CustomInput = ({ label, rightIcon, icon, ...props }: any) => {
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
  // Nuevos estilos para el selector de foto
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
