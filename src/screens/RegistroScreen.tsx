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
    import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
    import { RootStackParamList } from '../navigation/StackNavigator';
    import ProgressStepper from '../components/ProgressStepper';
    import UbicacionAlerta from '../components/UbicacionAlerta';
    import DateTimePicker from '@react-native-community/datetimepicker';
    import CustomToast from '../components/CustomToast';
    import { useRegistro } from '../hooks/useRegistro';
    import { useUser } from '../context/UserContext';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const { width } = Dimensions.get('window');
    const PRIMARY_COLOR = '#FFD700';
    const TEXT_COLOR = '#111';
    const ERROR_COLOR = '#E53935';

    type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registro'>;

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const RegistroScreen: React.FC = () => {
      const navigation = useNavigation<NavigationProp>();
      const { dispatch } = useUser();

      const [nombre, setNombre] = useState('');
      const [correo, setCorreo] = useState('');
      const [contrasena, setContrasena] = useState('');
      const [contrasenaError, setContrasenaError] = useState<string | null>(null);
      const [fechaNacimiento, setFechaNacimiento] = useState('');
      const [fechaDate, setFechaDate] = useState<Date | null>(null);
      const [showDatePicker, setShowDatePicker] = useState(false);
      const [ubicacion, setUbicacion] = useState<string | null>(null);
      const [aceptoTerminos, setAceptoTerminos] = useState(false);
      const [passwordVisible, setPasswordVisible] = useState(false);
      const [loadingLocation, setLoadingLocation] = useState(false);
      const [showUbicacionModal, setShowUbicacionModal] = useState(false);

      const {
        registrar,
        loading,
        success: showSuccess,
        error: showError,
        setSuccess: setShowSuccess,
        setError: setShowError,
      } = useRegistro();

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
        if (contrasena.length < 8) {
          setContrasenaError('La contraseña debe tener al menos 8 caracteres.');
          setShowError(true);
          return;
        } else {
          setContrasenaError(null);
        }

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

        const emailToSend = correo.toLowerCase();

        const userId = await registrar({
          nombre,
          correoElectronico: emailToSend,
          contraseña: contrasena,
          fechaNacimiento: fechaISO,
          ubicacion,
        });

        if (userId) {
          const userProfile = {
            userId,
            nombre,
            correoElectronico: emailToSend,
            fechaNacimiento: fechaISO,
            ubicacion: ubicacion ?? undefined,
          };

          dispatch({ type: 'SET_USER', payload: userProfile });

          await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));

          setTimeout(() => {
            setShowSuccess(false);
            navigation.replace('Dieta', {
              nombre,
              userId,
            });
          }, 1200);
        }
      };

      return (
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
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

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                  left={<TextInput.Icon icon="account" color={PRIMARY_COLOR} />}
                  autoCapitalize="words"
                  returnKeyType="next"
                  theme={{ colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR } }}
                />
                <TextInput
                  label="Correo electrónico"
                  value={correo}
                  onChangeText={text => setCorreo(text.toLowerCase())}
                  keyboardType="email-address"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="email" color={PRIMARY_COLOR} />}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  theme={{ colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR } }}
                />
                <TextInput
                  label="Contraseña"
                  value={contrasena}
                  onChangeText={text => {
                    setContrasena(text);
                    if (text.length < 8) {
                      setContrasenaError('La contraseña debe tener al menos 8 caracteres.');
                    } else {
                      setContrasenaError(null);
                    }
                  }}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" color={PRIMARY_COLOR} />}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? 'eye' : 'eye-off'}
                      color={PRIMARY_COLOR}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                  returnKeyType="done"
                  theme={{ colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR } }}
                />
                {contrasenaError && (
                  <Text style={styles.errorText}>{contrasenaError}</Text>
                )}

                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                  <TextInput
                    label="Fecha de nacimiento"
                    value={fechaDate ? formatDate(fechaDate) : ''}
                    style={styles.input}
                    mode="outlined"
                    editable={false}
                    left={<TextInput.Icon icon="calendar" color={PRIMARY_COLOR} />}
                    pointerEvents="none"
                    theme={{ colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR } }}
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
                  labelStyle={{ color: PRIMARY_COLOR }}
                  theme={{ colors: { primary: PRIMARY_COLOR } }}
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
                    Acepto los <Text style={{ textDecorationLine: 'underline', color: PRIMARY_COLOR }}>términos y condiciones</Text>
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handleRegistro}
                  disabled={!aceptoTerminos}
                  style={styles.registerButton}
                  contentStyle={{ paddingVertical: 10 }}
                  loading={loading}
                  labelStyle={{ color: TEXT_COLOR, fontWeight: 'bold' }}
                  theme={{ colors: { primary: PRIMARY_COLOR, text: TEXT_COLOR } }}
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
        backgroundColor: '#FFFDEB',
      },
      scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 50,
        backgroundColor: '#FFFDEB',
      },
      appName: {
        textAlign: 'center',
        fontSize: width * 0.08,
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
        marginBottom: 10,
        marginTop: 10,
        letterSpacing: 1.2,
      },
      subtitle: {
        fontSize: width * 0.04,
        color: TEXT_COLOR,
        textAlign: 'center',
        marginBottom: 20,
      },
      card: {
        backgroundColor: '#FFF',
        borderRadius: 22,
        elevation: 4,
        padding: 12,
        borderColor: PRIMARY_COLOR,
        borderWidth: 1,
        shadowColor: PRIMARY_COLOR,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
      },
      input: {
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        color: TEXT_COLOR,
        fontSize: 16,
      },
      sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: TEXT_COLOR,
        marginBottom: 10,
      },
      buttonOutline: {
        borderColor: PRIMARY_COLOR,
        borderWidth: 2,
        marginBottom: 15,
        backgroundColor: '#FFFDEB',
      },
      checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 6,
      },
      checkboxLabel: {
        fontSize: 14,
        color: TEXT_COLOR,
      },
      registerButton: {
        backgroundColor: PRIMARY_COLOR,
        marginTop: 12,
        borderRadius: 12,
        shadowColor: PRIMARY_COLOR,
        shadowOpacity: 0.09,
        shadowRadius: 8,
        elevation: 2,
      },
      errorText: {
        color: ERROR_COLOR,
        fontSize: 13,
        marginBottom: 7,
        marginTop: -7,
        marginLeft: 6,
      },
    });

    export default RegistroScreen;
