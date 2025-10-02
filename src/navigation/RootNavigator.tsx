import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUser } from '../context/UserContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import HistorialScreen from '../screens/HistorialScreen';
import TabNavigator from './TabNavigator';
import RutinaIAGenerada from '../screens/RutinaIAGenerada';
import DietaIAGenerada from '../screens/DietaIAGenerada';
import ResumenSemanalDieta from '../components/ResumenSemanalDieta';
import FavoritosScreen from '../screens/FavoritosScreen';
import QuejaSugerenciaScreen from '../screens/QuejaSugerenciaScreen';
import MapScreen from '../screens/MapScreen';
import ResetContraseñaScreen from '../screens/ResetContraseñaScreen';
import { ChatbotScreen } from '../screens/ChatbotScreen';


// Tipos de navegación principales
export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Dieta: { userId: string; nombre: string };
  Rutina: { userId: string; nombre: string; objetivo: string };
  Tabs: { userId: string; screen?: string };
  Perfil: { userId: string };
  Historial: { userId?: string };
  RutinaIAGenerada: { userId: string };
  DietaIAGenerada: { userId: string };
  ResumenSemanalDieta: { userId: string };
  Favoritos: { userId: string };
  Payment: undefined;
  QuejaSugerencia: { userId: string };
  Map: { userId: string };
  ResetContraseña: undefined;
  ChatbotScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Nuevo componente que decide qué pantallas renderizar
const RootNavigator: React.FC = () => {
  const { state } = useUser();
  const userId = state.user?.userId;

  if (state.loading) {
    // Muestra un indicador de carga mientras se verifica AsyncStorage
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CFD89" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Si hay usuario logueado, la primera pantalla será Tabs */}
      {state.user ? (
        <>
          <Stack.Screen 
            name="Tabs" 
            component={TabNavigator} 
            initialParams={{ userId: userId }}
          />
          {/* Todas las rutas autenticadas aquí */}
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="Historial" component={HistorialScreen} />
          <Stack.Screen name="RutinaIAGenerada" component={RutinaIAGenerada} />
          <Stack.Screen name="DietaIAGenerada" component={DietaIAGenerada} />
          <Stack.Screen name="ResumenSemanalDieta" component={ResumenSemanalDieta} />
          <Stack.Screen name="Favoritos" component={FavoritosScreen} />
          <Stack.Screen name="QuejaSugerencia" component={QuejaSugerenciaScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
          
          {/* Las pantallas de inicio de sesión deben estar aquí para permitir el logout */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
          <Stack.Screen name="ResetContraseña" component={ResetContraseñaScreen} />
          <Stack.Screen name="Dieta" component={DietaScreen} />
          <Stack.Screen name="Rutina" component={RutinaScreen} />
        </>
      ) : (
        // Si NO hay usuario, la primera pantalla será Login
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
          <Stack.Screen name="ResetContraseña" component={ResetContraseñaScreen} />
          
          {/* Ocultamos las pantallas que requieren autenticación */}
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="Dieta" component={DietaScreen} />
          <Stack.Screen name="Rutina" component={RutinaScreen} />
          <Stack.Screen name="Historial" component={HistorialScreen} />
          <Stack.Screen name="RutinaIAGenerada" component={RutinaIAGenerada} />
          <Stack.Screen name="DietaIAGenerada" component={DietaIAGenerada} />
          <Stack.Screen name="ResumenSemanalDieta" component={ResumenSemanalDieta} />
          <Stack.Screen name="Favoritos" component={FavoritosScreen} />
          <Stack.Screen name="QuejaSugerencia" component={QuejaSugerenciaScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const StackNavigator: React.FC = () => (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StackNavigator;
