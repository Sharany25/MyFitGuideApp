import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { Salad, Dumbbell, Home, MapPin } from 'lucide-react-native';

import DietaIAGenerada from '../screens/DietaIAGenerada';
import RutinaIAGenerada from '../screens/RutinaIAGenerada';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';

export type TabParamList = {
  Dieta: { userId:string };
  RutinaIAGenerada: { userId: string };
  Home: { userId: string };
  Map: { userId: string };
};

const Tab = createBottomTabNavigator<TabParamList>();

const PALETTE = {
  primary: '#2CFD89',
  inactive: '#B0C4DE',
  background: 'rgba(29, 42, 50, 0.85)',
  dark: '#1D2A32',
};

const { width } = Dimensions.get('window');
const getResponsiveSize = (percent: number) => Math.round(width * percent);

const TabNavigator: React.FC<any> = (props) => {
  const userId = props?.route?.params?.userId ?? props?.screenProps?.userId ?? undefined;
  const insets = useSafeAreaInsets();
  const iconSize = getResponsiveSize(0.065);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom - 10 : 20,
          left: '5%',
          right: '5%',
          height: getResponsiveSize(0.16),
          borderRadius: 25,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={90} tint="dark" style={styles.blurViewStyle} />
        ),
        tabBarIcon: ({ focused, color }) => {
          let icon;
          const strokeWidth = focused ? 2.8 : 2.2;

          switch (route.name) {
            case 'Dieta':
              icon = <Salad size={iconSize} color={focused ? PALETTE.dark : color} strokeWidth={strokeWidth} />;
              break;
            case 'Home':
              icon = <Home size={iconSize} color={focused ? PALETTE.dark : color} strokeWidth={strokeWidth} />;
              break;
            case 'RutinaIAGenerada':
              icon = <Dumbbell size={iconSize} color={focused ? PALETTE.dark : color} strokeWidth={strokeWidth} />;
              break;
            case 'Map':
              icon = <MapPin size={iconSize} color={focused ? PALETTE.dark : color} strokeWidth={strokeWidth} />;
              break;
            default:
              return null;
          }

          return (
            <View style={styles.iconContainer}>
              {focused ? (
                <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.activeIconWrapper}>
                  {icon}
                </LinearGradient>
              ) : (
                icon
              )}
            </View>
          );
        },
      })}
    >
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

const styles = StyleSheet.create({
  blurViewStyle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    width: getResponsiveSize(0.13),
    height: getResponsiveSize(0.13),
    borderRadius: getResponsiveSize(0.065),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default TabNavigator;
