import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUser } from '../context/UserContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import TabNavigator from './TabNavigator';
import PerfilScreen from '../screens/PerfilScreen';
import HistorialScreen from '../screens/HistorialScreen';

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Dieta: { userId: string; nombre: string };
  Rutina: { userId: string; nombre: string; objetivo: string };
  Tabs: { userId: string };
  Perfil: { userId: string };
  Historial: { userId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const { state } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="Dieta" component={DietaScreen} />
        <Stack.Screen name="Rutina" component={RutinaScreen} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Historial" component={HistorialScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
