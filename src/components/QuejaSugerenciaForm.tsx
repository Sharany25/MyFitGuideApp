import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { enviarQuejaSugerencia } from '../hooks/useQuejaSugerencia';
import { API_URL } from '../api/api';

export default function QuejaSugerenciaForm() {
  const [tipo, setTipo] = useState<'queja' | 'sugerencia'>('queja');
  const [mensaje, setMensaje] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [categoria, setCategoria] = useState<'acceso' | 'funcionalidad'>('acceso');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mensaje.trim()) return Alert.alert('Falta el mensaje');
    setLoading(true);
    try {
      await enviarQuejaSugerencia({ tipo, mensaje, emailContacto, categoria });
      Alert.alert('¡Enviado!', 'Tu queja/sugerencia ha sido enviada.');
      setMensaje('');
      setEmailContacto('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.row}>
        <Button title="Queja" onPress={() => setTipo('queja')} color={tipo === 'queja' ? '#23c6d8' : '#999'} />
        <Button title="Sugerencia" onPress={() => setTipo('sugerencia')} color={tipo === 'sugerencia' ? '#4ad991' : '#999'} />
      </View>
      <Text style={styles.label}>Mensaje</Text>
      <TextInput
        style={styles.input}
        value={mensaje}
        onChangeText={setMensaje}
        placeholder="Escribe tu queja o sugerencia..."
        multiline
      />
      <Text style={styles.label}>Email (opcional)</Text>
      <TextInput
        style={styles.input}
        value={emailContacto}
        onChangeText={setEmailContacto}
        placeholder="tu@email.com"
        keyboardType="email-address"
      />
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.row}>
        <Button title="Acceso" onPress={() => setCategoria('acceso')} color={categoria === 'acceso' ? '#23c6d8' : '#999'} />
        <Button title="Funcionalidad" onPress={() => setCategoria('funcionalidad')} color={categoria === 'funcionalidad' ? '#4ad991' : '#999'} />
      </View>
      <Button title={loading ? 'Enviando...' : 'Enviar'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  label: { marginTop: 18, fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 4, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }
});
