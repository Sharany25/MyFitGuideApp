// screens/RutinaScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'Rutina'>;

const opcionesPreferencia = ['gimnasio', 'casa', 'calistenia'];

const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';
const BG_COLOR = '#F9FAFB';

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
  const [lesiones, setLesiones] = useState('');
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
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/prueba-rutina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: userId,
          nombre,
          edad: edadNum,
          objetivo,
          preferencias: [preferenciaSeleccionada],
          dias: diasNum,
          lesiones,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Rutina generada con éxito');
        setEdad('');
        setPreferenciaSeleccionada('');
        setDias('');
        setLesiones('');
        navigation.replace('Home', {
          userId,
          nombre,
          edad,
          objetivo,
          genero: '', // Agregar si lo tienes antes
          altura: '', // Agregar si lo tienes antes
          peso: '',   // Agregar si lo tienes antes
          tipoRegistro: 'nuevo',
        });
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

  const InputWithIcon = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    editable = true,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric';
    editable?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Ionicons name={icon} size={22} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG_COLOR }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>MyFitGuide</Text>
        <ProgressStepper currentStep="Rutina" />
        <Text style={styles.subtitle}>Diseñemos tu rutina ideal</Text>

        <InputWithIcon
          icon="person-outline"
          placeholder="Nombre"
          value={nombre}
          onChangeText={() => {}}
          editable={false}
        />
        <InputWithIcon
          icon="calendar-outline"
          placeholder="Edad"
          value={edad}
          onChangeText={setEdad}
          keyboardType="numeric"
        />
        <InputWithIcon
          icon="flag-outline"
          placeholder="Objetivo"
          value={objetivo}
          onChangeText={() => {}}
          editable={false}
        />

        <Text style={styles.label}>¿Dónde prefieres entrenar?</Text>
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

        <InputWithIcon
          icon="calendar-number-outline"
          placeholder="Días disponibles (1 al 7)"
          value={dias}
          onChangeText={setDias}
          keyboardType="numeric"
        />

        <InputWithIcon
          icon="medkit-outline"
          placeholder="¿Tienes lesiones? (opcional)"
          value={lesiones}
          onChangeText={setLesiones}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    paddingVertical: 12,
  },
  inputDisabled: {
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
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  opcionSeleccionada: {
    backgroundColor: PRIMARY_COLOR,
  },
  opcionTexto: {
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  opcionTextoActivo: {
    color: '#FFFFFF',
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

export default RutinaScreen;
