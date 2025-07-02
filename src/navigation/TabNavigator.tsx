import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PerfilScreen from '../screens/PerfilScreen';
import DietaIAGenerada from '../screens/DietaIAGenerada';
import RutinaIAGenerada from '../screens/RutinaIAGenerada';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';

export type TabParamList = {
  Perfil: { userId: string };
  Dieta: { userId: string };
  RutinaIAGenerada: { userId: string };
  Home: { userId: string };
  Map: { userId: string };
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  route: { params: { userId: string } };
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ route }) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00C27F',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          minHeight: 56 + insets.bottom,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          backgroundColor: '#fff',
          // Elimina cualquier border
          borderTopWidth: 0,
          borderColor: 'transparent',
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowOffset: { width: 0, height: -1 },
          shadowRadius: 6,
          paddingBottom: insets.bottom,
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
            case 'RutinaIAGenerada':
              iconName = focused ? 'fitness' : 'fitness-outline';
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
      <Tab.Screen name="Perfil" component={PerfilScreen} initialParams={{ userId }} />
      <Tab.Screen name="Dieta" component={DietaIAGenerada} initialParams={{ userId }} />
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ userId }} />
      <Tab.Screen
        name="RutinaIAGenerada"
        component={RutinaIAGenerada}
        initialParams={{ userId }}
        options={{ tabBarLabel: 'Rutina' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        initialParams={{ userId }}
        options={{ tabBarLabel: 'Gym Cercanos' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
