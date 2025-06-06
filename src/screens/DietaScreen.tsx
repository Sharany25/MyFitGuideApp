import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';
import { useDieta } from '../hooks/useDieta';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dieta'>;

const DietaScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { userId, nombre } = route.params as { userId: string; nombre: string };

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino' | ''>('');
  const [presupuesto, setPresupuesto] = useState('');
  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);

  const { enviarDieta, loading, error, success } = useDieta();

  const handleAddAlergia = () => {
    if (alergiaInput.trim()) {
      setAlergias([...alergias, alergiaInput.trim()]);
      setAlergiaInput('');
    }
  };

  const handleRemoveAlergia = (index: number) => {
    setAlergias(alergias.filter((_, i) => i !== index));
  };

  const handleSiguiente = async () => {
    if (!peso || !altura || !objetivo || !genero || !presupuesto) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const presupuestoNum = parseFloat(presupuesto);

    if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(presupuestoNum)) {
      Alert.alert('Error', 'Peso, altura y presupuesto deben ser números válidos.');
      return;
    }

    const result = await enviarDieta({
      userId,
      genero: genero as 'masculino' | 'femenino',
      altura: alturaNum,
      peso: pesoNum,
      objetivo,
      alergias,
      presupuesto: presupuestoNum,
    });

    if (result) {
      Alert.alert('Éxito', 'Datos de dieta guardados correctamente');
      navigation.replace('Rutina', { userId, nombre, objetivo });
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Tu información corporal y dieta</Text>
      <ProgressStepper currentStep="Dieta" />

      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />
      <TextInput
        style={styles.input}
        placeholder="Altura (cm)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setAltura}
      />
      <TextInput
        style={styles.input}
        placeholder="Objetivo (ej. bajar grasa, ganar masa)"
        value={objetivo}
        onChangeText={setObjetivo}
      />

      <Text style={styles.subtitulo}>Género</Text>
      <View style={styles.sexoContainer}>
        {[
          { value: 'masculino', label: 'Masculino' },
          { value: 'femenino', label: 'Femenino' },
        ].map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.opcionSexo,
              genero === value && styles.opcionSeleccionada,
            ]}
            onPress={() => setGenero(value as 'masculino' | 'femenino')}
          >
            <Text
              style={[
                styles.opcionTexto,
                genero === value && styles.opcionTextoActivo,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Presupuesto mensual (ej. 2500)"
        keyboardType="numeric"
        value={presupuesto}
        onChangeText={setPresupuesto}
      />

      <Text style={styles.subtitulo}>Alergias alimenticias</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Añadir alergia (ej. gluten)"
          value={alergiaInput}
          onChangeText={setAlergiaInput}
        />
        <TouchableOpacity onPress={handleAddAlergia} style={styles.agregarBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.alergiasList}>
        {alergias.map((a, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.alergiaChip}
            onPress={() => handleRemoveAlergia(idx)}
          >
            <Text style={{ color: '#fff' }}>{a} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.boton, loading && { backgroundColor: '#94d3a2' }]}
        onPress={handleSiguiente}
        disabled={loading}
      >
        <Text style={styles.botonTexto}>
          {loading ? 'Enviando...' : 'Siguiente'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#10b981',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
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
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  opcionSexo: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  opcionSeleccionada: {
    backgroundColor: '#10b981',
  },
  opcionTexto: {
    fontWeight: '600',
    color: '#374151',
  },
  opcionTextoActivo: {
    color: '#fff',
  },
  alergiasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  alergiaChip: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  agregarBtn: {
    backgroundColor: '#10b981',
    marginLeft: 6,
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DietaScreen;
