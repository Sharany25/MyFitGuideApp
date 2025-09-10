import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  TextInput,
  Animated,
} from "react-native";
import { useForm, Controller, Control, FieldErrors } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/StackNavigator";
import SuccessToast from "../components/SuccessToast";
import ErrorToast from "../components/ErrorToast";
import { useLogin } from "../hooks/useLogin";
import { useUser } from "../context/UserContext";
import { obtenerPerfilCompleto } from "../hooks/usePerfil";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { appTheme } from "../themes/appTheme";

const logo = require("../../assets/Logo.png");
const { width, height } = Dimensions.get("window");

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  inactive: 'rgba(255, 255, 255, 0.2)',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  danger: '#FF4757',
  dark: '#1D2A32',
};

type FormData = {
  email: string;
  password: string;
};

interface CustomInputProps {
  control: Control<FormData, any>;
  name: keyof FormData;
  rules: Record<string, any>;
  placeholder: string;
  iconName: string;
  errors: FieldErrors<FormData>;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightIcon?: string;
  rightIconPress?: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({ control, name, rules, placeholder, iconName, errors, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences', rightIcon, rightIconPress }) => {
  const hasError = errors[name];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: 15 }}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <View style={[styles.inputContainer, hasError ? styles.inputErrorBorder : isFocused && styles.inputFocusedBorder]}>
              <Feather name={iconName as any} size={20} color={hasError ? PALETTE.danger : isFocused ? PALETTE.primary : PALETTE.text_secondary} style={styles.inputIcon} />
              <TextInput
                placeholder={placeholder}
                value={value as string}
                onChangeText={onChange}
                onBlur={() => { onBlur(); setIsFocused(false); }}
                onFocus={() => setIsFocused(true)}
                style={styles.input}
                placeholderTextColor={PALETTE.text_secondary}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
              />
              {rightIcon && (
                <TouchableOpacity onPress={rightIconPress} style={styles.rightIcon}>
                  <Feather name={rightIcon as any} size={22} color={PALETTE.text_secondary} />
                </TouchableOpacity>
              )}
            </View>
            {hasError && <Text style={styles.errorText}>{hasError.message}</Text>}
          </View>
        )}
      />
    </View>
  );
};


const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState("¡Login exitoso!");
  const [loadingLogin, setLoadingLogin] = useState(false);


  const { login, error } = useLogin(); // Se obtiene la variable 'error' del hook

  const { dispatch } = useUser();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!data.email || !data.password) return;

    setLoadingLogin(true); // Se inicia el estado de carga
    const emailLower = data.email.toLowerCase();
    const loginData = { correoElectronico: emailLower, contraseña: data.password };
    const result = await login(loginData);
    setLoadingLogin(false); // Se finaliza el estado de carga

    if (result) {
      try {
        const userId = result._id || result.idUsuario || result.userId || "";
        const perfilCompleto = await obtenerPerfilCompleto(userId);
  
        let edadStr = "";
        if (perfilCompleto?.usuario?.fechaNacimiento) {
          const fechaNacimiento = new Date(perfilCompleto.usuario.fechaNacimiento);
          const hoy = new Date();
          let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
          const m = hoy.getMonth() - fechaNacimiento.getMonth();
          if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
          edadStr = edad.toString();
        }

        const userProfile = {
          userId,
          nombre: perfilCompleto?.usuario?.nombre || "",
          correoElectronico: perfilCompleto?.usuario?.correoElectronico || "",
          fechaNacimiento: perfilCompleto?.usuario?.fechaNacimiento || "",
          edad: edadStr,
          foto: perfilCompleto?.usuario?.foto || "",
          objetivo: perfilCompleto?.dieta?.objetivo || "",
          genero: perfilCompleto?.dieta?.genero || "",
          altura: perfilCompleto?.dieta?.altura?.toString() || "",
          peso: perfilCompleto?.dieta?.peso?.toString() || "",
          alergias: perfilCompleto?.dieta?.alergias || [],
          presupuesto: perfilCompleto?.dieta?.presupuesto?.toString() || "",
          preferencias: perfilCompleto?.rutina?.preferencias || [],
          dias: perfilCompleto?.rutina?.dias?.toString() || "",
          lesiones: perfilCompleto?.rutina?.lesiones || "",
        };

        dispatch({ type: 'SET_USER', payload: userProfile });
        await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

        setSuccessToastMessage(`¡Bienvenido, ${userProfile.nombre || 'usuario'}!`);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.replace("Tabs", { userId });
        }, 1200);
      } catch (e) {
        console.error("Error al obtener perfil o guardar en AsyncStorage:", e);
        setShowError(true);
      }
    } else {
      setShowError(true);
    }
  };

  return (
    <>
      <SuccessToast message={successToastMessage} visible={showSuccess} onHide={() => setShowSuccess(false)} />
      <ErrorToast message={error || "Correo o contraseña incorrectos"} visible={showError} onHide={() => setShowError(false)} />

      <LinearGradient colors={PALETTE.background_gradient} style={styles.base}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.logoContainer, { opacity: logoAnim, transform: [{ scale: logoAnim }] }]}>
              <View style={styles.logoWrapper}>
                <Image source={logo} style={styles.logo} />
              </View>
              <Text style={styles.appName}>MyFitGuide</Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateY: formAnim }] }}>
              <BlurView intensity={50} tint="dark" style={styles.formContainer}>
                <CustomInput
                  control={control}
                  errors={errors}
                  name="email"
                  rules={{
                    required: "El email es obligatorio",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" },
                  }}
                  placeholder="Correo Electrónico"
                  iconName="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <CustomInput
                  control={control}
                  errors={errors}
                  name="password"
                  rules={{
                    required: "La contraseña es obligatoria",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  }}
                  placeholder="Contraseña"
                  iconName="lock"
                  secureTextEntry={!passwordVisible}
                  rightIcon={passwordVisible ? "eye-off" : "eye"}
                  rightIconPress={() => setPasswordVisible(!passwordVisible)}
                />

                <TouchableOpacity 
                  onPress={() => navigation.navigate("ResetContraseña")} 
                  style={appTheme.forgotPasswordButton}
                >
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loadingLogin} style={{ marginTop: 25 }}>
                  <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.button}>
                    {loadingLogin ? (
                      <ActivityIndicator color={PALETTE.dark} />
                    ) : (
                      <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </BlurView>

              <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate("Registro")}>
                <Text style={styles.bottomButtonText}>¿Nuevo usuario? <Text style={{ fontWeight: 'bold', color: PALETTE.primary }}>Crear cuenta</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helpLinkContainer}
                onPress={() => Linking.openURL("https://studio--smartbit-health-hub.us-central1.hosted.app/")}
              >
                <MaterialIcons name="help-outline" size={20} color={PALETTE.text_secondary} style={{ marginRight: 6 }} />
                <Text style={styles.helpLinkText}>Manual de Uso / Preguntas Frecuentes</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrapper: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: 'rgba(44, 253, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PALETTE.primary,
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  appName: {
    fontWeight: "700",
    color: PALETTE.text_primary,
    textAlign: "center",
    fontSize: width * 0.09,
    marginTop: 20,
    letterSpacing: 1,
  },
  formContainer: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputErrorBorder: {
    borderColor: PALETTE.danger,
  },
  inputFocusedBorder: {
    borderColor: PALETTE.primary,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: PALETTE.text_primary,
    fontSize: 16,
  },
  rightIcon: {
    padding: 5,
  },
  errorText: {
    color: PALETTE.danger,
    fontSize: 13,
    marginTop: 5,
    marginLeft: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonText: {
    color: PALETTE.dark,
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomButton: {
    marginTop: 30,
    alignItems: "center",
  },
  bottomButtonText: {
    color: PALETTE.text_secondary,
    fontSize: 15,
  },
  helpLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 30,
    opacity: 0.8,
  },
  helpLinkText: {
    color: PALETTE.text_secondary,
    fontSize: 14,
  },
  forgotPasswordText: {
    color: PALETTE.text_secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
    
  },
});

export default LoginScreen;
