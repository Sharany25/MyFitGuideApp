import React, { useState } from "react";
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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/StackNavigator";
import SuccessToast from "../components/SuccessToast";
import ErrorToast from "../components/ErrorToast";
import { useLogin } from "../hooks/useLogin";
import { useUser } from "../context/UserContext";
import { obtenerPerfilCompleto } from "../hooks/usePerfil"; // <-- Asegúrate de exportar esta función

const logo = require("../../assets/Logo.png");
const { width, height } = Dimensions.get("window");

type FormData = {
  email: string;
  password: string;
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const { login, loading, error } = useLogin();
  const { dispatch } = useUser();

  // ---- LOGIN PRINCIPAL ----
  const onSubmit = async (data: FormData) => {
    if (!data.email || !data.password) return;

    const emailLower = data.email.toLowerCase();

    const loginData = {
      correoElectronico: emailLower,
      contraseña: data.password,
    };

    const result = await login(loginData);

    if (result) {
      // 1. Obtener el userId válido
      const userId = result._id || result.idUsuario || result.userId || "";

      // 2. Fetch del perfil completo
      const perfilCompleto = await obtenerPerfilCompleto(userId);

      // 3. Mapping del perfil al UserContext
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
        ubicacion: perfilCompleto?.usuario?.ubicacion || "",
        edad: edadStr,
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

      // 4. Guarda en el contexto global y en AsyncStorage
      dispatch({ type: 'SET_USER', payload: userProfile });
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace("Tabs", { userId });
      }, 1200);
    } else {
      setShowError(true);
    }
  };

  return (
    <>
      <SuccessToast message="¡Login exitoso!" visible={showSuccess} onHide={() => setShowSuccess(false)} />
      <ErrorToast message={error || "Correo o contraseña incorrectos"} visible={showError} onHide={() => setShowError(false)} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#f0f0f0" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} />
            </View>

            <Text style={styles.appName}>MyFitGuide</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El email es obligatorio",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Correo Electrónico"
                      value={value}
                      onChangeText={text => onChange(text.toLowerCase())}
                      onBlur={onBlur}
                      style={[styles.input, errors.email && styles.inputError]}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      error={!!errors.email}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "La contraseña es obligatoria",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Contraseña"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={[styles.input, errors.password && styles.inputError]}
                      secureTextEntry={!passwordVisible}
                      error={!!errors.password}
                      right={
                        <TextInput.Icon
                          icon={passwordVisible ? "eye" : "eye-off"}
                          onPress={() => setPasswordVisible(!passwordVisible)}
                        />
                      }
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                  </>
                )}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { backgroundColor: "#ccc" }]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate("Registro")}>
              <Text style={styles.bottomButtonText}>¿Nuevo usuario? Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const PRIMARY_COLOR = "#28a745";

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 80,
    minHeight: height,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 50,
    marginBottom: 10,
  },
  appName: {
    fontWeight: "700",
    color: PRIMARY_COLOR,
    textAlign: "center",
    fontSize: width * 0.07,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  bottomButton: {
    marginTop: 20,
    alignItems: "center",
  },
  bottomButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default LoginScreen;
