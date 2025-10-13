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
  ActivityIndicator,
  TextInput,
  Animated,
  Image,
  Modal,
  TextInputProps,
  Linking,
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
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

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

const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const toISODate = (date: Date | null): string | undefined => {
    return date?.toISOString().split('T')[0];
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Registro">;

interface CustomInputProps extends TextInputProps {
    label: string;
    icon?: keyof typeof Feather.glyphMap;
    rightIcon?: React.ReactNode;
}

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


const RegistroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { dispatch } = useUser();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [contrasenaError, setContrasenaError] = useState<string | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fotoBase64, setFotoBase64] = useState<string>('');
  
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
      setShowError(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFotoBase64(uri);
    }
  };

  const handleRegistro = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setShowError(true);
      return;
    }

    if (contrasena.length < 8) {
      setContrasenaError("La contraseña debe tener al menos 8 caracteres.");
      setShowError(true);
      return;
    }
    setContrasenaError(null);

    if (!aceptoTerminos || !nombre || !contrasena || !fechaNacimiento) {
      setShowError(true);
      return;
    }
    
    const fechaISO = toISODate(fechaNacimiento);
    if (!fechaISO) {
        setShowError(true);
        return;
    }

    const payload = {
        nombre,
        correoElectronico: correo.toLowerCase(),
        contraseña: contrasena,
        fechaNacimiento: fechaISO,
        foto: fotoBase64 || undefined,
    };
    
    const responseData = await registrar(payload);

    if (responseData && responseData.userId) {
      const userProfile = {
        userId: responseData.userId,
        nombre,
        correoElectronico: correo.toLowerCase(),
        fechaNacimiento: fechaISO,
        foto: responseData.fotoUrl || fotoBase64,
      };

      dispatch({ type: "SET_USER", payload: userProfile });
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace("Dieta", { nombre, userId: responseData.userId });
      }, 1200);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setDatePickerVisible(false);
    }
    if (event.type === 'set' && selectedDate) {
        setFechaNacimiento(selectedDate);
    }
  };

  const renderDatePicker = () => {
      const currentDate = fechaNacimiento || new Date(2000, 0, 1);
      
      if (Platform.OS === 'android') {
        if (!isDatePickerVisible) return null;
        return (
            <DateTimePicker
                value={currentDate}
                mode="date"
                display="calendar"
                onChange={onDateChange}
                maximumDate={new Date()}
            />
        );
      }
      
      return (
          <Modal
              animationType="slide"
              transparent={true}
              visible={isDatePickerVisible}
              onRequestClose={() => setDatePickerVisible(false)}
          >
              <BlurView intensity={30} tint="dark" style={styles.modalBackdrop}>
                  <View style={styles.modalContent}>
                      <DateTimePicker
                          value={currentDate}
                          mode="date"
                          display="spinner"
                          onChange={onDateChange}
                          textColor={PALETTE.text_primary}
                          maximumDate={new Date()}
                      />
                      <TouchableOpacity
                          style={styles.dateConfirmButton}
                          onPress={() => setDatePickerVisible(false)}
                      >
                          <Text style={styles.dateConfirmButtonText}>Confirmar</Text>
                      </TouchableOpacity>
                  </View>
              </BlurView>
          </Modal>
      );
  }

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
                  <CustomInput label="Correo electrónico" value={correo} onChangeText={setCorreo} placeholder="nombre@ejemplo.com" keyboardType="email-address" autoCapitalize="none" icon="mail" />
                  
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

                  <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                    <CustomInput label="Fecha de nacimiento" value={formatDate(fechaNacimiento)} placeholder="DD/MM/AAAA" editable={false} icon="calendar" />
                  </TouchableOpacity>

                  {renderDatePicker()}

                  <Text style={[styles.label, {textAlign: 'center', marginBottom: 10}]}>Foto de Perfil (opcional)</Text>
                  <TouchableOpacity onPress={pickImage} style={styles.photoPickerButton}>
                    {fotoBase64 ? (
                      <Image source={{ uri: fotoBase64 }} style={styles.photoPreview} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons name="camera-outline" size={40} color={PALETTE.text_secondary} />
                        <Text style={styles.photoPlaceholderText}>Seleccionar Foto</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.checkboxContainer}>
                    <Checkbox.Android status={aceptoTerminos ? "checked" : "unchecked"} onPress={() => setAceptoTerminos(!aceptoTerminos)} color={PALETTE.primary} uncheckedColor={PALETTE.text_secondary} />
                    <Text style={styles.checkboxLabel}>
                      Acepto los{' '}
                      <Text 
                        style={{ textDecorationLine: "underline", color: PALETTE.primary }}
                        onPress={() => Linking.openURL('https://myfitguideapp-f48a8.web.app/projects/myfitguide')}
                      >
                        términos y condiciones
                      </Text>
                    </Text>
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
    height: 55,
  },
  input: {
    flex: 1,
    height: '100%',
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 25,
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
  photoPickerButton: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: PALETTE.inactive,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
    alignSelf: 'center',
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: PALETTE.dark,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dateConfirmButton: {
    backgroundColor: PALETTE.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    width: '90%',
    marginTop: 15,
  },
  dateConfirmButtonText: {
    color: PALETTE.dark,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default RegistroScreen;
