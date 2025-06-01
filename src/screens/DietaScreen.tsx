import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import ProgressStepper from "../components/ProgressStepper";
import { Ionicons } from "@expo/vector-icons";
import CustomToast from "../components/CustomToast";
import { TextInput } from "react-native";

const { width, height } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Rutina">;

const opcionesPreferencia = ["gimnasio", "casa", "calistenia"];

const PRIMARY_COLOR = "#00C27F";
const TEXT_COLOR = "#1F2937";
const BG_COLOR = "#F9FAFB";

const RutinaScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  // Acepta userId como string SIEMPRE
  const { userId, nombre, objetivo } = route.params as {
    userId: string; // <-- Aquí es string, igual que en tu backend
    nombre: string;
    objetivo: string;
  };

  const [edad, setEdad] = useState("");
  const [preferenciaSeleccionada, setPreferenciaSeleccionada] = useState("");
  const [dias, setDias] = useState("");
  const [lesiones, setLesiones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Solo números en edad
  const handleEdadChange = (val: string) => setEdad(val.replace(/[^0-9]/g, ""));

  const generarRutina = async () => {
    // Validación de campos obligatorios
    if (!userId || !nombre || !edad || !objetivo || !preferenciaSeleccionada || !dias) {
      setShowError(true);
      return;
    }
    const edadNum = parseInt(edad, 10);
    const diasNum = parseInt(dias, 10);

    if (isNaN(edadNum) || edadNum <= 0) {
      setShowError(true);
      return;
    }
    if (isNaN(diasNum) || diasNum < 1 || diasNum > 7) {
      setShowError(true);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("http://192.168.1.5:3000/MyFitGuide/prueba-rutina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // <-- Así, como string SIEMPRE
          nombre,
          edad: edadNum,
          objetivo,
          preferencias: [preferenciaSeleccionada],
          dias: diasNum,
          lesiones,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setEdad("");
          setPreferenciaSeleccionada("");
          setDias("");
          setLesiones("");
          navigation.replace("Tabs", {
            userId, // Lo pasas tal cual como string a Tabs
            nombre,
            edad,
            objetivo,
            genero: "",
            altura: "",
            peso: "",
            tipoRegistro: "nuevo",
          });
        }, 1000);
      } else {
        setShowError(true);
      }
    } catch (error) {
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputWithIcon = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    editable = true,
    multiline = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: "default" | "numeric";
    editable?: boolean;
    multiline?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Ionicons name={icon} size={22} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
      <TextInput
        style={[
          styles.input,
          !editable && styles.inputDisabled,
          multiline && { minHeight: 40, textAlignVertical: "top" },
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor="#A0A0A0"
        multiline={multiline}
        blurOnSubmit={false}
        returnKeyType={multiline ? "done" : "next"}
      />
    </View>
  );

  // Selector interactivo de días (círculos)
  const renderDiasSelector = () => (
    <View style={styles.diasCirculosContainer}>
      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
        <TouchableOpacity
          key={num}
          style={[
            styles.diaCirculo,
            dias === num.toString() && styles.diaCirculoSeleccionado,
          ]}
          onPress={() => setDias(num.toString())}
        >
          <Text
            style={[
              styles.diaCirculoTexto,
              dias === num.toString() && styles.diaCirculoTextoSeleccionado,
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : height * 0.05}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.appName}>MyFitGuide</Text>
          <ProgressStepper currentStep="Rutina" />
          <Text style={styles.subtitle}>Diseñemos tu rutina ideal</Text>

          <InputWithIcon
            icon="person-outline"
            placeholder="Nombre"
            value={nombre}
            onChangeText={() => {}}
            editable={false}
          />
          <InputWithIcon
            icon="calendar-outline"
            placeholder="Edad"
            value={edad}
            onChangeText={handleEdadChange}
            keyboardType="numeric"
          />
          <InputWithIcon
            icon="flag-outline"
            placeholder="Objetivo"
            value={objetivo}
            onChangeText={() => {}}
            editable={false}
          />

          <Text style={styles.label}>¿Dónde prefieres entrenar?</Text>
          <View style={styles.preferenciaContainer}>
            {opcionesPreferencia.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.opcion,
                  preferenciaSeleccionada === item && styles.opcionSeleccionada,
                ]}
                onPress={() => setPreferenciaSeleccionada(item)}
              >
                <Text
                  style={[
                    styles.opcionTexto,
                    preferenciaSeleccionada === item && styles.opcionTextoActivo,
                  ]}
                >
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>¿Cuántos días quieres entrenar?</Text>
          {renderDiasSelector()}

          <InputWithIcon
            icon="medkit-outline"
            placeholder="¿Tienes lesiones? (opcional)"
            value={lesiones}
            onChangeText={setLesiones}
            multiline={true}
          />

          <TouchableOpacity
            style={[styles.boton, isSubmitting && { backgroundColor: "#94d3a2" }]}
            onPress={generarRutina}
            disabled={isSubmitting}
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
    padding: width * 0.05,
    paddingBottom: 40,
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
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_COLOR,
    marginBottom: 8,
    marginTop: 10,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    paddingVertical: 12,
  },
  inputDisabled: {
    color: "#6b7280",
  },
  preferenciaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  opcion: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 13,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    alignItems: "center",
  },
  opcionSeleccionada: {
    backgroundColor: PRIMARY_COLOR,
  },
  opcionTexto: {
    fontWeight: "600",
    color: TEXT_COLOR,
  },
  opcionTextoActivo: {
    color: "#FFFFFF",
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
    borderColor: "#009966",
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
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RutinaScreen;
