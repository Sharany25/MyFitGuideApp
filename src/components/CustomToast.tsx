// components/CustomToast.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions, PanResponder, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface CustomToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: "success" | "error";
}

const ICONS = {
  success: { name: "checkmark-circle-outline", color: "#fff", bg: "#28a745" },
  error: { name: "close-circle-outline", color: "#fff", bg: "#D90429" },
};

const CustomToast: React.FC<CustomToastProps> = ({ message, visible, onHide, type = "success" }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // ¡IMPORTANTE! Para evitar el error.
      }).start(() => {
        // Auto-hide después de 3 segundos
        setTimeout(() => {
          hide();
        }, 3000);
      });
    }
    // eslint-disable-next-line
  }, [visible]);

  const hide = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: false, // ¡IMPORTANTE!
    }).start(onHide);
  };

  // Permite deslizar hacia arriba para ocultar el Toast
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -40) hide();
        else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  const iconProps = ICONS[type];

  return (
    <Animated.View
      style={[
        styles.toast,
        { transform: [{ translateY }], backgroundColor: iconProps.bg },
      ]}
      {...panResponder.panHandlers}
    >
      <Ionicons name={iconProps.name as any} size={24} color={iconProps.color} style={{ marginRight: 10 }} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 50,
    left: width * 0.1,
    right: width * 0.1,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap",
  },
});

export default CustomToast;
