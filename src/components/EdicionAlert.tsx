import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PALETTE = {
    danger: '#FF4757',
    text_primary: '#FFFFFF',
    text_secondary: '#B0C4DE',
    inactive: 'rgba(255, 255, 255, 0.1)',
};

interface DisclaimerModalProps {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const styles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    modalContentContainer: {
        width: '85%',
        maxWidth: 400,
        padding: 1,
        borderRadius: 20,
    },
    modalContent: {
        borderRadius: 18,
        padding: 25,
    },
    modalTitle: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: PALETTE.danger,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: width * 0.04,
        color: PALETTE.text_secondary,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: width * 0.055,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonConfirm: {
        backgroundColor: PALETTE.danger,
        marginRight: 10,
    },
    modalButtonCancel: {
        backgroundColor: PALETTE.inactive,
        marginLeft: 10,
    },
    modalButtonText: {
        color: PALETTE.text_primary,
        fontWeight: 'bold',
        fontSize: width * 0.038,
    },
});

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isVisible, onConfirm, onCancel }) => {
    if (!isVisible) return null;

    return (
        <View style={styles.modalOverlay}>
            <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient 
                colors={['rgba(255, 71, 87, 0.2)', 'rgba(255, 255, 255, 0.05)']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.modalContentContainer}
            >
                <BlurView intensity={70} tint="dark" style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Advertencia de Edición</Text>
                    <Text style={styles.modalMessage}>
                        Al realizar modificaciones en tu dieta, asumes la responsabilidad total de estos cambios. MyFitGuide solo proporciona sugerencias generadas por IA y queda exonerada de cualquier efecto adverso resultante de dietas editadas manualmente. Consulta siempre a un profesional de la salud antes de hacer cambios significativos.
                    </Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={onConfirm}>
                            <Text style={styles.modalButtonText}>Aceptar y Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={onCancel}>
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </LinearGradient>
        </View>
    );
};

export default DisclaimerModal;
