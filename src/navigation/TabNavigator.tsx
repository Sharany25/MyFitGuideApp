import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Platform } from 'react-native';

import { User2, Salad, Dumbbell, Home, MapPin } from 'lucide-react-native';

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

const getResponsiveSize = (percent: number) => {
  const { width } = Dimensions.get('window');
  return Math.round(width * percent);
};

const TabNavigator: React.FC<any> = (props) => {
  const userId =
    props?.route?.params?.userId ??
    props?.screenProps?.userId ??
    undefined;
  const insets = useSafeAreaInsets();
  const iconSize = getResponsiveSize(0.062);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00C27F',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          minHeight: getResponsiveSize(0.16) + insets.bottom,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderColor: 'transparent',
          elevation: 13,
          shadowColor: '#00C27F',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          paddingBottom: insets.bottom + (Platform.OS === 'android' ? 4 : 0),
        },
        tabBarLabelStyle: {
          fontSize: getResponsiveSize(0.033),
          fontWeight: 'bold',
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          switch (route.name) {
            case 'Perfil':
              return <User2 size={iconSize} color={color} strokeWidth={focused ? 2.8 : 2.1} />;
            case 'Dieta':
              return <Salad size={iconSize} color={color} strokeWidth={focused ? 2.6 : 2.1} />;
            case 'RutinaIAGenerada':
              return <Dumbbell size={iconSize} color={color} strokeWidth={focused ? 2.6 : 2.1} />;
            case 'Home':
              return <Home size={iconSize} color={color} strokeWidth={focused ? 2.7 : 2.1} />;
            case 'Map':
              return <MapPin size={iconSize} color={color} strokeWidth={focused ? 2.6 : 2.1} />;
            default:
              return null;
          }
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
