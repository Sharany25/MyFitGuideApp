// navigation/StackNavigator.tsx

import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegistroScreen from "../screens/RegistroScreen";
import DietaScreen from "../screens/DietaScreen";
import RutinaScreen from "../screens/RutinaScreen";

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Dieta: { userId: number; nombre: string };
  Rutina: { userId: number; nombre: string; objetivo: string };
  Home: undefined;
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
              onLoginSuccess={(isNew: boolean) => {
                setIsAuthenticated(true);
                props.navigation.replace(isNew ? "Registro" : "Home");
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              onRegisterSuccess={(nombre: string, userId: number) => {
                props.navigation.replace("Dieta", { nombre, userId });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Dieta">
          {(props) => (
            <DietaScreen
              {...props}
              onNext={(objetivo: string) => {
                const { userId, nombre } = props.route.params;
                props.navigation.replace("Rutina", {
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
              onComplete={() => {
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
