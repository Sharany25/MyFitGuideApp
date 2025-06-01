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

const logo = require("../../assets/Logo.png");
const { width, height } = Dimensions.get("window");

type FormData = {
  email: string;
  password: string;
};

interface LoginScreenProps {
  onLoginSuccess: (
    isNew: boolean,
    userData?: {
      userId: string;
      nombre: string;
      edad: string;
      objetivo: string;
      genero: string;
      altura: string;
      peso: string;
    }
  ) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const onSubmit = async (data: FormData) => {
    if (!data.email || !data.password) return;

    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.5:3000/MyFitGuide/Usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correoElectronico: data.email,
          contraseña: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result) {
        const fechaNacimiento = new Date(result.fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const m = hoy.getMonth() - fechaNacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;

        // MODIFICACIÓN: userId obtiene el id real del usuario desde la API (_id o idUsuario)
        const userData = {
          userId: result._id || result.idUsuario || "", // ← AQUÍ EL CAMBIO
          nombre: result.nombre || "",
          edad: edad.toString(),
          objetivo: result.objetivo || "",
          genero: result.genero || "",
          altura: result.altura?.toString() || "",
          peso: result.peso?.toString() || "",
        };

        await AsyncStorage.setItem("user", JSON.stringify(result));
        setShowSuccess(true);
        setTimeout(() => {
          onLoginSuccess(false, userData);
        }, 2000);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessToast message="¡Login exitoso!" visible={showSuccess} onHide={() => setShowSuccess(false)} />
      <ErrorToast message="Correo o contraseña incorrectos" visible={showError} onHide={() => setShowError(false)} />

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
                      onChangeText={onChange}
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
