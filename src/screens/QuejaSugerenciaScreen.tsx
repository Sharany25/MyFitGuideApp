import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { enviarQuejaSugerencia } from "../hooks/useQuejaSugerencia";
import ConfirmacionEnvio from "../components/ConfirmacionEnvio";

type Props = StackScreenProps<RootStackParamList, "QuejaSugerencia">;

const COLORS = {
  fondo: "#f7fafd",
  card: "#fff",
  borde: "#00C27F",
  secundario: "#1FBF7C",
  grad: "#00C27F",
  grad2: "#23c6d8",
  text: "#20293c",
  btn: "#13cc89",
  btnText: "#fff",
  switch: "#e7f5ef",
  switchSel: "#1FBF7C",
  input: "#e5f7ef",
  label: "#00A76A",
};

const QuejaSugerenciaScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [tipo, setTipo] = useState<"queja" | "sugerencia">("queja");
  const [mensaje, setMensaje] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [categoria, setCategoria] = useState<"acceso" | "funcionalidad">("acceso");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState<false | "queja" | "sugerencia">(false);

  const { width } = useWindowDimensions();

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      Keyboard.dismiss();
      return;
    }
    setLoading(true);
    try {
      await enviarQuejaSugerencia({
        tipo,
        mensaje,
        emailContacto,
        categoria,
        usuarioId: userId,
      });
      setEnviado(tipo);
      setMensaje("");
      setEmailContacto("");
      Keyboard.dismiss();
      setTimeout(() => {
        setEnviado(false);
        navigation.goBack();
      }, 2200);
    } catch (error) {
      alert("No se pudo enviar. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.fondo }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* Botón flotante para regresar */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={27} color={COLORS.grad} />
      </TouchableOpacity>
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingVertical: 18,
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View
          style={[
            styles.card,
            {
              maxWidth: Math.min(440, width - 22),
              marginTop: 18,
              marginBottom: 32,
            },
          ]}
        >
          <View style={styles.header}>
            <Image
              source={require("../../assets/Email.jpg")}
              style={styles.logo}
            />
            <Text style={styles.title}>Soporte MyFitGuide</Text>
          </View>
          <Text style={styles.subtitle}>Envíanos tu queja o sugerencia</Text>

          {/* Selector tipo */}
          <View style={styles.switchRow}>
            <TouchableOpacity
              style={[
                styles.switchButton,
                tipo === "queja" && styles.switchSelected,
              ]}
              onPress={() => setTipo("queja")}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.switchText,
                  tipo === "queja" && styles.switchSelectedText,
                ]}
              >
                Queja
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchButton,
                tipo === "sugerencia" && styles.switchSelected,
              ]}
              onPress={() => setTipo("sugerencia")}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.switchText,
                  tipo === "sugerencia" && styles.switchSelectedText,
                ]}
              >
                Sugerencia
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mensaje */}
          <Text style={styles.label}>Mensaje</Text>
          <TextInput
            style={styles.inputArea}
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Escribe tu queja o sugerencia..."
            placeholderTextColor="#92bda8"
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="done"
          />

          {/* Email */}
          <Text style={styles.label}>Email (opcional)</Text>
          <TextInput
            style={styles.input}
            value={emailContacto}
            onChangeText={setEmailContacto}
            placeholder="tu@email.com"
            placeholderTextColor="#a1b7bc"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
          />

          {/* Categoría */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.switchRow}>
            <TouchableOpacity
              style={[
                styles.switchButton,
                categoria === "acceso" && styles.switchSelected,
              ]}
              onPress={() => setCategoria("acceso")}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.switchText,
                  categoria === "acceso" && styles.switchSelectedText,
                ]}
              >
                Acceso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchButton,
                categoria === "funcionalidad" && styles.switchSelected,
              ]}
              onPress={() => setCategoria("funcionalidad")}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.switchText,
                  categoria === "funcionalidad" && styles.switchSelectedText,
                ]}
              >
                Funcionalidad
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[
              styles.btn,
              { opacity: !mensaje.trim() || loading ? 0.6 : 1 },
            ]}
            onPress={handleEnviar}
            disabled={!mensaje.trim() || loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Enviando..." : "Enviar"}
            </Text>
          </TouchableOpacity>
        </View>
        <ConfirmacionEnvio
          visible={!!enviado}
          tipo={enviado === "queja" ? "queja" : "sugerencia"}
          onClose={() => {
            setEnviado(false);
            navigation.goBack();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuejaSugerenciaScreen;

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: Platform.OS === "android" ? 26 : 50,
    left: 15,
    zIndex: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    elevation: 6,
    shadowColor: "#00C27F",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    padding: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    elevation: 7,
    alignSelf: "center",
    width: "98%",
    shadowColor: "#00C27F",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grad,
    marginBottom: 7,
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    color: COLORS.grad,
    fontWeight: "bold",
    letterSpacing: 0.1,
  },
  subtitle: {
    color: COLORS.secundario,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 8,
  },
  switchButton: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: COLORS.switch,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cdeedd",
  },
  switchSelected: {
    backgroundColor: COLORS.switchSel,
    borderColor: COLORS.grad,
  },
  switchText: {
    color: "#5e6e72",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.08,
  },
  switchSelectedText: {
    color: "#fff",
  },
  label: {
    color: COLORS.label,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: 8,
    backgroundColor: COLORS.input,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
    fontSize: 15.2,
  },
  inputArea: {
    borderWidth: 1,
    borderColor: COLORS.grad2,
    borderRadius: 10,
    backgroundColor: COLORS.input,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 15.2,
    minHeight: 80,
    textAlignVertical: "top",
  },
  btn: {
    backgroundColor: COLORS.secundario,
    borderRadius: 13,
    paddingVertical: 15,
    marginTop: 16,
    alignItems: "center",
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: COLORS.grad,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  btnText: {
    color: COLORS.btnText,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.18,
  },
});
