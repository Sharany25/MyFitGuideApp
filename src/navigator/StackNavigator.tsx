import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import FormularioMultiStepScreen from "../screens/FormularioMultiStepScreen";

export type RootStackParamList = {
  Login: undefined;
  FormularioMultiStep: undefined;
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
                props.navigation.replace(isNew ? "FormularioMultiStep" : "Home");
              }}
            />
          )}
        </Stack.Screen>

        {/* ✅ Se pasa la prop `onFinish` manualmente usando render prop */}
        <Stack.Screen name="FormularioMultiStep">
          {(props) => (
            <FormularioMultiStepScreen
              {...props}
              onFinish={() => {
                // Cuando se termina el flujo, navega al Home
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
