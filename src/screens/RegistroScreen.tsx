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
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import ProgressStepper from '../components/ProgressStepper';
import UbicacionAlerta from '../components/UbicacionAlerta';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomToast from '../components/CustomToast';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';
const TEXT_COLOR = '#1F2937';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registro'>;

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

  // Toasts
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

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
    if (!aceptoTerminos || !nombre || !correo || !contrasena || !fechaNacimiento) {
      setShowError(true);
      return;
    }

    const fechaParts = fechaNacimiento.split('/');
    if (fechaParts.length !== 3) {
      setShowError(true);
      return;
    }
    const fechaISO = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
    if (isNaN(new Date(fechaISO).getTime())) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch('http://192.168.1.5:3000/MyFitGuide/Usuarios', {
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
        setShowError(true);
        return;
      }

      const data = await response.json();

      // Guarda el usuario completo en AsyncStorage para perfil/autologin
      await AsyncStorage.setItem('user', JSON.stringify(data));

      setShowSuccess(true);

      setTimeout(() => {
        navigation.replace('Dieta', {
          nombre,
          // Se asegura de tomar el id correcto: _id, idUsuario o id (¡ajusta esto según tu API!)
          userId: data._id || data.idUsuario || data.id || "",
        });
      }, 1500);
    } catch (error) {
      setShowError(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}
    >
      {/* Toasts */}
      <CustomToast
        message="¡Registro guardado correctamente!"
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        type="success"
      />
      <CustomToast
        message="Error al guardar tus datos. Revisa tus datos."
        visible={showError}
        onHide={() => setShowError(false)}
        type="error"
      />

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
