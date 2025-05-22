import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import MetricasScreen from "../screens/MetricaScreen";
import RutinaScreen from "../screens/RutinaScreen";
import HomeScreen from "../screens/HomeScreen";

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Metricas: undefined;
  Rutinas: { nombre: string; objetivo: string; idUsuario: number };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [objetivoUsuario, setObjetivoUsuario] = useState<string>('');
  const [idUsuario, setIdUsuario] = useState<number>(0); // Ajusta según tu lógica

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={(isNew: boolean) => {
                setIsAuthenticated(true);
                setIsNewUser(isNew);
                props.navigation.replace(isNew ? "Metricas" : "Home");
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              onRegisterSuccess={(nombre: string, userId: number) => {
                setIsAuthenticated(true);
                setIsNewUser(true);
                setNombreUsuario(nombre);
                setIdUsuario(userId);
                props.navigation.replace("Metricas");
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Metricas">
          {(props) => (
            <MetricasScreen
              {...props}
              idUsuario={idUsuario}
              onComplete={(objetivo: string) => {
                setObjetivoUsuario(objetivo);
                props.navigation.replace("Rutinas", {
                  nombre: nombreUsuario,
                  objetivo,
                  idUsuario,
                });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Rutinas">
          {(props) => (
            <RutinaScreen
              {...props}
              onComplete={() => {
                setIsNewUser(false);
                props.navigation.replace("Home");
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
