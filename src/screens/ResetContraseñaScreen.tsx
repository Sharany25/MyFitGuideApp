import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/StackNavigator";
import SuccessToast from "../components/SuccessToast";
import ErrorToast from "../components/ErrorToast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useForgotPassword } from "../hooks/useForgotPassword";
import { useResetPassword } from "../hooks/useResetPassword";

const { width, height } = Dimensions.get("window");

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  inactive: 'rgba(255, 255, 255, 0.2)',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  danger: '#FF4757',
  dark: '#1D2A32',
};

const CustomInput = ({ control, name, rules, placeholder, iconName, errors, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences', rightIcon, rightIconPress, customKey }: any) => {
    const hasError = errors[name];
    const [isFocused, setIsFocused] = useState(false);
  
    return (
      <View style={{ marginBottom: 15 }} key={customKey}>
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <View style={[styles.inputContainer, hasError ? styles.inputErrorBorder : isFocused && styles.inputFocusedBorder]}>
                <Feather name={iconName} size={20} color={hasError ? PALETTE.danger : isFocused ? PALETTE.primary : PALETTE.text_secondary} style={styles.inputIcon} />
                <TextInput
                  placeholder={placeholder}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={() => { onBlur(); setIsFocused(false); }}
                  onFocus={() => setIsFocused(true)}
                  style={styles.input}
                  placeholderTextColor={PALETTE.text_secondary}
                  secureTextEntry={secureTextEntry}
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  maxLength={rules?.maxLength?.value}

                  {...(keyboardType === 'number-pad' && {
                    onChangeText: (text) => onChange(text.replace(/[^0-9]/g, '')),
                  })}
                />
                {rightIcon && (
                  <TouchableOpacity onPress={rightIconPress} style={styles.rightIcon}>
                    <Feather name={rightIcon} size={22} color={PALETTE.text_secondary} />
                  </TouchableOpacity>
                )}
              </View>
              {hasError && <Text style={styles.errorText}>{hasError.message}</Text>}
            </View>
          )}
        />
      </View>
    );
  };

type ForgotPasswordFormData = {
  email: string;
};

type ResetPasswordFormData = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetContraseñaScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [step, setStep] = useState<'emailInput' | 'tokenInput'>('emailInput');
  const [emailForDisplay, setEmailForDisplay] = useState<string>('');

  const { forgotPassword, loading: forgotLoading, error: forgotError } = useForgotPassword();
  const { resetPassword, loading: resetLoading, error: resetError } = useResetPassword();

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { control: emailControl, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors }, reset: resetEmailForm } = useForm<ForgotPasswordFormData>();

  const { 
    control: resetControl, 
    handleSubmit: handleResetSubmit, 
    formState: { errors: resetErrors }, 
    watch, 
    reset: resetResetForm, 
    setValue, 
    clearErrors 
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });
  const newPasswordValue = watch('newPassword');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const onEmailSubmit = async (data: ForgotPasswordFormData) => {
    const success = await forgotPassword(data.email.toLowerCase());
    if (success) {
      setEmailForDisplay(data.email.toLowerCase());
      setStep('tokenInput');
      setToastMessage('Hemos enviado un código de 6 dígitos al correo proporcionado.');
      setShowSuccessToast(true);
      resetEmailForm();
      fadeAnim.setValue(0);
      clearErrors('token');
      setValue('token', '');
    } else {
      setToastMessage(forgotError || 'No se pudo procesar la solicitud. Intenta de nuevo.');
      setShowErrorToast(true);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      setToastMessage('Las contraseñas no coinciden.');
      setShowErrorToast(true);
      return;
    }

    const success = await resetPassword(data.token, data.newPassword);
    if (success) {
      setToastMessage('Contraseña restablecida exitosamente. ¡Inicia sesión con tu nueva contraseña!');
      setShowSuccessToast(true);
      resetResetForm();
      setTimeout(() => {
        setShowSuccessToast(false);
        navigation.replace('Login');
      }, 2000);
    } else {
      setToastMessage(resetError || 'Error al restablecer la contraseña. Verifica el código o inténtalo de nuevo.');
      setShowErrorToast(true);
    }
  };

  const handleGoBackToEmailInput = () => {
    setStep('emailInput');
    resetResetForm();
    setValue('token', '');
    clearErrors('token');
    fadeAnim.setValue(0);
  };

  return (
    <>
      <SuccessToast message={toastMessage} visible={showSuccessToast} onHide={() => setShowSuccessToast(false)} />
      <ErrorToast message={toastMessage} visible={showErrorToast} onHide={() => setShowErrorToast(false)} />

      <LinearGradient colors={PALETTE.background_gradient} style={styles.base}>
        <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color={PALETTE.text_primary} />
              </TouchableOpacity>
              <Text style={styles.title}>
                {step === 'emailInput' ? 'Olvidé mi Contraseña' : 'Restablecer Contraseña'}
              </Text>
            </View>

            <BlurView intensity={50} tint="dark" style={styles.formContainer}>
              <Animated.View style={[styles.descriptionContainer, { opacity: fadeAnim }]}>
                {step === 'emailInput' ? (
                  <Text style={styles.descriptionText}>
                    Ingresa el correo electrónico asociado a tu cuenta para recibir un código de restablecimiento.
                  </Text>
                ) : (
                  <Text style={styles.descriptionText}>
                    Hemos enviado un código de 6 dígitos a <Text style={styles.boldEmail}>{emailForDisplay}</Text>. Introduce el código aquí y establece tu nueva contraseña.
                  </Text>
                )}
              </Animated.View>

              {step === 'emailInput' ? (
                <>
                  <CustomInput
                    control={emailControl}
                    errors={emailErrors}
                    name="email"
                    rules={{
                      required: "El correo electrónico es obligatorio",
                      pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" },
                    }}
                    placeholder="Correo Electrónico"
                    iconName="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={handleEmailSubmit(onEmailSubmit)} disabled={forgotLoading} style={styles.buttonWrapper}>
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.button}>
                      {forgotLoading ? (
                        <ActivityIndicator color={PALETTE.dark} />
                      ) : (
                        <Text style={styles.buttonText}>Enviar Código</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <CustomInput
                    control={resetControl}
                    errors={resetErrors}
                    name="token"
                    rules={{
                      required: "El código es obligatorio",
                      minLength: { value: 6, message: "El código debe tener 6 dígitos" },
                      maxLength: { value: 6, message: "El código debe tener 6 dígitos" },
                      pattern: { value: /^\d{6}$/, message: "El código solo debe contener dígitos (0-9)." },
                    }}
                    placeholder="Código de 6 dígitos"
                    iconName="key"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    customKey={`token-input-${step}`}
                  />
                  <CustomInput
                    control={resetControl}
                    errors={resetErrors}
                    name="newPassword"
                    rules={{
                      required: "La nueva contraseña es obligatoria",
                      minLength: { value: 8, message: "Mínimo 8 caracteres" },
                    }}
                    placeholder="Nueva Contraseña"
                    iconName="lock"
                    secureTextEntry={!passwordVisible}
                    rightIcon={passwordVisible ? "eye-off" : "eye"}
                    rightIconPress={() => setPasswordVisible(!passwordVisible)}
                  />
                  <CustomInput
                    control={resetControl}
                    errors={resetErrors}
                    name="confirmPassword"
                    rules={{
                      required: "Confirma tu contraseña",
                      validate: (value: string) =>
                        value === newPasswordValue || "Las contraseñas no coinciden",
                    }}
                    placeholder="Confirmar Contraseña"
                    iconName="lock"
                    secureTextEntry={!passwordVisible}
                    rightIcon={passwordVisible ? "eye-off" : "eye"}
                    rightIconPress={() => setPasswordVisible(!passwordVisible)}
                  />
                  <TouchableOpacity onPress={handleResetSubmit(onResetSubmit)} disabled={resetLoading} style={styles.buttonWrapper}>
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.button}>
                      {resetLoading ? (
                        <ActivityIndicator color={PALETTE.dark} />
                      ) : (
                        <Text style={styles.buttonText}>Restablecer Contraseña</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleGoBackToEmailInput} style={styles.goBackButton}>
                    <Text style={styles.goBackText}>Volver a enviar código</Text>
                  </TouchableOpacity>
                </>
              )}
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'center',
    position: 'relative',
    minHeight: 50,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
    zIndex: 1,
  },
  title: {
    fontWeight: "700",
    color: PALETTE.text_primary,
    fontSize: width * 0.07,
    textAlign: "center",
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionText: {
    color: PALETTE.text_secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldEmail: {
    fontWeight: 'bold',
    color: PALETTE.primary,
  },
  formContainer: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.inactive,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputErrorBorder: {
    borderColor: PALETTE.danger,
  },
  inputFocusedBorder: {
    borderColor: PALETTE.primary,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: PALETTE.text_primary,
    fontSize: 16,
  },
  rightIcon: {
    padding: 5,
  },
  errorText: {
    color: PALETTE.danger,
    fontSize: 13,
    marginTop: 5,
    marginLeft: 10,
  },
  buttonWrapper: {
    marginTop: 25,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonText: {
    color: PALETTE.dark,
    fontSize: 18,
    fontWeight: "bold",
  },
  goBackButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
  },
  goBackText: {
    color: PALETTE.text_secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ResetContraseñaScreen;
