import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import TabNavigator from './TabNavigator';
import PerfilScreen from '../screens/PerfilScreen';

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Dieta: { userId: number; nombre: string };
  Rutina: { userId: number; nombre: string; objetivo: string };
  Tabs: {
    userId: number;
    nombre: string;
    edad: string;
    objetivo: string;
    genero: string;
    altura: string;
    peso: string;
    tipoRegistro: 'nuevo' | 'login';
  };
  Perfil: {
    userId: number;
    nombre: string;
    edad: string;
    objetivo: string;
    genero: string;
    altura: string;
    peso: string;
    tipoRegistro: 'nuevo' | 'login';
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* LOGIN */}
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={(
                isNewUser: boolean,
                userData?: {
                  userId: number;
                  nombre: string;
                  edad: string;
                  objetivo: string;
                  genero: string;
                  altura: string;
                  peso: string;
                }
              ) => {
                setIsAuthenticated(true);
                if (isNewUser) {
                  props.navigation.replace('Registro');
                } else if (userData) {
                  props.navigation.replace('Tabs', {
                    ...userData,
                    tipoRegistro: 'login',
                  });
                }
              }}
            />
          )}
        </Stack.Screen>

        {/* REGISTRO */}
        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              onRegisterSuccess={(
                nombre: string,
                userId: number,
                userData?: {
                  edad?: string;
                  objetivo?: string;
                  genero?: string;
                  altura?: string;
                  peso?: string;
                }
              ) => {
                props.navigation.replace('Dieta', { nombre, userId });
              }}
            />
          )}
        </Stack.Screen>

        {/* DIETA */}
        <Stack.Screen name="Dieta">
          {(props) => (
            <DietaScreen
              {...props}
              onNext={(
                objetivo: string,
                extraData: {
                  edad: string;
                  genero: string;
                  altura: string;
                  peso: string;
                }
              ) => {
                const { userId, nombre } = props.route.params;
                props.navigation.replace('Rutina', {
                  userId,
                  nombre,
                  objetivo,
                  ...extraData,
                });
              }}
            />
          )}
        </Stack.Screen>

        {/* RUTINA */}
        <Stack.Screen name="Rutina">
          {(props) => (
            <RutinaScreen
              {...props}
              onComplete={(
                profileData: {
                  userId: number;
                  nombre: string;
                  edad: string;
                  objetivo: string;
                  genero: string;
                  altura: string;
                  peso: string;
                }
              ) => {
                props.navigation.replace('Tabs', {
                  ...profileData,
                  tipoRegistro: 'nuevo',
                });
              }}
            />
          )}
        </Stack.Screen>

        {/* TABS */}
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* PERFIL */}
        <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
