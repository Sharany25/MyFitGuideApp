import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  danger: '#FF4757',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  pin_red: '#F44336',
  bmi_normal: '#2CFD89',
  bmi_overweight: '#FFC107',
  bmi_obese: '#F44336',
  bmi_underweight: '#00A3FF',
};

const { width } = Dimensions.get("window");

const Logo = require("../../assets/Logo.png");

type User = {
  userId: string;
  nombre: string;
  foto?: string;
};

type HeaderProps = {
  user: User | null;
  onLogoutPress: () => void;
};

const Header: React.FC<HeaderProps> = ({ user, onLogoutPress }) => {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(1)).current; // Animación para la escala del logo

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuItemPress = (screenName: string) => {
    setMenuVisible(false);
    navigation.navigate(screenName, { userId: user?.userId });
  };

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const animatedShadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 10],
  });

  // Funciones para la animación del logo al presionar
  const handleLogoPressIn = () => {
    Animated.spring(logoScaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleLogoPressOut = () => {
    Animated.spring(logoScaleAnim, {
      toValue: 1,
      friction: 3, // Controla la "elasticidad"
      tension: 40, // Controla la velocidad
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.leftHeaderSection}>
          <TouchableOpacity
            onPressIn={handleLogoPressIn}
            onPressOut={handleLogoPressOut}
            activeOpacity={1} // Elimina el feedback de opacidad por defecto de TouchableOpacity
          >
            <Animated.Image source={Logo} style={[styles.logo, { transform: [{ scale: logoScaleAnim }] }]} />
          </TouchableOpacity>
          <Text style={styles.appTitle}>MyFitGuide</Text>
        </View>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={28} color={PALETTE.text_primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.userProfileSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Perfil', { userId: user?.userId })}
            style={[
              styles.avatarButtonWrapper,
              {
                shadowOpacity: animatedShadowOpacity,
                shadowRadius: animatedShadowRadius as any,
                elevation: animatedShadowRadius as any,
              }
            ]}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.avatar}>
              {user?.foto ? (
                <Image source={{ uri: user.foto }} style={styles.avatarImageHeader} />
              ) : (
                <View style={styles.avatarFallback} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingText}>¡Hola, {user?.nombre || 'Usuario'}!</Text>
            <Text style={styles.sloganText}>Tu bienestar es nuestra meta.</Text>
          </View>
        </View>
      </View>

      {menuVisible && (
        <Animated.View style={[
          styles.dropdownMenu,
          {
            opacity: menuAnim,
            transform: [{
              translateY: menuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }]
          }
        ]}>
          <BlurView intensity={100} tint="dark" style={styles.menuBlurBackground}>
            <TouchableOpacity onPress={() => handleMenuItemPress('Favoritos')} style={styles.menuItem}>
              <MaterialCommunityIcons name="pin-outline" size={20} color={PALETTE.pin_red} />
              <Text style={styles.menuItemText}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMenuItemPress('Historial')} style={styles.menuItem}>
              <Ionicons name="time-outline" size={20} color={PALETTE.primary} />
              <Text style={styles.menuItemText}>Historial de cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMenuItemPress('Map')} style={styles.menuItem}>
              <Ionicons name="map-outline" size={20} color={PALETTE.primary} />
              <Text style={styles.menuItemText}>Gym cercanos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMenuItemPress('QuejaSugerencia')} style={styles.menuItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={PALETTE.text_secondary} />
              <Text style={styles.menuItemText}>Quejas y Sugerencias</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogoutPress} style={styles.menuItem}>
              <Ionicons name="exit-outline" size={20} color={PALETTE.danger} />
              <Text style={[styles.menuItemText, { color: PALETTE.danger }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    paddingBottom: 25,
    marginTop: 10,
    position: 'relative',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  leftHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.1,
    height: width * 0.1,
    resizeMode: 'contain',
    marginRight: 10,
    borderRadius: (width * 0.1) / 2,
  },
  appTitle: {
    color: PALETTE.text_primary, // Cambiado de PALETTE.primary a PALETTE.text_primary (blanco)
    fontSize: width * 0.075,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 50,
  },
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  avatarButtonWrapper: {
    position: 'relative',
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: (width * 0.18) / 2,
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 0 },
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.18) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImageHeader: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.18) / 2,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: PALETTE.inactive,
  },
  headerTextContainer: {
    marginLeft: 15,
    flexShrink: 1,
  },
  greetingText: {
    color: PALETTE.text_primary,
    fontSize: width * 0.055,
    fontWeight: 'bold',
  },
  sloganText: {
    color: PALETTE.text_secondary,
    fontSize: width * 0.035,
    marginTop: 5,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: width * 0.55,
    backgroundColor: 'rgba(29, 42, 50, 0.95)',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuBlurBackground: {
    borderRadius: 15,
    padding: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.inactive,
  },
  menuItemText: {
    color: PALETTE.text_primary,
    fontSize: width * 0.042,
    marginLeft: 12,
  },
});

export default Header;
