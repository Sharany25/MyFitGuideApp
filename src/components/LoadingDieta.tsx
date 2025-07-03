import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#00C27F',
  bg: '#FAFAFA',
  text: '#232946',
  sub: '#777',
};

const alimentos = [
  'nutrition-outline',
  'restaurant',
  'fast-food-outline',
  'leaf-outline',
  'water-outline',
];

export const LoadingDieta = ({ text = "Cargando dieta generada..." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [iconIdx, setIconIdx] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setIconIdx(prev => (prev + 1) % alimentos.length);
    }, 850);

    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }], alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={alimentos[iconIdx] as any} size={SCREEN_WIDTH * 0.19} color={COLORS.primary} />
      </Animated.View>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.sub}>Por favor espera unos segundos...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  text: {
    marginTop: 28,
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.056,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  sub: {
    marginTop: 10,
    fontSize: SCREEN_WIDTH * 0.041,
    color: COLORS.sub,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.04,
  },
});
