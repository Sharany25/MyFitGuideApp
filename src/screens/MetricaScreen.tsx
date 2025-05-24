import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, ScrollView, StyleSheet,
  RefreshControl, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface MetricasScreenProps {
  onComplete: (metricas: {
    genero: string;
    altura: number;
    peso: number;
    objetivo: string;
    alergias: string[];
    presupuesto: number;
  }) => void;
  initialObjetivo?: string;
}

const MetricasScreen: React.FC<MetricasScreenProps> = ({ onComplete, initialObjetivo = '' }) => {
  const [genero, setGenero] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [objetivo, setObjetivo] = useState(initialObjetivo);
  const [alergias, setAlergias] = useState<string[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!genero) return Alert.alert('Error', 'Por favor ingresa tu género.');
    if (!altura) return Alert.alert('Error', 'Por favor ingresa tu altura.');
    if (isNaN(parseFloat(altura))) return Alert.alert('Error', 'La altura debe ser un número válido.');
    if (!peso) return Alert.alert('Error', 'Por favor ingresa tu peso.');
    if (isNaN(parseFloat(peso))) return Alert.alert('Error', 'El peso debe ser un número válido.');
    if (!objetivo) return Alert.alert('Error', 'Por favor ingresa tu objetivo.');
    if (!presupuesto) return Alert.alert('Error', 'Por favor ingresa tu presupuesto.');
    if (isNaN(parseFloat(presupuesto))) return Alert.alert('Error', 'El presupuesto debe ser un número válido.');

    const metricaData = {
      genero,
      altura: parseFloat(altura),
      peso: parseFloat(peso),
      objetivo,
      alergias: alergias.filter(Boolean),
      presupuesto: parseFloat(presupuesto),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch('http://192.168.1.12:3000/MyFitGuide/openai/dieta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricaData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Datos enviados correctamente');
        setGenero('');
        setAltura('');
        setPeso('');
        setObjetivo('');
        setAlergias([]);
        setPresupuesto('');
        onComplete(metricaData);
      } else {
        Alert.alert('Error', data.message || 'Hubo un error al enviar los datos');
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      Alert.alert('Error', 'Hubo un error al enviar los datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAlergia = () => {
    if (alergias.length >= 5) {
      Alert.alert('Error', 'Solo puedes ingresar hasta 5 alergias');
      return;
    }
    setAlergias([...alergias, '']);
  };

  const handleAlergiaChange = (index: number, value: string) => {
    const updated = [...alergias];
    updated[index] = value;
    setAlergias(updated);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>MyFitGuide Dieta!</Text>

        <InputWithIcon
          icon="person-outline"
          placeholder="Género (Ejemplo: Hombre)"
          value={genero}
          onChangeText={setGenero}
          autoFocus
        />
        <InputWithIcon
          icon="arrow-up-circle-outline"
          placeholder="Altura (cm)"
          value={altura}
          onChangeText={setAltura}
          keyboardType="numeric"
        />
        <InputWithIcon
          icon="fitness-outline"
          placeholder="Peso (kg)"
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
        />
        <InputWithIcon
          icon="trending-up-outline"
          placeholder="Objetivo (Ej: Perder peso)"
          value={objetivo}
          onChangeText={setObjetivo}
          editable={true}
        />
        <InputWithIcon
          icon="cash-outline"
          placeholder="Presupuesto semanal $"
          value={presupuesto}
          onChangeText={setPresupuesto}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Alergias Alimenticias (opcional)</Text>
        {alergias.map((alergia, index) => (
          <InputWithIcon
            key={index}
            icon="alert-circle-outline"
            placeholder={`Alergia ${index + 1}`}
            value={alergia}
            onChangeText={(text) => handleAlergiaChange(index, text)}
          />
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddAlergia}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Agregar Alergia</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.submitButton, animatedStyle]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            onPressIn={() => (scale.value = withSpring(0.95))}
            onPressOut={() => (scale.value = withSpring(1))}
            style={styles.submitButtonContent}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Enviar Dieta a IA'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const InputWithIcon = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoFocus = false,
  editable = true,
}: {
  icon: any;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  autoFocus?: boolean;
  editable?: boolean;
}) => (
  <View style={styles.inputGroup}>
    <Ionicons name={icon} size={24} style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#D1D1D6"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoFocus={autoFocus}
      editable={editable}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f7',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  icon: {
    marginRight: 15,
    color: '#28a745',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 25,
    paddingVertical: 8,
    marginVertical: 20,
    justifyContent: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  submitButtonContent: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MetricasScreen;
