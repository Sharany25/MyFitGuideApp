import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StackNavigator from "./src/navigation/StackNavigator";
import { StyleSheet, LogBox } from "react-native";
import { UserProvider } from "./src/context/UserContext";

LogBox.ignoreLogs(["useInsertionEffect must not schedule updates"]);


const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <UserProvider>
          <StackNavigator />
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
