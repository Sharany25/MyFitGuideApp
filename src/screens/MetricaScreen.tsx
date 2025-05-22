import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, ScrollView, StyleSheet,
  TouchableOpacity, Animated, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricasScreenProps {
  navigation: any;
  onComplete: () => void;
  idUsuario: number; // Se espera recibir esto desde Registro
}

const MetricasScreen: React.FC<MetricasScreenProps> = ({ navigation, onComplete, idUsuario }) => {
  const [genero, setGenero] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [scaleAnim] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);

  const handleSubmit = async () => {
    if (!genero || !altura || !peso || !objetivo || !presupuesto) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    if (
      isNaN(parseFloat(altura)) ||
      isNaN(parseFloat(peso)) ||
      isNaN(parseFloat(presupuesto))
    ) {
      Alert.alert('Error', 'Altura, peso y presupuesto deben ser números válidos.');
      return;
    }

    const metricaData = {
      idUsuario,
      genero,
      altura: parseFloat(altura),
      peso: parseFloat(peso),
      objetivo,
      alergias: alergias.join(','),
      presupuesto: parseFloat(presupuesto),
    };

    try {
      const response = await fetch('http://192.168.1.12:3000/MyFitGuide/Metricas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricaData),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Datos enviados correctamente');

        // Limpia campos
        setGenero('');
        setAltura('');
        setPeso('');
        setObjetivo('');
        setAlergias([]);
        setPresupuesto('');

        // Navega a siguiente paso
        onComplete();
      } else {
        Alert.alert('Error', data.message || 'Hubo un error al enviar los datos');
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      Alert.alert('Error', 'Hubo un error al enviar los datos');
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>MyFitGuide Dieta!</Text>

      <View style={styles.inputGroup}>
        <Ionicons name="person-outline" size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Género (Ejemplo: Hombre)"
          placeholderTextColor="#D1D1D6"
          value={genero}
          onChangeText={setGenero}
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="arrow-up-circle-outline" size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Altura (cm)"
          placeholderTextColor="#D1D1D6"
          value={altura}
          onChangeText={setAltura}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="fitness-outline" size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Peso (kg)"
          placeholderTextColor="#D1D1D6"
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="trending-up-outline" size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Objetivo (Ej: Perder peso)"
          placeholderTextColor="#D1D1D6"
          value={objetivo}
          onChangeText={setObjetivo}
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="cash-outline" size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Presupuesto semanal $"
          placeholderTextColor="#D1D1D6"
          value={presupuesto}
          onChangeText={setPresupuesto}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Alergias Alimenticias (opcional)</Text>
      {alergias.map((alergia, index) => (
        <View key={index} style={styles.inputGroup}>
          <Ionicons name="alert-circle-outline" size={24} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={`Alergia ${index + 1}`}
            placeholderTextColor="#D1D1D6"
            value={alergia}
            onChangeText={(value) => handleAlergiaChange(index, value)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddAlergia}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Agregar Alergia</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.submitButton, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.submitButtonContent}
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.submitButtonText}>Enviar Dieta a IA</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

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
  buttonContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonContent: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MetricasScreen;
