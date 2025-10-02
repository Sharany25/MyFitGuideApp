import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, Modal, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PALETTE = {
  primary: '#2CFD89',
  secondary_blue: '#00A3FF',
  text_primary: '#FFFFFF',
  text_dark: '#1D2A32',
  danger: '#FF4757',
  inactive_border: 'rgba(255, 255, 255, 0.15)',
  dark_overlay: 'rgba(0,0,0,0.85)',
  text_secondary: '#B0C4DE',
};

interface CustomAlertDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'error' | 'info' | 'success';
    actionButtonText?: string;
    onActionPress?: () => void;
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
    visible,
    onClose,
    title,
    message,
    type,
    actionButtonText,
    onActionPress,
}) => {
    const isError = type === 'error';
    const iconName: any = isError ? 'close-circle' : (type === 'success' ? 'checkmark-circle' : 'information-circle');
    const iconColor = isError ? PALETTE.danger : PALETTE.primary;

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <BlurView intensity={70} tint="dark" style={dialogStyles.overlay}>
                <View style={dialogStyles.modalWrapper}>
                    <View style={dialogStyles.modalContent}>
                        <Ionicons name={iconName} size={width * 0.12} color={iconColor} style={dialogStyles.icon} />
                        <Text style={dialogStyles.title}>{title}</Text>
                        <Text style={dialogStyles.message}>{message}</Text>

                        <View style={dialogStyles.buttons}>
                            <TouchableOpacity 
                                style={[dialogStyles.buttonBase, dialogStyles.buttonClose]} 
                                onPress={onClose}
                            >
                                <Text style={[dialogStyles.buttonText, { color: PALETTE.text_primary }]}>Cerrar</Text>
                            </TouchableOpacity>

                            {onActionPress && actionButtonText && (
                                <TouchableOpacity 
                                    style={dialogStyles.buttonActionWrapper} 
                                    onPress={onActionPress}
                                >
                                    <LinearGradient
                                        colors={isError ? [PALETTE.danger, '#CC3344'] : [PALETTE.primary, PALETTE.secondary_blue]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={dialogStyles.buttonBase}
                                    >
                                        <Text style={[dialogStyles.buttonText, { color: PALETTE.text_dark }]}>{actionButtonText}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};

const dialogStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalWrapper: {
        width: '88%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: PALETTE.inactive_border,
        backgroundColor: 'rgba(29, 42, 50, 0.95)',
    },
    modalContent: {
        padding: 30,
        alignItems: 'center',
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: '700',
        textAlign: 'center',
        color: PALETTE.text_primary,
        marginBottom: 8,
    },
    message: {
        fontSize: width * 0.04,
        textAlign: 'center',
        color: PALETTE.text_secondary,
        marginBottom: 30,
        lineHeight: width * 0.055,
    },
    buttons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    buttonBase: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonClose: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: PALETTE.inactive_border,
    },
    buttonActionWrapper: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
    },
    buttonText: {
        fontWeight: '700',
        fontSize: width * 0.042,
    },
});

export default CustomAlertDialog;