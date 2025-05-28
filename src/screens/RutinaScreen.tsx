import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';


type NavigationProp = StackNavigationProp<RootStackParamList, 'Rutina'>;

const opcionesPreferencia = ['gimnasio', 'casa', 'calistenia'];

const RutinaScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { userId, nombre, objetivo } = route.params as {
    userId: number;
    nombre: string;
    objetivo: string;
  };

  const [edad, setEdad] = useState('');
  const [preferenciaSeleccionada, setPreferenciaSeleccionada] = useState('');
  const [dias, setDias] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generarRutina = async () => {
    if (!nombre || !edad || !objetivo || !preferenciaSeleccionada || !dias) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const edadNum = parseInt(edad, 10);
    const diasNum = parseInt(dias, 10);

    if (isNaN(edadNum) || edadNum <= 0) {
      Alert.alert('Error', 'Edad debe ser un número válido mayor a 0.');
      return;
    }

    if (isNaN(diasNum) || diasNum < 1 || diasNum > 7) {
      Alert.alert('Error', 'Días debe estar entre 1 y 7.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/rutinas-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: userId,
          nombre,
          edad: edadNum,
          objetivo,
          preferencias: [preferenciaSeleccionada],
          dias: diasNum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Rutina generada con éxito');
        setEdad('');
        setPreferenciaSeleccionada('');
        setDias('');
        navigation.replace('Home');
      } else {
        Alert.alert('Error', data.message || 'Hubo un error al generar la rutina');
      }
    } catch (error) {
      console.error('Error al generar la rutina:', error);
      Alert.alert('Error', 'Hubo un error al generar la rutina');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Generar Rutina de Entrenamiento</Text>
      <ProgressStepper currentStep="Rutina" />


      <TextInput
        style={[styles.input, styles.inputDisabled]}
        placeholder="Nombre"
        value={nombre}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Edad"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
      />

      <TextInput
        style={[styles.input, styles.inputDisabled]}
        placeholder="Objetivo"
        value={objetivo}
        editable={false}
      />

      <Text style={styles.subtitulo}>Selecciona una preferencia:</Text>
      <View style={styles.preferenciaContainer}>
        {opcionesPreferencia.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.opcion,
              preferenciaSeleccionada === item && styles.opcionSeleccionada,
            ]}
            onPress={() => setPreferenciaSeleccionada(item)}
          >
            <Text
              style={[
                styles.opcionTexto,
                preferenciaSeleccionada === item && styles.opcionTextoActivo,
              ]}
            >
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Días disponibles (1 al 7)"
        value={dias}
        onChangeText={setDias}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.boton, isSubmitting && { backgroundColor: '#94d3a2' }]}
        onPress={generarRutina}
        disabled={isSubmitting}
      >
        <Text style={styles.botonTexto}>
          {isSubmitting ? 'Generando...' : 'Generar Rutina'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  inputDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
  },
  preferenciaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  opcion: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  opcionSeleccionada: {
    backgroundColor: '#3b82f6',
  },
  opcionTexto: {
    fontWeight: '600',
    color: '#374151',
  },
  opcionTextoActivo: {
    color: '#fff',
  },
  boton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RutinaScreen;
