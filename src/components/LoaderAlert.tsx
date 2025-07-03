import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLORS = {
  primary: "#00C27F",
  bg: "#F7F9FA",
  text: "#232946",
  sub: "#777",
};

const iconos = [
  "barbell-outline",
  "fitness-outline",
  "body-outline",
  "flash-outline",
  "star-outline",
];

export const LoaderAlert = ({
  text = "Cargando rutina personalizada...",
  sub = "Esto puede tardar unos segundos.",
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [iconIdx, setIconIdx] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setIconIdx((prev) => (prev + 1) % iconos.length);
    }, 650);

    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={alertStyles.container}>
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
          marginBottom: 18,
        }}
      >
        <Ionicons name={iconos[iconIdx] as any} size={width * 0.17} color={COLORS.primary} />
      </Animated.View>
      <Text style={alertStyles.text}>{text}</Text>
      <Text style={alertStyles.sub}>{sub}</Text>
    </View>
  );
};

const alertStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    flex: 1,
  },
  text: {
    marginTop: 0,
    fontWeight: "bold",
    fontSize: width * 0.054,
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  sub: {
    marginTop: 8,
    fontSize: width * 0.042,
    color: COLORS.sub,
    fontWeight: "500",
    textAlign: "center",
  },
});
