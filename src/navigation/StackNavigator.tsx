import React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUser } from '../context/UserContext'; // Importa el hook useUser desde tu UserContext

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import TabNavigator from './TabNavigator';
import PerfilScreen from '../screens/PerfilScreen';
import MapScreen from '../screens/MapScreen';

// Define el tipo de tus parámetros de navegación
export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Dieta: { userId: string; nombre: string };
  Rutina: { userId: string; nombre: string; objetivo: string };
  Tabs: { userId: string };
  Perfil: { userId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const { state } = useUser(); // Utiliza el hook useUser para obtener el estado y el dispatch del UserContext

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* LOGIN */}
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={(isNewUser: boolean, userData?: { userId: string; nombre: string }) => {
                // Actualiza el usuario en el contexto al hacer login
                // Aquí deberías realizar la lógica de autenticación y almacenar los datos del usuario en el contexto
              }}
            />
          )}
        </Stack.Screen>

        {/* REGISTRO */}
        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              onRegisterSuccess={(nombre: string, userId: string) => {
                // Actualiza el usuario en el contexto al registrar
                // Aquí deberías almacenar los datos del nuevo usuario en el contexto
              }}
            />
          )}
        </Stack.Screen>

        {/* DIETA */}
        <Stack.Screen name="Dieta">
          {(props) => (
            <DietaScreen
              {...props}
              onNext={(objetivo: string, extraData: { edad: string; genero: string; altura: string; peso: string }) => {
                // Aquí deberías actualizar los datos de la dieta del usuario en el contexto
              }}
            />
          )}
        </Stack.Screen>

        {/* RUTINA */}
        <Stack.Screen name="Rutina">
          {(props) => (
            <RutinaScreen
              {...props}
              onComplete={(profileData: {
                userId: string;
                nombre: string;
                edad: string;
                objetivo: string;
                genero: string;
                altura: string;
                peso: string;
              }) => {
                // Aquí deberías actualizar los datos de la rutina del usuario en el contexto
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
