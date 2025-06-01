// components/ErrorToast.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ErrorToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, visible, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(onHide);
        }, 2000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }]}>
      <Ionicons name="close-circle-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
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
    backgroundColor: "#e53935",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ErrorToast;
