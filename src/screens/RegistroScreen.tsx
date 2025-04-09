import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  RadioButton,
  Button,
  Checkbox,
  Card,
} from 'react-native-paper';
import * as Location from 'expo-location';

interface RegistroScreenProps {
  onRegisterSuccess: () => void;
}

const RegistroScreen: React.FC<RegistroScreenProps> = ({ onRegisterSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [alergias, setAlergias] = useState('');
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [nivel, setNivel] = useState('');
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  const solicitarUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUbicacion(`${location.coords.latitude}, ${location.coords.longitude}`);
  };

  const handleRegistro = () => {
    if (aceptoTerminos && nombre && correo && contrasena && genero && nivel) {
      onRegisterSuccess();
    } else {
      alert('Por favor completa todos los campos requeridos y acepta los términos.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/Logo.png')} 
            style={styles.logo}
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
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />
            <TextInput
              label="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />
            <TextInput
              label="Fecha de nacimiento"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              placeholder="DD/MM/AAAA"
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />

            <Text style={styles.sectionTitle}>Género</Text>
            <RadioButton.Group onValueChange={setGenero} value={genero}>
              <View style={styles.radioGroup}>
                <RadioButton.Item label="Masculino" value="masculino" />
                <RadioButton.Item label="Femenino" value="femenino" />
                <RadioButton.Item label="Otro" value="otro" />
              </View>
            </RadioButton.Group>

            <TextInput
              label="Alergias"
              value={alergias}
              onChangeText={setAlergias}
              style={styles.input}
              left={<TextInput.Icon icon="alert-circle-outline" />}
            />

            <Button
              mode="outlined"
              onPress={solicitarUbicacion}
              style={styles.buttonOutline}
              icon="map-marker"
            >
              Obtener ubicación actual
            </Button>
            {ubicacion && <Text style={styles.ubicacion}>Ubicación: {ubicacion}</Text>}

            <Text style={styles.sectionTitle}>Nivel de experiencia</Text>
            <RadioButton.Group onValueChange={setNivel} value={nivel}>
              <View style={styles.radioGroup}>
                <RadioButton.Item label="1: Principiante" value="1" />
                <RadioButton.Item label="2: Intermedio" value="2" />
                <RadioButton.Item label="3: Avanzado" value="3" />
              </View>
            </RadioButton.Group>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={aceptoTerminos ? 'checked' : 'unchecked'}
                onPress={() => setAceptoTerminos(!aceptoTerminos)}
              />
              <Text style={styles.checkboxLabel}>Acepto los términos y condiciones</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleRegistro}
              disabled={!aceptoTerminos}
              style={styles.registerButton}
            >
              Registrarse
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const PRIMARY_COLOR = '#00C27F';

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
    marginBottom: 10,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  buttonOutline: {
    borderColor: PRIMARY_COLOR,
    marginVertical: 10,
  },
  ubicacion: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10,
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
    paddingVertical: 6,
  },
});

export default RegistroScreen;
