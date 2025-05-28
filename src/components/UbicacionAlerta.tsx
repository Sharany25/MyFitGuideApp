import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UbicacionAlertaProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UbicacionAlerta: React.FC<UbicacionAlertaProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <MaterialCommunityIcons name="map-marker" size={40} color="#00C27F" />
          <Text style={styles.title}>Activar ubicación</Text>
          <Text style={styles.message}>Para mejorar tu experiencia, necesitamos acceder a tu ubicación.</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.confirmButton]}>
              <Text style={styles.confirmText}>Activar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#111',
  },
  message: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#00C27F',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default UbicacionAlerta;
