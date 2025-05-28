import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Card,
} from 'react-native-paper';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';
import UbicacionAlerta from '../components/UbicacionAlerta';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Registro'>;

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const RegistroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fechaDate, setFechaDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showUbicacionModal, setShowUbicacionModal] = useState(false);

  const solicitarUbicacion = async () => {
    setLoadingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setShowUbicacionModal(true);
      setLoadingLocation(false);
      return;
    }
    try {
      await Location.getCurrentPositionAsync({});
      setUbicacion('OK');
      setShowUbicacionModal(true);
    } catch (e) {
      setShowUbicacionModal(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRegistro = async () => {
    if (!aceptoTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    if (!nombre || !correo || !contrasena || !fechaNacimiento) {
      alert('Por favor completa todos los campos');
      return;
    }

    const fechaParts = fechaNacimiento.split('/');
    if (fechaParts.length !== 3) {
      alert('La fecha de nacimiento debe tener formato DD/MM/YYYY.');
      return;
    }

    const fechaISO = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
    if (isNaN(new Date(fechaISO).getTime())) {
      alert('La fecha de nacimiento es inválida.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/Usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correoElectronico: correo,
          contraseña: contrasena,
          fechaNacimiento: fechaISO,
          ubicacion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Error al registrar usuario.');
        return;
      }

      const data = await response.json();
      await AsyncStorage.setItem('userData', JSON.stringify({ token: 'fake-token', isNewUser: true }));

      navigation.replace('Dieta', {
        nombre,
        userId: data.idUsuario || data.id || 0,
      });
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al registrar. Intenta nuevamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>MyFitGuide</Text>
        <ProgressStepper currentStep="Registro" />
        <Text style={styles.subtitle}>Bienvenido, registra tu información</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <TextInput
              label="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              autoCapitalize="words"
            />
            <TextInput
              label="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              label="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry={!passwordVisible}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye' : 'eye-off'}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Fecha de nacimiento"
                value={fechaDate ? formatDate(fechaDate) : ''}
                style={styles.input}
                mode="outlined"
                editable={false}
                left={<TextInput.Icon icon="calendar" />}
                pointerEvents="none"
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={fechaDate || new Date(2000, 0, 1)}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFechaDate(selectedDate);
                    const formatted = formatDate(selectedDate);
                    setFechaNacimiento(formatted);
                  }
                }}
              />
            )}

            <Button
              mode="outlined"
              icon="map-marker"
              onPress={solicitarUbicacion}
              loading={loadingLocation}
              style={styles.buttonOutline}
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              Activar ubicación
            </Button>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={aceptoTerminos ? 'checked' : 'unchecked'}
                onPress={() => setAceptoTerminos(!aceptoTerminos)}
                color={PRIMARY_COLOR}
              />
              <Text style={styles.checkboxLabel}>
                Acepto los <Text style={{ textDecorationLine: 'underline' }}>términos y condiciones</Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleRegistro}
              disabled={!aceptoTerminos}
              style={styles.registerButton}
              contentStyle={{ paddingVertical: 10 }}
            >
              Registrarse
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <UbicacionAlerta
        visible={showUbicacionModal}
        onClose={() => setShowUbicacionModal(false)}
        onConfirm={() => setShowUbicacionModal(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 3,
    padding: 10,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  buttonOutline: {
    borderColor: PRIMARY_COLOR,
    marginVertical: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: TEXT_COLOR,
    fontSize: 13,
  },
  registerButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    marginTop: 5,
  },
});

export default RegistroScreen;
