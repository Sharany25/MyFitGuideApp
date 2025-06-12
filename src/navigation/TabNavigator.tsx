import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PerfilScreen from '../screens/PerfilScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';

type TabParamList = {
  Perfil: undefined;
  Dieta: undefined;
  Rutina: undefined;
  Home: undefined;
  Map: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00C27F',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          height: 62 + insets.bottom,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderColor: '#e7e7e7',
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -1 },
          shadowRadius: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginBottom: 3,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = '';
          switch (route.name) {
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Dieta':
              iconName = focused ? 'fast-food' : 'fast-food-outline';
              break;
            case 'Rutina':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
          }
          return <Ionicons name={iconName as any} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Dieta" component={DietaScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rutina" component={RutinaScreen} />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ tabBarLabel: 'Gym Cercanos' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
