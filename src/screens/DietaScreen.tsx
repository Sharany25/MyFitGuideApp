// screens/DietaScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';

const { width } = Dimensions.get('window');

const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';
const BORDER_COLOR = '#E5E7EB';
const BG_COLOR = '#F9FAFB';

type DietaScreenRouteProp = RouteProp<RootStackParamList, 'Dieta'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'Dieta'>;

const DietaScreen: React.FC = () => {
  const route = useRoute<DietaScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { userId, nombre } = route.params;

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [genero, setGenero] = useState<'Masculino' | 'Femenino' | ''>('');
  const [alergias, setAlergias] = useState<string[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleAlergiaChange = (index: number, text: string) => {
    const nuevas = [...alergias];
    nuevas[index] = text;
    setAlergias(nuevas);
  };

  const handleAgregarAlergia = () => {
    if (alergias.length >= 5) {
      Alert.alert('Límite alcanzado', 'Máximo 5 alergias permitidas.');
      return;
    }
    setAlergias([...alergias, '']);
  };

  const handleSiguiente = async () => {
    if (!peso || !altura || !objetivo || !genero || !presupuesto) {
      Alert.alert('Campos incompletos', 'Completa todos los campos obligatorios.');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const presupuestoNum = parseFloat(presupuesto);

    if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(presupuestoNum)) {
      Alert.alert('Error', 'Peso, altura y presupuesto deben ser números válidos.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/prueba-dieta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genero,
          altura: alturaNum,
          peso: pesoNum,
          objetivo,
          alergias: alergias.filter(Boolean),
          presupuesto: presupuestoNum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Datos enviados correctamente');
        navigation.replace('Rutina', { userId, nombre, objetivo });
      } else {
        Alert.alert('Error', data.message || 'Error al registrar métricas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al enviar los datos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: BG_COLOR }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>MyFitGuide</Text>
        <ProgressStepper currentStep="Dieta" />
        <Text style={styles.subtitle}>Cuéntanos sobre tu cuerpo</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 70"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />

          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 175"
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
          />

          <Text style={styles.label}>Objetivo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Bajar grasa, ganar masa"
            value={objetivo}
            onChangeText={setObjetivo}
          />

          <Text style={styles.label}>Presupuesto semanal ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 500"
            keyboardType="numeric"
            value={presupuesto}
            onChangeText={setPresupuesto}
          />

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.generoContainer}>
            <TouchableOpacity
              style={[
                styles.generoButton,
                genero === 'Masculino' && styles.generoSeleccionado,
              ]}
              onPress={() => setGenero('Masculino')}
            >
              <Ionicons name="male" size={28} color={genero === 'Masculino' ? '#fff' : '#007BFF'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.generoButton,
                genero === 'Femenino' && styles.generoSeleccionadoF,
              ]}
              onPress={() => setGenero('Femenino')}
            >
              <Ionicons name="female" size={28} color={genero === 'Femenino' ? '#fff' : '#E91E63'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Alergias alimenticias (opcional)</Text>
          {alergias.map((alergia, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Alergia ${index + 1}`}
              value={alergia}
              onChangeText={(text) => handleAlergiaChange(index, text)}
            />
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAgregarAlergia}>
            <Text style={styles.addButtonText}>+ Agregar alergia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boton, cargando && { backgroundColor: '#94d3a2' }]}
            onPress={handleSiguiente}
            disabled={cargando}
          >
            <Text style={styles.botonTexto}>
              {cargando ? 'Enviando...' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  appName: {
    textAlign: 'center',
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
    marginTop: 10,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    marginBottom: 10,
  },
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  generoButton: {
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  generoSeleccionado: {
    backgroundColor: '#007BFF',
  },
  generoSeleccionadoF: {
    backgroundColor: '#E91E63',
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  boton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DietaScreen;
