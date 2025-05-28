import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StackNavigator from "./src/navigation/StackNavigator";

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StackNavigator />
    </SafeAreaProvider>
  );
};

export default App;