import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

import PerfilScreen from '../screens/PerfilScreen';
import DietaScreen from '../screens/DietaScreen';
import RutinaScreen from '../screens/RutinaScreen';
import HomeScreen from '../screens/HomeScreen';

type TabParamList = {
  Perfil: { userId?: string };
  Dieta: { userId?: string };
  Rutina: { userId?: string };
  Home: RootStackParamList['Home']; // Asumiendo que HomeScreen toma los mismos props que en RootStackParamList
};

const Tab = createBottomTabNavigator<TabParamList>();

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

const PerfilTabWrapper: React.FC = () => {
  const { params } = useRoute<RouteProp<TabParamList, 'Perfil'>>();
  return <PerfilScreen userId={params?.userId} />;
};

const DietaTabWrapper: React.FC = () => {
  const { params } = useRoute<RouteProp<TabParamList, 'Dieta'>>();
  return <DietaScreen userId={params?.userId} />;
};

const RutinaTabWrapper: React.FC = () => {
  const { params } = useRoute<RouteProp<TabParamList, 'Rutina'>>();
  return <RutinaScreen userId={params?.userId} />;
};

const HomeTabWrapper: React.FC = () => {
  const { params } = useRoute<RouteProp<TabParamList, 'Home'>>();
  return <HomeScreen {...params} />;
};

export default TabNavigator;
