import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ConfirmacionEnvioProps {
  visible: boolean;
  tipo: "queja" | "sugerencia";
  onClose: () => void;
}

const COLORS = {
  queja: "#ff595e",
  sugerencia: "#00C27F",
  card: "#fff",
  fondo: "rgba(12,32,35,0.81)",
};

const ConfirmacionEnvio: React.FC<ConfirmacionEnvioProps> = ({
  visible,
  tipo,
  onClose,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Image
            source={require("../../assets/Email.jpg")}
            style={styles.img}
          />
          <Ionicons
            name={tipo === "queja" ? "alert-circle-outline" : "bulb-outline"}
            size={48}
            color={tipo === "queja" ? COLORS.queja : COLORS.sugerencia}
            style={{ marginBottom: 2 }}
          />
          <Text
            style={[
              styles.title,
              { color: tipo === "queja" ? COLORS.queja : COLORS.sugerencia },
            ]}
          >
            {tipo === "queja" ? "¡Queja enviada!" : "¡Sugerencia enviada!"}
          </Text>
          <Text style={styles.message}>
            {tipo === "queja"
              ? "Gracias por compartir tu queja. Nuestro equipo la revisará y, si ingresaste tu correo, te contactaremos con una respuesta."
              : "¡Gracias por tu sugerencia! Valoramos tus aportaciones para seguir mejorando MyFitGuide."}
          </Text>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              {
                backgroundColor:
                  tipo === "queja" ? COLORS.queja : COLORS.sugerencia,
              },
            ]}
            onPress={onClose}
            activeOpacity={0.87}
          >
            <Text style={styles.confirmText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: width * 0.86,
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
    elevation: 9,
    shadowColor: "#00C27F",
    shadowOpacity: 0.13,
    shadowRadius: 12,
  },
  img: {
    width: 54,
    height: 54,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00C27F",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 7,
    marginBottom: 3,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 15.2,
    color: "#23272b",
    textAlign: "center",
    marginTop: 9,
    marginBottom: 19,
    lineHeight: 21.5,
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 13,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16.3,
    letterSpacing: 0.13,
  },
});

export default ConfirmacionEnvio;
