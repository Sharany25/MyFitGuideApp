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
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';
const BORDER_COLOR = '#E5E7EB';
const BG_COLOR = '#F9FAFB';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dieta'>;

const DietaScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { userId, nombre } = route.params as { userId: number; nombre: string };

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [sexo, setSexo] = useState<'Hombre' | 'Mujer' | ''>('');
  const [cargando, setCargando] = useState(false);

  const handleSiguiente = async () => {
    if (!peso || !altura || !objetivo || !sexo) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (isNaN(pesoNum) || isNaN(alturaNum)) {
      Alert.alert('Error', 'Peso y altura deben ser números válidos.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/metrica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: userId,
          peso: pesoNum,
          altura: alturaNum,
          sexo,
          objetivo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Métricas registradas correctamente');
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
          <Text style={styles.helperText}>Ingresa tu peso actual en kilogramos.</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 70"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />

          <Text style={styles.label}>Altura (cm)</Text>
          <Text style={styles.helperText}>Ingresa tu altura actual en centímetros.</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 175"
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
          />

          <Text style={styles.label}>Objetivo</Text>
          <Text style={styles.helperText}>¿Cuál es tu meta? Ejemplo: bajar grasa, ganar masa.</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. bajar grasa, ganar masa"
            value={objetivo}
            onChangeText={setObjetivo}
          />

          <Text style={styles.label}>Sexo</Text>
          <Text style={styles.helperText}>Selecciona tu sexo para personalizar tus recomendaciones.</Text>
          <View style={styles.sexoContainer}>
            {['Hombre', 'Mujer'].map((value) => {
              const isSelected = sexo === value;
              const color = value === 'Hombre' ? '#3B82F6' : '#EC4899';
              const icon = value === 'Hombre' ? 'gender-male' : 'gender-female';
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setSexo(value as 'Hombre' | 'Mujer')}
                  style={[
                    styles.generoBoton,
                    {
                      backgroundColor: isSelected ? color : '#E5E7EB',
                      borderColor: color,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={24}
                    color={isSelected ? '#fff' : color}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
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
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  generoBoton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DietaScreen;
