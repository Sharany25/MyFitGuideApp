import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import TabNavigator from "./TabNavigator";

const Stack = createStackNavigator();

const StackNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLoginSuccess={() => setIsAuthenticated(true)} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Registro">
            {(props) => (
              <RegistroScreen {...props} onRegisterSuccess={() => setIsAuthenticated(true)} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default StackNavigator;
