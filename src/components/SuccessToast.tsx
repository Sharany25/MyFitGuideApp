import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

const PALETTE = {
    primary: '#2CFD89',
    text_primary: '#FFFFFF',
    text_secondary: '#B0C4DE',
    toast_success_bg_start: '#2CFD89',
    toast_success_bg_end: '#22B060',
    toast_text: '#1D2A32',
};

interface SuccessToastProps {
    message: string;
    visible: boolean;
    onHide: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, visible, onHide }) => {
    const slideAnim = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: Platform.OS === 'android' ? 0 : 50,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(slideAnim, {
                        toValue: -150,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(onHide);
                }, 2500);
            });
        }
    }, [visible, slideAnim, onHide]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
                colors={[PALETTE.toast_success_bg_start, PALETTE.toast_success_bg_end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            >
                <BlurView intensity={20} tint="light" style={styles.blurEffect}>
                    <Ionicons name="checkmark-circle-outline" size={28} color={PALETTE.toast_text} style={styles.icon} />
                    <Text style={styles.toastText}>{message}</Text>
                </BlurView>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: "absolute",
        top: Platform.OS === 'android' ? 20 : 0,
        left: width * 0.05,
        right: width * 0.05,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        zIndex: 1000,
    },
    gradientBackground: {
        flex: 1,
        borderRadius: 15,
    },
    blurEffect: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
    },
    icon: {
        marginRight: 12,
    },
    toastText: {
        color: PALETTE.toast_text,
        fontSize: width * 0.04,
        fontWeight: "600",
        flexShrink: 1,
    },
});

export default SuccessToast;
