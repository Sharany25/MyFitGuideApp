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
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import UbicacionAlerta from "../components/UbicacionAlerta";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomToast from "../components/CustomToast";
import { useRegistro } from "../hooks/useRegistro";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const PRIMARY_COLOR = "#28a745";
const TEXT_COLOR = "#232946";
const ERROR_COLOR = "#E53935";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Registro">;

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const RegistroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { dispatch } = useUser();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [contrasenaError, setContrasenaError] = useState<string | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaDate, setFechaDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showUbicacionModal, setShowUbicacionModal] = useState(false);

  const {
    registrar,
    loading,
    success: showSuccess,
    error: showError,
    setSuccess: setShowSuccess,
    setError: setShowError,
  } = useRegistro();

  const solicitarUbicacion = async () => {
    setLoadingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setShowUbicacionModal(true);
      setLoadingLocation(false);
      return;
    }
    try {
      await Location.getCurrentPositionAsync({});
      setUbicacion("OK");
      setShowUbicacionModal(true);
    } catch (e) {
      setShowUbicacionModal(true);
    } finally {
      setLoadingLocation(false);
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

    const userId = await registrar({
      nombre,
      correoElectronico: emailToSend,
      contraseña: contrasena,
      fechaNacimiento: fechaISO,
      ubicacion,
    });

    if (userId) {
      const userProfile = {
        userId,
        nombre,
        correoElectronico: emailToSend,
        fechaNacimiento: fechaISO,
        ubicacion: ubicacion ?? undefined,
      };

      dispatch({ type: "SET_USER", payload: userProfile });

      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace("Dieta", {
          nombre,
          userId,
        });
      }, 1200);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
    >
      <CustomToast
        message="¡Registro guardado correctamente!"
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        type="success"
      />
      <CustomToast
        message="Error al guardar tus datos. Revisa tus datos."
        visible={showError}
        onHide={() => setShowError(false)}
        type="error"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.appName}>MyFitGuide</Text>
          <ProgressStepper currentStep="Registro" />
          <Text style={styles.subtitle}>Bienvenido, registra tu información</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              mode="flat"
              label=""
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
              theme={{
                colors: {
                  primary: PRIMARY_COLOR,
                  text: TEXT_COLOR,
                  placeholder: "#888",
                  background: "#fff",
                },
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              mode="flat"
              label=""
              placeholder="Correo electrónico"
              value={correo}
              onChangeText={text => setCorreo(text.toLowerCase())}
              keyboardType="email-address"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              theme={{
                colors: {
                  primary: PRIMARY_COLOR,
                  text: TEXT_COLOR,
                  placeholder: "#888",
                  background: "#fff",
                },
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              mode="flat"
              label=""
              placeholder="Contraseña"
              value={contrasena}
              onChangeText={text => {
                setContrasena(text);
                if (text.length < 8) {
                  setContrasenaError("La contraseña debe tener al menos 8 caracteres.");
                } else {
                  setContrasenaError(null);
                }
              }}
              secureTextEntry={!passwordVisible}
              style={styles.input}
              returnKeyType="done"
              theme={{
                colors: {
                  primary: PRIMARY_COLOR,
                  text: TEXT_COLOR,
                  placeholder: "#888",
                  background: "#fff",
                },
              }}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye" : "eye-off"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  color={PRIMARY_COLOR}
                />
              }
            />
            {contrasenaError && <Text style={styles.errorText}>{contrasenaError}</Text>}
          </View>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TextInput
              mode="flat"
              label=""
              placeholder="Fecha de nacimiento"
              value={fechaDate ? formatDate(fechaDate) : ""}
              style={styles.input}
              editable={false}
              pointerEvents="none"
              theme={{
                colors: {
                  primary: PRIMARY_COLOR,
                  text: TEXT_COLOR,
                  placeholder: "#888",
                  background: "#fff",
                },
              }}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={fechaDate || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFechaDate(selectedDate);
                  const formatted = formatDate(selectedDate);
                  setFechaNacimiento(formatted);
                }
              }}
            />
          )}
          <TouchableOpacity
            onPress={solicitarUbicacion}
            style={styles.outlineButton}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>
              Activar ubicación
            </Text>
          </TouchableOpacity>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={aceptoTerminos ? "checked" : "unchecked"}
              onPress={() => setAceptoTerminos(!aceptoTerminos)}
              color={PRIMARY_COLOR}
            />
            <Text style={styles.checkboxLabel}>
              Acepto los <Text style={{ textDecorationLine: "underline", color: PRIMARY_COLOR }}>términos y condiciones</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.registerButton, !aceptoTerminos && { backgroundColor: "#ccc" }]}
            onPress={handleRegistro}
            disabled={!aceptoTerminos}
            activeOpacity={0.9}
          >
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <UbicacionAlerta
        visible={showUbicacionModal}
        onClose={() => setShowUbicacionModal(false)}
        onConfirm={() => setShowUbicacionModal(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
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
    marginTop: 20,
    marginBottom: 30,
  },
  appName: {
    fontWeight: "700",
    color: PRIMARY_COLOR,
    textAlign: "center",
    fontSize: width * 0.07,
    marginBottom: 10,
    marginTop: 0,
  },
  subtitle: {
    fontSize: width * 0.042,
    color: TEXT_COLOR,
    textAlign: "center",
    marginBottom: 22,
    marginTop: -5,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 12,
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
    marginBottom: 0,
    justifyContent: "center",
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 13,
    marginTop: 4,
    marginLeft: 3,
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  outlineButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
    fontSize: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 0,
  },
  checkboxLabel: {
    fontSize: 15,
    color: TEXT_COLOR,
    marginLeft: 5,
  },
  registerButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default RegistroScreen;
