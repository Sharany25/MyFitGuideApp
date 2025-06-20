import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';
import CustomToast from '../components/CustomToast';
import { useDieta } from '../hooks/useDieta';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#FFD700';
const SECONDARY_COLOR = '#111';
const BG_COLOR = '#FFFDEB';
const MALE_COLOR = '#428AF8';
const FEMALE_COLOR = '#FF69B4';

type DietaRouteProp = RouteProp<RootStackParamList, 'Dieta'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'Dieta'>;

const DietaScreen: React.FC = () => {
  const route = useRoute<DietaRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { userId, nombre } = route.params || { userId: '', nombre: '' };

  const { state, dispatch } = useUser();

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino' | ''>('');
  const [presupuesto, setPresupuesto] = useState('');
  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const { enviarDieta, loading, error } = useDieta();

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
      setShowError(true);
      return;
    }
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const presupuestoNum = parseFloat(presupuesto);
    if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(presupuestoNum)) {
      setShowError(true);
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
      const updatedUser = {
        ...state.user,
        userId,
        nombre,
        genero,
        altura, 
        peso, 
        objetivo,
        alergias,
        presupuesto,
        correoElectronico: state.user?.correoElectronico ?? '',
        fechaNacimiento: state.user?.fechaNacimiento ?? '',
        ubicacion: state.user?.ubicacion ?? '',
        edad: state.user?.edad ?? '',
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace('Rutina', { userId, nombre, objetivo });
      }, 1200);
    } else {
      setShowError(true);
    }
  };

  return (
    <>
      <CustomToast
        message="¡Datos de dieta guardados correctamente!"
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        type="success"
      />
      <CustomToast
        message={error || "Verifica tus datos e inténtalo de nuevo."}
        visible={showError}
        onHide={() => setShowError(false)}
        type="error"
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: BG_COLOR }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>Tu información corporal y dieta</Text>
          <ProgressStepper currentStep="Dieta" />

          {/* ----------- Campos del formulario ----------- */}
          <TextInput
            mode="outlined"
            label="Peso (kg)"
            placeholder="Ejemplo: 70"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
            style={styles.input}
            left={<TextInput.Icon icon="weight-kilogram" color={PRIMARY_COLOR} />}
            theme={{ colors: { primary: PRIMARY_COLOR, text: SECONDARY_COLOR } }}
          />

          <TextInput
            mode="outlined"
            label="Altura (cm)"
            placeholder="Ejemplo: 170"
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
            style={styles.input}
            left={<TextInput.Icon icon="human-male-height" color={PRIMARY_COLOR} />}
            theme={{ colors: { primary: PRIMARY_COLOR, text: SECONDARY_COLOR } }}
          />

          <TextInput
            mode="outlined"
            label="Objetivo"
            placeholder="Ejemplo: bajar grasa, ganar masa"
            value={objetivo}
            onChangeText={setObjetivo}
            style={styles.input}
            left={<TextInput.Icon icon="target" color={PRIMARY_COLOR} />}
            theme={{ colors: { primary: PRIMARY_COLOR, text: SECONDARY_COLOR } }}
          />

          <Text style={styles.subtitulo}>Género</Text>
          <View style={styles.sexoContainer}>
            <TouchableOpacity
              style={[
                styles.generoOpcion,
                genero === 'masculino' && styles.generoSeleccionadoM,
              ]}
              onPress={() => setGenero('masculino')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="male"
                size={26}
                color={genero === 'masculino' ? '#fff' : MALE_COLOR}
                style={styles.iconGenero}
              />
              <Text style={[
                styles.textGenero,
                genero === 'masculino' && { color: '#fff' }
              ]}>
                Masculino
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.generoOpcion,
                genero === 'femenino' && styles.generoSeleccionadoF,
              ]}
              onPress={() => setGenero('femenino')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="female"
                size={26}
                color={genero === 'femenino' ? '#fff' : FEMALE_COLOR}
                style={styles.iconGenero}
              />
              <Text style={[
                styles.textGenero,
                genero === 'femenino' && { color: '#fff' }
              ]}>
                Femenino
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            mode="outlined"
            label="Presupuesto Semanal"
            placeholder="Ejemplo: 500"
            keyboardType="numeric"
            value={presupuesto}
            onChangeText={setPresupuesto}
            style={styles.input}
            left={<TextInput.Icon icon="cash-multiple" color={PRIMARY_COLOR} />}
            theme={{ colors: { primary: PRIMARY_COLOR, text: SECONDARY_COLOR } }}
          />

          <Text style={styles.subtitulo}>Alergias alimenticias</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TextInput
              mode="outlined"
              label="Añadir alergia"
              placeholder="Ejemplo: gluten"
              value={alergiaInput}
              onChangeText={setAlergiaInput}
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              left={<TextInput.Icon icon="alert-circle-outline" color={PRIMARY_COLOR} />}
              theme={{ colors: { primary: PRIMARY_COLOR, text: SECONDARY_COLOR } }}
            />
            <TouchableOpacity onPress={handleAddAlergia} style={styles.agregarBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={26} color={SECONDARY_COLOR} />
            </TouchableOpacity>
          </View>
          <View style={styles.alergiasList}>
            {alergias.map((a, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.alergiaChip}
                onPress={() => handleRemoveAlergia(idx)}
                activeOpacity={0.85}
              >
                <Text style={{ color: SECONDARY_COLOR, fontWeight: 'bold' }}>
                  {a} <Ionicons name="close-circle" size={16} color={SECONDARY_COLOR} />
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.boton, loading && { backgroundColor: "#F5E172" }]}
            onPress={handleSiguiente}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.botonTexto}>
              {loading ? 'Enviando...' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: BG_COLOR,
  },
  titulo: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: PRIMARY_COLOR,
    letterSpacing: 0.3,
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    color: SECONDARY_COLOR,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 14,
    borderRadius: 10,
    fontSize: 16,
    borderColor: PRIMARY_COLOR,
    borderWidth: 1.2,
    color: SECONDARY_COLOR,
  },
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
    gap: 12,
  },
  generoOpcion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#eee',
    backgroundColor: '#FFFDEB',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginHorizontal: 4,
    elevation: 1,
    gap: 8,
  },
  generoSeleccionadoM: {
    backgroundColor: MALE_COLOR,
    borderColor: MALE_COLOR,
    elevation: 3,
  },
  generoSeleccionadoF: {
    backgroundColor: FEMALE_COLOR,
    borderColor: FEMALE_COLOR,
    elevation: 3,
  },
  iconGenero: {
    marginRight: 4,
  },
  textGenero: {
    fontWeight: '700',
    color: SECONDARY_COLOR,
    fontSize: 15,
    letterSpacing: 0.1,
  },
  alergiasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  alergiaChip: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 5,
    elevation: 2,
    borderColor: SECONDARY_COLOR,
    borderWidth: 1,
  },
  agregarBtn: {
    backgroundColor: PRIMARY_COLOR,
    marginLeft: 8,
    borderRadius: 22,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  boton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 15,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 25,
    elevation: 2,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  botonTexto: {
    color: SECONDARY_COLOR,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default DietaScreen;
