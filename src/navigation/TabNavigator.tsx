// src/navigation/TabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

// Importa tus screens
import PerfilScreen from '../screens/PerfilScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const PerfilTabWrapper = () => {
  // Los params llegan desde el Stack principal (Tabs)
  // @ts-ignore
  const { params } = useRoute<any>();
  return <PerfilScreen {...params} />;
};

const DietaTabWrapper = () => {
  // @ts-ignore
  const { params } = useRoute<any>();
  // Si quieres pasarle props iniciales (no es obligatorio)
  return <DietaScreen {...params} />;
};

const RutinaTabWrapper = () => {
  // @ts-ignore
  const { params } = useRoute<any>();
  return <RutinaScreen {...params} />;
};

const HomeTabWrapper = () => {
  // @ts-ignore
  const { params } = useRoute<any>();
  return <HomeScreen {...params} />;
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00C27F',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: { height: 62, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
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
          }
          return <Ionicons name={iconName as any} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Perfil" component={PerfilTabWrapper} />
      <Tab.Screen name="Dieta" component={DietaTabWrapper} />
      <Tab.Screen name="Home" component={HomeTabWrapper} />
      <Tab.Screen name="Rutina" component={RutinaTabWrapper} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
