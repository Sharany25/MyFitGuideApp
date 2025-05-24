import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Card,
} from 'react-native-paper';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#00C27F';

type RegistroScreenProps = {
  onRegisterSuccess: (nombre: string, userId: number) => void;
};

const RegistroScreen: React.FC<RegistroScreenProps> = ({ onRegisterSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const solicitarUbicacion = async () => {
    setLoadingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Permiso de ubicación denegado');
      setLoadingLocation(false);
      return;
    }
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUbicacion(`${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`);
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRegistro = async () => {
    if (!aceptoTerminos) {
      Alert.alert('Atención', 'Debes aceptar los términos y condiciones');
      return;
    }
    if (!nombre || !correo || !contrasena || !fechaNacimiento) {
      Alert.alert('Atención', 'Por favor completa todos los campos');
      return;
    }

    const fechaParts = fechaNacimiento.split('/');
    if (fechaParts.length !== 3) {
      Alert.alert('Error', 'La fecha de nacimiento debe tener formato DD/MM/YYYY.');
      return;
    }

    const fechaISO = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
    if (isNaN(new Date(fechaISO).getTime())) {
      Alert.alert('Error', 'La fecha de nacimiento es inválida.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.12:3000/MyFitGuide/Usuarios', {
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
        Alert.alert('Error', error.message || 'Error al registrar usuario.');
        return;
      }

      const data = await response.json();
      console.log('Usuario registrado:', data);

      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({ token: 'fake-token', isNewUser: true })
      );

      // Llamar callback para que el padre maneje el siguiente paso
      onRegisterSuccess(nombre, data.idUsuario || data.id || 0);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al registrar. Intenta nuevamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image
            source={require('../../assets/Logo.png')}
            style={[styles.logo, { width: width * 0.22, height: width * 0.22 }]}
            resizeMode="contain"
          />
          <Text style={styles.title}>myFitGuide</Text>
          <Text style={styles.subtitle}>Crea tu cuenta para comenzar tu viaje fitness</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
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
              left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="email" size={24} color="#000" />} />}
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
            <TextInput
              label="Fecha de nacimiento"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              placeholder="DD/MM/YYYY"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="calendar" />}
              keyboardType="numbers-and-punctuation"
            />

            <Button
              mode="outlined"
              icon="map-marker"
              onPress={solicitarUbicacion}
              loading={loadingLocation}
              style={styles.buttonOutline}
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              Obtener ubicación actual
            </Button>
            {ubicacion && <Text style={styles.ubicacion}>Ubicación: {ubicacion}</Text>}

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={aceptoTerminos ? 'checked' : 'unchecked'}
                onPress={() => setAceptoTerminos(!aceptoTerminos)}
                color={PRIMARY_COLOR}
              />
              <Text style={styles.checkboxLabel}>Acepto los términos y condiciones</Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: '#f3fdf9',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    marginBottom: 10,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    padding: 10,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  buttonOutline: {
    borderColor: PRIMARY_COLOR,
    marginVertical: 10,
  },
  ubicacion: {
    fontSize: width * 0.04,
    color: '#34495e',
    marginBottom: 10,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#333',
  },
  registerButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
  },
});

export default RegistroScreen;
