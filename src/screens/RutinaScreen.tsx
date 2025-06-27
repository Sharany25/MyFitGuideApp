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
import { useRoute, useNavigation, RouteProp, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import CustomToast from "../components/CustomToast";
import { useRutina } from "../hooks/useRutina";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const PRIMARY_COLOR = "#28a745";
const TEXT_COLOR = "#232946";
const FIELD_DISABLED_BG = "#F4F4F4";
const FIELD_DISABLED_TEXT = "#A4A4A4";

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
  const { userId, nombre, objetivo } = route.params || {
    userId: "",
    nombre: "",
    objetivo: "",
  };

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
        userId,
        nombre,
        objetivo,
        edad,
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

      dispatch({ type: "SET_USER", payload: updatedUser });
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

  // Días en grid responsivo (4+3)
  const renderDiasGrid = () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    return (
      <View style={styles.diasGridContainer}>
        <View style={styles.diasGridRow}>
          {items.slice(0, 4).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.diaCirculo,
                dias === num && styles.diaCirculoSeleccionado,
              ]}
              onPress={() => setDias(num)}
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
        <View style={styles.diasGridRow}>
          {items.slice(4).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.diaCirculo,
                dias === num && styles.diaCirculoSeleccionado,
              ]}
              onPress={() => setDias(num)}
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
      </View>
    );
  };

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
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.appName}>MyFitGuide</Text>
            <ProgressStepper currentStep="Rutina" />
            <Text style={styles.subtitle}>Diseñemos tu rutina ideal</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                mode="flat"
                label=""
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
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                mode="flat"
                label=""
                placeholder="Ejemplo: 22"
                value={edad}
                keyboardType="numeric"
                onChangeText={handleEdadChange}
                style={styles.input}
                left={<TextInput.Icon icon="calendar-outline" color={PRIMARY_COLOR} />}
                theme={{ colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR } }}
                maxLength={2}
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Objetivo</Text>
              <TextInput
                mode="flat"
                label=""
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
            </View>

            <Text style={styles.label}>¿Dónde prefieres entrenar?</Text>
            <View style={styles.preferenciaGridContainer}>
              {opcionesPreferencia.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.preferenciaCard,
                    preferenciaSeleccionada === item.value && styles.preferenciaCardActiva,
                  ]}
                  onPress={() => setPreferenciaSeleccionada(item.value)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={30}
                    color={preferenciaSeleccionada === item.value ? "#fff" : PRIMARY_COLOR}
                    style={{ marginBottom: 5 }}
                  />
                  <Text
                    style={[
                      styles.preferenciaCardTexto,
                      preferenciaSeleccionada === item.value && styles.preferenciaCardTextoActivo,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>¿Cuántos días quieres entrenar?</Text>
            {renderDiasGrid()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>¿Tienes lesiones? (opcional)</Text>
              <View style={styles.lesionesBox}>
                <Ionicons name="medkit" size={24} color={PRIMARY_COLOR} style={styles.lesionesIcon} />
                <TextInput
                  mode="flat"
                  label=""
                  value={lesiones}
                  onChangeText={setLesiones}
                  style={styles.lesionesInput}
                  theme={{
                    colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR, placeholder: "#B6B6B6" },
                  }}
                  multiline
                  placeholder="Escribe si tienes alguna lesión..."
                  placeholderTextColor="#B6B6B6"
                  textAlignVertical="top"
                  underlineColor="transparent"
                  underlineColorAndroid="transparent"
                  numberOfLines={3}
                  blurOnSubmit
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.boton, isSubmitting && { backgroundColor: "#92dda6" }]}
              onPress={onGenerarRutina}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Text style={styles.botonTexto}>
                {isSubmitting ? "Generando..." : "Generar Rutina"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const CARD_SIZE = width < 400 ? width * 0.25 : 90;
const CARD_FONT = width < 400 ? 13 : 15;
const CIRC_SIZE = width < 380 ? 37 : 45;
const CIRC_FONT = width < 380 ? 17 : 20;

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
    fontSize: width * 0.045,
    color: TEXT_COLOR,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
    marginTop: 7,
  },
  inputContainer: {
    marginBottom: 10,
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
  inputDisabled: {
    backgroundColor: FIELD_DISABLED_BG,
    color: FIELD_DISABLED_TEXT,
    borderColor: "#eee",
    opacity: 0.8,
  },
  // PREFERENCIAS GRID
  preferenciaGridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 10,
    gap: 10,
  },
  preferenciaCard: {
    width: CARD_SIZE,
    height: CARD_SIZE + 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#eee",
    elevation: 2,
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 1,
  },
  preferenciaCardActiva: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
    elevation: 3,
  },
  preferenciaCardTexto: {
    fontWeight: "700",
    color: PRIMARY_COLOR,
    fontSize: CARD_FONT,
    textAlign: "center",
    marginTop: 3,
    letterSpacing: 0.08,
  },
  preferenciaCardTextoActivo: {
    color: "#fff",
  },
  // DIAS EN GRID
  diasGridContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8,
    gap: 7,
  },
  diasGridRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
  },
  diaCirculo: {
    width: CIRC_SIZE,
    height: CIRC_SIZE,
    borderRadius: CIRC_SIZE / 2,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
    elevation: 2,
  },
  diaCirculoSeleccionado: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  diaCirculoTexto: {
    fontWeight: "700",
    color: PRIMARY_COLOR,
    fontSize: CIRC_FONT,
    textAlign: "center",
  },
  diaCirculoTextoSeleccionado: {
    color: "#fff",
  },
  // INPUT LESIONES mejorado
  lesionesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 70,
    marginTop: 2,
    marginBottom: 5,
  },
  lesionesIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  lesionesInput: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "transparent",
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 0,
    marginTop: 0,
  },
  boton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    elevation: 2,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

export default RutinaScreen;
