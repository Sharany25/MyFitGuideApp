import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="Dieta" component={DietaScreen} />
      <Stack.Screen name="Rutina" component={RutinaScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="Historial" component={HistorialScreen} />
      <Stack.Screen name="RutinaIAGenerada" component={RutinaIAGenerada} />
      <Stack.Screen name="DietaIAGenerada" component={DietaIAGenerada} />
      <Stack.Screen name="ResumenSemanalDieta" component={ResumenSemanalDieta} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} />
      <Stack.Screen name="QuejaSugerencia" component={QuejaSugerenciaScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default StackNavigator;
