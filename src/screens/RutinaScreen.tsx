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
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import CustomToast from "../components/CustomToast";
import { useRutina } from "../hooks/useRutina";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#FFD700";
const BG_COLOR = "#FFFDEB";
const TEXT_COLOR = "#232946";
const FIELD_DISABLED_BG = "#FAF7EB";
const FIELD_DISABLED_TEXT = "#BEBEBE";

type RutinaRouteProp = RouteProp<RootStackParamList, "Rutina">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Rutina">;

const opcionesPreferencia = [
  { label: "Gimnasio", value: "gimnasio", icon: "barbell-outline" },
  { label: "Casa", value: "casa", icon: "home-outline" },
  { label: "Calistenia", value: "calistenia", icon: "walk-outline" },
];

const RutinaScreen: React.FC = () => {
  const route = useRoute<RutinaRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { userId, nombre, objetivo } = route.params || { userId: '', nombre: '', objetivo: '' };

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

  const handleEdadChange = (text: string) => {
    setEdad(text.replace(/[^0-9]/g, ""));
  };

  const handleSeleccionarDia = (dia: number) => {
    setDias(dia);
  };

  const onGenerarRutina = async () => {
    if (!userId || !nombre || !edad || !objetivo || !preferenciaSeleccionada || !dias) {
      setShowError(true);
      return;
    }
    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum <= 0) {
      setShowError(true);
      return;
    }
    if (dias < 1 || dias > 7) {
      setShowError(true);
      return;
    }
    if (isSubmitting) return;

    const ok = await generarRutina({
      userId,
      nombre,
      edad: edadNum,
      objetivo,
      preferencias: [preferenciaSeleccionada],
      dias,
      lesiones,
    });
    if (ok) {
      const updatedUser = {
        ...state.user,
        userId,
        nombre,
        objetivo,
        edad, // string
        preferencias: [preferenciaSeleccionada],
        dias: dias?.toString(),
        lesiones,
        correoElectronico: state.user?.correoElectronico ?? "",
        fechaNacimiento: state.user?.fechaNacimiento ?? "",
        ubicacion: state.user?.ubicacion ?? "",
        genero: state.user?.genero ?? "",
        altura: state.user?.altura ?? "",
        peso: state.user?.peso ?? "",
        alergias: state.user?.alergias ?? [],
        presupuesto: state.user?.presupuesto ?? "",
      };
      dispatch({
        type: "SET_USER",
        payload: updatedUser,
      });
      // Guarda en AsyncStorage la última versión del usuario
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace("Tabs", { userId });
      }, 1200);
    }
  };

  const renderDiasCirculos = () => (
    <View style={styles.diasCirculosContainer}>
      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
        <TouchableOpacity
          key={num}
          style={[
            styles.diaCirculo,
            dias === num && styles.diaCirculoSeleccionado,
          ]}
          onPress={() => handleSeleccionarDia(num)}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.diaCirculoTexto,
              dias === num && styles.diaCirculoTextoSeleccionado,
            ]}
          >
            {num}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <CustomToast
        message="¡Rutina generada con éxito!"
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        type="success"
      />
      <CustomToast
        message="Error: verifica tus datos"
        visible={showError}
        onHide={() => setShowError(false)}
        type="error"
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: BG_COLOR }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.appName}>Rutina IA</Text>
          <ProgressStepper currentStep="Rutina" />
          <Text style={styles.subtitle}>Diseñemos tu rutina ideal</Text>

          {/* Nombre - SOLO LECTURA */}
          <TextInput
            label="Nombre"
            mode="outlined"
            value={nombre}
            style={[styles.input, styles.inputDisabled]}
            left={<TextInput.Icon icon="account" color={PRIMARY_COLOR} />}
            editable={false}
            pointerEvents="none"
            theme={{
              colors: {
                text: FIELD_DISABLED_TEXT,
                primary: PRIMARY_COLOR,
                background: FIELD_DISABLED_BG,
                placeholder: FIELD_DISABLED_TEXT,
              },
            }}
          />

          {/* Edad */}
          <TextInput
            label="Edad"
            mode="outlined"
            placeholder="Ejemplo: 22"
            value={edad}
            keyboardType="numeric"
            onChangeText={handleEdadChange}
            style={styles.input}
            left={<TextInput.Icon icon="calendar-outline" color={PRIMARY_COLOR} />}
            theme={{
              colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR },
            }}
            maxLength={2}
            returnKeyType="done"
          />

          {/* Objetivo - SOLO LECTURA */}
          <TextInput
            label="Objetivo"
            mode="outlined"
            value={objetivo}
            style={[styles.input, styles.inputDisabled]}
            left={<TextInput.Icon icon="flag-outline" color={PRIMARY_COLOR} />}
            editable={false}
            pointerEvents="none"
            theme={{
              colors: {
                text: FIELD_DISABLED_TEXT,
                primary: PRIMARY_COLOR,
                background: FIELD_DISABLED_BG,
                placeholder: FIELD_DISABLED_TEXT,
              },
            }}
          />

          {/* Preferencia de entrenamiento */}
          <Text style={styles.label}>¿Dónde prefieres entrenar?</Text>
          <View style={styles.preferenciaContainer}>
            {opcionesPreferencia.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.opcion,
                  preferenciaSeleccionada === item.value && styles.opcionSeleccionada,
                ]}
                onPress={() => setPreferenciaSeleccionada(item.value)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={item.icon as any}
                  size={23}
                  color={preferenciaSeleccionada === item.value ? "#fff" : PRIMARY_COLOR}
                  style={styles.preferenciaIcon}
                />
                <Text
                  style={[
                    styles.opcionTexto,
                    preferenciaSeleccionada === item.value && styles.opcionTextoActivo,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Días de entrenamiento */}
          <Text style={styles.label}>¿Cuántos días quieres entrenar?</Text>
          {renderDiasCirculos()}

          {/* Lesiones */}
          <TextInput
            label="¿Tienes lesiones? (opcional)"
            mode="outlined"
            value={lesiones}
            onChangeText={setLesiones}
            style={styles.input}
            left={<TextInput.Icon icon="medical-bag" color={PRIMARY_COLOR} />}
            theme={{
              colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR },
            }}
            multiline
            placeholder="Escribe si tienes alguna lesión..."
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.boton,
              isSubmitting && { backgroundColor: "#FFF59E" },
            ]}
            onPress={onGenerarRutina}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.botonTexto}>
              {isSubmitting ? "Generando..." : "Generar Rutina"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: BG_COLOR,
  },
  appName: {
    textAlign: "center",
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 12,
    marginTop: 10,
  },
  subtitle: {
    fontSize: width * 0.045,
    color: TEXT_COLOR,
    textAlign: "center",
    marginBottom: 22,
    fontWeight: "600",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_COLOR,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 14,
    borderRadius: 10,
    fontSize: 16,
    borderColor: PRIMARY_COLOR,
    borderWidth: 1.2,
    color: TEXT_COLOR,
  },
  inputDisabled: {
    backgroundColor: FIELD_DISABLED_BG,
    color: FIELD_DISABLED_TEXT,
    borderColor: "#FFD70080",
    opacity: 0.85,
  },
  preferenciaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 2,
    gap: 9,
  },
  preferenciaIcon: {
    marginRight: 6,
  },
  opcion: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDEB",
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 6,
    justifyContent: "center",
    marginHorizontal: 3,
    elevation: 1,
    gap: 5,
  },
  opcionSeleccionada: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: "#FFC300",
    elevation: 2,
  },
  opcionTexto: {
    fontWeight: "700",
    color: PRIMARY_COLOR,
    fontSize: 15,
    letterSpacing: 0.1,
  },
  opcionTextoActivo: {
    color: "#fff",
  },
  diasCirculosContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8,
    gap: 7,
  },
  diaCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
  },
  diaCirculoSeleccionado: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: "#FFC300",
  },
  diaCirculoTexto: {
    fontWeight: "700",
    color: PRIMARY_COLOR,
    fontSize: 18,
  },
  diaCirculoTextoSeleccionado: {
    color: "#fff",
  },
  boton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 15,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  botonTexto: {
    color: TEXT_COLOR,
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
});

export default RutinaScreen;
