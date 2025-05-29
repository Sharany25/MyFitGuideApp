// navigation/StackNavigator.tsx

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import PerfilScreen from '../screens/PerfilScreen';

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Dieta: { userId: number; nombre: string };
  Rutina: { userId: number; nombre: string; objetivo: string };
  Home: {
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
                  props.navigation.replace('Home', {
                    ...userData,
                    tipoRegistro: 'login',
                  });
                }
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              onRegisterSuccess={(nombre: string, userId: number, userData) => {
                props.navigation.replace('Dieta', { nombre, userId });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Dieta">
          {(props) => (
            <DietaScreen
              {...props}
              onNext={(objetivo: string, extraData) => {
                const { userId, nombre } = props.route.params;
                props.navigation.replace('Rutina', {
                  userId,
                  nombre,
                  objetivo,
                });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Rutina">
          {(props) => (
            <RutinaScreen
              {...props.route.params}
              onComplete={(profileData) => {
                props.navigation.replace('Home', {
                  ...profileData,
                  tipoRegistro: 'nuevo',
                });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              onPerfilPress={() => {
                props.navigation.navigate('Perfil', {
                  nombre: props.route.params.nombre,
                  edad: props.route.params.edad,
                  objetivo: props.route.params.objetivo,
                  genero: props.route.params.genero,
                  altura: props.route.params.altura,
                  peso: props.route.params.peso,
                  tipoRegistro: props.route.params.tipoRegistro,
                });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Perfil" component={PerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
