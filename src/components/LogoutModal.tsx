import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PALETTE = {
    primary: '#2CFD89',
    accent_blue: '#00A3FF',
    text_primary: '#FFFFFF',
    text_secondary: '#B0C4DE',
    danger: '#FF4757',
    inactive: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.15)',
    dark_overlay: 'rgba(0,0,0,0.7)',
    card_background_dark: 'rgba(30, 45, 55, 0.95)',
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
                <BlurView intensity={70} tint="dark" style={styles.modalContent}>
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
                </BlurView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: PALETTE.dark_overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        padding: 30,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: PALETTE.border,
        overflow: 'hidden',
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
