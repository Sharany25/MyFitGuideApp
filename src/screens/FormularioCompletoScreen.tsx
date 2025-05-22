import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const opcionesPreferencia = ['gimnasio', 'casa', 'calistenia'];

const FormularioCompletoScreen = () => {
  const navigation = useNavigation();

  // Control de pasos
  const [step, setStep] = useState(1);

  // --- Estado formulario 1: Registro ---
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(null);

  // Mostrar/Ocultar contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // DatePicker show/hide
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Estado formulario 2: Métricas ---
  const [idUsuario, setIdUsuario] = useState(null);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivel, setNivel] = useState('');

  // --- Estado formulario 3: Rutina ---
  const [nombreRutina, setNombreRutina] = useState('');
  const [edad, setEdad] = useState('');
  const [objetivoRutina, setObjetivoRutina] = useState('');
  const [preferenciaSeleccionada, setPreferenciaSeleccionada] = useState('');
  const [dias, setDias] = useState('');

  // --- Función envío formulario 1: Registro ---
  const handleRegistro = async () => {
    if (!nombre || !correo || !contrasena || !fechaNacimiento) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      const fechaString = fechaNacimiento.toISOString().split('T')[0];

      const response = await fetch('http://192.168.1.12:3000/MyFitGuide/Usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correoElectonico: correo,
          password: contrasena,
          fechaNacimiento: fechaString,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Registro exitoso', 'Usuario registrado correctamente');
        setIdUsuario(data.idUsuario);
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  // --- Función envío formulario 2: Métricas ---
  const handleMetricas = async () => {
    if (!peso || !altura || !objetivo || !nivel) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (idUsuario === null) {
      Alert.alert('Error', 'ID de usuario no disponible');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (isNaN(pesoNum) || pesoNum <= 0) {
      Alert.alert('Error', 'Peso debe ser un número válido mayor a 0');
      return;
    }
    if (isNaN(alturaNum) || alturaNum <= 0) {
      Alert.alert('Error', 'Altura debe ser un número válido mayor a 0');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.12:3000/MyFitGuide/metricas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario,
          peso: pesoNum,
          altura: alturaNum,
          objetivo,
          nivel,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Métricas guardadas', 'Datos guardados correctamente');
        setStep(3);
      } else {
        Alert.alert('Error', data.message || 'No se pudo guardar las métricas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  // --- Función envío formulario 3: Rutina ---
  const handleRutina = async () => {
    if (
      !nombreRutina ||
      !edad ||
      !objetivoRutina ||
      !preferenciaSeleccionada ||
      !dias
    ) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (idUsuario === null) {
      Alert.alert('Error', 'ID de usuario no disponible');
      return;
    }

    const edadNum = parseInt(edad, 10);
    const diasNum = parseInt(dias, 10);

    if (isNaN(edadNum) || edadNum <= 0) {
      Alert.alert('Error', 'Edad debe ser un número válido mayor a 0');
      return;
    }
    if (isNaN(diasNum) || diasNum < 1 || diasNum > 7) {
      Alert.alert('Error', 'Días debe estar entre 1 y 7');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.12:3000/MyFitGuide/rutinas-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario,
          nombre: nombreRutina,
          edad: edadNum,
          objetivo: objetivoRutina,
          preferencias: [preferenciaSeleccionada],
          dias: diasNum,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Rutina generada con éxito');
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.message || 'Error al generar rutina');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  // --- Handler para fecha ---
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // en ios permanece abierto
    if (selectedDate) {
      setFechaNacimiento(selectedDate);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {step === 1 && (
        <>
          <Text style={styles.titulo}>Registro de Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Contraseña"
              secureTextEntry={!mostrarPassword}
              value={contrasena}
              onChangeText={setContrasena}
            />
            <TouchableOpacity
              onPress={() => setMostrarPassword(!mostrarPassword)}
              style={styles.botonMostrarPassword}
            >
              <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: fechaNacimiento ? '#000' : '#9ca3af' }}>
              {fechaNacimiento
                ? fechaNacimiento.toLocaleDateString()
                : 'Fecha de nacimiento'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={fechaNacimiento || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

          <TouchableOpacity style={styles.boton} onPress={handleRegistro}>
            <Text style={styles.botonTexto}>Siguiente</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.titulo}>Datos Métricos</Text>
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
            placeholder="Objetivo (ej. Ganar masa, Definir)"
            value={objetivo}
            onChangeText={setObjetivo}
          />
          <TextInput
            style={styles.input}
            placeholder="Nivel (ej. Principiante, Intermedio)"
            value={nivel}
            onChangeText={setNivel}
          />
          <TouchableOpacity style={styles.boton} onPress={handleMetricas}>
            <Text style={styles.botonTexto}>Siguiente</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.titulo}>Generar Rutina</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombreRutina}
            onChangeText={setNombreRutina}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />
          <TextInput
            style={styles.input}
            placeholder="Objetivo (ej. Ganar masa, Definir)"
            value={objetivoRutina}
            onChangeText={setObjetivoRutina}
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
            placeholder="Días disponibles (1-7)"
            keyboardType="numeric"
            value={dias}
            onChangeText={setDias}
          />

          <TouchableOpacity style={styles.boton} onPress={handleRutina}>
            <Text style={styles.botonTexto}>Generar Rutina</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  boton: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonMostrarPassword: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  preferenciaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  opcion: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9ca3af',
  },
  opcionSeleccionada: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  opcionTexto: {
    color: '#4b5563',
    fontWeight: '600',
  },
  opcionTextoActivo: {
    color: '#fff',
  },
});

export default FormularioCompletoScreen;
