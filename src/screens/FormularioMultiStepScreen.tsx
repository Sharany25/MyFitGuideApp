import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import RegistroScreen from '../screens/RegistroScreen';
import MetricasScreen from '../screens/MetricaScreen';
import RutinaScreen from '../screens/RutinaScreen';

type FormularioMultiStepScreenProps = {
  onFinish: () => void;
};

const FormularioMultiStepScreen: React.FC<FormularioMultiStepScreenProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const handleRegistroSuccess = (nombreFromRegistro: string, idFromRegistro: number) => {
    setNombre(nombreFromRegistro);
    setUserId(idFromRegistro);
    setStep(2);
  };

  const handleMetricasComplete = (metricas: {
    genero: string;
    altura: number;
    peso: number;
    objetivo: string;
    alergias: string[];
    presupuesto: number;
  }) => {
    setObjetivo(metricas.objetivo); // Guardar objetivo para pasar a Rutina
    setStep(3);
  };

  const handleRutinaComplete = () => {
    onFinish();
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <RegistroScreen onRegisterSuccess={handleRegistroSuccess} />
      )}

      {step === 2 && userId !== null && (
        <MetricasScreen
          onComplete={handleMetricasComplete}
          initialObjetivo={objetivo} // opcional: para mostrar si ya estaba escrito
        />
      )}

      {step === 3 && (
        <RutinaScreen
          nombre={nombre}
          objetivo={objetivo}
          onComplete={handleRutinaComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default FormularioMultiStepScreen;
