import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PALETTE = {
    primary: '#2CFD89',
    accent_blue: '#00A3FF',
    text_primary: '#FFFFFF',
    text_secondary: '#B0C4DE',
    danger: '#FF4757',
    inactive: 'rgba(255, 255, 255, 0.15)', // Más opaco
    border: 'rgba(255, 255, 255, 0.15)',
    dark_overlay: 'rgba(0,0,0,0.95)', // Fondo casi negro sólido
    button_cancel_text: '#B0C4DE',
};

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Ionicons name="log-out-outline" size={width * 0.14} color={PALETTE.danger} style={styles.icon} />
                    <Text style={styles.title}>¿Cerrar sesión?</Text>
                    <Text style={styles.message}>
                        Tu sesión se cerrará y deberás iniciarla de nuevo para acceder a tus datos.
                    </Text>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                            <Text style={[styles.buttonText, { color: PALETTE.button_cancel_text }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonConfirmWrapper} onPress={onConfirm}>
                            <LinearGradient
                                colors={[PALETTE.danger, '#CC3344']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.buttonConfirmGradient}
                            >
                                <Text style={[styles.buttonText, { color: PALETTE.text_primary }]}>Salir</Text>
                            </LinearGradient>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: PALETTE.dark_overlay, 
    },
    modalContent: {
        width: '85%',
        padding: 30,
        borderRadius: 25,
        alignItems: 'center',
        // Sombra más intensa para que flote sobre el fondo oscuro
        shadowColor: PALETTE.danger,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 71, 87, 0.5)', // Borde más visible
        overflow: 'hidden',
        backgroundColor: 'rgba(29, 42, 50, 1)',
    },
    icon: {
        marginBottom: 25,
    },
    title: {
        fontSize: width * 0.065,
        fontWeight: '700',
        textAlign: 'center',
        color: PALETTE.text_primary,
        marginBottom: 10,
    },
    message: {
        fontSize: width * 0.042,
        textAlign: 'center',
        color: PALETTE.text_secondary,
        marginBottom: 35,
        lineHeight: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    buttonCancel: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        backgroundColor: PALETTE.inactive,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    buttonConfirmWrapper: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
    },
    buttonConfirmGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
    },
    buttonText: {
        fontWeight: '700',
        fontSize: width * 0.042,
    },
});

export default LogoutModal;
