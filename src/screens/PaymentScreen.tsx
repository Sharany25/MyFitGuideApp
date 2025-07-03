import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CardInput from '../components/CardInput';

const MAIN_GRADIENT = ['#E0EAFC', '#CFDEF3'] as const;
const CARD_GRADIENT = ['#f7fafd', '#e0e7ff'] as const;
const PRIMARY = '#2563eb';
const ACCENT = '#06b6d4';

const PaymentScreen: React.FC = () => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const isCardNumberValid = (num: string) => /^\d{16}$/.test(num.replace(/\s/g, ''));
  const isExpiryValid = (exp: string) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(exp);
  const isCvvValid = (cvv: string) => /^\d{3,4}$/.test(cvv);

  const handlePayment = () => {
    if (!cardName.trim()) return Alert.alert('Error', 'El nombre del titular es obligatorio.');
    if (!isCardNumberValid(cardNumber)) return Alert.alert('Error', 'El número de tarjeta debe tener 16 dígitos.');
    if (!isExpiryValid(expiry)) return Alert.alert('Error', 'Fecha de expiración inválida. Formato: MM/AA');
    if (!isCvvValid(cvv)) return Alert.alert('Error', 'El CVV debe tener 3 o 4 dígitos.');

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert('¡Pago exitoso!', 'Tu suscripción Plus fue activada.');
      setCardName('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }, 2000);
  };

  const handleCardNumberChange = (val: string) => {
    let value = val.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(value);
  };

  return (
    <LinearGradient colors={MAIN_GRADIENT} style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <View style={[styles.panelWrap, { minHeight: 420 }]}>
          <LinearGradient
            colors={CARD_GRADIENT}
            style={[
              styles.panel,
              {
                width: width > 500 ? 410 : width * 0.94,
                paddingHorizontal: width > 350 ? 28 : 12,
              },
            ]}
            start={{ x: 0, y: 0.9 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.iconWrap}>
              <View style={styles.crownCircle}>
                <MaterialIcons name="credit-card" size={32} color={PRIMARY} />
              </View>
            </View>
            <Text style={styles.title}>Suscripción Plus</Text>
            <Text style={styles.subtitle}>
              Accede a beneficios exclusivos y contenido personalizado.
            </Text>
            <View style={styles.inputsBox}>
              <Label label="Nombre del titular" />
              <CardInput
                icon={<MaterialIcons name="person" size={22} color={PRIMARY} />}
                placeholder="Ej. Diego Osorio"
                value={cardName}
                onChangeText={setCardName}
              />
              <Label label="Número de tarjeta" />
              <CardInput
                icon={<FontAwesome name="credit-card" size={19} color={PRIMARY} />}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                maxLength={19}
              />
              <View style={styles.row}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Label label="Vencimiento" />
                  <CardInput
                    icon={<MaterialIcons name="date-range" size={19} color={PRIMARY} />}
                    placeholder="MM/AA"
                    keyboardType="numeric"
                    value={expiry}
                    onChangeText={setExpiry}
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Label label="CVV" />
                  <CardInput
                    icon={<MaterialIcons name="lock" size={19} color={PRIMARY} />}
                    placeholder="CVV"
                    keyboardType="numeric"
                    value={cvv}
                    onChangeText={setCvv}
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handlePayment}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[PRIMARY, ACCENT]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.btnGrad}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Procesando...' : 'Pagar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.secureWrap}>
              <MaterialIcons name="lock" size={18} color={PRIMARY} />
              <Text style={styles.secureTxt}>Pago 100% seguro y cifrado</Text>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const Label = ({ label }: { label: string }) => (
  <Text style={styles.label}>{label}</Text>
);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kav: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  panelWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  panel: {
    alignSelf: 'center',
    borderRadius: 34,
    paddingTop: 34,
    paddingBottom: 25,
    shadowColor: PRIMARY,
    shadowOpacity: 0.11,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 9 },
    elevation: 17,
    backgroundColor: '#f7fafd',
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  crownCircle: {
    backgroundColor: '#e0e7ff',
    padding: 17,
    borderRadius: 38,
    elevation: 7,
    shadowColor: PRIMARY,
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: PRIMARY,
    alignSelf: 'center',
    marginTop: 12,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 20,
    opacity: 0.94,
  },
  label: {
    fontSize: 13,
    color: PRIMARY,
    marginLeft: 4,
    fontWeight: '700',
    marginBottom: 2,
    marginTop: 6,
    opacity: 0.88,
  },
  inputsBox: {
    marginBottom: 13,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: 0,
  },
  button: {
    marginTop: 18,
    marginBottom: 7,
    borderRadius: 17,
    overflow: 'hidden',
    elevation: 2,
  },
  btnGrad: {
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
    textShadowColor: '#0001',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  secureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
    justifyContent: 'center',
  },
  secureTxt: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
    letterSpacing: 0.2,
    opacity: 0.88,
  },
});

export default PaymentScreen;
