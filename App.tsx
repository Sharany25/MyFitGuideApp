import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigator/TabNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
//import React from "react";
//import StackNavigator from "./src/navigator/StackNavigator";

//const App: React.FC = () => {
//   return <StackNavigator />;
// };

// export default App;

//ctl+k+c comentar