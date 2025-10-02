import React, { useState, useRef, useEffect } from "react";
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
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { enviarQuejaSugerencia } from "../hooks/useQuejaSugerencia";
import ConfirmacionEnvio from "../components/ConfirmacionEnvio";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = StackScreenProps<RootStackParamList, "QuejaSugerencia">;

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

const QuejaSugerenciaScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [tipo, setTipo] = useState<"queja" | "sugerencia">("queja");
  const [mensaje, setMensaje] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [categoria, setCategoria] = useState<"acceso" | "funcionalidad">("acceso");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState<false | "queja" | "sugerencia">(false);
  
  const formAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(formAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
    }).start();
  }, []);

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
    <LinearGradient colors={PALETTE.background_gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={27} color={PALETTE.text_primary} />
          </TouchableOpacity>
          
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{transform: [{translateY: formAnim}]}}>
                <BlurView intensity={50} tint="dark" style={styles.card}>
                  <View style={styles.header}>
                    <Feather name="message-square" size={width * 0.12} color={PALETTE.primary} />
                    <Text style={styles.title}>Soporte MyFitGuide</Text>
                    <Text style={styles.subtitle}>Tu opinión nos ayuda a mejorar.</Text>
                  </View>

                  <SegmentedControl
                    label="Tipo"
                    options={[{ label: 'Queja', value: 'queja' }, { label: 'Sugerencia', value: 'sugerencia' }]}
                    selectedValue={tipo}
                    onValueChange={setTipo}
                  />

                  <CustomInput
                    label="Mensaje"
                    value={mensaje}
                    onChangeText={setMensaje}
                    placeholder="Escribe aquí tu mensaje..."
                    multiline
                    height={120}
                  />

                  <CustomInput
                    label="Correo Electrónico"
                    value={emailContacto}
                    onChangeText={setEmailContacto}
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <SegmentedControl
                    label="Categoría"
                    options={[{ label: 'Acceso', value: 'acceso' }, { label: 'Funcionalidad', value: 'funcionalidad' }]}
                    selectedValue={categoria}
                    onValueChange={setCategoria}
                  />

                  <TouchableOpacity
                    style={{ opacity: !mensaje.trim() || loading ? 0.6 : 1, marginTop: 20 }}
                    onPress={handleEnviar}
                    disabled={!mensaje.trim() || loading}
                  >
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.btn}>
                        {loading ? <ActivityIndicator color={PALETTE.dark} /> : <Text style={styles.btnText}>Enviar</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
            </Animated.View>
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
      </SafeAreaView>
    </LinearGradient>
  );
};

const SegmentedControl = ({ label, options, selectedValue, onValueChange }: any) => (
    <View style={{marginVertical: 10}}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.switchRow}>
            {options.map((option: any) => (
                <TouchableOpacity
                    key={option.value}
                    style={[styles.switchButton, selectedValue === option.value && styles.switchSelected]}
                    onPress={() => onValueChange(option.value)}
                >
                    <Text style={[styles.switchText, selectedValue === option.value && styles.switchSelectedText]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const CustomInput = ({ label, ...props }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    { height: props.multiline ? props.height : 55, textAlignVertical: props.multiline ? 'top' : 'center' },
                    isFocused && styles.inputFocused,
                ]}
                placeholderTextColor={PALETTE.text_secondary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
        </View>
    );
};

export default QuejaSugerenciaScreen;

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 40) + 15,
    left: 20,
    zIndex: 20,
    backgroundColor: PALETTE.inactive,
    borderRadius: 25,
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: width * 0.06,
    color: PALETTE.text_primary,
    fontWeight: "bold",
    marginTop: 15,
  },
  subtitle: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.04,
    textAlign: "center",
    marginTop: 5,
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    padding: 5,
  },
  switchButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  switchSelected: {
    backgroundColor: PALETTE.primary,
  },
  switchText: {
    color: PALETTE.text_secondary,
    fontWeight: "bold",
    fontSize: 15,
  },
  switchSelectedText: {
    color: PALETTE.dark,
  },
  label: {
    color: PALETTE.text_secondary,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    color: PALETTE.text_primary,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingTop: 15,
  },
  inputFocused: {
    borderColor: PALETTE.primary,
  },
  btn: {
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
  },
  btnText: {
    color: PALETTE.dark,
    fontWeight: "bold",
    fontSize: 18,
  },
});
