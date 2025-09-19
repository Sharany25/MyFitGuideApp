import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export const EmptyChatAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/Anima Bot.json')}
        autoPlay
        loop
        style={{ width: width * 0.6, height: width * 0.6 }}
      />
      <Text style={styles.text}>
        Soy tu asistente virtual para el uso de MyFitGuide{'\n'}
        ¡Estoy aquí para ayudarte!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { marginTop: 20, color: '#2CFD89', fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
